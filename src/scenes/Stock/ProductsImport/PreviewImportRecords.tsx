import { Empty, Table, Tooltip } from "antd";
import { ColumnProps } from "antd/lib/table";
import React from "react";
import { useTranslation } from "react-i18next";
import { CustomField, StockItem } from "types";
import {
  getRandomAlphaNumericString,
  mapCustomFieldValuesToColumns,
} from "utils/helpers";

interface PreviewImportRecordsProps {
  records: StockItem[];
  fields: CustomField[];
  loading: boolean;
}
const PreviewImportRecords = ({
  records = [],
  fields = [],
  loading,
}: PreviewImportRecordsProps) => {
  const [t] = useTranslation();
  const customFieldsColumns = mapCustomFieldValuesToColumns<StockItem>(fields);
  const cols: ColumnProps<StockItem>[] = [
    {
      title: t("products.productName"),
      dataIndex: "title",
      render: (text) => {
        return (
          <div
            title={text}
            className="tw-truncate"
            style={{ maxWidth: "250px" }}
          >
            {text}
          </div>
        );
      },
    },
    {
      title: t("products.serialNumber"),
      dataIndex: "barcode",
    },
    {
      title: t("productsImport.totalQty"),
      render: (record) => {
        const stock: {
          binId: string;
          qty: number;
          title: string;
          // @ts-ignore
        }[] = record?.initialStock || [];
        const total = stock.reduce((acc, curr) => acc + (curr.qty || 0), 0);
        return <div>{total > 0 ? total : null}</div>;
      },
    },
    {
      title: t("addProduct.unit"),
      dataIndex: "unitOfMeasurement",
    },
    {
      title: t("products.salesPrice"),
      dataIndex: "unitPrice",
    },
    {
      title: t("products.purchasePrice"),
      dataIndex: "purchasePrice",
    },
    {
      title: t("products.taxRate"),
      dataIndex: "taxRate",
    },
    {
      title: t("products.tags"),
      dataIndex: "tags",
      render: (tags = []) => {
        return (
          <Tooltip
            autoAdjustOverflow
            placement="bottom"
            title={
              <ol>
                {tags.map((tag: string, index: number) => (
                  <li key={getRandomAlphaNumericString()}>{`${
                    index + 1
                  }. ${tag}`}</li>
                ))}
              </ol>
            }
          >
            <div className="tw-w-48 tw-truncate">{tags.join(" | ")}</div>
          </Tooltip>
        );
      },
    },
    ...customFieldsColumns,
  ];
  const columns = cols.map((col) => ({
    ...col,
    title: <span className="s-col-title">{col.title}</span>,
    onCell: () => ({ className: "s-table-text" }),
  }));
  const getExtendedRow = (record: StockItem) => {
    const stock: {
      binId: string;
      qty: number;
      title: string;
      // @ts-ignore
    }[] = record.initialStock;
    const header = (
      <div className="tw-flex tw-justify-between s-std-text s-semibold tw-w-1/2 tw-mx-auto tw-border-b tw-py-1 tw-text-lg">
        <div>{t("products.warehouse")}</div>
        <div>{t("products.quantity")}</div>
      </div>
    );
    const body = stock.map(({ binId, qty, title }) => (
      <div className="tw-flex tw-justify-between s-std-text tw-w-1/2 tw-mx-auto tw-border-b tw-py-2">
        <div>{title}</div>
        <div>{qty}</div>
      </div>
    ));
    const footer = (
      <div className="tw-flex tw-justify-between s-std-text s-semibold tw-w-1/2 tw-mx-auto tw-py-1">
        <div>{t("stock.total")}</div>
        <div>{stock.reduce((acc, curr) => acc + (curr.qty || 0), 0)}</div>
      </div>
    );
    return [header, body, footer];
  };

  return (
    <div>
      <Table
        dataSource={records}
        columns={columns}
        rowKey={"uid"}
        scroll={{ x: true }}
        pagination={{
          hideOnSinglePage: true,
          showSizeChanger: true,
          defaultPageSize: 25,
          pageSizeOptions: ["25", "50", "100"],
        }}
        expandable={{
          expandedRowRender: (record) => getExtendedRow(record || {}),
          expandIcon: ({ expanded, expandable }) =>
            expandable ? (
              <div className="tw-relative">
                <div className="s-expand-icon" />
                <div
                  className={
                    "s-expand-icon s-expand-icon-overlay " +
                    (expanded ? "" : "s-expand-icon-expanded")
                  }
                />
              </div>
            ) : null,
          expandRowByClick: true,
          // @ts-ignore
          rowExpandable: (record) => Array.isArray(record?.initialStock),
        }}
        rowClassName="s-pointer"
        loading={loading}
        locale={{
          emptyText: <Empty description={t("tables.noData")} />,
        }}
      />
    </div>
  );
};

export default PreviewImportRecords;
