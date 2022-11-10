import { Empty, Table, message } from "antd";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { withTranslation } from "react-i18next";
import { getPaginationButtons } from "scenes/Tasks/helpers";
import UserContext from "UserContext";
import { currencyFormatter } from "utils/helpers/currencyFormatter";

import { ExpensesService, RevenueService } from "../../services";

const Wrapper = ({ t, showDetails, month }) => {
  const [expenses, setExpenses] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activePage, setActivePage] = useState(1);
  const { firm } = useContext(UserContext);

  useEffect(() => {
    const updateRefreshKey = () => {
      setRefreshKey(() => Date.now());
    };

    ExpensesService.on("created", updateRefreshKey);
    ExpensesService.on("patched", updateRefreshKey);
    ExpensesService.on("removed", updateRefreshKey);
    return () => {
      ExpensesService.off("created", updateRefreshKey);
      ExpensesService.off("patched", updateRefreshKey);
      ExpensesService.off("removed", updateRefreshKey);
    };
  }, [month]);

  const fetchSuccess = (data = []) => {
    setExpenses(data);
  };

  useEffect(() => {
    RevenueService.find({
      query: {
        reportName: "DailyExpenseAndRevenue",
        startDate: moment(month).startOf("month"),
        endDate: moment(month).endOf("month"),
      },
    }).then(
      (res) => fetchSuccess(res),
      (error) => {
        // console.log("Error: ", error);
        message.error(t("accounting.fetchError"));
      },
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, refreshKey]);

  const cols = [
    {
      title: t("accounting.date"),
      width: "25%",
      dataIndex: "date",
      render: (text) => (text ? moment(text).format("DD/MM/YYYY") : null),
    },
    {
      title: t("accounting.income"),
      width: "25%",
      dataIndex: "income",
      render: (text) => currencyFormatter(text, true, firm.currencyFormat),
    },
    {
      title: t("accounting.expense"),
      width: "25%",
      dataIndex: "expense",
      render: (value = 0) =>
        currencyFormatter(value, true, firm.currencyFormat),
    },
    {
      title: t("accounting.profit/loss"),
      width: "25%",
      render: (value, record) =>
        currencyFormatter(
          (+record.income || 0) - (+record.expense || 0),
          true,
          firm.currencyFormat,
        ),
    },
  ];
  const columns = cols.map((col) => ({
    ...col,
    title: <span className="s-col-title-simple">{col.title}</span>,
    onCell: (record) => ({ className: "s-table-text" }),
  }));

  const getExtendedRow = ({ items: dataSource, date }, index) => {
    const exCols = [
      {
        title: t("accounting.worker"),
        dataIndex: "fullName",
        width: "25%",
      },
      {
        title: t("accounting.income"),
        dataIndex: "income",
        width: "25%",
        render: (value = 0) =>
          currencyFormatter(value, true, firm.currencyFormat),
      },
      {
        title: t("accounting.expense"),
        dataIndex: "expense",
        width: "25%",
        render: (value = 0) =>
          currencyFormatter(value, true, firm.currencyFormat),
      },
      {
        title: t("accounting.profit/loss"),
        width: "25%",
        render: (value, record) =>
          currencyFormatter(
            (+record.income || 0) - (+record.expense || 0),
            true,
            firm.currencyFormat,
          ),
      },
    ];
    const exColumns = exCols.map((item) => ({
      ...item,
      title: <span className="s-col-title-simple">{item.title}</span>,
      onCell: (data) => ({
        className: "s-table-text s-pointer",
        onClick: () => showDetails({ ...data, date }),
      }),
    }));

    return (
      <div style={{ marginLeft: "28px" }}>
        <Table
          columns={exColumns}
          dataSource={dataSource}
          className="tw-bg-white"
          rowKey={(record) => record.userId}
          pagination={{ hideOnSinglePage: true }}
          locale={{
            emptyText: <Empty description={t("tables.noData")} />,
          }}
        />
      </div>
    );
  };

  return (
    <Table
      columns={columns}
      dataSource={expenses}
      rowKey={(record) => record.date}
      expandable={{
        expandedRowRender: (record) => getExtendedRow(record || {}),
        expandIcon: ({ expanded }) => (
          <div className="tw-relative">
            <div className="s-expand-icon" />
            <div
              className={
                "s-expand-icon s-expand-icon-overlay " +
                (expanded ? "" : "s-expand-icon-expanded")
              }
            />
          </div>
        ),
        expandRowByClick: true,
      }}
      rowClassName="s-pointer"
      pagination={{
        showTotal: (total, range) => `${range[0]} - ${range[1]} / ${total}`,
        itemRender: (page, type) =>
          getPaginationButtons(
            page,
            type,
            activePage,
            activePage * 5 >= (expenses?.length || 0),
          ),
        defaultPageSize: 30,
        onChange: (page) => setActivePage(page),
        position: ["bottomCenter"],
        style: { marginBottom: 0 },
      }}
      locale={{
        emptyText: <Empty description={t("tables.noData")} />,
      }}
      className="s-table-scrolling"
    />
  );
};

export default withTranslation()(Wrapper);
