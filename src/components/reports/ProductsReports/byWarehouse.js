import { Empty, Select, Table } from "antd";
import Appshell from "Appshell";
import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import ElasticSearchField from "utils/components/ElasticSearchField";

import { doFetchReport } from "../../../store/reports";
import numberFormatter from "../../../utils/helpers/numberFormatter";

class ProductsReportsByWarehouse extends Component {
  constructor() {
    super();
    this.state = {
      selectedProduct: "",
    };
  }

  componentDidMount() {
    this.props.doFetchReport({
      reportName: "StockProductSoldByDepo",
      filters: {},
    });
  }

  selectProduct = (value) => {
    this.setState({ selectedProduct: value });
    this.props.doFetchReport({
      reportName: "StockProductSoldByDepo",
      filters: { productId: value },
    });
  };

  render() {
    const { t, report } = this.props;

    const columns = [
      {
        title: t("reports.warehouse"),
        dataIndex: "warehouse",
        width: "80%",
      },
      {
        title: t("reports.quantityUsed"),
        dataIndex: "count",
        render: (text) => numberFormatter(text),
      },
    ];

    const hasData =
      report.warehouseData && report.warehouseData.length > 0 ? true : false;

    return (
      <Appshell activeLink={["reports", "productsByWarehouse"]}>
        <h1 className="s-page-title tw-mb-5">
          {t("reports.menu.productsByWarehouse")}
        </h1>
        <ElasticSearchField
          entity="stock/items"
          className="tw-w-1/4 tw-mb-6 st-field-color st-placeholder-color"
          placeholder={t("addStock.productNamePlaceholder")}
          currentValue={undefined}
          renderOptions={(items = []) =>
            items.map((item: StockItem) => (
              <Select.Option key={item._id} value={item._id} item={item}>
                {item.title} {item.barcode ? `- ${item.barcode}` : ""}
              </Select.Option>
            ))
          }
          style={{ maxWidth: "230px" }}
          onSelect={this.selectProduct}
        />
        <Table
          rowKey={(record) => `${record.warehouse} ${Math.random()}`}
          columns={columns}
          dataSource={hasData ? report.warehouseData : []}
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

const Translated = withTranslation()(ProductsReportsByWarehouse);

const mapStateToProps = (state) => {
  return {
    report: state.reports,
  };
};

const mapDispatchToProps = {
  doFetchReport,
};

export default connect(mapStateToProps, mapDispatchToProps)(Translated);
