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
import { RFQService } from "services";
import { PaginatedFeathersResponse, RFQ, UserContextType } from "types";
import UserContext from "UserContext";
import { getRTEText } from "utils/components/RTE/RTE";
import { rfqColumns } from "utils/components/TableSettings/Components/StandardTableColumns";
import {
  getCustomerName,
  getOrderedColumns,
  mapCustomFieldValuesToColumns,
} from "utils/helpers";
import {
  SortState,
  handleSorting,
  setUpSorting,
} from "utils/helpers/tableEnhancements";
import {
  getConversionStatusText,
  getTaskStatusStyles,
} from "utils/helpers/utils";

import { RFQFilters, areRFQFiltersEmpty } from "./RFQHeader/RFQFiltersForm";
import { RFQState } from "..";

const defaultLimit = 25;
const INITIAL_STATE: PaginatedFeathersResponse<RFQ> = {
  data: [],
  limit: defaultLimit,
  skip: 0,
  total: 0,
};
export const getRFQsQueryFromFilters = (filters = {} as RFQFilters) => {
  let query = {};
  const {
    title = "",
    customerIds = [],
    statusIds = [],
    assigneeIds = [],
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
    if (statuses.includes("convertedToQuote")) {
      $or.push({ isQuoteCreated: true });
      tempQuery = { ...tempQuery, isQuoteCreated: true };
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
  if (assigneeIds.length) {
    const ids = assigneeIds.map((item) => JSON.parse(item)?._id);
    query = Object.assign({}, query, { assigneeIds: { $in: ids } });
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
interface ColumnsType<T> extends ColumnProps<T> {
  cellWidth?: number;
}
interface RFQsListProps {
  parentState: RFQState;
  updateParentState: (changes: Partial<RFQState>) => void;
}

const RFQsList = ({ parentState, updateParentState }: RFQsListProps) => {
  const [t] = useTranslation();
  const { hasPermission, tableSettings, firm } = useContext(
    UserContext,
  ) as UserContextType;
  const { rfq: firmCustomFields = [] } = firm.forms || {};
  const [rfqs, setRfqs] = useState(INITIAL_STATE);

  const { filters, selectedRowKeys, isLoading, sorts = {} } = parentState;
  const { data = [], limit = defaultLimit, skip = 0, total = 0 } = rfqs;

  const removeRFQ = (rfqId: string) => {
    RFQService.remove(rfqId).then(
      () => message.success(t("requests.removeSuccess")),
      (e: Error) => {
        logger.error("Error in removing RFQ: ", e);
        message.error(t("requests.removeError"));
      },
    );
  };

  let columns: ColumnsType<RFQ>[] = [
    {
      title: t("requests.requestDate"),
      dataIndex: "createdAt",
      ...setUpSorting(sorts, "createdAt", 1),
      render: (text) => (
        <div style={{ width: "inherit" }}>
          {text ? moment(text).format("DD/MM/YYYY HH:mm") : null}
        </div>
      ),
    },
    {
      title: t("requests.customer"),
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
      title: t("requests.details"),
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
      title: t("requests.status"),
      dataIndex: "status",
      render: (text, record) => (
        <Tag
          style={{
            ...getTaskStatusStyles(
              record.status,
              record.isQuoteCreated || record.isTaskCreated,
            ),
            width: "inherit",
            display: "block",
          }}
          className="tw-truncate tw-block"
          title={getConversionStatusText(record, t("Pending"))}
        >
          {getConversionStatusText(record, t("Pending"))}
        </Tag>
      ),
    },
    ...mapCustomFieldValuesToColumns<RFQ>(firmCustomFields, firm),
  ];
  if (hasPermission("canManageRFQs")) {
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
                    onConfirm={() => removeRFQ(record._id!)}
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
  columns = getOrderedColumns(columns, tableSettings["rfq"] || rfqColumns);
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
              style: { width: cellWidth },
            };
          },
        };
  });

  useEffect(() => {
    updateParentState({ isLoading: true });
    const filtersQuery = getRFQsQueryFromFilters(filters);
    const defaultSorting = { createdAt: -1 };
    const $sort = Object.keys(sorts).length > 0 ? sorts : defaultSorting;

    RFQService.find({
      query: { ...filtersQuery, $sort, $limit: limit, $skip: skip },
    })
      .then(
        (res: PaginatedFeathersResponse<RFQ>) => setRfqs(res),
        (e: Error) => {
          logger.error("Error in fetching FRQs: ", e);
          message.error(t("RFQs.fetchError"));
        },
      )
      .finally(() => updateParentState({ isLoading: false }));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, limit, skip, sorts, t]);
  useEffect(() => {
    const handleCreated = (res: RFQ) => {
      setRfqs((old) => ({
        ...old,
        total: old.total + 1,
        data: [res, ...old.data].slice(0, old.limit),
      }));
    };
    const handlePatched = (res: RFQ) => {
      setRfqs((old) => ({
        ...old,
        data: old.data.map((item) => (item._id === res._id ? res : item)),
      }));
    };
    const handleRemoved = (res: RFQ) => {
      setRfqs((old) => {
        const oldNum = old.data.length;
        const data = old.data.filter((item) => item._id !== res._id);
        return {
          ...old,
          total: oldNum !== data.length ? old.total - 1 : old.total,
          data,
        };
      });
    };

    RFQService.on("created", handleCreated);
    RFQService.on("patched", handlePatched);
    RFQService.on("removed", handleRemoved);

    return () => {
      RFQService.off("created", handleCreated);
      RFQService.off("patched", handlePatched);
      RFQService.off("removed", handleRemoved);
    };
  }, []);

  return !isLoading && areRFQFiltersEmpty(filters) && total === 0 ? (
    <Placeholder
      primaryAction={
        hasPermission("canManageAllRFQs")
          ? () =>
              updateParentState({ isEditing: true, editedRecord: {} as RFQ })
          : undefined
      }
      primaryText={t("dataPlaceholder.requests.title")}
      secondaryText={t("dataPlaceholder.requests.description")}
      primaryBtnText={t("dataPlaceholder.requests.action")}
      heightReduction={68 + 74}
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
          setRfqs((old) => ({ ...old, limit: size, skip: (page - 1) * limit })),
        onChange: (page = 1, size = limit) =>
          setRfqs((old) => ({ ...old, limit: size, skip: (page - 1) * limit })),

        showTotal: (total, range) => `${range[0]} - ${range[1]} / ${total}`,
        style: { marginBottom: 0 },
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
      }}
      onChange={(a, b, sortData) =>
        handleSorting(sortData, sorts, (sorts: SortState) =>
          updateParentState({ sorts }),
        )
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

export default RFQsList;
