import logger from "logger";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { RevenueService } from "services";
import { RevenueReport } from "types";

import AccountingBody from "../AccountingSummary/AccountingBody";
import { defaultDashboardRange } from "../dashboard";
import Portal from "../Portal";
import PortalHeaderWithPeriodFilter from "../PortalHeaderWithPeriodFilter";

export interface AssigneeIncomeReport {
  income: number;
  expense: number;
  fullName: string;
  userId: string;
}

export interface AssigneeBalanceReport {
  income: number;
  expense: number;
  fullName: string;
  userId: string;
  balance: number;
}

const AccountingSummary = () => {
  const [t] = useTranslation();
  const [period, setPeriod] = useState(defaultDashboardRange);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<AssigneeBalanceReport[]>([]);

  useEffect(() => {
    setIsLoading(true);
    RevenueService.find({
      query: {
        reportName: "DailyExpenseAndRevenue",
        startDate: moment(period[0]).startOf("day"),
        endDate: moment(period[1]).endOf("day"),
      },
    }).then(
      (res: RevenueReport[]) => {
        const result = res.reduce((report, curr) => {
          const { items = [] } = curr;

          const todays = items.reduce((allUsers, currUser) => {
            const { userId, expense, income, fullName } = currUser;
            return {
              ...allUsers,
              [userId]: {
                income: (report[userId]?.income || 0) + (income || 0),
                expense: (report[userId]?.expense || 0) + (expense || 0),
                fullName,
                userId,
              },
            };
          }, {});
          return { ...report, ...todays };
        }, {} as { [key: string]: AssigneeIncomeReport });
        const balanceReport: AssigneeBalanceReport[] = Object.values(result)
          .map(({ income = 0, expense = 0, ...rest }) => ({
            ...rest,
            income,
            expense,
            balance: income - expense,
          }))
          .sort((a, b) => a.balance - b.balance);
        setData(balanceReport);
        setIsLoading(false);
      },
      (err: Error) => {
        setIsLoading(false);
        logger.log("Error in fetching revenue report: ", err);
      },
    );
  }, [t, period]);

  return (
    <Portal
      header={
        <PortalHeaderWithPeriodFilter
          title={t("accounting.incomes")}
          period={period}
          setPeriod={setPeriod}
          allowClear={false}
        />
      }
      footer={
        <Link to="/accounting" className="tw-ml-auto clickAble">
          {t("accounting.seeInDetails")}
        </Link>
      }
    >
      <AccountingBody data={data} isLoading={isLoading} />
    </Portal>
  );
};

export default AccountingSummary;
