import { Empty, Table, Tag, message } from "antd";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import UserContext from "UserContext";
import { getRTEText } from "utils/components/RTE/RTE";
import { currencyFormatter } from "utils/helpers/currencyFormatter";

import { getPaginationButtons } from "../../../../scenes/Tasks/helpers";
import { InvoiceService } from "../../../../services";
import {
  Invoice,
  PaginatedFeathersResponse,
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

interface InvoicesCustomerDetailsProps extends WithTranslation {
  customerId: string;
  viewDetails: (rec: Invoice) => void;
}

const InvoicesCustomerDetails = ({
  t,
  customerId,
  viewDetails,
}: InvoicesCustomerDetailsProps) => {
  const { firm } = useContext(UserContext) as UserContextType;
  const [isLoading, setIsLoading] = useState(false);
  const [invoices, setInvoices] = useState<PaginatedFeathersResponse<Invoice>>(
    {} as PaginatedFeathersResponse<Invoice>,
  );
  const { data = [], total = 0, skip = 0, limit = 25 } = invoices;

  useEffect(() => {
    if (customerId) {
      setIsLoading(true);
      InvoiceService.find({
        query: {
          customerId: customerId,
          $limit: limit,
          $skip: skip,
        },
      }).then(
        (res: PaginatedFeathersResponse<Invoice>) => {
          setInvoices(res);
          setIsLoading(false);
        },
        () => {
          // console.log("Error in fetching invoices: ", error);
          message.error(t("invoices.fetchError"));
          setIsLoading(false);
        },
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, limit, skip]);
  const jobColumns = [
    {
      title: t("customerDetails.dateAndDescription"),
      dataIndex: "dueAt",
      render: (text: any, record: Invoice) => (
        <div className="s-table-text" style={{ width: "330px" }}>
          <p className="s-semibold tw-truncate tw-w-full">{`${t(
            "PDF.invoice",
          )} #${(record._id || "").substr(-5)} ${
            record.dueAt
              ? t("invoices.edit.dueAt") +
                " " +
                moment(record.dueAt).format("DD/MM/YYYY")
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
      render: (text: string, record: Invoice) => (
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
      render: (text: string, record: Invoice) => (
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
      render: (text: string, record: Invoice) => (
        <Tag style={getTaskStatusStyles(record.status)}>
          {getConversionStatusText(record, t("Open"))}
        </Tag>
      ),
    },
  ];

  const columns = jobColumns.map((col) => ({
    ...col,
    onCell: (rec: Invoice) => ({
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
          rowKey={(record: Invoice) =>
            record._id || getRandomAlphaNumericString(10)
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
              setInvoices((old) => ({ ...old, skip: (pageNum - 1) * limit })),
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

export default withTranslation()(InvoicesCustomerDetails);
