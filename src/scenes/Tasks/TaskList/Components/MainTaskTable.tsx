import { MoreOutlined } from "@ant-design/icons";
import { faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dropdown, Empty, Menu, Popconfirm, Table, Tag, Tooltip } from "antd";
import { ColumnProps } from "antd/lib/table";
import { SorterResult, TableRowSelection } from "antd/lib/table/interface";
import moment from "moment";
import React, { Key, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { getRTEText } from "utils/components/RTE/RTE";
import { taskColumns } from "utils/components/TableSettings/Components/StandardTableColumns";
import { currencyFormatter } from "utils/helpers/currencyFormatter";
import { handleSorting, setUpSorting } from "utils/helpers/tableEnhancements";

import { CustomField, Task, UserContextType } from "../../../../types";
import UserContext from "../../../../UserContext";
import {
  getCustomerName,
  getGrandTotalWithTax,
  getOrderedColumns,
  getRandomAlphaNumericString,
  getRecurrenceLabel,
  getUsername,
  mapCustomFieldValuesToColumns,
} from "../../../../utils/helpers";
import {
  getConversionStatusText,
  getTaskStatusStyles,
} from "../../../../utils/helpers/utils";
import { getPaginationButtons } from "../../helpers";
import RepeatedTasks from "./RepeatedTasks";

interface MainTaskTableProps {
  tasks: Task[];
  pagination: { total: number; skip: number; limit: number };
  isLoading: boolean;
  startEditingTask: (record: Task) => void;
  duplicateTask: (record: Task) => void;
  deleteTask: (id: string) => void;
  deleteAllRepetitions: (_id: string) => void;
  handlePageChange: (pageNum: number, pageSize: number) => void;
  selectedRowKeys: Key[];
  onRowSelectionChange: (keys: Key[]) => void;
  sorts: any;
  setSorts: (sorts: any) => void;
}

interface TaskColumns extends ColumnProps<Task> {
  cellWidth?: number;
}

const MainTaskTable = ({
  tasks = [] as Task[],
  selectedRowKeys,
  onRowSelectionChange,
  isLoading,
  startEditingTask,
  duplicateTask,
  deleteTask,
  deleteAllRepetitions,
  pagination,
  handlePageChange,
  sorts,
  setSorts,
}: MainTaskTableProps) => {
  const [t] = useTranslation();
  const { hasPermission, firm, tableSettings } = useContext(
    UserContext,
  ) as UserContextType;
  const fields = firm?.forms?.tasks || ([] as CustomField[]);
  const { total, limit, skip } = pagination;
  const [state, setState] = useState({ showRepetitions: false, parentId: "" });

  let columns: TaskColumns[] = [
    {
      title: t("taskList.dueDate"),
      dataIndex: "endAt",
      ...setUpSorting(sorts, "endAt", 1),
      render: (text, record) => (
        <div className="tw-truncate" style={{ width: "inherit" }}>
          {text ? moment(text).format("DD/MM/YYYY HH:mm") : ""}
          {record.isRecurring && (
            <>
              <Tooltip
                autoAdjustOverflow
                title={t("repeatedTasks.viewRepetitions")}
                trigger="hover"
              >
                <span
                  className="tw-ml-5 repeat-icon-parent"
                  onClick={(e) => {
                    e.stopPropagation();
                    setState({
                      showRepetitions: true,
                      parentId: record.parentId || record._id || "",
                    });
                  }}
                >
                  <FontAwesomeIcon icon={faSyncAlt} className="s-repeat-icon" />
                  <span className="tw-ml-2">{getRecurrenceLabel(record)}</span>
                </span>
              </Tooltip>
            </>
          )}
        </div>
      ),
    },
    {
      title: t("taskList.customer"),
      dataIndex: "customer",
      render: (text, record) => {
        return (
          <div
            className="tw-truncate"
            style={{ width: "inherit" }}
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
      render: (text) => (
        <div
          className="tw-truncate"
          style={{ width: "inherit" }}
          title={getRTEText(text)}
        >
          {getRTEText(text)}
        </div>
      ),
    },
    {
      title: t("taskList.assignee"),
      dataIndex: "assignees",
      render: (text, record) => {
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
            <div className="tw-truncate" style={{ width: "inherit" }}>
              {names.join(" | ")}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: t("taskList.num"),
      dataIndex: "_id",
      render: (text: string) => {
        return <div style={{ width: "inherit" }}>{text.substr(-5)}</div>;
      },
    },
    {
      title: t("taskList.status"),
      dataIndex: "statusId",
      render: (text: any, record: Task) => {
        return (
          <Tag
            style={{
              ...getTaskStatusStyles(record.status, record.isInvoiceCreated),
              width: "inherit",
            }}
            className="tw-truncate tw-block"
            title={getConversionStatusText(record, t("Open"))}
          >
            {getConversionStatusText(record, t("Open"))}
          </Tag>
        );
      },
    },
    {
      title: t("taskList.salesTotal"),
      dataIndex: "salesTotal",
      render: (_, task) =>
        task?.stock?.length ? (
          <div style={{ width: "inherit" }}>
            {currencyFormatter(
              getGrandTotalWithTax(task.stock),
              false,
              firm.currencyFormat,
            )}
          </div>
        ) : null,
    },
    {
      title: t("customerList.city"),
      dataIndex: "address",
      render: (text: any, record: Task) => (
        <div
          className="tw-truncate"
          title={record?.customer?.address?.city}
          style={{ width: "inherit" }}
        >
          {record?.customer?.address?.city}
        </div>
      ),
    },
    ...mapCustomFieldValuesToColumns<Task>(fields, firm),
    {
      title: t("taskList.action"),
      className: "s-table-text",
      dataIndex: "actions",
      render: (_, record) => (
        <Dropdown
          trigger={["click"]}
          overlay={
            <Menu>
              <Menu.Item key="0" onClick={() => startEditingTask(record)}>
                <span className="s-main-font s-main-text-color">
                  {t("tasklist.edit")}
                </span>
              </Menu.Item>
              <Menu.Item
                key="1"
                style={{
                  display: hasPermission("canCreateTasks") ? "static" : "none",
                }}
              >
                <span
                  className="s-main-font s-main-text-color"
                  onClick={() => duplicateTask(record)}
                >
                  {t("global.duplicate")}
                </span>
              </Menu.Item>
              <Menu.Item
                key="2"
                style={{
                  display: hasPermission("canRemoveTasks") ? "static" : "none",
                }}
              >
                <Popconfirm
                  title={t("settings.deleteMsg")}
                  onConfirm={() => deleteTask(record._id || "")}
                  placement="topRight"
                  okText={t("global.delete")}
                  cancelText={t("global.cancel")}
                  okButtonProps={{ danger: true }}
                >
                  <div className="s-main-font tw-text-red-500 tw-w-full">
                    {t("tasklist.delete")}
                  </div>
                </Popconfirm>
              </Menu.Item>
              {record.isRecurring && hasPermission("canRemoveTasks") && (
                <Menu.Item className="s-menu-item">
                  <Popconfirm
                    title={t("repeatedTasks.deleteAllMsg")}
                    onConfirm={() =>
                      deleteAllRepetitions(record.parentId || record._id || "")
                    }
                    placement="right"
                    okText={t("global.delete")}
                    cancelText={t("global.cancel")}
                    okButtonProps={{ danger: true }}
                    arrowPointAtCenter={false}
                  >
                    <div className="tw-text-red-500">
                      {t("repeatedTasks.deleteAll")}
                    </div>
                  </Popconfirm>
                </Menu.Item>
              )}
            </Menu>
          }
          placement="bottomCenter"
        >
          <MoreOutlined className="tw-px-3" />
        </Dropdown>
      ),
    },
  ];
  columns = getOrderedColumns(columns, tableSettings["tasks"] || taskColumns);
  columns = columns.reduce((all, curr) => {
    const { cellWidth } = curr;
    const current = {
      ...curr,
      title: (
        <Tooltip title={curr.title} placement="topLeft">
          <div
            className="s-col-title tw-truncate"
            style={{ minWidth: `${cellWidth}px` }}
          >
            {curr.title}
          </div>
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
                onClick: () => startEditingTask(record),
                className: "s-pointer s-table-text",
                style: { width: `${cellWidth}px` },
              };
            },
          },
        ];
  }, [] as typeof columns);

  const rowSelection: TableRowSelection<Task> = {
    selectedRowKeys,
    preserveSelectedRowKeys: true,
    onChange: onRowSelectionChange,
  };

  return (
    <div>
      <Table
        rowKey="_id"
        loading={isLoading}
        columns={columns}
        rowSelection={rowSelection}
        dataSource={tasks}
        onChange={(a, b, sort) =>
          handleSorting(sort as SorterResult<Task>[], sorts, setSorts)
        }
        pagination={{
          showTotal: (total, range) => `${range[0]} - ${range[1]} / ${total}`,
          itemRender: (page, type) =>
            getPaginationButtons(
              page,
              type,
              skip / limit + 1,
              skip + limit >= total,
            ),
          position: ["bottomCenter"],
          showSizeChanger: true,
          defaultPageSize: 25,
          pageSizeOptions: ["25", "50", "100"],
          current: skip / limit + 1,
          total,
          style: { marginBottom: 0 },
          pageSize: limit,
          onShowSizeChange: handlePageChange,
          onChange: (pageNum, pageSize = limit) =>
            handlePageChange(pageNum, pageSize),
        }}
        locale={{
          emptyText: <Empty description={t("tables.noData")} />,
        }}
        rowClassName={() => "s-compact-row"}
        scroll={{
          x: true,
        }}
        className="s-size-changer s-tasks-scrolling"
      />

      <RepeatedTasks
        visible={state.showRepetitions}
        parentId={state.parentId}
        editTask={startEditingTask}
        duplicateTask={duplicateTask}
        deleteTask={deleteTask}
        handleClose={() =>
          setState((old) => ({
            ...old,
            showRepetitions: false,
            parentId: "",
          }))
        }
      />
    </div>
  );
};

export default MainTaskTable;
