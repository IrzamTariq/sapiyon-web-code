import { LoadingOutlined } from "@ant-design/icons";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DatePicker, Empty, Select, Table, Tooltip } from "antd";
import { ColumnProps } from "antd/lib/table";
import logger from "logger";
import moment from "moment";
import React, { CSSProperties, useEffect, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { getPaginationButtons } from "scenes/Tasks/helpers";
import { getRTEText } from "utils/components/RTE/RTE";

import { TaskService, TaskStatusService } from "../../../services";
import { PaginatedFeathersResponse, Task, TaskStatus } from "../../../types";
import ElasticSearchField from "../../../utils/components/ElasticSearchField";
import {
  getCustomerName,
  getPresetDateRanges,
  getRandomAlphaNumericString,
  getUsername,
} from "../../../utils/helpers";
import numberFormatter from "../../../utils/helpers/numberFormatter";
import {
  getTaskStatusLabel,
  isWhiteBG,
  openTaskStatusColor,
} from "../../../utils/helpers/utils";

interface JobsCardProps extends WithTranslation {
  onTaskEdit: (task: Task) => void;
}
interface TaskColumnProps extends ColumnProps<Task> {
  title: JSX.Element;
  dataIndex: string;
}
interface State {
  tasksLoading: boolean;
  reportLoading: boolean;
  activeDate: string;
  activeStatus: string;
  activeUsers: string[];
  period: any[] | null;
}
interface StatusCount {
  [statusId: string]: number;
}
const boxTextStyles: CSSProperties = {
  fontFamily: "roboto",
  fontSize: "28px",
  fontWeight: "bold",
};
const boxStyle = {
  width: "192px",
  padding: "12px",
  marginRight: "10px",
  backgroundColor: "white",
  border: "1px solid rgba(0, 0, 0, 0.15)",
  borderRadius: "3px",
  display: "inline-block",
  justifyContent: "space-between",
  alignItems: "center",
  transition: "all 400ms",
  cursor: "pointer",
};
const getRange = (activeDate: string, customRange?: any[] | null) => {
  const dates = Object.assign(getPresetDateRanges());
  const range = dates[activeDate] || customRange || [];
  if (Array.isArray(range) && range?.length === 2) {
    const [$gte, $lte] = range;
    return { $gte, $lte };
  } else {
    return undefined;
  }
};
const defaultPageLimit = 10;

const JobsCard = ({ t, onTaskEdit }: JobsCardProps) => {
  const [allStatuses, setAllStatuses] = useState([] as TaskStatus[]);
  const [statusCounts, setStatusCounts] = useState({} as StatusCount);
  const [tasks, setTasks] = useState({
    total: 0,
    limit: defaultPageLimit,
    skip: 0,
    data: [],
  } as PaginatedFeathersResponse<Task>);
  const { total = 0, skip = 0, limit = defaultPageLimit, data = [] } = tasks;
  const [state, updateState] = useState({
    tasksLoading: false,
    reportLoading: false,
    activeDate: t("datePresets.today"),
    activeStatus: "open",
    activeUsers: [],
    period: [],
  } as State);
  const {
    tasksLoading,
    reportLoading,
    activeDate,
    activeStatus,
    activeUsers,
    period = [],
  } = state;
  const setState = (changes: Partial<State>) =>
    updateState((old) => ({ ...old, ...changes }));

  useEffect(() => {
    setState({ reportLoading: true });
    TaskStatusService.find({ query: { category: "task", $limit: 500 } }).then(
      (res: PaginatedFeathersResponse<TaskStatus>) => {
        const rawStatuses = res.data;
        const userStatuses = rawStatuses.filter(
          (item) => item.type !== "system",
        );
        const open = [
          {
            _id: "open",
            title: t("Open"),
            type: "system",
            color: "#808080",
          } as TaskStatus,
        ];

        const orderedStatuses = open.concat(
          userStatuses,
          rawStatuses.filter(
            (item) => item.title === "Completed" && item.type === "system",
          ),
          rawStatuses.filter(
            (item) => item.title === "Cancelled" && item.type === "system",
          ),
        );
        setAllStatuses(orderedStatuses);
        setState({ reportLoading: false });
      },
      (error: Error) => {
        // message.error(t("status.fetchError"));
        logger.error("JobsCard - Error in fetching statuses: ", error);
        setState({ reportLoading: false });
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    setState({ reportLoading: true });
    TaskService.find({
      query: {
        recurringTasks: true,
        ...(getRange(activeDate, period)
          ? { endAt: getRange(activeDate, period) }
          : {}),
        ...((activeUsers?.length || 0) > 0
          ? { assigneeIds: { $in: activeUsers } }
          : {}),
        reportName: "TaskByStatus",
      },
    }).then(
      (res: any) => {
        const counts = res.reduce(
          (acc: StatusCount, curr: any) => ({
            ...acc,
            [curr.statusId || "open"]:
              (acc[curr.statusId || "open"] || 0) + (curr.count || 0),
          }),
          {} as StatusCount,
        );
        setStatusCounts(counts);
        setState({ reportLoading: false });
      },
      (error: Error) => {
        // message.error(t("reports.countFetchError"));
        logger.error(
          "JobsCard - Error in fetching TaskByStatus report: ",
          error,
        );
        setState({ reportLoading: false });
      },
    );
  }, [activeStatus, activeDate, activeUsers, period]);
  useEffect(() => {
    setState({ tasksLoading: true });
    TaskService.find({
      query: {
        recurringTasks: true,
        endAt: getRange(activeDate, period),
        ...((activeUsers?.length || 0) > 0
          ? { assigneeIds: { $in: activeUsers } }
          : {}),
        statusId: activeStatus === "open" ? null : activeStatus,
        subTasks: false,
        $sort: { endAt: 1 },
        $limit: limit,
        $skip: skip,
      },
    }).then(
      (res: PaginatedFeathersResponse<Task>) => {
        setTasks(res);
        setState({ tasksLoading: false });
      },
      (error: Error) => {
        setState({ tasksLoading: false });
        logger.error("JobsCard - Error in fetching tasks: ", error);
        // message.error(t("taskList.fetchError"));
      },
    );
  }, [t, limit, skip, activeStatus, activeDate, activeUsers, period]);
  useEffect(() => {
    let isUnmounted = false;
    const handleCreated = (res: Task) => {
      if (isUnmounted || res.isSubtask || (res.isRecurring && res.parentId)) {
        return;
      }
      setTasks((old) => {
        let taskExist = old.data.findIndex((item) => item._id === res._id);

        if (taskExist === -1) {
          return {
            ...old,
            total: old.total + 1,
            data: [res, ...old.data],
          };
        }

        return {
          ...old,
          data: old.data.map((item) => (item._id === res._id ? res : item)),
        };
      });
    };

    const handlePatched = (res: Task) => {
      if (isUnmounted) {
        return;
      }

      setTasks((old) => ({
        ...old,
        data: old.data.map((item: Task) => (item._id === res._id ? res : item)),
      }));
    };

    const handleRemoved = (res: Task) => {
      if (isUnmounted) {
        return;
      }
      setTasks((old) => ({
        ...old,
        total: old.total - 1,
        data: old.data.filter((item: Task) => item._id !== res._id),
      }));
    };

    TaskService.on("created", handleCreated);
    TaskService.on("patched", handlePatched);
    TaskService.on("removed", handleRemoved);
    return () => {
      isUnmounted = true;
      TaskService.off("created", handleCreated);
      TaskService.off("patched", handlePatched);
      TaskService.off("removed", handleRemoved);
    };
  }, []);

  let columns: TaskColumnProps[] = [
    {
      title: t("taskList.dueDate"),
      dataIndex: "endAt",
      render: (text: string) =>
        text && (
          <div className="tw-w-32">
            {text ? moment(text).format("D/MM/YYYY HH:mm") : ""}
          </div>
        ),
    },
    {
      title: t("taskList.customer"),
      dataIndex: "customerId",
      render: (text: any, record: Task) => {
        return (
          <div
            className="tw-w-64 tw-truncate"
            title={getCustomerName(record.customer)}
          >
            {getCustomerName(record.customer)}
          </div>
        );
      },
    },
    {
      title: t("taskList.title"),
      dataIndex: "title",
      render: (text: string) => (
        <div
          className="tw-truncate"
          style={{ width: "400px" }}
          title={getRTEText(text)}
        >
          {getRTEText(text)}
        </div>
      ),
    },
    {
      title: t("taskList.assignee"),
      dataIndex: "assigneeIds",
      render: (text: any, record: Task) => {
        const names =
          (record.assignees || []).map((item) => getUsername(item)) || [];
        return (
          <Tooltip
            autoAdjustOverflow
            placement="bottomLeft"
            title={
              <ol>
                {names.map((name: string, index: number) => (
                  <li key={getRandomAlphaNumericString(10)}>{`${
                    index + 1
                  }. ${name}`}</li>
                ))}
              </ol>
            }
          >
            <div className="tw-w-56 tw-truncate">{names.join(" | ")}</div>
          </Tooltip>
        );
      },
    },
    {
      title: t("customerList.city"),
      dataIndex: "address",
      render: (text: any, record: Task) => (
        <div
          className="tw-w-56 tw-truncate"
          title={record?.customer?.address?.city}
        >
          {record?.customer?.address?.city}
        </div>
      ),
    },
    {
      title: t("taskList.num"),
      dataIndex: "_id",
      render: (text: string) => {
        return text?.slice(-5);
      },
    },
  ];
  columns = columns.map((col) => ({
    ...col,
    title: <span className="s-col-title">{col.title}</span>,
    onCell: (record) => ({
      className: "s-table-text s-pointer",
      onClick: () => onTaskEdit(record),
      style: { minWidth: "80px" },
    }),
  }));

  const scrollLeft = (flag: boolean) => {
    const element = document.querySelector(".scroll");
    if (element) {
      element.scrollLeft = flag
        ? element.scrollLeft + element.clientWidth - 100
        : element.scrollLeft - element.clientWidth - 100;
    }
  };

  return (
    <div className="tw-shadow-md tw-border tw-p-4">
      <div className="tw-flex">
        <span className="s-page-title">{t("header.dashboard")}</span>
      </div>
      <div className="tw-flex tw-my-2">
        <Select
          value={activeDate}
          className="tw-w-56"
          onChange={(activeDate) => setState({ activeDate })}
        >
          {Object.entries(getPresetDateRanges()).map(([name, value]) => (
            <Select.Option value={name} key={name}>
              {name}
            </Select.Option>
          ))}
          <Select.Option
            value={t("datePresets.allTime") as string}
            key="allTime"
          >
            {t("datePresets.allTime")}
          </Select.Option>
        </Select>
        <DatePicker.RangePicker
          value={period as any}
          onChange={(period) => {
            let activeDate = t("datePresets.allTime");
            if (Array.isArray(period)) {
              activeDate = t("datePresets.customDate");
            }
            setState({ period, activeDate });
          }}
          ranges={getPresetDateRanges()}
          className="tw-w-56 tw-mx-2"
        />
        <ElasticSearchField
          entity="users"
          currentValue={[]}
          mode="multiple"
          stringifyJSON={true}
          renderOptions={(options: string[]) =>
            options.map((option) => (
              <Select.Option key={option} value={option}>
                {getUsername(JSON.parse(option))}
              </Select.Option>
            ))
          }
          onChange={(users: any) =>
            setState({
              activeUsers: users.map((item: string) => JSON.parse(item)._id),
            })
          }
          maxTagCount={1}
          maxTagTextLength={2}
          placeholder={t("taskSubHeader.filterByEmployee")}
          className="st-placeholder-color s-tags-color tw-hidden md:tw-inline"
          style={{ width: "12rem" }}
        />
      </div>
      <div className="s-hover-parent tw-relative">
        <div
          className="tw-absolute s-hover-target tw-rounded-full tw-shadow-lg tw-bg-white tw-ml-5 s-pointer"
          style={{
            left: "0",
            top: "calc(50% - 15px)",
            height: "30px",
            width: "30px",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
          }}
          onClick={() => scrollLeft(false)}
        >
          <div className="tw-h-full tw-w-full tw-flex tw-justify-center tw-items-center">
            <FontAwesomeIcon icon={faAngleLeft} size="2x" />
          </div>
        </div>
        <div
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            scrollBehavior: "smooth",
          }}
          className="scroll tw-mb-5"
        >
          {allStatuses.map((status) => (
            <div
              style={{
                ...boxStyle,
                ...(activeStatus === status._id
                  ? {
                      color: "white",
                      background: isWhiteBG(status)
                        ? openTaskStatusColor
                        : status.color,
                    }
                  : {}),
              }}
              key={status._id}
              onClick={() => setState({ activeStatus: status._id })}
            >
              <div style={boxTextStyles}>
                {reportLoading ? (
                  <LoadingOutlined />
                ) : (
                  numberFormatter(statusCounts[status._id || ""] || 0)
                )}
              </div>
              <div className="tw-truncate tw-text-base">
                {getTaskStatusLabel(status)}
              </div>
            </div>
          ))}
        </div>
        <div
          className="tw-absolute s-hover-target tw-rounded-full tw-shadow-lg tw-mr-5 s-pointer"
          style={{
            right: "0",
            top: "calc(50% - 15px)",
            height: "30px",
            width: "30px",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
          }}
          onClick={() => scrollLeft(true)}
        >
          <div className="tw-h-full tw-w-full tw-flex tw-justify-center tw-items-center">
            <FontAwesomeIcon icon={faAngleRight} size="2x" />
          </div>
        </div>
      </div>
      <Table
        dataSource={data}
        columns={columns}
        rowKey="_id"
        pagination={{
          current: skip / limit + 1,
          pageSize: limit,
          total,
          onChange: (pageNum) =>
            setTasks((old) => ({ ...old, skip: (+pageNum - 1) * limit })),
          onShowSizeChange: (page, size) =>
            setTasks((old) => ({
              ...old,
              limit: size,
              skip: (page - 1) * limit,
            })),
          pageSizeOptions: ["10", "25", "50", "100"],
          size: "small",
          itemRender: (page, type) =>
            getPaginationButtons(
              page,
              type,
              skip / limit + 1,
              skip + limit >= total,
              false,
            ),
          style: { display: "block", textAlign: "center", float: "unset" },
        }}
        loading={tasksLoading}
        size="middle"
        locale={{
          emptyText: <Empty description={t("tables.noData")} />,
        }}
        scroll={{ x: true }}
        className="s-dashboard-tasks"
      />
    </div>
  );
};

export default withTranslation()(JobsCard);
