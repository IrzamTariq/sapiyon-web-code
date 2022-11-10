import { Empty, Spin } from "antd";
import logger from "logger";
import { Moment } from "moment";
import React, { useEffect, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";

import { TaskService } from "../../../../services";
import { TaskStatus } from "../../../../types";
import {
  getTaskStatusLabel,
  openTaskStatusColor,
} from "../../../../utils/helpers/utils";
import { defaultDashboardRange, getPeriodFilterQuery } from "../dashboard";
import Portal from "../Portal";
import PortalHeaderWithPeriodFilter from "../PortalHeaderWithPeriodFilter";
import TaskByStatusSummaryBody from "./TaskByStatusSummaryBody";

interface TaskByStatusSummaryProps extends WithTranslation {}
interface StatusCount {
  count?: number;
  statusId: string;
  status: TaskStatus;
}
interface SingleCount extends TaskStatus {
  count: number;
  statusId: string;
}
interface StatusCountReport {
  [key: string]: SingleCount;
}

const TaskByStatusSummary = ({ t }: TaskByStatusSummaryProps) => {
  const [state, setState] = useState({
    period: defaultDashboardRange,
    chartData: [] as SingleCount[],
    isLoading: false,
  });
  const { period = [], chartData = [], isLoading } = state;

  useEffect(() => {
    setState((old) => ({ ...old, isLoading: true }));
    TaskService.find({
      query: {
        recurringTasks: true,
        reportName: "TaskByStatus",
        ...getPeriodFilterQuery(period),
      },
    }).then(
      (res: StatusCount[]) => {
        const counts = res.reduce(
          (acc, curr) => ({
            ...acc,
            [curr.statusId || "open"]: {
              ...(acc[curr.statusId || "open"] || {}),
              ...(curr.status || {}),
              count:
                (acc[curr.statusId || "open"]?.count || 0) + (curr.count || 0),
            } as SingleCount,
          }),
          {
            open: {
              _id: "open",
              statusId: "open",
              title: t("Open"),
              type: "system",
              category: "task",
              color: openTaskStatusColor,
              count: 0,
            } as SingleCount,
          } as StatusCountReport,
        );

        const chartData = Object.values(counts).filter(
          (item) => item.count !== 0,
        );
        const userStatuses = chartData.filter((item) => item.type !== "system");
        const open = chartData.filter(
          (item) => item._id === "open" && item.type === "system",
        );

        const orderedStatuses = ([] as SingleCount[])
          .concat(
            open,
            chartData.filter(
              (item) => item.title === "Completed" && item.type === "system",
            ),
            chartData.filter(
              (item) => item.title === "Cancelled" && item.type === "system",
            ),
            userStatuses.sort((a, b) =>
              (a.title || "").toLocaleLowerCase() >
              (b.title || "").toLocaleLowerCase()
                ? 1
                : -1,
            ),
          )
          .map((item) => ({ ...item, title: getTaskStatusLabel(item) }));

        setState((old) => ({
          ...old,
          chartData: orderedStatuses,
          isLoading: false,
        }));
      },
      (error: Error) => {
        logger.error(
          "TasksByStatusSummary - Error in fetching TaskByStatus report: ",
          error,
        );
        // message.error(t("reports.countFetchError"));
        setState((old) => ({ ...old, isLoading: false }));
      },
    );
  }, [t, period]);

  return (
    <Portal
      header={
        <PortalHeaderWithPeriodFilter
          title={t("tasksStatusSummary.pageTitle")}
          period={period}
          setPeriod={(period: Moment[]) =>
            setState((old) => ({ ...old, period }))
          }
        />
      }
    >
      <Spin spinning={isLoading}>
        {chartData?.length > 0 ? (
          <TaskByStatusSummaryBody report={chartData} />
        ) : (
          <Empty description={t("tables.noData")} className="tw-pt-10" />
        )}
      </Spin>
    </Portal>
  );
};

export default withTranslation()(TaskByStatusSummary);
