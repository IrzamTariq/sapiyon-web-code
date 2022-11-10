import { MoreOutlined } from "@ant-design/icons";
import { Button, Dropdown, Empty, Menu, Popconfirm, Table } from "antd";
import { ColumnProps } from "antd/lib/table";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import UserContext from "UserContext";
import { TaskStockColumns } from "utils/components/TableSettings/Components/StandardTableColumns";
import { currencyFormatter } from "utils/helpers/currencyFormatter";

import { TaskStockLine, UserContextType } from "../../types";
import { getOrderedColumns, getTotalWithTax } from "../../utils/helpers";
import numberFormatter from "../../utils/helpers/numberFormatter";
import EditableCell from "./EditableCell";
import EditableRow, { EditableRowContext } from "./EditableRowContext";

interface EditableStockTableProps {
  editingId: string;
  stockList: TaskStockLine[];
  handleRemove: (_id: string) => void;
  handleSave: (record: TaskStockLine) => void;
  cancelEditing: (_id: string) => void;
  onEdit: (_id: string) => void;
}

interface EditableStockColumnProps extends ColumnProps<TaskStockLine> {
  editable?: boolean;
  initialValue?: string | number;
  inputType?: string;
  inputName?: string;
}

const EditableStockTable = ({
  editingId,
  stockList,
  handleRemove,
  handleSave,
  cancelEditing,
  onEdit,
}: EditableStockTableProps) => {
  const [t] = useTranslation();
  const { firm } = useContext(UserContext) as UserContextType;
  const { tableSettings } = useContext(UserContext) as UserContextType;
  const isEditing = (record: TaskStockLine) => record._id === editingId;

  let cols: EditableStockColumnProps[] = [
    {
      title: t("stock.item"),
      dataIndex: "itemId",
      editable: true,
      render: (text: string, record: TaskStockLine) => (
        <div
          className="tw-truncate"
          title={record?.item?.title}
          style={{ maxWidth: "230px" }}
        >
          {record?.item?.title}
        </div>
      ),
    },
    {
      title: t("stock.qty"),
      dataIndex: "qty",
      editable: true,
      align: "right",
      width: "15%",
      render: (text) => numberFormatter(text),
    },
    {
      title: t("stock.unitCost"),
      dataIndex: "unitPrice",
      editable: true,
      align: "right",
      width: "15%",
      render: (text: string) =>
        currencyFormatter(parseFloat(text), false, firm.currencyFormat),
    },
    {
      title: t("stockList.KDV"),
      dataIndex: "taxPercentage",
      editable: true,
      align: "right",
      width: "15%",
      render: (text: string) => `${Number.isFinite(text) ? text : 18}%`,
    },
    {
      title: t("stock.cost"),
      dataIndex: "cost",
      editable: true,
      align: "right",
      width: "15%",
      render: (text: string, record) =>
        currencyFormatter(getTotalWithTax(record), false, firm.currencyFormat),
    },
    {
      dataIndex: "actions",
      width: "3%",
      render: (text: any, record: TaskStockLine) => {
        return isEditing(record) ? (
          <div className="tw-truncate tw-text-right">
            <EditableRowContext.Consumer>
              {({ saveStock }) => (
                <Button
                  type="primary"
                  size="small"
                  className="tw-mr-1"
                  onClick={() => saveStock()}
                >
                  {t("global.save")}
                </Button>
              )}
            </EditableRowContext.Consumer>
            <Popconfirm
              title={t("settings.cancelMsg")}
              onConfirm={() => cancelEditing(record._id)}
              okButtonProps={{ danger: true }}
              okText={t("global.ok")}
              cancelText={t("global.cancel")}
              placement="topRight"
            >
              <Button type="default" size="small" className="tw-mr-1">
                {t("global.cancel")}
              </Button>
            </Popconfirm>
          </div>
        ) : (
          <div className="tw-text-right">
            <Dropdown
              placement="bottomRight"
              overlay={
                <Menu>
                  <Menu.Item
                    disabled={!!editingId}
                    onClick={() => onEdit(record._id)}
                  >
                    {t("settings.edit")}
                  </Menu.Item>
                  <Menu.Item disabled={!!editingId}>
                    <Popconfirm
                      title={t("settings.deleteMsg")}
                      onConfirm={() => handleRemove(record._id)}
                      okText={t("global.delete")}
                      okButtonProps={{ danger: true }}
                      cancelText={t("global.cancel")}
                      placement="topRight"
                    >
                      <div className="tw-text-red-500">
                        {t("settings.delete")}
                      </div>
                    </Popconfirm>
                  </Menu.Item>
                </Menu>
              }
            >
              <MoreOutlined className="s-pointer tw-font-bold" />
            </Dropdown>
          </div>
        );
      },
    },
  ];
  cols = getOrderedColumns(cols, tableSettings.taskStock || TaskStockColumns);
  const columns = cols.map((col) => {
    const newCol = {
      ...col,
      title: <span className="s-col-title-simple">{col.title}</span>,
    };

    if (!newCol.editable) {
      return { ...newCol, onCell: () => ({ className: "s-table-text" }) };
    } else {
      return {
        ...newCol,
        onCell: (record: TaskStockLine) => ({
          editable: newCol.editable,
          dataIndex: newCol.dataIndex,
          className: "s-table-text",
        }),
      };
    }
  });

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  return (
    <div>
      <Table
        columns={columns}
        dataSource={stockList}
        rowKey={"_id"}
        //ANTDV4TODO: onRow type could not be determined, do something about it
        // @ts-ignore
        onRow={(record) => ({
          record,
          isEditing: isEditing(record),
          submitStockForm: (stock: TaskStockLine) => handleSave(stock),
        })}
        components={components}
        className="editable-row s-style-validation-msg"
        pagination={false}
        locale={{
          emptyText: <Empty description={t("tables.noData")} />,
        }}
      />
    </div>
  );
};

export default EditableStockTable;
