import { Empty, Table, Tag, message } from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { getRTEText } from "utils/components/RTE/RTE";

import { getPaginationButtons } from "../../../../scenes/Tasks/helpers";
import { RFQService } from "../../../../services";
import { PaginatedFeathersResponse, RFQ } from "../../../../types";
import { getRandomAlphaNumericString } from "../../../../utils/helpers";
import {
  getConversionStatusText,
  getTaskStatusStyles,
} from "../../../../utils/helpers/utils";

interface RFQCustomerDetailsProps extends WithTranslation {
  customerId: string;
  viewDetails: (rfq: RFQ) => void;
}

const RFQCustomerDetails = ({
  t,
  customerId,
  viewDetails,
}: RFQCustomerDetailsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [rfqs, setRfqs] = useState<PaginatedFeathersResponse<RFQ>>(
    {} as PaginatedFeathersResponse<RFQ>,
  );
  const { total = 0, skip = 0, limit = 25, data = [] } = rfqs;
  useEffect(() => {
    if (customerId) {
      setIsLoading(true);
      RFQService.find({
        query: {
          customerId: customerId,
          $limit: limit,
          $skip: skip,
        },
      }).then(
        (res: PaginatedFeathersResponse<RFQ>) => {
          setRfqs(res);
          setIsLoading(false);
        },
        () => {
          // console.log("Could not fetch RFQs: ", error);
          message.error(t("RFQs.fetchError"));
        },
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, limit, skip]);

  const jobColumns = [
    {
      title: t("customerDetails.dateAndDescription"),
      dataIndex: "createdAt",
      render: (text: any, record: RFQ) => (
        <div className="s-table-text" style={{ width: "330px" }}>
          <p className="s-semibold tw-truncate tw-w-full">{`${t(
            "customerDetails.rfqCreatedOn",
          )} ${
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
      render: (text: string, record: RFQ) => (
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
      title: t("taskList.status"),
      dataIndex: "status",
      render: (text: string, record: RFQ) => (
        <Tag
          style={getTaskStatusStyles(
            record.status,
            record.isQuoteCreated || record.isTaskCreated,
          )}
        >
          {getConversionStatusText(record, t("Pending"))}
        </Tag>
      ),
    },
  ];

  const columns = jobColumns.map((col) => ({
    ...col,
    onCell: (rec: RFQ) => ({
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
          rowKey={(record: RFQ) =>
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
              setRfqs((old) => ({ ...old, skip: (pageNum - 1) * limit })),
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

export default withTranslation()(RFQCustomerDetails);
