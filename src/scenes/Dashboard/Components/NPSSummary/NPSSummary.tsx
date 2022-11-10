import { Spin } from "antd";
import logger from "logger";
import React, { useEffect, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { TaskService } from "../../../../services";
import {
  NPSReport,
  defaultDashboardRange,
  getPeriodFilterQuery,
} from "../dashboard";
import Portal from "../Portal";
import PortalHeaderWithPeriodFilter from "../PortalHeaderWithPeriodFilter";
import NPSSummaryBody from "./NPSSummaryBody";

interface NPSSummaryProps extends WithTranslation {}

const NPSSummary = ({ t }: NPSSummaryProps) => {
  const [period, setPeriod] = useState(defaultDashboardRange);
  const [data, setData] = useState({} as NPSReport);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      setIsLoading(true);
      TaskService.find({
        query: {
          recurringTasks: true,
          reportName: "NPSReport",
          ...getPeriodFilterQuery(period),
        },
      }).then(
        (res: any) => {
          setData(res[0]);
          setIsLoading(false);
        },
        (error: Error) => {
          if (error.name !== "Unprocessable") {
            // message.error(t("nps.fetchError"));
            logger.error(
              "NPSSummary - Error in fetching NPSReport report: ",
              error,
            );
          } else {
            setData({} as NPSReport);
          }
          setIsLoading(false);
          logger.error(
            "NPSSummary - Error in fetching NPSReport report: ",
            error,
          );
        },
      );
    }

    return () => {
      isMounted = false;
    };
  }, [t, period]);

  return (
    <Portal
      header={
        <PortalHeaderWithPeriodFilter
          title={t("npsReport.pageTitle")}
          period={period}
          setPeriod={setPeriod}
        />
      }
      footer={
        <Link to="/feedback" className="tw-ml-auto clickAble">
          {t("nps.seeAllResponses")}
        </Link>
      }
    >
      <Spin spinning={isLoading}>
        <NPSSummaryBody data={data} />
      </Spin>
    </Portal>
  );
};

export default withTranslation()(NPSSummary);
