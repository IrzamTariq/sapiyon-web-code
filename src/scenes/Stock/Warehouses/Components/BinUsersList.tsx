import { MoreOutlined } from "@ant-design/icons";
import {
  Button,
  Dropdown,
  Empty,
  Menu,
  Popconfirm,
  Table,
  Tooltip,
} from "antd";
import { ColumnProps } from "antd/lib/table";
import React, { Key, useContext } from "react";
import { useTranslation } from "react-i18next";
import { getPaginationButtons } from "scenes/Tasks/helpers";
import Placeholder from "scenes/Tasks/TaskList/Components/Placeholder";
import { Bin, PaginatedFeathersResponse, User, UserContextType } from "types";
import UserContext from "UserContext";
import { warehouseColumns } from "utils/components/TableSettings/Components/StandardTableColumns";
import { getOrderedColumns, getUsername } from "utils/helpers";
import {
  SortState,
  handleSorting,
  setUpSorting,
} from "utils/helpers/tableEnhancements";

interface StockBinsProps {
  bins: PaginatedFeathersResponse<Bin>;
  loading: boolean;
  viewDetails: (bin: Bin) => void;
  selectedRowKeys: Key[];
  setSelectedRowKeys: (keys: Key[]) => void;
  editBin: (bin: Bin) => void;
  removeBin: (binId: string) => void;
  handlePageChange: (skip: number) => void;
  sorts: SortState;
  setSorts: (sortQuery: SortState) => void;
}

interface ColProps extends ColumnProps<Bin> {
  cellWidth?: number;
}

const StockBins = ({
  bins,
  loading,
  viewDetails,
  selectedRowKeys,
  setSelectedRowKeys,
  editBin,
  removeBin,
  handlePageChange,
  sorts,
  setSorts,
}: StockBinsProps) => {
  const [t] = useTranslation();
  const { data = [], limit = 50, skip = 0, total = 0 } = bins;
  const { firm, hasFeature, tableSettings } = useContext(
    UserContext,
  ) as UserContextType;

  let cols: ColProps[] = [
    {
      title: t("warehouses.name"),
      dataIndex: "title",
      ...setUpSorting(sorts, "title", 1),
      render: (text) => (
        <div className="tw-truncate" title={text} style={{ width: "inherit" }}>
          {text}
        </div>
      ),
    },
    {
      title: t("warehouses.assignedTo"),
      dataIndex: "assignees",
      render: (_: any, { assignees = [] as User[] }) => {
        const names = assignees.map((user) => getUsername(user));

        return (
          <Tooltip
            title={
              <ol>
                {assignees.map((user, index) => (
                  <li key={user._id}>{`${index + 1}. ${getUsername(user)}`}</li>
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
  ];

  if (hasFeature("parasutSync")) {
    cols = [
      ...cols,
      {
        title: t("parasutIntegration.colTitle"),
        dataIndex: "parasutId",
        render: (text) =>
          !!text ? (
            <Button
              type="link"
              disabled={!firm.parasutId}
              target="_blank"
              href={`https://uygulama.parasut.com/${firm.parasutId}/depolar/${text}`}
              style={{ padding: 0 }}
            >
              {t("parasutIntegration.synced")}
            </Button>
          ) : (
            t("parasutIntegration.notSynced")
          ),
      },
    ];
  }
  cols = [
    ...cols,
    {
      title: t("global.actions"),
      dataIndex: "actions",
      render: (_: any, record) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item onClick={() => editBin(record)}>
                {t("settings.edit")}
              </Menu.Item>
              <Menu.Item>
                <Popconfirm
                  title={t("settings.deleteMsg")}
                  onConfirm={() => removeBin(record._id)}
                  okButtonProps={{ danger: true }}
                  okText={t("global.delete")}
                  cancelText={t("global.cancel")}
                >
                  <div className="tw-text-red-500">{t("settings.delete")}</div>
                </Popconfirm>
              </Menu.Item>
            </Menu>
          }
        >
          <MoreOutlined className="tw-mx-2 s-pointer" />
        </Dropdown>
      ),
    },
  ];
  cols = getOrderedColumns(
    cols,
    tableSettings["warehouses"] || warehouseColumns,
  );
  const columns = cols.map((col) => {
    const { cellWidth = 200 } = col;
    return {
      ...col,
      title: (
        <div className="s-col-title" style={{ minWidth: `${cellWidth}px` }}>
          {col.title}
        </div>
      ),
      onCell:
        col.dataIndex === "actions" || col.dataIndex === "parasutId"
          ? () => ({ className: "s-table-text", style: { width: cellWidth } })
          : (record) => ({
              className: "s-table-text s-pointer",
              style: { width: cellWidth },
              onClick: () => viewDetails(record),
            }),
    } as ColProps;
  });

  return (
    <>
      {!loading && data.length === 0 ? (
        <Placeholder
          primaryAction={() => editBin({} as Bin)}
          primaryBtnText={t("dataPlaceholder.warehouses.action")}
          primaryText={t("dataPlaceholder.warehouses.title")}
          secondaryText={t("dataPlaceholder.warehouses.description")}
          fixHeight={400}
        />
      ) : (
        <Table
          rowKey={(record) => record._id}
          dataSource={data}
          columns={columns}
          rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
          pagination={{
            current: skip / limit + 1,
            total,
            pageSize: limit,
            onChange: (pageNum) => handlePageChange((pageNum - 1) * limit),
            itemRender: (page, type) =>
              getPaginationButtons(
                page,
                type,
                skip / limit + 1,
                skip + limit >= total,
              ),
            showTotal: (total, range) => `${range[0]} - ${range[1]} / ${total}`,
            style: { marginBottom: 0 },
            position: ["bottomCenter"],
          }}
          onChange={(a, b, sortData) =>
            handleSorting(sortData, sorts, setSorts)
          }
          scroll={{ x: true }}
          locale={{
            emptyText: <Empty description={t("tables.noData")} />,
          }}
          loading={loading}
          className="s-tabsTable-scrolling"
        />
      )}
    </>
  );
};

export default StockBins;
