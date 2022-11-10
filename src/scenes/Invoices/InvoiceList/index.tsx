import { MoreOutlined } from "@ant-design/icons";
import {
  Button,
  Dropdown,
  Empty,
  Menu,
  Popconfirm,
  Table,
  Tag,
  Tooltip,
  message,
} from "antd";
import { ColumnProps } from "antd/lib/table";
import logger from "logger";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getPaginationButtons } from "scenes/Tasks/helpers";
import Placeholder from "scenes/Tasks/TaskList/Components/Placeholder";
import { InvoiceService } from "services";
import { Invoice, PaginatedFeathersResponse, UserContextType } from "types";
import UserContext from "UserContext";
import { getRTEText } from "utils/components/RTE/RTE";
import { invoiceColumns } from "utils/components/TableSettings/Components/StandardTableColumns";
import {
  getCustomerName,
  getGrandTotalWithTax,
  getOrderedColumns,
  mapCustomFieldValuesToColumns,
} from "utils/helpers";
import { currencyFormatter } from "utils/helpers/currencyFormatter";
import { handleSorting, setUpSorting } from "utils/helpers/tableEnhancements";
import { getTaskStatusLabel, getTaskStatusStyles } from "utils/helpers/utils";

import {
  InvoiceFilters,
  areInvoiceFiltersEmpty,
} from "./InvoiceHeader/InvoiceFiltersForm";
import { InvoiceState } from "..";

interface InvoicesListProps {
  parentState: InvoiceState;
  updateParentState: (changes: Partial<InvoiceState>) => void;
}
interface ColumnsType<T> extends ColumnProps<T> {
  cellWidth?: number;
}
const getQueryFromFilters = (filters: InvoiceFilters) => {
  let query = {};
  const { title = "", customerIds = [], statusIds = [], dueAt = [] } = filters;
  if (!!title) {
    query = Object.assign({}, query, { title: { $search: title } });
  }
  if (customerIds.length) {
    const ids = customerIds.map((item) => JSON.parse(item)?._id);
    query = Object.assign({}, query, { customerId: { $in: ids } });
  }
  if (statusIds.length) {
    const ids = statusIds.map((item) => JSON.parse(item)?._id);
    query = Object.assign({}, query, { statusId: { $in: ids } });
  }
  if (Array.isArray(dueAt) && (dueAt || []).length > 0) {
    query = Object.assign({}, query, {
      dueAt: {
        $gte: moment(dueAt[0]).startOf("day"),
        $lte: moment(dueAt[1]).endOf("day"),
      },
    });
  }
  return query;
};
const defaultLimit = 10;
const INITIAL_STATE: PaginatedFeathersResponse<Invoice> = {
  data: [],
  limit: defaultLimit,
  skip: 0,
  total: 0,
};

const InvoicesList = ({
  parentState,
  updateParentState,
}: InvoicesListProps) => {
  const [t] = useTranslation();
  const { hasPermission, tableSettings, firm, hasFeature } = useContext(
    UserContext,
  ) as UserContextType;
  const { invoices: firmCustomFields = [] } = firm.forms || {};
  const [invoices, setInvoices] = useState(INITIAL_STATE);

  const { filters, selectedRowKeys, isLoading, sorts = {} } = parentState;
  const { data = [], limit = defaultLimit, skip = 0, total = 0 } = invoices;

  const removeInvoice = (invoiceId: string) => {
    InvoiceService.remove(invoiceId).then(
      () => message.success(t("invoices.removeSuccess")),
      (e: Error) => {
        logger.error("Error in removing invoice: ", e);
        message.error(t("invoices.removeError"));
      },
    );
  };

  let columns: ColumnsType<Invoice>[] = [
    {
      title: t("invoices.invoiceNo"),
      dataIndex: "_id",
      render: (text) => (
        <div style={{ width: "inherit" }}>{`#${(text || "").substr(
          -5,
          5,
        )}`}</div>
      ),
    },
    {
      title: t("invoices.dueDate"),
      dataIndex: "dueAt",
      ...setUpSorting(sorts, "dueAt", 1),
      render: (text) => (
        <div style={{ width: "inherit" }}>
          {text ? moment(text).format("DD/MM/YYYY") : null}
        </div>
      ),
    },
    {
      title: t("taskList.customer"),
      dataIndex: ["customer", "businessName"],
      // ...setUpSorting(sorts, "customer.businessName", 2),
      render: (text, record) => {
        return (
          <div
            className="tw-truncate"
            title={getCustomerName(record.customer)}
            style={{ width: "inherit" }}
          >
            {getCustomerName(record.customer)}
          </div>
        );
      },
    },
    {
      title: t("invoices.jobTitle"),
      dataIndex: "title",
      render: (text) => (
        <div
          className="tw-truncate"
          title={getRTEText(text)}
          style={{ width: "inherit" }}
        >
          {getRTEText(text)}
        </div>
      ),
    },
    {
      title: t("invoices.totalAmount"),
      dataIndex: "stock",
      render: (text, record) => (
        <div style={{ width: "inherit" }}>
          {currencyFormatter(
            getGrandTotalWithTax(record.stock),
            false,
            firm.currencyFormat,
          )}
        </div>
      ),
    },
    {
      title: t("invoices.status"),
      dataIndex: "status",
      render: (text, record) => (
        <Tag
          className="tw-truncate tw-block"
          style={{ ...getTaskStatusStyles(record.status), width: "inherit" }}
          title={getTaskStatusLabel(record.status, t("Pending"))}
        >
          {getTaskStatusLabel(record.status, t("Pending"))}
        </Tag>
      ),
    },
    ...mapCustomFieldValuesToColumns<Invoice>(firmCustomFields, firm),
  ];

  if (hasFeature("parasutSync")) {
    columns = [
      ...columns,
      {
        title: t("parasutIntegration.colTitle"),
        dataIndex: "parasutId",
        render: (text) =>
          !!text ? (
            <Button
              type="link"
              disabled={!firm.parasutId}
              target="_blank"
              href={`https://uygulama.parasut.com/${firm.parasutId}/satislar/${text}`}
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
  if (hasPermission("canManageInvoices")) {
    columns = [
      ...columns,
      {
        title: t("global.actions"),
        dataIndex: "actions",
        render: (text, record) => (
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item
                  className="s-main-text-color s-main-font"
                  onClick={() =>
                    updateParentState({ isEditing: true, editedRecord: record })
                  }
                >
                  {t("global.edit")}
                </Menu.Item>
                <Menu.Item className="s-main-text-color s-main-font">
                  <Popconfirm
                    title={t("global.deleteSurety")}
                    onConfirm={() => removeInvoice(record._id)}
                    okText={t("global.delete")}
                    cancelText={t("global.cancel")}
                    okButtonProps={{ danger: true }}
                  >
                    <div className="tw-text-red-500">{t("global.delete")}</div>
                  </Popconfirm>
                </Menu.Item>
              </Menu>
            }
            trigger={["click"]}
            placement="bottomCenter"
          >
            <MoreOutlined className="s-main-text-color" />
          </Dropdown>
        ),
      },
    ];
  }

  columns = getOrderedColumns(
    columns,
    tableSettings["invoices"] || invoiceColumns,
  );
  columns = columns.map((col) => {
    const { cellWidth = 200 } = col;
    const current = {
      ...col,
      title: (
        <Tooltip title={col.title} placement="topLeft">
          <div className="s-col-title" style={{ minWidth: `${cellWidth}px` }}>
            {col.title}
          </div>
        </Tooltip>
      ),
    };
    return current.dataIndex === "actions" || current.dataIndex === "parasutId"
      ? current
      : {
          ...current,
          onCell: (record) => {
            return {
              className: "s-table-text s-pointer",
              onClick: () =>
                updateParentState({ isEditing: true, editedRecord: record }),
              style: { width: cellWidth },
            };
          },
        };
  });

  useEffect(() => {
    updateParentState({ isLoading: true });
    const filtersQuery = getQueryFromFilters(filters);
    const defaultSorting = { createdAt: -1 };
    const $sort = Object.keys(sorts).length > 0 ? sorts : defaultSorting;

    InvoiceService.find({
      query: {
        ...filtersQuery,
        $sort,
        $limit: limit,
        $skip: skip,
      },
    })
      .then(
        (res: PaginatedFeathersResponse<Invoice>) => {
          setInvoices(res);
        },
        (e: Error) => {
          logger.error("Error in fetching Invoices: ", e);
          message.error(t("invoices.fetchError"));
        },
      )
      .finally(() => updateParentState({ isLoading: false }));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, limit, skip, sorts, t]);
  useEffect(() => {
    const handleCreated = (res: Invoice) => {
      setInvoices((old) => ({
        ...old,
        total: old.total + 1,
        data: [res, ...old.data].slice(0, old.limit),
      }));
    };
    const handlePatched = (res: Invoice) => {
      setInvoices((old) => ({
        ...old,
        data: old.data.map((item) => (item._id === res._id ? res : item)),
      }));
    };
    const handleRemoved = (res: Invoice) => {
      setInvoices((old) => {
        const oldNum = old.data.length;
        const data = old.data.filter((item) => item._id !== res._id);
        const total = oldNum !== data.length ? old.total - 1 : old.total;
        return {
          ...old,
          data,
          total,
        };
      });
    };

    InvoiceService.on("created", handleCreated);
    InvoiceService.on("patched", handlePatched);
    InvoiceService.on("removed", handleRemoved);

    return () => {
      InvoiceService.off("created", handleCreated);
      InvoiceService.off("patched", handlePatched);
      InvoiceService.off("removed", handleRemoved);
    };
  }, []);

  return areInvoiceFiltersEmpty(parentState.filters) &&
    !invoices.total &&
    !isLoading ? (
    <Placeholder
      primaryAction={
        hasPermission("canManageInvoices")
          ? () =>
              updateParentState({
                isEditing: true,
                editedRecord: {} as Invoice,
              })
          : undefined
      }
      primaryBtnText={t("dataPlaceholder.invoices.action")}
      primaryText={t("dataPlaceholder.invoices.title")}
      secondaryText={t("dataPlaceholder.invoices.description")}
    />
  ) : (
    <Table
      rowSelection={{
        selectedRowKeys,
        onChange: (selectedRowKeys) => updateParentState({ selectedRowKeys }),
        preserveSelectedRowKeys: true,
      }}
      rowKey={(record) => record._id!}
      columns={columns}
      dataSource={data}
      pagination={{
        total,
        current: skip / limit + 1,
        pageSizeOptions: ["10", "25", "50"],
        pageSize: limit,
        onShowSizeChange: (page, size) =>
          setInvoices((old) => ({
            ...old,
            limit: size,
            skip: (page - 1) * limit,
          })),
        onChange: (page = 1, size = limit) =>
          setInvoices((old) => ({
            ...old,
            limit: size,
            skip: (page - 1) * limit,
          })),

        showTotal: (total, range) => `${range[0]} - ${range[1]} / ${total}`,
        itemRender: (page, type) =>
          getPaginationButtons(
            page,
            type,
            skip / limit + 1,
            skip + limit >= total,
          ),
        style: { marginBottom: 0 },
        position: ["bottomCenter"],
        showSizeChanger: true,
        defaultPageSize: 25,
      }}
      onChange={(a, b, sortData) =>
        handleSorting(sortData, sorts, (sorts) => updateParentState({ sorts }))
      }
      loading={isLoading}
      rowClassName={() => "s-compact-row"}
      className="tw-bg-white s-size-changer s-exTasks-scrolling"
      locale={{
        emptyText: <Empty description={t("tables.noData")} />,
      }}
      scroll={{ x: true }}
    />
  );
};

export default InvoicesList;
