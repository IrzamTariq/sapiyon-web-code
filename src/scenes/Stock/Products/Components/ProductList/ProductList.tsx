import { EyeOutlined, MoreOutlined } from "@ant-design/icons";
import {
  Button,
  Dropdown,
  Empty,
  Image,
  Menu,
  Popconfirm,
  Table,
  Tooltip,
} from "antd";
import { ColumnProps } from "antd/lib/table";
import FilterBar from "components/FilterBar/FilterBar";
import React, { Key, useContext } from "react";
import { useTranslation } from "react-i18next";
import { getPaginationButtons } from "scenes/Tasks/helpers";
import Placeholder from "scenes/Tasks/TaskList/Components/Placeholder";
import { PaginatedFeathersResponse, StockItem, UserContextType } from "types";
import UserContext from "UserContext";
import { productsColumns } from "utils/components/TableSettings/Components/StandardTableColumns";
import {
  getOrderedColumns,
  getRandomAlphaNumericString,
  mapCustomFieldValuesToColumns,
  s3BucketURL,
} from "utils/helpers";
import {
  SortState,
  handleSorting,
  setUpSorting,
} from "utils/helpers/tableEnhancements";

import { currencyFormatter } from "../../../../../utils/helpers/currencyFormatter";
import numberFormatter from "../../../../../utils/helpers/numberFormatter";

interface ProductListProps {
  products: PaginatedFeathersResponse<StockItem>;
  filters: any;
  setFilters: (filters: any) => void;
  editProduct: (product: StockItem) => void;
  removeProduct: (productId: string) => void;
  changePage: (page: number, size: number) => void;
  viewDetails: (product: StockItem) => void;
  selectedRowKeys: Key[];
  setSelectedRowKeys: (keys: Key[]) => void;
  loading: boolean;
  isEmpty: boolean;
  sorts: SortState;
  setSorts: (sortQuery: SortState) => void;
  areFiltersEmpty: boolean;
}

interface ProductColumns<T> extends ColumnProps<T> {
  cellWidth?: number;
}

const ProductList = ({
  products,
  filters,
  setFilters,
  editProduct,
  removeProduct,
  changePage,
  selectedRowKeys,
  setSelectedRowKeys,
  viewDetails,
  loading,
  sorts,
  setSorts,
  isEmpty,
  areFiltersEmpty = false,
}: ProductListProps) => {
  const [t] = useTranslation();
  const { data = [], limit = 25, skip = 0, total = 0 } = products;
  const { firm, hasFeature, tableSettings } = useContext(
    UserContext,
  ) as UserContextType;
  const { forms = {} } = firm;
  const { stockItems: firmCustomFields = [] } = forms;

  let columns: ProductColumns<StockItem>[] = [
    {
      title: t("products.files"),
      dataIndex: "files",
      render: (_, record) =>
        record?.files?.length ? (
          <Image.PreviewGroup>
            {record.files.map((file, index) => (
              <span
                key={file._id}
                className="tw-mr-2"
                style={{ display: index > 0 ? "none" : "inline" }}
              >
                <Image
                  height="52px"
                  width="52px"
                  className="tw-rounded-lg"
                  preview={{
                    mask: <EyeOutlined className="tw-text-lg" />,
                    maskClassName: "tw-rounded-lg",
                  }}
                  src={s3BucketURL(file)}
                />
              </span>
            ))}
          </Image.PreviewGroup>
        ) : null,
    },
    {
      title: t("products.productName"),
      dataIndex: "title",
      ...setUpSorting(sorts, "title", 1),
      render: (text: string) => (
        <div className="tw-truncate" title={text} style={{ width: "inherit" }}>
          {text}
        </div>
      ),
    },
    {
      title: t("products.serialNumber"),
      dataIndex: "barcode",
      render: (text) => <div style={{ width: "inherit" }}>{text}</div>,
    },
    {
      title: t("products.stockInHand"),
      dataIndex: "qty",
      render: (text: number) => (
        <div style={{ width: "inherit" }}>
          {!text || +text === 0 ? "" : numberFormatter(text)}
        </div>
      ),
    },
    {
      title: t("addProduct.unit"),
      dataIndex: "unitOfMeasurement",
      render: (text) => <div style={{ width: "inherit" }}>{text}</div>,
    },
    {
      title: t("products.salesPrice"),
      dataIndex: "unitPrice",
      ...setUpSorting(sorts, "unitPrice", 2),
      render: (text) => (
        <div style={{ width: "inherit" }}>
          {currencyFormatter(text, false, firm.currencyFormat)}
        </div>
      ),
    },
    {
      title: t("products.purchasePrice"),
      dataIndex: "purchasePrice",
      ...setUpSorting(sorts, "purchasePrice", 3),
      render: (text) => (
        <div style={{ width: "inherit" }}>
          {currencyFormatter(text, false, firm.currencyFormat)}
        </div>
      ),
    },
    {
      title: t("products.taxRate"),
      dataIndex: "taxRate",
      ...setUpSorting(sorts, "taxRate", 3),
      render: (taxRate) => (
        <div style={{ width: "inherit" }}>{taxRate || 0}%</div>
      ),
    },
    {
      title: t("products.tags"),
      dataIndex: "tags",
      render: (_, record) => {
        const tags = record?.tags || [];
        return (
          <Tooltip
            autoAdjustOverflow
            placement="bottom"
            title={
              <ol>
                {tags.map((tag, index) => (
                  <li key={getRandomAlphaNumericString()}>{`${
                    index + 1
                  }. ${tag}`}</li>
                ))}
              </ol>
            }
          >
            <div className="tw-truncate" style={{ width: "inherit" }}>
              {tags.join(" | ")}
            </div>
          </Tooltip>
        );
      },
    },
    ...mapCustomFieldValuesToColumns<StockItem>(firmCustomFields, firm),
  ];

  if (hasFeature("parasutSync")) {
    columns = [
      ...columns,
      {
        title: t("parasutIntegration.colTitle"),
        dataIndex: "parasutId",
        ...setUpSorting(sorts, "parasutId", 4),
        render: (text) =>
          !!text ? (
            <Button
              type="link"
              disabled={!firm.parasutId}
              target="_blank"
              href={`https://uygulama.parasut.com/${firm.parasutId}/hizmet-ve-urunler/${text}`}
              style={{ padding: 0 }}
            >
              {t("parasutIntegration.synced")}
            </Button>
          ) : (
            t("parasutIntegration.notSynced")
          ),
        onCell: () => ({ className: "s-table-text" }),
      },
    ];
  }

  columns = [
    ...columns,
    {
      title: t("products.actions"),
      dataIndex: "actions",
      render: (_, record) => (
        <span>
          <Dropdown
            trigger={["click"]}
            overlay={
              <Menu>
                <Menu.Item key="0" onClick={() => editProduct(record)}>
                  <span className="s-text-dark">{t("customerList.edit")}</span>
                </Menu.Item>

                <Menu.Item key="1">
                  <Popconfirm
                    title={t("settings.deleteMsg")}
                    onConfirm={() => removeProduct(record._id)}
                    okButtonProps={{ danger: true }}
                    okText={t("global.delete")}
                    cancelText={t("global.cancel")}
                  >
                    <div className="tw-text-red-500">
                      {t("customerList.delete")}
                    </div>
                  </Popconfirm>
                </Menu.Item>
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

  columns = getOrderedColumns(
    columns,
    tableSettings["stockItems"] || productsColumns,
  );

  columns = columns.reduce((all, curr) => {
    const { cellWidth = 200, sorter = false } = curr;
    const current = {
      ...curr,
      sorter: areFiltersEmpty ? sorter : false,
      title: (
        <Tooltip title={curr.title} placement="topLeft">
          <div className="s-col-title" style={{ minWidth: `${cellWidth}px` }}>
            {curr.title}
          </div>
        </Tooltip>
      ),
    };
    return current.dataIndex === "actions" ||
      current.dataIndex === "files" ||
      current.dataIndex === "parasutId"
      ? [...all, current]
      : [
          ...all,
          {
            ...current,
            onCell: (product: StockItem) => {
              return {
                className: "s-table-text s-pointer",
                onClick: () => viewDetails(product),
                style: { width: cellWidth },
              };
            },
          },
        ];
  }, [] as ColumnProps<StockItem>[]);

  return (
    <div className="t-products">
      <FilterBar
        styleClasses="lg:tw-flex tw-mb-4"
        resetFilters={() => setFilters({})}
        fields={[
          {
            label: t("products.elasticSearch"),
            className: "tw-w-3/12 tw-mr-2",
            placeholder: t("products.searchTerm"),
            type: "shortText",
            key: "title",
          },
          {
            label: t("products.tags"),
            className: "tw-w-3/12 tw-mr-2",
            placeholder: t("products.searchByTags"),
            type: "tags",
            key: "tags",
          },
        ]}
        handleChange={(key, val) => setFilters({ ...filters, [key]: val })}
      />
      {isEmpty ? (
        <Placeholder
          primaryText={t("dataPlaceholder.products.title")}
          primaryAction={() => editProduct({} as StockItem)}
          primaryBtnText={t("dataPlaceholder.products.action")}
          secondaryText={t("dataPlaceholder.products.description")}
          topBorder={true}
          fixHeight={350}
        />
      ) : (
        <Table
          rowKey={"_id"}
          rowSelection={{
            selectedRowKeys,
            preserveSelectedRowKeys: true,
            onChange: setSelectedRowKeys,
          }}
          columns={columns}
          dataSource={data}
          onChange={(a, b, sortData) =>
            handleSorting(sortData, sorts, setSorts)
          }
          scroll={{ x: true }}
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
            onShowSizeChange: changePage,
            onChange: (pageNum, pageSize = limit) =>
              changePage(pageNum, pageSize),
            style: { marginBottom: 0 },
          }}
          locale={{
            emptyText: <Empty description={t("tables.noData")} />,
          }}
          className="s-stock-scrolling"
          rowClassName={(record) =>
            record?.files?.length > 0 ? "s-compact-row" : "s-less-compact-row"
          }
          loading={loading}
        />
      )}
    </div>
  );
};

export default ProductList;
