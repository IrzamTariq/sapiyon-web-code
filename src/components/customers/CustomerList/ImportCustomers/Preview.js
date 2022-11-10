import { Empty, Table } from "antd";
import moment from "moment";
import React from "react";
import { withTranslation } from "react-i18next";

import { getCustomerName } from "./../../../../utils/helpers";

function PreviewImportRecords({ records = [], t, fields = [] }) {
  // console.log("firm", firm);

  let customFieldsColumns = fields.map((field) => ({
    title: <span className="s-col-title">{field.label}</span>,
    dataIndex: field._id,
    className: "s-table-text s-pointer",
    sorter: ({ fields: aFields = [] }, { fields: bFields = [] }) => {
      let fieldA = aFields.find((item) => item._id === field._id) || {};
      let fieldB = bFields.find((item) => item._id === field._id) || {};
      return ("" + fieldA.value).localeCompare("" + fieldB.value);
    },
    sortDirections: ["descend", "ascend"],
    render: (text, record = {}) => {
      let customFields = record.fields || [];
      let colField = customFields.find((item) => item._id === field._id);
      if (!colField) {
        return "";
      }
      if (colField.type === "dropdown") {
        let val = colField.value || [];
        if (Array.isArray(val)) {
          val = val.join(", ");
        }
        return val;
      }
      if (colField.type === "date") {
        return colField.value
          ? moment(colField.value).format("DD/MM/YYYY HH:mm")
          : "";
      }
      if (colField.type === "toggleSwitch") {
        return colField.value === true ? t("global.yes") : t("global.no");
      }
      return colField.value;
    },
  }));

  const getAccountType = (accountType = "") => {
    if (accountType === "business") {
      return "Kurumsal";
    }
    return "Bireysel";
  };

  const columns = [
    {
      title: t("customerEdit.businessName"),
      dataIndex: "businessName",
      sorter: (a, b) => ("" + a.bussinessName).localeCompare(b.bussinessName),
      sortDirections: ["descend", "ascend"],
      render: (text, record) => (
        <div className="tw-truncate tw-w-64" title={getCustomerName(record)}>
          {getCustomerName(record)}
        </div>
      ),
    },
    {
      title: t("customerList.contactPerson"),
      dataIndex: "contactPerson",
      sorter: (a, b) => ("" + a.contactPerson).localeCompare(b.contactPerson),
      sortDirections: ["descend", "ascend"],
      render: (text, record) => (
        <div className="tw-truncate tw-w-65" title={text}>
          {text}
        </div>
      ),
    },
    {
      title: t("customerEdit.accountType"),
      dataIndex: "accountType",
      sorter: (a, b) => ("" + a.accountType).localeCompare(b.accountType),
      sortDirections: ["descend", "ascend"],
      render: (text, record) => (
        <div className="tw-truncate tw-w-64" title={getAccountType(text)}>
          {getAccountType(text)}
        </div>
      ),
    },
    {
      title: t("customerList.email"),
      dataIndex: "email",
      sorter: (a, b) => ("" + a.email).localeCompare(b.email),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: t("customerList.telephone"),
      dataIndex: "phone",
      sorter: (a, b) => ("" + a.phone).localeCompare(b.phone),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: t("customerEdit.addressTitle"),
      dataIndex: "address.tag",
      sorter: (a, b) => ("" + a.tag).localeCompare(b.tag),
      sortDirections: ["descend", "ascend"],
      render: (text, record) => (
        <div
          className="tw-w-56 tw-truncate"
          title={text || t("customer.defaultAddressLabel")}
        >
          {text || t("customer.defaultAddressLabel")}
        </div>
      ),
    },
    {
      title: t("taskCustomer.address"),
      dataIndex: "address.formatted",
      sorter: (a, b) => ("" + a.formatted).localeCompare(b.formatted),
      sortDirections: ["descend", "ascend"],
      render: (text, record) => (
        <div className="tw-w-56 tw-truncate" title={text}>
          {text}
        </div>
      ),
    },
    {
      title: t("customerList.state"),
      dataIndex: "address.state",
      sorter: (a, b) => ("" + a.state).localeCompare(b.state),
      sortDirections: ["descend", "ascend"],
      render: (text, record) => (
        <div className="tw-w-56 tw-truncate" title={text}>
          {text}
        </div>
      ),
    },
    {
      title: t("customerList.city"),
      dataIndex: "address.city",
      sorter: (a, b) => ("" + a.city).localeCompare(b.city),
      sortDirections: ["descend", "ascend"],
      render: (text, record) => (
        <div className="tw-w-56 tw-truncate" title={text}>
          {text}
        </div>
      ),
    },
    ...customFieldsColumns,
  ];

  return (
    <div>
      <Table
        dataSource={records}
        scroll={{ x: true, y: 400 }}
        pagination={{
          hideOnSinglePage: true,
          showSizeChanger: true,
          defaultPageSize: 25,
          pageSizeOptions: ["25", "50", "100"],
        }}
        rowKey={"uid"}
        columns={columns}
        locale={{
          emptyText: <Empty description={t("tables.noData")} />,
        }}
      />
    </div>
  );
}

export default withTranslation()(PreviewImportRecords);
