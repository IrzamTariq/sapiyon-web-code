import { Empty, Table, Tag, message } from "antd";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import UserContext from "UserContext";
import { getRTEText } from "utils/components/RTE/RTE";
import { currencyFormatter } from "utils/helpers/currencyFormatter";

import { getPaginationButtons } from "../../../../scenes/Tasks/helpers";
import { QuoteService } from "../../../../services";
import {
  PaginatedFeathersResponse,
  Quote,
  UserContextType,
} from "../../../../types";
import {
  getGrandTotalWithoutTax,
  getRandomAlphaNumericString,
} from "../../../../utils/helpers";
import {
  getConversionStatusText,
  getTaskStatusStyles,
} from "../../../../utils/helpers/utils";

interface QuotesCustomerDetailsProps extends WithTranslation {
  customerId: string;
  viewDetails: (invoice: Quote) => void;
}

const QuotesCustomerDetails = ({
  t,
  customerId,
  viewDetails,
}: QuotesCustomerDetailsProps) => {
  const { firm } = useContext(UserContext) as UserContextType;
  const [isLoading, setIsLoading] = useState(false);
  const [quotes, setQuotes] = useState<PaginatedFeathersResponse<Quote>>(
    {} as PaginatedFeathersResponse<Quote>,
  );
  const { total = 0, skip = 0, limit = 25, data = [] } = quotes;

  useEffect(() => {
    if (customerId) {
      setIsLoading(true);
      QuoteService.find({
        query: {
          customerId: customerId,
          $limit: limit,
          $skip: skip,
        },
      }).then(
        (res: PaginatedFeathersResponse<Quote>) => {
          setQuotes(res);
          setIsLoading(false);
        },
        () => {
          // console.log("Error in fetching quotes, ", error);
          message.error(t("quotes.fetchError"));
          setIsLoading(false);
        },
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, limit, skip]);

  const jobColumns = [
    {
      title: t("customerDetails.dateAndDescription"),
      dataIndex: "createdAt",
      render: (text: any, record: Quote) => (
        <div className="s-table-text" style={{ width: "350px" }}>
          <p className="s-semibold tw-truncate tw-w-full">{`${t(
            "customerDetails.quote",
          )} #${(record._id || "").substr(-5)} ${t("taskEdit.createdAt")} ${
            record?.createdAt
              ? moment(record?.createdAt).format("DD/MM/YYYY - HH:mm")
              : ""
          }`}</p>
          <p
            className="s-light-text-color tw-truncate tw-w-full"
            title={getRTEText(record.title)}
          >
            {getRTEText(record.title)}
          </p>
        </div>
      ),
    },
    {
      title: t("taskCustomer.address"),
      dataIndex: "customer",
      render: (text: string, record: Quote) => (
        <div
          className="s-table-text tw-truncate"
          style={{ width: "330px" }}
          title={record?.customer?.address?.formatted}
        >
          {record?.customer?.address?.formatted}
        </div>
      ),
    },
    {
      title: t("stockList.amount"),
      dataIndex: "stock",
      render: (text: string, record: Quote) => (
        <div className="s-table-text" style={{ width: "150px" }}>
          {currencyFormatter(
            getGrandTotalWithoutTax(record.stock),
            false,
            firm.currencyFormat,
          )}
        </div>
      ),
    },
    {
      title: t("taskList.status"),
      dataIndex: "status",
      render: (text: string, record: Quote) => (
        <Tag
          style={getTaskStatusStyles(
            record.status,
            record.isTaskCreated || record.isInvoiceCreated,
          )}
        >
          {getConversionStatusText(record, t("Pending"))}
        </Tag>
      ),
    },
  ];

  const columns = jobColumns.map((col) => ({
    ...col,
    onCell: (rec: Quote) => ({
      className: "s-pointer",
      onClick: () => viewDetails(rec),
    }),
    title: <span className="s-col-title">{col.title}</span>,
  }));

  return (
    <div className="tw-px-6">
      <div className="tw-mb-20">
        <Table
          dataSource={data}
          columns={columns}
          rowKey={(record: Quote) =>
            record._id ? record._id : getRandomAlphaNumericString(10)
          }
          pagination={{
            style: { display: "block", textAlign: "right", float: "unset" },
            itemRender: (page, type) =>
              getPaginationButtons(
                page,
                type,
                skip / limit + 1,
                skip + limit >= total,
              ),
            hideOnSinglePage: true,
            pageSize: limit,
            current: skip / limit + 1,
            total,
            onChange: (pageNum) =>
              setQuotes((old) => ({ ...old, skip: (pageNum - 1) * limit })),
          }}
          scroll={{ x: true }}
          loading={isLoading}
          locale={{
            emptyText: <Empty description={t("tables.noData")} />,
          }}
        />
      </div>
    </div>
  );
};

export default withTranslation()(QuotesCustomerDetails);
