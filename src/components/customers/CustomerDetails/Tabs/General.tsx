import {
  BankOutlined,
  CalendarOutlined,
  DollarOutlined,
  InfoCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Col, Empty, Row, Table, Tag, message } from "antd";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { getRTEText } from "utils/components/RTE/RTE";
import { currencyFormatter } from "utils/helpers/currencyFormatter";

import {
  getCustomFieldIcon,
  getPaginationButtons,
} from "../../../../scenes/Tasks/helpers";
import { TaskService } from "../../../../services";
import {
  Address,
  Customer,
  Firm,
  PaginatedFeathersResponse,
  Task,
  UserContextType,
} from "../../../../types";
import UserContext from "../../../../UserContext";
import {
  getCustomFieldValue,
  getCustomerName,
  getGrandTotalWithoutTax,
  getRandomAlphaNumericString,
} from "../../../../utils/helpers";
import {
  getConversionStatusText,
  getTaskStatusStyles,
} from "../../../../utils/helpers/utils";

interface GeneralCustomerDetailsProps extends WithTranslation {
  customer: Customer;
  viewDetails: (rec: Task) => void;
}

const GeneralCustomerDetails = ({
  customer,
  viewDetails,
  t,
}: GeneralCustomerDetailsProps) => {
  const { firm = {} as Firm } = useContext(UserContext) as UserContextType;
  const completedStatusId = firm?.completedTaskStatusId;
  const cancelledStatusId = firm?.cancelledTaskStatusId;
  const customFields = firm?.forms?.customers || [];
  const [activePage, setActivePage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState<PaginatedFeathersResponse<Task>>(
    {} as PaginatedFeathersResponse<Task>,
  );
  const { data, limit = 25, skip = 0, total = 0 } = tasks;
  useEffect(() => {
    if (!!customer._id && !!completedStatusId && !!cancelledStatusId) {
      setIsLoading(true);
      TaskService.find({
        query: {
          customerId: customer._id,
          recurringTasks: true,
          statusId: { $nin: [completedStatusId, cancelledStatusId] },
          $limit: limit,
          $skip: skip,
        },
      }).then(
        (res: PaginatedFeathersResponse<Task>) => {
          setTasks(res);
          setIsLoading(false);
        },
        () => {
          // console.log("Error in fetching upcominng jobs: ", error);
          setIsLoading(false);
          message.error(t("tasks.fetchError"));
        },
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer._id, completedStatusId, cancelledStatusId, limit, skip]);

  const addressColumns = [
    {
      title: (
        <span className="s-col-title">{t("customerDetails.addresses")}</span>
      ),
      dataIndex: "formatted",
      width: "60%",
      ellipsis: true,
      render: (text: string, record: Address) => (
        <span
          className="s-table-text tw-cursor-text"
          title={`${record.tag || t("customer.defaultAddressLabel")} - ${text}`}
        >
          <span className="s-semibold">
            {record.tag || t("customer.defaultAddressLabel")}
          </span>{" "}
          - <span>{text}</span>
        </span>
      ),
    },
    {
      dataIndex: "city",
      ellipsis: true,
    },
    {
      dataIndex: "state",
      ellipsis: true,
    },
  ];

  const jobColumns = [
    {
      title: (
        <span className="s-col-title">{t("customerDetails.activeJobs")}</span>
      ),
      dataIndex: "endAt",
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
      dataIndex: "customer",
      render: (text: string, record: Task) => (
        <div
          className="s-table-text tw-truncate"
          style={{ width: "330px" }}
          title={customer?.address?.formatted}
        >
          {customer?.address?.formatted}
        </div>
      ),
    },
    {
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
  }));

  const getAddresses: (x: Customer) => Address[] = (cstmr: Customer) => {
    if (!cstmr) {
      return [];
    }

    const defaultAddress: Address = cstmr.address;
    let output: Address[] = [{ _id: "home", ...defaultAddress }];

    if (Array.isArray(cstmr.addresses)) {
      output = [...output, ...cstmr.addresses];
    }
    return output;
  };

  return (
    <div className="tw-px-6">
      <h1 className="tw-text-2xl s-main-font s-main-text-color s-semibold">
        {getCustomerName(customer)}
      </h1>
      <div className="tw-mt-5 customer-info">
        {customer?.accountType === "business" && (
          <Row gutter={[0, 16]} className="tw-mb-2">
            <Col span={1}>
              <UserOutlined className="tw-align-text-top s-light-text-color" />
            </Col>
            <Col span={4}>
              <div className="s-main-font s-light-text-color">
                {t("customerList.contactPerson")}
              </div>
            </Col>
            <Col>
              <div className="s-main-font s-main-text-color">
                {customer?.contactPerson}
              </div>
            </Col>
          </Row>
        )}
        <Row gutter={[0, 16]} className="tw-mb-2">
          <Col span={1}>
            <InfoCircleOutlined className="tw-align-text-top s-light-text-color" />
          </Col>
          <Col span={4}>
            <div className="s-main-font s-light-text-color">
              {t("customerEdit.accountType")}
            </div>
          </Col>
          <Col>
            <div className="s-main-font s-main-text-color">
              {t(
                `customer.accountType.${customer?.accountType?.toLowerCase()}`,
              )}
            </div>
          </Col>
        </Row>
        <Row gutter={[0, 16]} className="tw-mb-2">
          <Col span={1}>
            <PhoneOutlined className="tw-align-text-top s-light-text-color" />
          </Col>
          <Col span={4}>
            <div className="s-main-font s-light-text-color">
              {t("customerDetails.telephone")}
            </div>
          </Col>
          <Col>
            <div className="s-main-font s-main-text-color">
              {customer.phone}
            </div>
          </Col>
        </Row>
        <Row gutter={[0, 16]} className="tw-mb-2">
          <Col span={1}>
            <MailOutlined className="tw-align-text-top s-light-text-color" />
          </Col>
          <Col span={4}>
            <div className="s-main-font s-light-text-color">
              {t("customerDetails.email")}
            </div>
          </Col>
          <Col>
            <div className="s-main-font s-main-text-color">
              {customer.email}
            </div>
          </Col>
        </Row>
        <Row gutter={[0, 16]} className="tw-mb-2">
          <Col span={1}>
            <CalendarOutlined className="tw-align-text-top s-light-text-color" />
          </Col>
          <Col span={4}>
            <div className="s-main-font s-light-text-color">
              {t("customerDetails.createdDate")}
            </div>
          </Col>
          <Col>
            <div className="s-main-font s-main-text-color">
              {customer.createdAt
                ? moment(customer.createdAt).format("DD/MM/YYYY")
                : ""}
            </div>
          </Col>
        </Row>
        <Row gutter={[0, 16]} className="tw-mb-2">
          <Col span={1}>
            <DollarOutlined className="tw-align-text-top s-light-text-color" />
          </Col>
          <Col span={4}>
            <div className="s-main-font s-light-text-color">
              {t("customerEdit.taxIdNumber")}
            </div>
          </Col>
          <Col>
            <div className="s-main-font s-main-text-color">
              {customer.taxIdNumber}
            </div>
          </Col>
        </Row>
        <Row gutter={[0, 16]} className="tw-mb-2">
          <Col span={1}>
            <BankOutlined className="tw-align-text-top s-light-text-color" />
          </Col>
          <Col span={4}>
            <div className="s-main-font s-light-text-color">
              {t("customerEdit.taxOffice")}
            </div>
          </Col>
          <Col>
            <div className="s-main-font s-main-text-color">
              {customer.taxOffice}
            </div>
          </Col>
        </Row>
        {customFields.map((field) => {
          return (
            <Row gutter={[0, 16]} key={field._id} className="tw-mb-2">
              <Col span={1}>
                {getCustomFieldIcon(
                  field.type,
                  "tw-align-text-top s-light-text-color",
                )}
              </Col>
              <Col span={4} className="s-main-font s-light-text-color">
                {field.label}
              </Col>
              <Col span={16} className="s-main-font s-main-text-color">
                {getCustomFieldValue(
                  customer?.fields?.find((item) => item._id === field._id),
                  true,
                  firm,
                )}
              </Col>
            </Row>
          );
        })}
      </div>
      <div className="tw-mt-10">
        <Table
          dataSource={getAddresses(customer)}
          columns={addressColumns}
          rowKey={(record) => record._id || getRandomAlphaNumericString(10)}
          pagination={{
            style: { display: "block", textAlign: "right", float: "unset" },
            itemRender: (page, type) =>
              getPaginationButtons(
                page,
                type,
                activePage,
                activePage * 25 >= (getAddresses(customer)?.length || 0),
              ),
            hideOnSinglePage: true,
            pageSize: 25,
            onChange: (page) => setActivePage(page),
          }}
          locale={{
            emptyText: <Empty description={t("tables.noData")} />,
          }}
        />
      </div>
      <div className="tw-mt-10 tw-mb-20">
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

export default withTranslation()(GeneralCustomerDetails);
