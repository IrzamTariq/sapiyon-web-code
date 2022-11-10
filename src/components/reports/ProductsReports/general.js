import { Empty, Table } from "antd";
import Appshell from "Appshell";
import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";

import { doFetchReport } from "../../../store/reports";
import numberFormatter from "../../../utils/helpers/numberFormatter";

class ProductsReportsGeneral extends Component {
  columns = [
    {
      title: this.props.t("reports.product"),
      dataIndex: "product",
      width: "80%",
    },
    {
      title: this.props.t("reports.quantity"),
      dataIndex: "count",
      render: (text) => numberFormatter(text),
    },
  ];

  componentDidMount() {
    this.props.doFetchReport();
  }

  render() {
    const { report, t } = this.props;
    const hasData = report.data && report.data.length > 0 ? true : false;

    return (
      <Appshell activeLink={["reports", "productsGeneral"]}>
        <h1 className="s-page-title tw-mb-5">
          {t("reports.menu.productsGeneral")}
        </h1>
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
const mapStateTopProps = (state) => {
  return {
    report: state.reports,
  };
};

const mapDisptachToProps = (dispatch) => {
  return {
    doFetchReport: () =>
      dispatch(
        doFetchReport({ reportName: "StockProductGeneral", filters: {} }),
      ),
  };
};

const Translated = withTranslation()(ProductsReportsGeneral);
export default connect(mapStateTopProps, mapDisptachToProps)(Translated);
