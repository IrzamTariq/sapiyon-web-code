import logger from "logger";
import React, { useEffect, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";

import { TaskService } from "../../../../services";
import {
  AssigneeTaskRanking,
  defaultDashboardRange,
  getPeriodFilterQuery,
} from "../dashboard";
import Portal from "../Portal";
import PortalHeaderWithPeriodFilter from "../PortalHeaderWithPeriodFilter";
import AssigneeRankingsBody from "./AssigneeRankingsBody";

interface AssigneeRankingSummaryProps extends WithTranslation {}

function AssigneeRankingsSummary({ t }: AssigneeRankingSummaryProps) {
  const [period, setPeriod] = useState(defaultDashboardRange);
  const [data, setData] = useState<AssigneeTaskRanking[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (isMounted) {
      setIsLoading(true);
      TaskService.find({
        query: {
          recurringTasks: true,
          reportName: "TaskAssigneeRankings",
          ...getPeriodFilterQuery(period),
        },
      }).then(
        (res: AssigneeTaskRanking[]) => {
          setData(res);
          setIsLoading(false);
        },
        (error: Error) => {
          // message.error(t("reports.assigneeRankingsFetchError"));
          logger.error(
            "AssigneeRankingSummary - Error in fetching TaskAssigneeRankings report: ",
            error,
          );
          setIsLoading(false);
        },
      );
    }

    return () => {
      isMounted = false;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  return (
    <Portal
      header={
        <PortalHeaderWithPeriodFilter
          title={t("assigneeRankings.pageTitle")}
          period={period}
          setPeriod={setPeriod}
        />
      }
    >
      <AssigneeRankingsBody data={data} isLoading={isLoading} />
    </Portal>
  );
}

export default withTranslation()(AssigneeRankingsSummary);
