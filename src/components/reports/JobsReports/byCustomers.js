import { DatePicker, Empty, Select, Table, message } from "antd";
import Appshell from "Appshell";
import i18next from "i18next";
import moment from "moment";
import { path } from "rambdax";
import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";

import { doFetchReport } from "../../../store/reports";
import numberFormatter from "../../../utils/helpers/numberFormatter";

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
class JobsReportByCustomers extends Component {
  constructor() {
    super();
    this.state = {
      selectedUser: "all",
      selectedUserChartData: [],
      selectedUserTableData: [],
    };
  }

  selectUser = (value) => {
    const customers = this.props.report.data.statistics;
    const ids = this.props.report.data.customerIds;
    if (value !== "all") {
      this.setState({
        selectedUser: customers[value].name,
        selectedUserChartData: customers[value].chartData,
        selectedUserTableData: [customers[value].tableData],
      });
    } else {
      const data = ids.map((id) => ({
        name: customers[id].name,
        ...customers[id].tableData,
      }));
      this.setState({
        selectedUser: value,
        selectedUserTableData: data,
      });
    }
  };

  handleDateFilter = (range = []) => {
    if (Array.isArray(range) && range.length === 2) {
      if (moment(range[1]).diff(range[0], "days") > 365) {
        message.info(this.props.t("reports.aYearLimit"));
        this.props.doFetchReport({
          reportName: "TaskByCustomer",
          filters: { endAt: [range[0], moment(range[0]).add(365, "day")] },
        });
      } else {
        this.props.doFetchReport({
          reportName: "TaskByCustomer",
          filters: { endAt: range },
        });
      }
    }
  };

  componentDidMount() {
    const data = {
      reportName: "TaskByCustomer",
      filters: { endAt: [moment().add(-30, "day"), moment()] },
    };
    this.props.doFetchReport(data);
  }

  render() {
    const { report, t } = this.props;
    const { data, isLoading, filters } = report;
    const hasData =
      Object.keys(path("data.statistics", report) || {}).length > 0 &&
      (path("data.x_axis", report) || []).length > 0 &&
      (path("data.customerIds", report) || []).length > 0
        ? true
        : false;

    const { x_axis, customerIds, statistics } = hasData ? data : {};
    const firstCol =
      this.state.selectedUser === "all"
        ? [
            {
              title: t("reports.businessName"),
              dataIndex: "name",
              width: 300,
              fixed: "left",
            },
          ]
        : [
            {
              title: t("reports.businessName"),
              render: (record) => this.state.selectedUser,
              key: "name",
              width: 300,
              fixed: "left",
            },
          ];
    const columns = [
      ...firstCol,
      ...(hasData
        ? x_axis.map((col) => ({
            title: col,
            dataIndex: col,
            render: (text) => numberFormatter(text),
          }))
        : []),
    ];

    const allTableData = hasData
      ? customerIds.map((id) => ({
          name: statistics[id].name,
          ...statistics[id].tableData,
        }))
      : [];

    return (
      <Appshell activeLink={["reports", "jobsByCustomers"]}>
        <h1 className="s-page-title tw-mb-5">
          {t("reports.menu.jobsByCustomers")}
        </h1>
        <div className="tw-mb-6">
          <DatePicker.RangePicker
            onChange={this.handleDateFilter}
            value={filters?.endAt || []}
            ranges={getRanges()}
            className="md:tw-w-56 md:tw-mr-2 st-field-color st-placeholder-color"
            allowClear={false}
          />
          <Select
            className="tw-mr-3 tw-w-40 st-field-color st-placeholder-color"
            onChange={this.selectUser}
            placeholder={t("reports.selectUser")}
            defaultValue="all"
            showSearch
            filterOption={(input, option) =>
              option.props.children
                .toLowerCase()
                .indexOf(input.toLowerCase()) >= 0
            }
          >
            <Select.Option key="all">{t("reports.all")}</Select.Option>
            {hasData &&
              customerIds.map((id) => (
                <Select.Option key={id}>{statistics[id].name}</Select.Option>
              ))}
          </Select>
        </div>
        <Table
          rowKey={(record) => `${record.name} ${Math.random()}`}
          columns={columns}
          dataSource={
            hasData && this.state.selectedUser === "all"
              ? allTableData
              : this.state.selectedUserTableData
          }
          pagination={{ pageSize: 50, hideOnSinglePage: true }}
          locale={{
            emptyText: <Empty description={t("tables.noData")} />,
          }}
          scroll={{ x: true }}
          loading={isLoading}
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
const Translated = withTranslation()(JobsReportByCustomers);
export default connect(mapStateToProps, mapDispatchToProps)(Translated);
