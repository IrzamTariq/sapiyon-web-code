import { Empty, Table, Tag } from "antd";
import { ColumnProps } from "antd/lib/table";
import moment from "moment";
import React from "react";
import { useTranslation } from "react-i18next";
import { getPaginationButtons } from "scenes/Tasks/helpers";
import { PaginatedFeathersResponse, RFQ } from "types";
import { getRTEText } from "utils/components/RTE/RTE";
import { getCustomerName } from "utils/helpers";
import {
  getConversionStatusText,
  getTaskStatusStyles,
} from "utils/helpers/utils";

interface RecentRFQsListProps {
  rfqs: PaginatedFeathersResponse<RFQ>;
  isLoading: boolean;
  updateParentState: (state: any) => void;
  updateRFQsState: (state: any) => void;
}

const RecentRFQsList = ({
  rfqs,
  isLoading,
  updateRFQsState,
  updateParentState,
}: RecentRFQsListProps) => {
  const [t] = useTranslation();

  const { data = [], limit = 7, skip = 0, total = 0 } = rfqs;

  let columns: ColumnProps<RFQ>[] = [
    {
      title: t("requests.requestDate"),
      dataIndex: "createdAt",
      render: (date) => (
        <div>{date ? moment(date).format("DD/MM/YYYY HH:mm") : null}</div>
      ),
    },
    {
      title: t("requests.customer"),
      dataIndex: ["customer", "businessName"],
      render: (text, record) => (
        <div
          className="tw-truncate"
          style={{ maxWidth: "200px" }}
          title={getCustomerName(record.customer)}
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
          style={{ maxWidth: "400px" }}
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
  ];
  columns = columns.map((col) => ({
    ...col,
    title: <div className="s-col-title">{col.title}</div>,
    onCell: (record) => ({
      className: "s-pointer",
      onClick: () =>
        updateParentState({ isEditing: true, editedRecord: record }),
    }),
  }));

  return (
    <div className="tw-p-4">
      <Table
        dataSource={data}
        columns={columns}
        rowKey="_id"
        pagination={{
          itemRender: (page, type) =>
            getPaginationButtons(
              page,
              type,
              skip / limit + 1,
              skip + limit >= total,
              false,
            ),
          style: { display: "block", textAlign: "center", float: "unset" },
          current: skip / limit + 1,
          pageSize: limit,
          total,
          onChange: (pageNum) =>
            updateRFQsState({ skip: (+pageNum - 1) * limit }),
        }}
        loading={isLoading}
        size="middle"
        className="s-compact-row"
        locale={{
          emptyText: <Empty description={t("tables.noData")} />,
        }}
        scroll={{ x: true }}
      />
    </div>
  );
};

export default RecentRFQsList;
