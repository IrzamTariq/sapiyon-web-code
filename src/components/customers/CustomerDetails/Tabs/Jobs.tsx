import { Empty, Table, Tag, message } from "antd";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { getRTEText } from "utils/components/RTE/RTE";
import { currencyFormatter } from "utils/helpers/currencyFormatter";

import { getPaginationButtons } from "../../../../scenes/Tasks/helpers";
import { TaskService } from "../../../../services";
import { PaginatedFeathersResponse, Task } from "../../../../types";
import UserContext from "../../../../UserContext";
import {
  getGrandTotalWithoutTax,
  getRandomAlphaNumericString,
} from "../../../../utils/helpers";
import {
  getConversionStatusText,
  getTaskStatusStyles,
} from "../../../../utils/helpers/utils";

interface TasksCustomerDetailsProps extends WithTranslation {
  customerId: string;
  viewDetails: (rec: Task) => void;
}

const TasksCustomerDetails = ({
  t,
  customerId,
  viewDetails,
}: TasksCustomerDetailsProps) => {
  const { firm = {} }: any = useContext(UserContext);
  const completedStatusId = firm?.completedTaskStatusId;
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState<PaginatedFeathersResponse<Task>>(
    {} as PaginatedFeathersResponse<Task>,
  );
  const { data, total, skip, limit } = tasks;

  useEffect(() => {
    if (!!customerId) {
      setIsLoading(true);
      TaskService.find({
        query: {
          recurringTasks: true,
          customerId: customerId,
          statusId: completedStatusId,
          $limit: limit,
          $skip: skip,
        },
      }).then(
        (res: PaginatedFeathersResponse<Task>) => {
          setTasks(res);
          setIsLoading(false);
        },
        () => {
          // console.log("Error in fetching tasks: ", error);
          setIsLoading(false);
          message.error(t("tasks.fetchError"));
        },
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, limit, skip]);

  const jobColumns = [
    {
      title: t("customerDetails.dateAndDescription"),
      dataIndex: "title",
      render: (text: any, record: Task) => (
        <div className="s-table-text" style={{ width: "330px" }}>
          <p className="s-semibold tw-truncate tw-w-full">{`${t(
            "customerDetails.task",
          )} #${(record._id || "").substr(-5)} ${t("customerDetails.dueOn")} ${
            record?.endAt
              ? moment(record?.endAt).format("DD/MM/YYYY - HH:mm")
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
      render: (text: string, record: Task) => {
        const address = record?.customer?.address?.formatted;
        let addressToShow: string | undefined = "";
        if (record.addressId) {
          addressToShow = (
            record?.customer?.addresses?.find(
              (item) => item._id !== record.addressId,
            ) || {}
          )?.formatted;
        }
        return (
          <div
            className="s-table-text tw-truncate"
            style={{ width: "330px" }}
            title={addressToShow ? addressToShow : address}
          >
            {addressToShow ? addressToShow : address}
          </div>
        );
      },
    },
    {
      title: t("stockList.amount"),
      dataIndex: "stock",
      render: (text: string, record: Task) => (
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
      render: (text: string, record: Task) => (
        <Tag
          style={getTaskStatusStyles(record.status, record.isInvoiceCreated)}
        >
          {getConversionStatusText(record, t("Open"))}
        </Tag>
      ),
    },
  ];

  const columns = jobColumns.map((col) => ({
    ...col,
    onCell: (rec: Task) => ({
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
          rowKey={(record: Task) =>
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
              setTasks((old) => ({ ...old, skip: (pageNum - 1) * limit })),
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

export default withTranslation()(TasksCustomerDetails);
