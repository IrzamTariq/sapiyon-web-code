import { MoreOutlined } from "@ant-design/icons";
import { Dropdown, Empty, Menu, Popconfirm, Table, message } from "antd";
import logger from "logger";
import React, { useContext } from "react";
import { withTranslation } from "react-i18next";
import UserContext from "UserContext";
import { currencyFormatter } from "utils/helpers/currencyFormatter";

import { ExpensesService, TaskService } from "../../services";

function DailyAccountExpensesList({
  t,
  handleEdit,
  expenses = [],
  onTaskEdit,
}) {
  const { firm } = useContext(UserContext);
  const handleRemove = (id) => {
    ExpensesService.remove(id).then(
      (res) => {
        message.success(t("accounting.expense.removeSuccess"));
      },
      (error) => message.errror(t("tasks.removeError")),
    );
  };

  const expCols = [
    {
      title: (
        <span className="s-col-title-simple">
          {t("accounting.expense.code")}
        </span>
      ),
      dataIndex: "code",
      width: "25%",
      render: (text) => (
        <div className="tw-truncate tw-w-40" title={text}>
          {text}
        </div>
      ),
    },
    {
      title: (
        <span className="s-col-title-simple">
          {t("accounting.expense.description")}
        </span>
      ),
      dataIndex: "remarks",
      render: (text) => (
        <div className="tw-truncate" title={text} style={{ width: "370px" }}>
          {text}
        </div>
      ),
    },
    {
      title: (
        <span className="s-col-title-simple">
          {t("accounting.expense.jobId")}
        </span>
      ),
      dataIndex: ["task", "_id"],
      className: "s-pointer",
      align: "right",
      width: "15%",
      render: (text) => (text ? `#${(text || "").substr(-5)}` : ""),
      onCell: (record) => {
        return {
          onClick: (e) => {
            if (record.taskId) {
              TaskService.get(record.taskId).then(
                (res) => onTaskEdit(res),
                (err) => {
                  logger.error(t("taskList.fetchError"), err);
                  message.error(t("accounting.expense.noJob"));
                },
              );
            }
          },
        };
      },
    },

    {
      title: (
        <span className="s-col-title-simple">{t("accounting.amount")}</span>
      ),
      dataIndex: "amount",
      align: "right",
      width: "20%",
      render: (value) => currencyFormatter(value, true, firm.currencyFormat),
    },
    {
      dataIndex: "actions",
      width: "6%",
      render: (value, record) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item
                className="s-main-text-color s-main-font"
                onClick={() => handleEdit(record)}
              >
                {t("global.edit")}
              </Menu.Item>
              <Menu.Item className="s-main-text-color s-main-font">
                <Popconfirm
                  title={t("global.deleteSurety")}
                  onConfirm={() => handleRemove(record._id)}
                  okText={t("global.delete")}
                  cancelText={t("global.cancel")}
                >
                  <div className="tw-text-red-500">{t("global.delete")}</div>
                </Popconfirm>
              </Menu.Item>
            </Menu>
          }
          trigger={["click"]}
          placement="bottomCenter"
        >
          <MoreOutlined className="s-main-text-color" />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      <p className="tw-text-sm tw-underline s-semibold s-main-font s-main-text-color">
        {t("accounting.expense.pageTitle")}
      </p>
      <Table
        dataSource={expenses}
        columns={expCols}
        rowKey={(record) => record._id}
        pagination={{ hideOnSinglePage: true }}
        locale={{
          emptyText: <Empty description={t("tables.noData")} />,
        }}
      />
      <div className="tw-flex tw-justify-end tw-mt-4 s-main-font s-main-text-color s-semibold">
        <span className="tw-mr-6">{t("accounting.total")}</span>
        <div
          style={{ width: "14%", marginRight: "6%" }}
          className="tw-text-right tw-pr-4"
        >
          {currencyFormatter(
            expenses.reduce((a, c) => a + c.amount, 0),
            true,
            firm.currencyFormat,
          )}
        </div>
      </div>
    </div>
  );
}

export default withTranslation()(DailyAccountExpensesList);
