import { Empty, Table, Tooltip } from "antd";
import moment from "moment";
import { path } from "rambdax";
import React, { useContext } from "react";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { getPaginationButtons } from "scenes/Tasks/helpers";
import UserContext from "UserContext";
import { feedbackColumns } from "utils/components/TableSettings/Components/StandardTableColumns";

import { doFeedbackPageChange } from "./../../../store/feedback";
import {
  getCustomFieldValue,
  getCustomerName,
  getOrderedColumns,
  getUsername,
} from "../../../utils/helpers";

const FeedBackList = ({
  t,
  dataSource,
  editFeedback,
  fields,
  total,
  skip,
  limit,
  isLoading,
  currentPage,
  doFeedbackPageChange,
}) => {
  const { tableSettings, firm } = useContext(UserContext);
  const mapCustomFieldValuesToColumns = (customFields = []) =>
    customFields.map((field) => ({
      title: field.label,
      dataIndex: field._id,
      render: (text: any, record) => {
        let savedField = record?.completionFeedbackByCustomer?.fields?.find(
          (item) => item._id === field._id,
        );

        return (
          <div
            className="tw-truncate"
            style={{ width: "inherit" }}
            title={getCustomFieldValue(savedField, false, firm)}
          >
            {getCustomFieldValue(savedField, true, firm)}
          </div>
        );
      },
    }));
  let columns = [
    {
      title: t("feedback.points"),
      dataIndex: ["completionFeedbackByCustomer", "rating"],
      render: (text, record) => {
        const rating = path("completionFeedbackByCustomer.rating", record);
        if (rating) {
          let color = "";
          if (rating >= 1 && rating <= 6) {
            color = "#FF4B19";
          } else if (rating >= 7 && rating <= 8) {
            color = "#ECAA00";
          } else {
            color = "#00B21A";
          }

          return (
            <div
              style={{
                height: "28px",
                backgroundColor: color,
              }}
              className="tw-w-8 tw-text-lg tw-text-white tw-font-medium tw-rounded tw-flex tw-items-center tw-justify-center s-font-roboto"
            >
              {rating}
            </div>
          );
        } else {
          return "";
        }
      },
    },
    {
      title: t("feedback.customer"),
      dataIndex: "customer",
      render: (text, record) => (
        <div
          className="tw-truncate"
          style={{ width: "inherit" }}
          title={getCustomerName(record.customer)}
        >
          {getCustomerName(record.customer)}
        </div>
      ),
    },
    {
      title: t("feedback.feedbackNote"),
      dataIndex: ["completionFeedbackByCustomer", "text"],
      render: (text, record) => (
        <div
          className="tw-truncate"
          title={path("completionFeedbackByCustomer.text", record) || ""}
          style={{ width: "inherit" }}
        >
          {path("completionFeedbackByCustomer.text", record)}
        </div>
      ),
    },
    {
      title: t("feedback.assignee"),
      dataIndex: "assigneeIds",
      render: (text, record) => {
        const names =
          (record.assignees || []).map((item) => getUsername(item)) || [];
        return (
          <Tooltip
            autoAdjustOverflow
            placement="bottomLeft"
            title={
              <ol>
                {names.map((name, index) => (
                  <li key={`${name}${Math.random()}`}>{`${
                    index + 1
                  }. ${name}`}</li>
                ))}
              </ol>
            }
          >
            <div className="tw-truncate" style={{ width: "inherit" }}>
              {names.join(" | ")}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: t("taskDetail.endAt"),
      dataIndex: "endAt",
      render: (text, record) =>
        path("endAt", record) ? (
          <div style={{ width: "inherit" }}>
            {moment(record.endAt).format("DD/MM/YYYY HH:mm")}
          </div>
        ) : (
          ""
        ),
    },
    {
      title: t("feedback.smsSentAt"),
      dataIndex: ["completionFeedbackByCustomer", "smsSentAt"],
      render: (text, record) => {
        let smsSentAt = path("completionFeedbackByCustomer.smsSentAt", record);
        return (
          smsSentAt && (
            <div style={{ width: "inherit" }}>
              {moment(smsSentAt).format("DD/MM/YYYY HH:mm")}
            </div>
          )
        );
      },
    },
    {
      title: t("feedback.receivedAt"),
      dataIndex: ["completionFeedbackByCustomer", "receivedAt"],
      render: (text, record) =>
        path("completionFeedbackByCustomer.receivedAt", record) ? (
          <div style={{ width: "inherit" }}>
            {moment(record.completionFeedbackByCustomer.receivedAt).format(
              "DD/MM/YYYY HH:mm",
            )}
          </div>
        ) : (
          ""
        ),
    },
    {
      title: t("feedback.smsStatus"),
      dataIndex: ["completionFeedbackByCustomer", "smsStatus"],
      render: (status = "") => {
        let returnValue = "";
        if (status === "sent") {
          returnValue = t("feedback.SMSSent");
        } else if (status === "failed") {
          returnValue = t("feedback.SMSFailed");
        } else if (status === "pending") {
          returnValue = t("feedback.SMSPending");
        } else if (status === "Invalid Phone") {
          returnValue = t("feedback.invalidPhone");
        } else if (status === "Scheduled") {
          returnValue = t("Gönderilecek");
        } else if (!status) {
          returnValue = "";
        } else {
          returnValue = t("feedback.SMSFailed");
        }
        return (
          <div
            className="tw-truncate"
            title={returnValue}
            style={{ width: "inherit" }}
          >
            {returnValue}
          </div>
        );
      },
    },
    ...mapCustomFieldValuesToColumns(fields, firm),
  ];

  columns = getOrderedColumns(
    columns,
    tableSettings["feedback"] || feedbackColumns,
  );

  columns = columns.reduce((all, curr) => {
    const { cellWidth = 200 } = curr;
    const current = {
      ...curr,
      title: (
        <Tooltip title={curr.title} placement="topLeft">
          <div className="s-col-title" style={{ minWidth: `${cellWidth}px` }}>
            {curr.title}
          </div>
        </Tooltip>
      ),
    };

    return current.dataIndex === "actions"
      ? [...all, current]
      : [
          ...all,
          {
            ...current,
            onCell: (record) => ({
              onClick: () => editFeedback(record),
              className: "s-table-text s-pointer",
              style: { width: cellWidth },
            }),
          },
        ];
  }, []);

  return (
    <Table
      rowKey={(record) => `${record._id}`}
      dataSource={dataSource}
      columns={columns}
      pagination={{
        showSizeChanger: true,
        defaultPageSize: 25,
        pageSizeOptions: ["25", "50", "100"],
        current: currentPage,
        total,
        onShowSizeChange: (current, size) => {
          doFeedbackPageChange({ pageNumber: current, pageSize: size });
        },
        onChange: (pageNumber, pageSize) => {
          doFeedbackPageChange({ pageNumber, pageSize });
        },
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
      }}
      loading={isLoading}
      className="s-exTasks-scrolling"
      scroll={{ x: true }}
      locale={{
        emptyText: <Empty description={t("tables.noData")} />,
      }}
    />
  );
};

const Translated = withTranslation()(FeedBackList);
const mapStateToProps = (state) => {
  return {
    currentPage: state.feedback.currentPage,
    isLoading: state.feedback.isLoading,
    total: state.feedback.total,
    skip: state.feedback.skip,
    limit: state.feedback.limit,
  };
};
const mapDispatchToProps = {
  doFeedbackPageChange,
};

const Connected = connect(mapStateToProps, mapDispatchToProps)(Translated);
export default Connected;
