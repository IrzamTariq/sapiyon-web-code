import { Empty, Table } from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { getPaginationButtons } from "scenes/Tasks/helpers";
import { StockTransactionService } from "services";
import { PaginatedFeathersResponse, StockTransaction } from "types";

interface IncomingProps extends WithTranslation {
  binId: string;
}

const Incoming = ({ t, binId }: IncomingProps) => {
  const [activities, setActivities] = useState<
    PaginatedFeathersResponse<StockTransaction>
  >({
    data: [],
    total: 0,
    skip: 0,
    limit: 50,
  });
  const { data = [], total = 0, limit = 50, skip = 0 } = activities;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!!binId) {
      setLoading(true);
      StockTransactionService.find({
        query: {
          type: { $in: ["remove", "transfer", "sale"] },
          fromId: binId,
          $sort: { createdAt: -1 },
          $limit: limit,
          $skip: skip,
        },
      })
        .then((res: PaginatedFeathersResponse<StockTransaction>) => {
          setActivities(res);
        })
        .finally(() => setLoading(false));
    } else {
      setActivities({
        data: [],
        total: 0,
        skip: 0,
        limit: 50,
      });
    }
  }, [binId, skip, limit]);

  const columns = [
    {
      title: t("products.productName"),
      dataIndex: ["product", "title"],
      className: "s-table-text",
      render: (text: string) => (
        <div className="tw-truncate" style={{ maxWidth: "500px" }} title={text}>
          {text}
        </div>
      ),
    },
    {
      title: t("addProduct.quantity"),
      dataIndex: "qty",
    },
    {
      title: t("stockTransaction.remarks"),
      dataIndex: "type",
      render: (text: string) => {
        if (text === "remove") {
          return t("stockTransaction.removed");
        } else if (text === "sale") {
          return t("stockTransaction.sold");
        } else if (text === "transfer") {
          return t("stockTransaction.transferred");
        } else {
          return null;
        }
      },
    },
    {
      title: t("stockTransaction.date"),
      dataIndex: "createdAt",
      render: (text: string) =>
        text ? moment(text).format("DD/MM/YYYY HH:mm") : null,
    },
  ];

  return (
    <Table
      rowKey="_id"
      columns={columns}
      dataSource={data}
      pagination={{
        current: skip / limit + 1,
        size: "small",
        total,
        pageSize: limit,
        onChange: (page) =>
          setActivities((old) => ({ ...old, skip: (page - 1) * limit })),
        itemRender: (page, type) =>
          getPaginationButtons(
            page,
            type,
            skip / limit + 1,
            skip + limit >= total,
            false,
          ),
        hideOnSinglePage: true,
      }}
      loading={loading}
      rowClassName={() => "s-hover-parent"}
      className="tw-mb-16"
      locale={{
        emptyText: <Empty description={t("tables.noData")} />,
      }}
    />
  );
};

export default withTranslation()(Incoming);
