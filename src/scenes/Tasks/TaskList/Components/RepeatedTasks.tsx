import { MoreOutlined } from "@ant-design/icons";
import {
  Button,
  Dropdown,
  Empty,
  Menu,
  Modal,
  Popconfirm,
  Tag,
  Tooltip,
  message,
} from "antd";
import Table, { ColumnProps } from "antd/lib/table";
import logger from "logger";
import moment from "moment";
import React, { ReactText, useContext, useEffect, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { tasksInitialState } from "scenes/Tasks/helpers";
import { getRTEText } from "utils/components/RTE/RTE";

import { TaskService } from "../../../../services";
import {
  CustomField,
  PaginatedFeathersResponse,
  Task,
} from "../../../../types";
import UserContext from "../../../../UserContext";
import {
  getCustomerName,
  getRandomAlphaNumericString,
  getUsername,
} from "../../../../utils/helpers";
import {
  getConversionStatusText,
  getTaskStatusStyles,
} from "../../../../utils/helpers/utils";

const INITIAL_STATE = {
  total: 0,
  limit: 50,
  skip: 0,
  data: [] as Task[],
} as PaginatedFeathersResponse<Task>;

interface RepeatedTasksProps extends WithTranslation {
  visible: boolean;
  parentId: string;
  editTask: (task: Task) => void;
  duplicateTask: (task: Task) => void;
  deleteTask: (_id: string) => void;
  handleClose: () => void;
}
interface TaskColumnProps extends ColumnProps<Task> {
  title: JSX.Element;
  dataIndex: string;
}

const RepeatedTasks = ({
  t,
  visible,
  parentId,
  editTask,
  duplicateTask,
  deleteTask,
  handleClose,
}: RepeatedTasksProps) => {
  const { hasPermission, firm }: any = useContext(UserContext);
  const fields = firm?.forms?.tasks || ([] as CustomField[]);
  const [fetchRequired, setFetchRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([] as string[]);
  const [tasks, setTasks] = useState(INITIAL_STATE);
  const { data = [], total = 0, limit = 50, skip = 0 } = tasks;
  const query = {
    subTasks: false,
    $or: [{ parentId }, { _id: parentId }],
    recurringTasks: true,
    $sort: { endAt: -1 },
    $limit: limit,
    $skip: skip,
  };

  useEffect(() => {
    if (!!parentId) {
      setLoading(true);
      TaskService.find({ query }).then(
        (res: PaginatedFeathersResponse<Task>) => {
          setTasks(res);
          setLoading(false);
        },
        (error: Error) => {
          setLoading(false);
          logger.error("Could not fetch jobs: ", error);
          message.error(t("tasks.fetchError"));
        },
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentId, skip, fetchRequired]);
  useEffect(() => {
    let isUnmounted = false;
    const handleCreated = (res: Task) => {
      if (isUnmounted || res.isSubtask || res.parentId !== parentId) {
        return;
      }

      setTasks((old) => ({
        ...old,
        total: old.total + 1,
        data: [res, ...old.data].slice(0, 25),
      }));
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
      setSelectedRowKeys((old) => old.filter((item) => item !== res._id));
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let customFieldsColumns: any = fields.map((field: CustomField) => ({
    title: field.label,
    dataIndex: field._id,
    render: (text: any, record = {} as Task) => {
      let returnValue = "";
      let width = "tw-w-64";
      let customFields = record.fields || [];
      let colField = customFields.find((item) => item._id === field._id);
      if (!colField) {
        returnValue = "";
      } else if (colField.type === "date") {
        width = "tw-w-32";
        returnValue = colField.value
          ? moment(colField.value).format("DD/MM/YYYY HH:mm")
          : "";
      } else if (colField.type === "dropdown") {
        width = "tw-w-56";
        let val = colField.value || [];
        if (Array.isArray(val)) {
          val = val.join(", ");
        }
        returnValue = val;
      } else if (colField.type === "toggleSwitch") {
        width = "tw-w-16";
        returnValue =
          colField.value === true ? t("global.yes") : t("global.no");
      } else {
        returnValue = colField.value;
      }

      return (
        <div className={"tw-truncate " + width} title={returnValue}>
          {returnValue}
        </div>
      );
    },
  }));
  let columns: TaskColumnProps[] = [
    {
      title: t("taskList.dueDate"),
      dataIndex: "endAt",
      render: (text: string, record: Task) =>
        text && (
          <div className="tw-w-32">
            {text ? moment(text).format("DD/MM/YYYY HH:mm") : ""}
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
      title: t("taskList.num"),
      dataIndex: "_id",
      render: (text: string) => {
        return text.substr(-5);
      },
    },
    {
      title: t("taskList.status"),
      dataIndex: "statusId",
      render: (text: any, record: Task) => {
        return (
          <Tag
            style={getTaskStatusStyles(record.status, record.isInvoiceCreated)}
          >
            {getConversionStatusText(record, t("Open"))}
          </Tag>
        );
      },
    },
    ...customFieldsColumns,
    {
      title: t("taskList.action"),
      className: "s-table-text",
      dataIndex: "actions",
      //   fixed: "right",
      render: (text: any, record: Task) => (
        <span>
          <Dropdown
            trigger={["click"]}
            overlay={
              <Menu>
                <Menu.Item
                  key="0"
                  onClick={() => {
                    editTask(record);
                    setTasks({} as PaginatedFeathersResponse<Task>);
                    handleClose();
                  }}
                >
                  <span className="s-main-font s-main-text-color">
                    {t("tasklist.edit")}
                  </span>
                </Menu.Item>
                <Menu.Item
                  key="1"
                  style={{
                    display: hasPermission("canCreateTasks")
                      ? "static"
                      : "none",
                  }}
                >
                  <span
                    className="s-main-font s-main-text-color"
                    onClick={() => {
                      duplicateTask(record);
                      setTasks({} as PaginatedFeathersResponse<Task>);
                      handleClose();
                    }}
                  >
                    {t("global.duplicate")}
                  </span>
                </Menu.Item>
                {(!record.isRecurring ||
                  (record.isRecurring && !!record.parentId)) && (
                  <Menu.Item
                    key="2"
                    style={{
                      display: hasPermission("canRemoveTasks")
                        ? "static"
                        : "none",
                    }}
                  >
                    <Popconfirm
                      title={t("settings.deleteMsg")}
                      onConfirm={() =>
                        record?._id ? deleteTask(record._id) : null
                      }
                      okButtonProps={{ danger: true }}
                      okText={t("global.delete")}
                      cancelText={t("global.cancel")}
                    >
                      <div className="tw-text-red-500">
                        {t("tasklist.delete")}
                      </div>
                    </Popconfirm>
                  </Menu.Item>
                )}
              </Menu>
            }
            placement="bottomCenter"
          >
            <MoreOutlined />
          </Dropdown>
        </span>
      ),
    },
  ];
  columns = columns.reduce((all: TaskColumnProps[], curr: TaskColumnProps) => {
    const current = {
      ...curr,
      title: (
        <Tooltip title={curr.title} placement="topLeft">
          <span className="s-col-title">{curr.title}</span>
        </Tooltip>
      ),
    };

    return current.dataIndex === "actions"
      ? [...all, current]
      : [
          ...all,
          {
            ...current,
            onCell: (record: Task) => {
              return {
                onClick: () => {
                  editTask(record);
                  // handleClose();
                },
                className: "s-pointer s-table-text",
              };
            },
          },
        ];
  }, []);

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: ReactText[]) => setSelectedRowKeys(keys as string[]),
  };

  const bulkDeleteTasks = () => {
    setLoading(true);
    message.loading({
      content: `${t("bulkActions.deleting")} ${selectedRowKeys.length} ${t(
        "bulkActions.records",
      )}`,
      key: "deletingTasks",
      duration: 0,
    });
    TaskService.remove(null, {
      query: { _id: { $in: selectedRowKeys } },
    }).then(
      (res: Task[]) => {
        const deleted = res?.length || 0;
        if ((skip === 0 || deleted < limit) && !(skip + limit >= total)) {
          setFetchRequired((old) => !old);
        } else {
          setTasks((old) => ({
            ...old,
            skip: skip - limit,
          }));
        }
        setLoading(false);
        message.success({
          content: `${t("bulkActions.deleted")} ${deleted} ${t(
            "bulkActions.selectedRecords",
          )}`,
          key: "deletingTasks",
        });
      },
      (error: Error) => {
        logger.error("Could not bulk delete tasks", error);
        setLoading(false);
        message.error({
          content: t("tasks.bulkDeleteError"),
          key: "deletingTasks",
        });
      },
    );
  };

  const onClose = () => {
    setTasks(tasksInitialState);
    handleClose();
  };

  return (
    <Modal
      title={
        <>
          {t("repeatedTasks.pageTitle")}{" "}
          {selectedRowKeys.length > 0 && (
            <Button
              danger
              className="tw-ml-5"
              onClick={() => bulkDeleteTasks()}
            >
              {t("bulkActions.delete")} {selectedRowKeys.length}{" "}
              {t("bulkActions.selectedItems")}
            </Button>
          )}
        </>
      }
      visible={visible}
      width={900}
      onCancel={onClose}
      footer={null}
      bodyStyle={{ padding: "0px" }}
      zIndex={950}
    >
      <Table
        rowKey="_id"
        loading={loading}
        tableLayout={"auto"}
        columns={columns}
        rowSelection={rowSelection}
        dataSource={data}
        scroll={{ x: true }}
        pagination={{
          style: { marginRight: "24px" },
          hideOnSinglePage: true,
          pageSize: limit,
          current: skip / limit + 1,
          total,
          showSizeChanger: false,
          onChange: (pageNum) =>
            setTasks((old) => ({ ...old, skip: (pageNum - 1) * limit })),
        }}
        locale={{
          emptyText: <Empty description={t("tables.noData")} />,
        }}
      />
    </Modal>
  );
};

export default withTranslation()(RepeatedTasks);
