import {
  CheckOutlined,
  CloseOutlined,
  DownOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  Button,
  Divider,
  Dropdown,
  Empty,
  InputNumber,
  Menu,
  Popover,
  Spin,
  Switch,
  Table,
  message,
} from "antd";
import { ColumnProps } from "antd/lib/table";
import logger from "logger";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ExpensesService } from "services";
import UserContext from "UserContext";
import { TaskStockColumns } from "utils/components/TableSettings/Components/StandardTableColumns";

import {
  DailyExpense,
  DiscountType,
  Invoice,
  PaginatedFeathersResponse,
  Quote,
  Task,
  TaskStockLine,
  UserContextType,
} from "../../types";
import {
  getAmountFromPercentageTotal,
  getGrandTaxAmount,
  getGrandTotalWithTax,
  getGrandTotalWithoutTax,
  getOrderedColumns,
  getTotalWithTax,
} from "../../utils/helpers";
import { currencyFormatter } from "../../utils/helpers/currencyFormatter";
import numberFormatter from "../../utils/helpers/numberFormatter";

interface StockUtilizationTableProps {
  task: Task | Quote | Invoice;
  updateTask?: (task: Partial<Task | Quote | Invoice>) => void;
  disableStockEditing: boolean;
  onEdit: () => void;
  showSettings?: boolean;
  sagregateTaxes?: boolean;
  compact?: boolean;
  discounts?: boolean;
  disableDiscountEditing?: boolean;
  type: "invoice" | "quote" | "task";
}
interface StateType {
  isDiscounting: boolean;
  discountType: DiscountType;
  discount: number;
  savingSettings: boolean;
  expenseTotal: number;
  expenseRipple: boolean;
}

const StockUtilizationTable = ({
  task,
  updateTask,
  disableStockEditing,
  disableDiscountEditing = false,
  showSettings = false,
  onEdit,
  sagregateTaxes = true,
  compact,
  discounts = false,
  type,
}: StockUtilizationTableProps) => {
  const [t] = useTranslation();
  const { tableSettings, updateUserPreferences, firm } = useContext(
    UserContext,
  ) as UserContextType;
  const [state, setState] = useState<StateType>({
    isDiscounting: false,
    discountType: "%",
    discount: 0,
    savingSettings: false,
    expenseTotal: 0,
    expenseRipple: false,
  });

  const { stock = [], discount = 0, discountType = "%" } = task;

  let cols: ColumnProps<TaskStockLine>[] = [
    {
      title: t("stock.item"),
      dataIndex: "itemId",
      render: (text: string, record) => record?.item?.title,
    },
    {
      title: t("products.serialNumber"),
      dataIndex: "barcode",
      render: (text: string, record) => record?.item?.barcode,
    },
    {
      title: t("stock.qty"),
      dataIndex: "qty",
      align: "right",
      width: "15%",
      render: (text) => numberFormatter(text),
    },
    {
      title: t("stock.unitCost"),
      dataIndex: "unitPrice",
      align: "right",
      width: "15%",
      render: (text: string) =>
        currencyFormatter(parseFloat(text), true, firm.currencyFormat),
    },
    {
      title: t("stockList.KDV"),
      dataIndex: "taxPercentage",
      align: "right",
      width: "15%",
      render: (text: string) => `${Number.isFinite(text) ? text : 18}%`,
    },
    {
      title: t("stock.cost"),
      dataIndex: "cost",
      align: "right",
      width: "15%",
      render: (text: string, record: TaskStockLine) =>
        currencyFormatter(getTotalWithTax(record), true, firm.currencyFormat),
    },
  ];
  const taskStockColumns = tableSettings["taskStock"] || TaskStockColumns;
  const hideTotal = taskStockColumns.find((item) => item.dataIndex === "cost")
    ?.isHidden;
  cols = getOrderedColumns(cols, taskStockColumns);
  const columns = cols.map((col) => {
    return {
      ...col,
      title: (
        <span
          className={`s-semibold s-std-text ${compact ? "tw-text-xs" : ""}`}
        >
          {col.title}
        </span>
      ),
      onCell: () => ({
        className: "s-table-text",
        style: compact ? { fontSize: "12px", padding: "5px" } : {},
      }),
    };
  });
  const updateTableSettings = (isHidden: boolean, dataIndex: string) => {
    setState((old) => ({ ...old, savingSettings: true }));
    updateUserPreferences({
      taskStock: taskStockColumns.map((item) =>
        item.dataIndex === dataIndex ? { ...item, isHidden } : item,
      ),
    }).finally(() => setState((old) => ({ ...old, savingSettings: false })));
  };
  const tax1 = getGrandTaxAmount(stock, 1);
  const tax8 = getGrandTaxAmount(stock, 8);
  const tax18 = getGrandTaxAmount(stock, 18);
  const taxTotal = getGrandTaxAmount(stock);
  const grandTotal = getGrandTotalWithTax(stock);
  const getNetTotal = () => {
    const discountValue = state.isDiscounting ? state.discount : discount;
    const discountTypeValue = state.isDiscounting
      ? state.discountType
      : discountType;

    const discountAmount =
      discountTypeValue === "fixed"
        ? discountValue || 0
        : getAmountFromPercentageTotal(discountValue, grandTotal);
    return grandTotal - discountAmount + state.expenseTotal;
  };
  const updateDiscount = () => {
    const { discount = 0, discountType = "%" } = state;
    updateTask?.({ discount, discountType });
    setState((old) => ({
      ...old,
      discount: 0,
      discountType: "%",
      isDiscounting: false,
    }));
  };
  useEffect(() => {
    if (task._id && type === "task") {
      ExpensesService.find({ query: { taskId: task._id, $limit: 50 } }).then(
        (res: PaginatedFeathersResponse<DailyExpense>) => {
          setState((old) => ({
            ...old,
            expenseTotal: res?.data?.reduce(
              (total, record) => total + (+record.amount || 0),
              0,
            ),
          }));
        },
        (e: Error) => {
          message.error(t("accounting.expense.fetchError"));
          logger.error("Error in fetching expenses: ", e);
        },
      );
    }
  }, [task._id, state.expenseRipple, t, type]);
  useEffect(() => {
    if (type === "task") {
      const handleExpenseChange = (expense: DailyExpense) => {
        if (expense.taskId === task._id) {
          setState((old) => ({ ...old, expenseRipple: !old.expenseRipple }));
        }
      };

      ExpensesService.on("created", handleExpenseChange);
      ExpensesService.on("patched", handleExpenseChange);
      ExpensesService.on("removed", handleExpenseChange);
      return () => {
        ExpensesService.off("created", handleExpenseChange);
        ExpensesService.off("patched", handleExpenseChange);
        ExpensesService.off("removed", handleExpenseChange);
      };
    }
  }, [task._id, type]);

  return (
    <div className="s-hover-parent">
      {showSettings ? (
        <Popover
          title={
            <span className="s-std-text s-semibold">
              {t("taskStock.popTitle")}
            </span>
          }
          content={
            <Spin spinning={state.savingSettings}>
              {taskStockColumns.map((col) => (
                <div className="tw-flex tw-justify-between tw-items-center tw-mb-2">
                  <span>{col.title}</span>
                  <Switch
                    size="small"
                    checked={!col.isHidden}
                    className="tw-ml-10"
                    disabled={col.alwaysVisible}
                    onChange={(checked) =>
                      updateTableSettings(!checked, col.dataIndex)
                    }
                  />
                </div>
              ))}
            </Spin>
          }
          placement="bottom"
        >
          <EditOutlined className="tw-text-xl s-icon-color s-pointer tw-mb-1 clickAble" />
        </Popover>
      ) : null}
      <Table
        rowKey={"_id"}
        columns={columns}
        dataSource={stock || []}
        pagination={false}
        size={compact ? "small" : undefined}
        bordered={compact}
        locale={{
          emptyText: <Empty description={t("tables.noData")} />,
        }}
      />
      <div
        className={`tw-flex tw-justify-end ${
          compact ? "tw-mt-4 tw-text-xs" : "tw-mt-8"
        }`}
      >
        <div className="tw-flex tw-flex-col tw-justify-between tw-flex-grow">
          <div>
            {!disableStockEditing ? (
              <Button
                className="s-stock-add-btn tw-ml-4 tw-mr-2 s-hover-target tw-self-start"
                onClick={onEdit}
              >
                {t("global.edit")}
              </Button>
            ) : null}
          </div>
          {!hideTotal && discounts && !disableDiscountEditing ? (
            <div className="tw-mb-10 tw-self-end">
              {state.isDiscounting ? (
                <div className="tw-mb-1">
                  <Button
                    type="text"
                    size="small"
                    onClick={() =>
                      setState((old) => ({
                        ...old,
                        discount: 0,
                        isDiscounting: false,
                        discountType: "%",
                      }))
                    }
                  >
                    <CloseOutlined className="tw-text-red-500" />
                  </Button>
                  <Divider type="vertical" />
                  <Button type="text" size="small" onClick={updateDiscount}>
                    <CheckOutlined className="tw-text-blue-700" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="link"
                  onClick={() =>
                    setState((old) => ({
                      ...old,
                      isDiscounting: true,
                      discountType,
                      discount,
                    }))
                  }
                >
                  {t("stock.addDiscount")}
                </Button>
              )}
            </div>
          ) : null}
        </div>
        {hideTotal ? null : (
          <>
            <div
              className={`tw-text-right ${
                compact ? "tw-pr-1" : "tw-pr-4"
              } s-main-font s-main-text-color s-semibold`}
            >
              <p className="tw-mb-3 tw-uppercase">{t("stockList.subTotal")}</p>
              {sagregateTaxes ? (
                <div>
                  {tax1 > 0 ? (
                    <p className="tw-mb-3">{t("stockList.KDV-1")}</p>
                  ) : null}
                  {tax8 > 0 ? (
                    <p className="tw-mb-3">{t("stockList.KDV-8")}</p>
                  ) : null}
                  {tax18 > 0 ? (
                    <p className="tw-mb-3">{t("stockList.KDV-18")}</p>
                  ) : null}
                </div>
              ) : null}
              <p className="tw-pb-2">{t("stockList.KDV-total")}</p>
              {type === "task" ? (
                <p className="tw-pb-2">{t("Expenses total")}</p>
              ) : null}
              {discounts && (discount > 0 || state.isDiscounting) ? (
                <p
                  className="tw-pb-2"
                  style={{ lineHeight: compact ? "19px" : "22px" }}
                >
                  {t("stock.discount")}
                  {!state.isDiscounting && discountType === "%"
                    ? ` (${discount}%)`
                    : ""}
                </p>
              ) : null}
              <p className="tw-mb-3 tw-pt-1 tw-border-t tw-uppercase">
                {t("stockList.grandTotal")}
              </p>
            </div>
            <div
              className={`s-main-font s-main-text-color s-semibold tw-text-right ${
                compact ? "tw-pr-1" : "tw-pr-4"
              }"`}
              style={{ width: "30%" }}
            >
              <p className="tw-mb-3">
                {currencyFormatter(
                  getGrandTotalWithoutTax(stock),
                  true,
                  firm.currencyFormat,
                )}
              </p>
              {sagregateTaxes ? (
                <div>
                  {tax1 > 0 ? (
                    <p className="tw-mb-3">
                      {currencyFormatter(tax1, true, firm.currencyFormat)}
                    </p>
                  ) : null}
                  {tax8 > 0 ? (
                    <p className="tw-mb-3">
                      {currencyFormatter(tax8, true, firm.currencyFormat)}
                    </p>
                  ) : null}
                  {tax18 > 0 ? (
                    <p className="tw-mb-3">
                      {currencyFormatter(tax18, true, firm.currencyFormat)}
                    </p>
                  ) : null}
                </div>
              ) : null}
              <p className="tw-pb-2">
                {currencyFormatter(taxTotal, true, firm.currencyFormat)}
              </p>
              {type === "task" ? (
                <p className="tw-pb-2">
                  {currencyFormatter(
                    state.expenseTotal,
                    true,
                    firm.currencyFormat,
                  )}
                </p>
              ) : null}
              {state.isDiscounting ? (
                <div className="tw-pb-2 tw-flex tw-justify-between">
                  <Dropdown
                    overlay={
                      <Menu
                        onClick={(info) =>
                          setState((old) => ({
                            ...old,
                            discountType: info.key as DiscountType,
                            discount: 0,
                          }))
                        }
                      >
                        <Menu.Item key="%">{t("stock.percentage")}</Menu.Item>
                        <Menu.Item key="fixed">{t("stock.fixed")}</Menu.Item>
                      </Menu>
                    }
                  >
                    <Button
                      className="tw-inline-flex tw-items-center"
                      size="small"
                    >
                      {state.discountType === "%"
                        ? t("stock.percentage")
                        : t("stock.fixed")}
                      <DownOutlined />
                    </Button>
                  </Dropdown>
                  <InputNumber
                    size="small"
                    value={state.discount}
                    precision={2}
                    placeholder={t("stock.discount")}
                    formatter={(value) =>
                      state.discountType === "%" ? `${value}%` : `${value}`
                    }
                    min={0}
                    max={state.discountType === "%" ? 100 : grandTotal}
                    decimalSeparator=","
                    onChange={(discount = 0) =>
                      setState((old) => ({
                        ...old,
                        discount: (discount || 0) as number,
                      }))
                    }
                  />
                </div>
              ) : null}
              {discounts && !state.isDiscounting && discount > 0 ? (
                <p className="tw-pb-2">
                  {currencyFormatter(
                    grandTotal - getNetTotal(),
                    true,
                    firm.currencyFormat,
                  )}
                </p>
              ) : null}
              <p className="tw-mb-3 tw-pt-1 tw-border-t">
                {currencyFormatter(getNetTotal(), true, firm.currencyFormat)}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StockUtilizationTable;
