import { MoreOutlined } from "@ant-design/icons";
import { Button, Dropdown, Empty, Menu, Popconfirm, message } from "antd";
import Table, { ColumnProps } from "antd/lib/table";
import logger from "logger";
import mixpanel from "mixpanel-browser";
import React, { Key, useContext } from "react";
import { useTranslation } from "react-i18next";
import { getPaginationButtons } from "scenes/Tasks/helpers";
import { StockItemService } from "services";
import { PaginatedFeathersResponse, StockItem, UserContextType } from "types";
import UserContext from "UserContext";
import { ServiceColumns } from "utils/components/TableSettings/Components/StandardTableColumns";
import { getOrderedColumns } from "utils/helpers";
import { currencyFormatter } from "utils/helpers/currencyFormatter";
import {
  SortState,
  handleSorting,
  setUpSorting,
} from "utils/helpers/tableEnhancements";

import EditableCell from "./ServiceEdit/EditableCell";
import EditableRow, { EditableContext } from "./ServiceEdit/EditableRow";

interface ColProps extends ColumnProps<StockItem> {
  editable?: boolean;
  cellWidth?: number;
}
interface ServicesListProps {
  selectedRowKeys: Key[];
  setSelectedRowKeys: (keys: Key[]) => void;
  isLoading: boolean;
  services: PaginatedFeathersResponse<StockItem>;
  sorts: SortState;
  setSorts: (sortQuery: SortState) => void;
  editedRecordId: string;
  setEditedRecordId: (serviceId: string) => void;
  handlePageChange: (page: number, size: number) => void;
  updateServices: (
    service: StockItem,
    type: "create" | "update" | "remove",
  ) => void;
  areFiltersEmpty: boolean;
}

const ServicesList = ({
  selectedRowKeys,
  setSelectedRowKeys,
  isLoading,
  editedRecordId,
  services,
  sorts,
  setSorts,
  setEditedRecordId,
  handlePageChange,
  updateServices,
  areFiltersEmpty = false,
}: ServicesListProps) => {
  const [t] = useTranslation();
  const { data = [], total = 0, limit = 0, skip = 0 } = services;
  const { tableSettings, firm } = useContext(UserContext) as UserContextType;
  const isEditing = (record: StockItem) => record._id === editedRecordId;
  const handleSubmit = (values: StockItem) => {
    const { _id = "", ...rest } = values;
    if (_id.substr(0, 3) === "NEW") {
      StockItemService.create(rest).then(
        (res: StockItem) => {
          message.success(t("services.saveSuccess"));
          setEditedRecordId("");
          updateServices(values, "remove");
          // updateServices(res, "create");
          mixpanel.track(`service created`, {
            _id: res._id,
          });
        },
        (error: Error) => {
          logger.error("Error in creating product: ", error);
          message.error(t("services.saveError"));
        },
      );
    } else {
      StockItemService.patch(_id, rest).then(
        (res: StockItem) => {
          message.success(t("services.saveSuccess"));
          // updateServices(res, "update");
          setEditedRecordId("");
          mixpanel.track(`service updated`, {
            _id: res._id,
          });
        },
        (error: Error) => {
          logger.error("Error in updating product: ", error);
          message.error(t("services.saveError"));
        },
      );
    }
  };
  const handleRemove = (serviceId: string) => {
    StockItemService.remove(serviceId).then(
      (res: StockItem) => {
        message.success(t("services.removeSuccess"));
        // updateServices(res, "remove");
        mixpanel.track(`Service removed`, {
          _id: res._id,
        });
      },
      (error: Error) => {
        message.error(t("services.removeError"));
        logger.error("Could not delete service: ", error);
      },
    );
  };

  let cols: ColProps[] = [
    {
      title: t("services.serviceName"),
      dataIndex: "title",
      ...setUpSorting(sorts, "title", 1),
      width: "30%",
      editable: true,
      render: (text: string) => (
        <div
          className="tw-truncate"
          style={{ maxWidth: "inherit" }}
          title={text}
        >
          {text}
        </div>
      ),
    },
    {
      title: t("services.description"),
      width: "50%",
      editable: true,
      dataIndex: "description",
      ...setUpSorting(sorts, "description", 2),
      render: (text: string) => (
        <div
          className="tw-truncate"
          title={text}
          style={{ maxWidth: "inherit" }}
        >
          {text}
        </div>
      ),
    },
    {
      title: t("services.price"),
      width: "15%",
      editable: true,
      dataIndex: "unitPrice",
      ...setUpSorting(sorts, "unitPrice", 3),
      render: (text) => (
        <div style={{ width: "inherit" }}>
          {currencyFormatter(text, false, firm.currencyFormat)}
        </div>
      ),
    },
    {
      dataIndex: "actions",
      align: "right",
      render: (_, record) => {
        return isEditing(record) ? (
          <div style={{ width: "inherit" }}>
            <EditableContext.Consumer>
              {({ onSubmit }) => (
                <Button
                  type="primary"
                  size="small"
                  onClick={onSubmit}
                  style={{ marginRight: 8 }}
                >
                  {t("settings.save")}
                </Button>
              )}
            </EditableContext.Consumer>
            <Popconfirm
              title={t("settings.cancelMsg")}
              onConfirm={() => setEditedRecordId("")}
              okText={t("global.ok")}
              cancelText={t("global.cancel")}
              okButtonProps={{ danger: true }}
            >
              <Button size="small">{t("settings.cancel")}</Button>
            </Popconfirm>
          </div>
        ) : (
          <Dropdown
            disabled={editedRecordId !== ""}
            overlay={
              <Menu>
                <Menu.Item
                  disabled={editedRecordId !== ""}
                  onClick={() => setEditedRecordId(record._id)}
                >
                  {t("settings.edit")}
                </Menu.Item>
                <Menu.Item>
                  <Popconfirm
                    title={t("settings.deleteMsg")}
                    onConfirm={() => handleRemove(record._id)}
                    okText={t("global.delete")}
                    okButtonProps={{ danger: true }}
                    cancelText={t("global.cancel")}
                  >
                    <div className="tw-text-red-500">
                      {t("settings.delete")}
                    </div>
                  </Popconfirm>
                </Menu.Item>
              </Menu>
            }
          >
            <MoreOutlined className="tw-px-2 s-pointer" />
          </Dropdown>
        );
      },
    },
  ];
  cols = getOrderedColumns(cols, tableSettings["services"] || ServiceColumns);
  const columns = cols.map((col) => {
    const { cellWidth, sorter = false } = col;
    return {
      ...col,
      sorter: areFiltersEmpty ? sorter : false,
      title: (
        <div className="s-col-title" style={{ minWidth: `${cellWidth}px` }}>
          {col.title}
        </div>
      ),
      onCell: () => ({
        className: "s-table-text",
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        style: { width: cellWidth },
      }),
    } as ColProps;
  });

  const components = {
    body: {
      cell: EditableCell,
      row: EditableRow,
    },
  };

  return (
    <div>
      <Table
        rowKey={"_id"}
        components={components}
        dataSource={data}
        columns={columns}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
          preserveSelectedRowKeys: true,
        }}
        onChange={(a, b, sortData) => handleSorting(sortData, sorts, setSorts)}
        loading={isLoading}
        onRow={(record) => ({
          record,
          isEditing: isEditing(record),
          handleSubmit,
          className: isEditing(record) ? "tw-h-20" : "",
        })}
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
          pageSize: limit,
          onShowSizeChange: handlePageChange,
          onChange: (pageNumber, pageSize = limit) =>
            handlePageChange(pageNumber, pageSize),
          style: { marginBottom: 0 },
        }}
        scroll={{ x: true }}
        rowClassName="editable-row"
        locale={{ emptyText: <Empty description={t("tables.noData")} /> }}
        className="s-exTasks-scrolling"
      />
    </div>
  );
};

export default ServicesList;
