import { DatePicker, Empty, Select, Table } from "antd";
import Appshell from "Appshell";
import i18next from "i18next";
import moment from "moment";
import { path } from "rambdax";
import React from "react";
import { Component } from "react";
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
class JobsReportByUsers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedUser: { key: "all", label: props.t("reports.all") },
    };
  }

  selectUser = (value) => {
    this.setState({ selectedUser: value });
  };

  handleDateFilter = (range = []) => {
    const data = {
      reportName: "TaskByUser",
      filters: { endAt: range },
    };
    this.props.doFetchReport(data);
  };

  componentDidMount() {
    const data = {
      reportName: "TaskByUser",
      filters: { endAt: [], filterByUser: "" },
    };
    this.props.doFetchReport(data);
  }

  render() {
    const { t, report } = this.props;
    const { data, isLoading } = report;
    const hasData =
      Object.keys(path("data.statistics", report) || {}).length > 0 &&
      (Object.keys(path("data.users", report) || {}) || []).length > 0
        ? true
        : false;

    const { statistics, users } = hasData ? data : {};

    const { selectedUser } = this.state;
    const selection =
      selectedUser.key === "all"
        ? users
        : {
            [selectedUser.key]: {
              _id: selectedUser.key,
              name: selectedUser.label,
            },
          };

    const firstCol = [
      {
        title: t("reports.months"),
        dataIndex: "date",
        fixed: "left",
        width: 150,
      },
    ];

    const columns = [
      ...firstCol,
      ...(hasData
        ? (Object.values(selection) || []).map((user) => ({
            title: user.name,
            dataIndex: user._id,
            render: (text) => numberFormatter(text),
          }))
        : []),
    ];

    const allTableData = Object.values(statistics || {}) || [];

    return (
      <Appshell activeLink={["reports", "jobsByUsers"]}>
        <h1 className="s-page-title tw-mb-5">
          {t("reports.menu.jobsByUsers")}
        </h1>
        <div className="tw-mb-6">
          <DatePicker.RangePicker
            value={report.filters.endAt || []}
            onChange={this.handleDateFilter}
            ranges={getRanges()}
            className="md:tw-mr-2 st-field-color st-placeholder-color"
          />
          <Select
            className="tw-mr-3 tw-w-40 st-field-color st-placeholder-color"
            onChange={this.selectUser}
            placeholder={t("reports.selectUser")}
            defaultValue={{ key: "all" }}
            showSearch
            labelInValue
            filterOption={(input, option) =>
              option.props.children
                .toLowerCase()
                .indexOf(input.toLowerCase()) >= 0
            }
          >
            <Select.Option key="all">{t("reports.all")}</Select.Option>
            {hasData &&
              (Object.values(users) || []).map((user) => (
                <Select.Option key={user._id}>{user.name}</Select.Option>
              ))}
          </Select>
        </div>
        <Table
          rowKey={(record) => `${record.date}`}
          columns={columns}
          dataSource={hasData ? allTableData : []}
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
const Translated = withTranslation()(JobsReportByUsers);
export default connect(mapStateToProps, mapDispatchToProps)(Translated);
