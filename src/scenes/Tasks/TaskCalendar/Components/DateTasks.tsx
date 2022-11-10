import { MoreOutlined } from "@ant-design/icons";
import { faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Dropdown,
  Empty,
  Menu,
  Modal,
  Popconfirm,
  Table,
  Tag,
  Tooltip,
} from "antd";
import { ColumnProps } from "antd/lib/table";
import moment, { Moment } from "moment";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { getRTEText } from "utils/components/RTE/RTE";

import { Task, UserContextType } from "../../../../types";
import UserContext from "../../../../UserContext";
import {
  getCustomerName,
  getRandomAlphaNumericString,
  getRecurrenceLabel,
  getUsername,
  mapCustomFieldValuesToColumns,
} from "../../../../utils/helpers";
import {
  getConversionStatusText,
  getTaskStatusStyles,
} from "../../../../utils/helpers/utils";

interface DateTasksProps {
  visible: boolean;
  date: Moment;
  tasks: Task[];
  onClose: () => void;
  startEditingTask: (record: Task) => void;
  duplicateTask: (record: Task) => void;
  deleteTask: (id: string) => void;
}

const DateTasks = ({
  visible,
  date,
  tasks,
  onClose,
  startEditingTask,
  duplicateTask,
  deleteTask,
}: DateTasksProps) => {
  const [t] = useTranslation();
  const { firm, hasPermission } = useContext(UserContext) as UserContextType;
  const customFields = firm?.forms?.tasks;

  let columns: ColumnProps<Task>[] = [
    {
      title: t("taskList.dueDate"),
      dataIndex: "endAt",
      render: (text: string, record: Task) =>
        text && (
          <div style={{ width: record.isRecurring ? "17rem" : "8rem" }}>
            {text ? moment(text).format("DD MM YYYY HH:mm") : ""}
            {record.isRecurring && (
              <>
                <Tooltip
                  autoAdjustOverflow
                  title={t("repeatedTasks.viewRepetitions")}
                >
                  <span className="tw-ml-5 repeat-icon-parent">
                    <FontAwesomeIcon
                      icon={faSyncAlt}
                      className="s-repeat-icon"
                    />
                    {record?.isRecurring && (
                      <span className="tw-ml-2">
                        {getRecurrenceLabel(record)}
                      </span>
                    )}
                  </span>
                </Tooltip>
              </>
            )}
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
        return text.slice(-5);
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
    ...mapCustomFieldValuesToColumns<Task>(customFields),
    {
      title: t("taskList.action"),
      className: "s-table-text",
      dataIndex: "actions",
      render: (text: any, record: Task) => (
        <span>
          <Dropdown
            trigger={["click"]}
            overlay={
              <Menu>
                <Menu.Item
                  key="0"
                  onClick={() => {
                    startEditingTask(record);
                    onClose();
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
                      onClose();
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
  columns = columns.reduce((all, curr) => {
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
                  startEditingTask(record);
                  onClose();
                },
                className: "s-pointer s-table-text",
              };
            },
          },
        ];
  }, [] as ColumnProps<Task>[]);

  return (
    <Modal
      title={date && moment(date).format("dddd, DD MMMM YYYY")}
      visible={visible}
      onCancel={() => onClose()}
      footer={null}
      width={800}
      bodyStyle={{ padding: "0px" }}
    >
      <Table
        rowKey="_id"
        tableLayout={"auto"}
        columns={columns}
        dataSource={tasks}
        scroll={{ x: true }}
        pagination={{
          style: { marginRight: "24px" },
          hideOnSinglePage: true,
          pageSize: 100,
        }}
        locale={{
          emptyText: <Empty description={t("tables.noData")} />,
        }}
      />
    </Modal>
  );
};

export default DateTasks;
