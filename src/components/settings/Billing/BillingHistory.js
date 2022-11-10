import { Empty, Table } from "antd";
import moment from "moment";
import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";

import PageContainer from "../../../scenes/Layouts/PageContainer";
import { doSubscriptionTransactionFetchRequest } from "../../../store/subscription";
import { getUsableScreenHeight } from "../../../utils/helpers";
import { currencyFormatter } from "../../../utils/helpers/currencyFormatter";
import SettingsMenu from "../SettingsMenu/SettingsMenu";

class BillingHistory extends Component {
  componentDidMount() {
    this.props.doSubscriptionTransactionFetchRequest();
  }

  columns = [
    {
      title: this.props.t("billingHistory.date"),
      dataIndex: "periodEndAt",
      render: (text, record) => moment(text).format("DD MMM YYYY - HH:mm"),
    },
    {
      title: this.props.t("billingHistory.amount"),
      dataIndex: "price",
      render: (text, record) => currencyFormatter(record.price, true),
    },
    {
      title: this.props.t("billingHistory.status"),
      dataIndex: "paymentStatus",
      render: (text) =>
        text === "SUCCESS"
          ? this.props.t("billingHistory.paid")
          : this.props.t("billingHistory.notPaid"),
    },
    {
      title: this.props.t("billingHistory.paidThrough"),
      dataIndex: "type",
      render: (text) => (
        <span className="uppercase s-main-text s-main-text-color">{text}</span>
      ),
    },
  ];

  columns = this.columns.map((col) => ({
    ...col,
    title: <span className="s-col-title">{col.title}</span>,
    onCell: () => ({ className: "s-table-text" }),
  }));

  render() {
    const { t, transactions } = this.props;
    return (
      <div>
        <PageContainer containerStyle={getUsableScreenHeight()}>
          <div className="tw-flex tw-bg-white tw-p-4 tw-shadow">
            <div className="tw-w-64">
              <SettingsMenu
                defaultOpenKeys={["billing"]}
                selectedKeys={["billingHistory"]}
              />
            </div>
            <div className="tw-w-full tw-ml-16">
              <h1 className="tw-text-2xl tw-mb-6 s-font-roboto">
                {t("settingsMenu.billingHistory")}
              </h1>
              <Table
                dataSource={transactions || []}
                columns={this.columns}
                pagination={{ hideOnSinglePage: true, pageSize: 50 }}
                rowKey={(record) => record._id}
                locale={{
                  emptyText: <Empty description={t("tables.noData")} />,
                }}
                scroll={{ x: true }}
              />
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    transactions: state.subscription.transactions,
  };
};
const mapDispatchToProps = {
  doSubscriptionTransactionFetchRequest,
};
const Translated = withTranslation()(BillingHistory);
export default connect(mapStateToProps, mapDispatchToProps)(Translated);
