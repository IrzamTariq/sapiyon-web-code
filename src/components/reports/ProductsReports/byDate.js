import { DatePicker, Empty, Table } from "antd";
import Appshell from "Appshell";
import i18next from "i18next";
import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";

import { doFetchReport } from "../../../store/reports";
import numberFormatter from "../../../utils/helpers/numberFormatter";

const moment = require("moment");
const getRanges = () => {
  const now = moment();

  return {
    [i18next.t("dates.lastSevenDays")]: [
      now.clone().add(-7, "day").startOf("day"),
      now.clone().endOf("day"),
    ],
    [i18next.t("dates.lastWeek")]: [
      now.clone().add(-1, "week").startOf("week"),
      now.clone().add(-1, "week").endOf("week"),
    ],
    [i18next.t("dates.lastThirtyDays")]: [
      now.clone().add(-30, "day").startOf("day"),
      now.clone().endOf("day"),
    ],
    [i18next.t("dates.lastMonth")]: [
      now.clone().add(-1, "month").startOf("month"),
      now.clone().add(-1, "month").endOf("month"),
    ],
    [i18next.t("dates.lastThreeMonths")]: [
      now.clone().add(-3, "month").startOf("month"),
      now.clone().add(-1, "month").endOf("month"),
    ],
    [i18next.t("dates.lastSixMonths")]: [
      now.clone().add(-6, "month").startOf("month"),
      now.clone().add(-1, "month").endOf("month"),
    ],
    [i18next.t("dates.thisYear")]: [
      now.clone().startOf("year"),
      now.clone().endOf("day"),
    ],
  };
};

class ProductReportsByDate extends Component {
  handleDateFilter = (range = []) => {
    const data = {
      reportName: "StockProductByDate",
      filters: { endAt: range },
    };
    this.props.doFetchReport(data);
  };
  componentDidMount() {
    const data = {
      reportName: "StockProductByDate",
      filters: { endAt: [] },
    };
    this.props.doFetchReport(data);
  }

  columns = [
    {
      title: this.props.t("reports.months"),
      dataIndex: "date",
      width: "80%",
    },
    {
      title: this.props.t("reports.quantity"),
      dataIndex: "count",
      render: (text) => numberFormatter(text),
    },
  ];

  render() {
    const { t, report } = this.props;
    const hasData = report.data && report.data.length > 0 ? true : false;

    return (
      <Appshell activeLink={["reports", "productsByDate"]}>
        <h1 className="s-page-title tw-mb-5">
          {t("reports.menu.productsByDate")}
        </h1>
        <DatePicker.RangePicker
          value={report?.filters?.endAt || []}
          onChange={this.handleDateFilter}
          ranges={getRanges()}
          className="tw-mb-6 md:tw-mr-2 st-field-color st-placeholder-color"
        />

        <Table
          rowKey={(record) => `${record.product} ${Math.random()}`}
          columns={this.columns}
          dataSource={hasData ? report.data : []}
          pagination={{ pageSize: 50, hideOnSinglePage: true }}
          locale={{
            emptyText: <Empty description={t("tables.noData")} />,
          }}
          loading={report.isLoading}
        />
      </Appshell>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    report: state.reports,
  };
};

const mapDispatchToProps = {
  doFetchReport,
};

const Translated = withTranslation()(ProductReportsByDate);
export default connect(mapStateToProps, mapDispatchToProps)(Translated);
