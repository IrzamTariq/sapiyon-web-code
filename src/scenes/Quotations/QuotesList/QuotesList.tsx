import { MoreOutlined } from "@ant-design/icons";
import {
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
import { QuoteService } from "services";
import { PaginatedFeathersResponse, Quote, UserContextType } from "types";
import UserContext from "UserContext";
import { getRTEText } from "utils/components/RTE/RTE";
import { quoteColumns } from "utils/components/TableSettings/Components/StandardTableColumns";
import {
  getCustomerName,
  getGrandTotalWithTax,
  getOrderedColumns,
  getUsername,
  mapCustomFieldValuesToColumns,
} from "utils/helpers";
import { currencyFormatter } from "utils/helpers/currencyFormatter";
import { handleSorting, setUpSorting } from "utils/helpers/tableEnhancements";
import {
  getConversionStatusText,
  getTaskStatusStyles,
} from "utils/helpers/utils";

import {
  QuotesFilters,
  areQuotesFiltersEmpty,
} from "./QuotesHeader/QuotesFiltersForm";
import { QuoteState } from "..";

const defaultLimit = 25;
const INITIAL_STATE: PaginatedFeathersResponse<Quote> = {
  data: [],
  limit: defaultLimit,
  skip: 0,
  total: 0,
};
interface ColumnsType<T> extends ColumnProps<T> {
  cellWidth?: number;
}
interface QuotesListProps {
  parentState: QuoteState;
  updateParentState: (changes: Partial<QuoteState>) => void;
}

const getQueryFromFilters = (filters: QuotesFilters) => {
  let query = {};
  const {
    title = "",
    customerIds = [],
    statusIds = [],
    createdByIds = [],
    createdAt = [],
  } = filters;
  if (!!title) {
    query = Object.assign({}, query, { title: { $search: title } });
  }
  if (customerIds.length) {
    const ids = customerIds.map((item) => JSON.parse(item)?._id);
    query = Object.assign({}, query, { customerId: { $in: ids } });
  }
  if (statusIds.length) {
    const statuses = statusIds.map((item) => JSON.parse(item)._id);

    const ids = statuses.filter(
      (item) => (item || "").substr(0, 9) !== "converted",
    );

    const $or = [];
    let tempQuery = {};
    if (statuses.includes("convertedToTask")) {
      $or.push({ isTaskCreated: true });
      tempQuery = { ...tempQuery, isTaskCreated: true };
    }
    if (statuses.includes("convertedToInvoice")) {
      $or.push({ isInvoiceCreated: true });
      tempQuery = { ...tempQuery, isInvoiceCreated: true };
    }
    if (ids.length > 0 && $or.length === 0) {
      query = Object.assign({}, query, {
        statusId: { $in: ids },
      });
    } else if (ids.length === 0 && $or.length === 2) {
      query = Object.assign({}, query, { $or });
    } else if (ids.length === 0 && $or.length === 1) {
      query = Object.assign({}, query, tempQuery);
    } else if (ids.length > 0 && $or.length > 0) {
      query = Object.assign({}, query, {
        $or: [{ statusId: { $in: ids } }, ...$or],
      });
    }
  }
  if (createdByIds.length) {
    const ids = createdByIds.map((item) => JSON.parse(item)?._id);
    query = Object.assign({}, query, { createdById: { $in: ids } });
  }
  if (createdAt.length) {
    query = Object.assign({}, query, {
      createdAt: {
        $gte: moment(createdAt[0]).startOf("day"),
        $lte: moment(createdAt[1]).endOf("day"),
      },
    });
  }
  return query;
};

const QuotationsList = ({
  parentState,
  updateParentState,
}: QuotesListProps) => {
  const [t] = useTranslation();
  const { hasPermission, tableSettings, firm } = useContext(
    UserContext,
  ) as UserContextType;
  const { quotes: firmCustomFields = [] } = firm.forms || {};
  const [quotes, setQuotes] = useState(INITIAL_STATE);

  const { filters, selectedRowKeys, isLoading, sorts = {} } = parentState;
  const { data = [], limit = defaultLimit, skip = 0, total = 0 } = quotes;

  const removeQuote = (quoteId: string) => {
    QuoteService.remove(quoteId).then(
      () => message.success(t("quotes.removeSuccess")),
      (e: Error) => {
        logger.error("Error in removing Quote: ", e);
        message.error(t("quotes.removeError"));
      },
    );
  };

  let columns: ColumnsType<Quote>[] = [
    {
      title: t("quotes.date"),
      dataIndex: "createdAt",
      ...setUpSorting(sorts, "createdAt", 1),
      render: (text) => (
        <div style={{ width: "inherit" }}>
          {text ? moment(text).format("DD/MM/YYYY") : null}
        </div>
      ),
    },
    {
      title: t("quotes.customer"),
      dataIndex: ["customer", "businessName"],
      // ...setUpSorting(sorts, "customer.businessName", 2),
      render: (text, record) => (
        <div
          className="tw-truncate"
          title={getCustomerName(record.customer)}
          style={{ width: "inherit" }}
        >
          {getCustomerName(record.customer)}
        </div>
      ),
    },
    {
      title: t("quotes.details"),
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
      title: t("quotes.amount"),
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
      title: t("quotes.status"),
      dataIndex: "status",
      render: (text, record) => (
        <Tag
          style={{
            ...getTaskStatusStyles(
              record.status,
              record.isInvoiceCreated || record.isTaskCreated,
            ),
            width: "inherit",
          }}
          className="tw-truncate tw-block"
          title={getConversionStatusText(record, t("Pending"))}
        >
          {getConversionStatusText(record, t("Pending"))}
        </Tag>
      ),
    },
    {
      title: t("quotes.createdBy"),
      dataIndex: ["createdBy", "fullName"],
      // ...setUpSorting(sorts, "createdBy.fullName", 3),
      render: (text, record) =>
        text ? (
          <div
            className="tw-truncate"
            title={getUsername(record.createdBy)}
            style={{ width: "inherit" }}
          >
            {getUsername(record.createdBy)}
          </div>
        ) : (
          ""
        ),
    },
    ...mapCustomFieldValuesToColumns<Quote>(firmCustomFields, firm),
  ];

  if (hasPermission("canManageQuotes")) {
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
                    onConfirm={() => removeQuote(record._id)}
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

  columns = getOrderedColumns(columns, tableSettings["quotes"] || quoteColumns);

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
    return current.dataIndex === "actions"
      ? current
      : {
          ...current,
          onCell: (record) => {
            return {
              className: "s-table-text s-pointer",
              onClick: () =>
                updateParentState({ isEditing: true, editedRecord: record }),
              style: { width: `${cellWidth}px` },
            };
          },
        };
  });

  useEffect(() => {
    updateParentState({ isLoading: true });
    const filtersQuery = getQueryFromFilters(filters);
    const defaultSorting = { createdAt: -1 };
    const $sort = Object.keys(sorts).length > 0 ? sorts : defaultSorting;

    QuoteService.find({
      query: {
        ...filtersQuery,
        $sort,
        $limit: limit,
        $skip: skip,
      },
    })
      .then(
        (res: PaginatedFeathersResponse<Quote>) => {
          setQuotes(res);
        },
        (e: Error) => {
          logger.error("Error in fetching Quotes: ", e);
          message.error(t("quotes.fetchError"));
        },
      )
      .finally(() => updateParentState({ isLoading: false }));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, limit, skip, sorts, t]);
  useEffect(() => {
    const handleCreated = (res: Quote) => {
      setQuotes((old) => ({
        ...old,
        total: old.total + 1,
        data: [res, ...old.data].slice(0, old.limit),
      }));
    };
    const handlePatched = (res: Quote) => {
      setQuotes((old) => ({
        ...old,
        data: old.data.map((item) => (item._id === res._id ? res : item)),
      }));
    };
    const handleRemoved = (res: Quote) => {
      setQuotes((old) => {
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

    QuoteService.on("created", handleCreated);
    QuoteService.on("patched", handlePatched);
    QuoteService.on("removed", handleRemoved);

    return () => {
      QuoteService.off("created", handleCreated);
      QuoteService.off("patched", handlePatched);
      QuoteService.off("removed", handleRemoved);
    };
  }, []);

  return areQuotesFiltersEmpty(parentState.filters) &&
    !quotes.total &&
    !isLoading ? (
    <Placeholder
      primaryAction={
        hasPermission("canManageQuotes")
          ? () =>
              updateParentState({ isEditing: true, editedRecord: {} as Quote })
          : undefined
      }
      primaryBtnText={t("dataPlaceholder.quotes.action")}
      primaryText={t("dataPlaceholder.quotes.title")}
      secondaryText={t("dataPlaceholder.quotes.description")}
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
          setQuotes((old) => ({
            ...old,
            limit: size,
            skip: (page - 1) * limit,
          })),
        onChange: (page = 1, size = limit) =>
          setQuotes((old) => ({
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
      className="s-size-changer s-exTasks-scrolling"
      locale={{
        emptyText: <Empty description={t("tables.noData")} />,
      }}
      scroll={{ x: true }}
    />
  );
};

export default QuotationsList;
