import { Card, message } from "antd";
import logger from "logger";
import React, { useEffect, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { NotificationService } from "../../../../services";
import {
  NotificationProps,
  PaginatedFeathersResponse,
} from "../../../../types";
import LatestUpdateCard from "./LatestUpdateCard";

interface NotificationsSummaryProps extends WithTranslation {
  onTaskEdit: (taskId: string) => void;
}

const NotificationsSummary = ({ t, onTaskEdit }: NotificationsSummaryProps) => {
  const [notifications, setNotifications] = useState([] as NotificationProps[]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    setIsLoading(true);
    NotificationService.find({
      query: { $limit: 7, $sort: { createdAt: -1 } },
    }).then(
      (res: PaginatedFeathersResponse<NotificationProps>) => {
        setNotifications(res.data);
        setIsLoading(false);
      },
      (error: Error) => {
        message.error(t("notifications.fetchError"));
        logger.error(
          "NotficationSummary - Error in fetching notifications",
          error,
        );
        setIsLoading(false);
      },
    );
  }, [t]);

  return (
    <Card
      title={t("updates.pageTitle")}
      loading={isLoading}
      actions={[
        <Link to="/notifications">
          <span className="s-main-text-color s-main-font tw-text-lg clickAble">
            {t("updates.seeAll")}
          </span>
        </Link>,
      ]}
      className="tw-shadow"
      style={{ height: "622px" }}
      bodyStyle={{ padding: "0px 24px" }}
    >
      {notifications.map((item) => (
        <LatestUpdateCard
          notification={item}
          key={item._id}
          onTaskEdit={onTaskEdit}
        />
      ))}
    </Card>
  );
};

export default withTranslation()(NotificationsSummary);
