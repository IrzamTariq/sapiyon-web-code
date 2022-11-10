import { Empty } from "antd";
import Table, { ColumnProps } from "antd/lib/table";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserContextType } from "types";
import UserContext from "UserContext";
import { currencyFormatter } from "utils/helpers/currencyFormatter";

import { getPaginationButtons } from "../../../Tasks/helpers";
import { AssigneeBalanceReport } from "./AccountingSummary";

interface AssigneeRankingsBodyProps {
  data: AssigneeBalanceReport[];
  isLoading: boolean;
}

function AccountingBody(props: AssigneeRankingsBodyProps) {
  const [t] = useTranslation();
  const { firm } = useContext(UserContext) as UserContextType;
  const { data, isLoading } = props;
  const [activePage, setActivePage] = useState(1);
  let columns: ColumnProps<AssigneeBalanceReport>[] = [
    {
      dataIndex: "fullName",
      title: t("accounting.worker"),
      sorter: (a, b) => (a.fullName < b.fullName ? -1 : 1),
      render: (text) => (
        <div className="tw-truncate" style={{ maxWidth: "130px" }} title={text}>
          {text}
        </div>
      ),
    },
    {
      dataIndex: "income",
      title: t("accounting.income"),
      sorter: (a, b) => (a.income < b.income ? -1 : 1),
      render: (expense) =>
        currencyFormatter(expense, true, firm.currencyFormat),
    },
    {
      dataIndex: "expense",
      title: t("accounting.expense"),
      sorter: (a, b) => (a.expense < b.expense ? -1 : 1),
      render: (income) => currencyFormatter(income, true, firm.currencyFormat),
    },
    {
      dataIndex: "balance",
      title: t("accounting.profit/loss"),
      sorter: (a, b) => (a.balance < b.balance ? -1 : 1),
      render: (balance) =>
        currencyFormatter(balance, true, firm.currencyFormat),
    },
  ];

  columns = columns.map((col) => ({
    ...col,
    title: <span className="s-col-title">{col.title}</span>,
    onCell: () => ({ className: "s-table-text" }),
  }));

  return (
    <div className={"tw-p-4"}>
      <Table
        columns={columns}
        rowKey={"assigneeId"}
        dataSource={data}
        pagination={{
          pageSize: 5,
          size: "small",
          style: { display: "block", textAlign: "center", float: "unset" },
          itemRender: (page, type) =>
            getPaginationButtons(
              page,
              type,
              activePage,
              activePage * 5 >= (data?.length || 0),
              false,
            ),
          onChange: (page) => setActivePage(page),
          hideOnSinglePage: true,
        }}
        loading={isLoading}
        scroll={{ x: true }}
        locale={{
          emptyText: <Empty description={t("tables.noData")} />,
        }}
      />
    </div>
  );
}

export default AccountingBody;
