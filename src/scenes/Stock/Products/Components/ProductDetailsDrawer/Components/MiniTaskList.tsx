import { Empty, Table } from "antd";
import { ColumnProps } from "antd/lib/table";
import moment from "moment";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { getPaginationButtons } from "scenes/Tasks/helpers";
import UserContext from "UserContext";
import { getRTEText } from "utils/components/RTE/RTE";
import { currencyFormatter } from "utils/helpers/currencyFormatter";

import {
  PaginatedFeathersResponse,
  Task,
  UserContextType,
} from "../../../../../../types";
import { getGrandTotalWithoutTax } from "../../../../../../utils/helpers";

interface MiniTaskListProps extends PaginatedFeathersResponse<Task> {
  onEdit?: (task: Task) => void;
  handlePageChange?: (pageNum: number) => void;
  onRemove?: () => void;
  loading: boolean;
}

function DailyAccountTaskList({
  data = [],
  total,
  skip,
  limit,
  onEdit,
  handlePageChange,
  loading,
}: MiniTaskListProps) {
  const [t] = useTranslation();
  const { firm } = useContext(UserContext) as UserContextType;
  const taskCols: ColumnProps<Task>[] = [
    {
      title: (
        <span className="s-col-title">{t("productDetails.dateJobs")}</span>
      ),
      dataIndex: "title",
      render: (text, record) => (
        <div className="tw-truncate tw-w-64" title={getRTEText(record.title)}>
          <p>{moment(record.endAt).format("DD/MM/YYYY HH:mm")}</p>
          {getRTEText(record.title)}
        </div>
      ),
      onCell: (record) => {
        return {
          className: "s-table-text s-pointer",
          onClick: () => {
            return onEdit ? onEdit(record) : null;
          },
        };
      },
    },
    {
      title: (
        <span className="s-col-title">{t("customerDetails.address")}</span>
      ),
      width: "35%",
      dataIndex: "address",
      render: (text, record: Task) => (
        <div
          className="tw-truncate tw-w-64"
          title={record?.customer?.address?.formatted}
        >
          {record?.customer?.address?.formatted}
        </div>
      ),
      onCell: (record) => {
        return {
          className: "s-table-text s-pointer",
          onClick: () => {
            return onEdit ? onEdit(record) : null;
          },
        };
      },
    },
    {
      title: <span className="s-col-title">{t("taskList.num")}</span>,
      className: "s-pointer",
      width: "10%",
      dataIndex: "_id",
      render: (text: string = "") => <div>{text.substr(-5)}</div>,
      onCell: (record) => {
        return {
          className: "s-table-text s-pointer",
          onClick: () => {
            return onEdit ? onEdit(record) : null;
          },
        };
      },
    },
    {
      title: <span className="s-col-title">{t("stockList.amount")}</span>,
      dataIndex: "cost",
      align: "right",
      width: "20%",
      render: (text, record) =>
        currencyFormatter(
          getGrandTotalWithoutTax(record.stock),
          false,
          firm.currencyFormat,
        ),
      onCell: (record) => {
        return {
          className: "s-table-text s-pointer",
          onClick: () => {
            return onEdit ? onEdit(record) : null;
          },
        };
      },
    },
  ];

  return (
    <div>
      <Table
        dataSource={data}
        columns={taskCols}
        rowKey={"_id"}
        pagination={{
          showTotal: (total, range) => `${range[0]} - ${range[1]} / ${total}`,
          current: skip / limit + 1,
          total,
          pageSize: limit,
          onChange: (pageNum) =>
            handlePageChange ? handlePageChange(pageNum) : null,
          itemRender: (page, type) =>
            getPaginationButtons(
              page,
              type,
              skip / limit + 1,
              skip + limit >= total,
              false,
            ),
          size: "small",
          position: ["bottomCenter"],
        }}
        loading={loading}
        locale={{
          emptyText: <Empty description={t("tables.noData")} />,
        }}
        scroll={{ x: true }}
      />
    </div>
  );
}

export default DailyAccountTaskList;
