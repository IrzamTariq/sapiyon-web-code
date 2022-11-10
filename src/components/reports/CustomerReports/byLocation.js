import { Empty, Select, Table } from "antd";
import Appshell from "Appshell";
import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";

import { doFetchReport } from "../../../store/reports";
import numberFormatter from "../../../utils/helpers/numberFormatter";

class CustomerReportsByLocation extends Component {
  constructor() {
    super();
    this.state = {
      selectedLocation: "city",
    };
  }

  selectLocation = (value) => {
    this.setState({ selectedLocation: value });
  };

  componentDidMount() {
    this.props.doFetchReport();
  }
  render() {
    const { report, t } = this.props;
    const isCity = this.state.selectedLocation === "city";

    const columns = [
      {
        title: isCity ? t("reports.city") : t("reports.state"),
        dataIndex: isCity ? "city" : "locState",
        width: "80%",
      },
      {
        title: t("reports.numberOfCustomers"),
        dataIndex: "customers",
        render: (text) => numberFormatter(text),
      },
    ];

    return (
      <Appshell activeLink={["reports", "customerByLocation"]}>
        <h1 className="s-page-title tw-mb-5">
          {t("reports.menu.customersByLocation")}
        </h1>
        <Select
          className="tw-w-56 tw-mb-6 st-field-color st-placeholder-color"
          placeholder={t("reports.selectArea")}
          value={this.state.selectedLocation}
          onChange={this.selectLocation}
        >
          <Select.Option key="city">{t("reports.byCity")}</Select.Option>
          <Select.Option key="state">{t("reports.byState")}</Select.Option>
        </Select>
        <Table
          rowKey={(record) => `${record.customers} ${Math.random()}`}
          columns={columns}
          dataSource={isCity ? report.byCities || [] : report.byStates || []}
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

const mapDispatchToProps = (dispatch) => {
  return {
    doFetchReport: () =>
      dispatch(
        doFetchReport({ reportName: "CustomerByLocation", filters: {} }),
      ),
  };
};
const Translated = withTranslation()(CustomerReportsByLocation);
export default connect(mapStateToProps, mapDispatchToProps)(Translated);
