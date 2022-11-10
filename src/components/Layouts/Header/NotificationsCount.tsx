import { faBell } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Badge, Tooltip } from "antd";
import React, { useContext, useEffect, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import logger from "../../../logger";
import { NotificationService } from "../../../services/index";
import { NotificationProps, PaginatedFeathersResponse } from "../../../types";
import UserContext from "../../../UserContext";

interface NotificationsCountProps extends WithTranslation {}

const NotificationsCount = ({ t }: NotificationsCountProps) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user }: any = useContext(UserContext);
  useEffect(() => {
    NotificationService.find({
      query: {
        isRead: false,
        $limit: 0,
      },
    }).then(
      (res: PaginatedFeathersResponse<NotificationProps>) =>
        setUnreadCount(res.total),
      (error: Error) =>
        logger.error("Error in fetching notification count: ", error),
    );

    const handleCreated = (notification: NotificationProps) => {
      if (user?._id === notification.recipientId) {
        setUnreadCount((old) => old + 1);
      }
    };
    const handlePatched = (notification: NotificationProps) => {
      if (user?._id === notification.recipientId && notification.isRead) {
        setUnreadCount((old) => (old > 0 ? old - 1 : 0));
      }
    };

    NotificationService.on("created", handleCreated);
    NotificationService.on("patched", handlePatched);
    return () => {
      NotificationService.off("created", handleCreated);
      NotificationService.off("patched", handlePatched);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Link to="/notifications">
      <Tooltip
        autoAdjustOverflow
        placement="bottom"
        title={`${unreadCount} ${t("header.unreadNotifications")}`}
      >
        <Badge
          className={"tw-text-white s-notification-count"}
          count={unreadCount <= 9 ? unreadCount : "9+"}
          offset={[-1, 5]}
        >
          <FontAwesomeIcon
            icon={faBell}
            className="tw-text-2xl tw-text-gray-600"
          />
        </Badge>
      </Tooltip>
    </Link>
  );
};

export default withTranslation()(NotificationsCount);
