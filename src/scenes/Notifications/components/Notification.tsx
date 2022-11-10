import { Card } from "antd";
import moment from "moment";
import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { getUpdateAvatar } from "scenes/Dashboard/Components/LatestUpdates/utils";
import UserNamePopup from "utils/components/UserNamePopup";

import { NotificationProps } from "../../../types";
import { getCustomerName } from "../../../utils/helpers";
import {
  getNotificationBody,
  getNotificationTitle,
  isTaskType,
} from "../utils";

interface NotificationComponentProps extends WithTranslation {
  onTaskEdit: (_id: string, notiId: string) => void;
  notification: NotificationProps;
  onMarkAsRead: (_id: string) => void;
}

const Notification = ({
  t,
  notification,
  onTaskEdit,
  onMarkAsRead,
}: NotificationComponentProps) => {
  let { _id, isRead, activity } = notification || {};

  //@ts-ignore A flexible solution to disastrous API schema
  if (notification.type === "SummaryNotification") {
    //@ts-ignore A flexible solution to disastrous API schema
    activity = { ...notification };
  }
  const { from, task, customer } = activity || {};
  const taskId = task?._id;
  const isTask = !!task?._id;
  const isOfTaskType = isTaskType(activity.type);
  return (
    <Card
      onClick={() => {
        if (!notification.isRead) {
          onMarkAsRead(_id);
        }
      }}
      key={_id}
      className="s-notifications-top-border"
      bordered={false}
      style={{
        backgroundColor: isRead ? "white" : "#e7f8fe",
      }}
    >
      <Card.Meta
        avatar={getUpdateAvatar(activity, "default", false)}
        title={
          <div>
            <p className="tw-truncate s-main-text-color s-main-font s-semibold">
              <span className="tw-text-sm">
                {activity.type === "SummaryNotification" ? null : (
                  <UserNamePopup user={from} />
                )}
              </span>
              <span className="tw-text-sm tw-ml-2 s-main-font s-main-text-color">
                {getNotificationTitle(activity)}
              </span>
            </p>
            {isOfTaskType && (
              <h2 className="text-base s-main-text-color s-main-font s-semibold">
                {getCustomerName(customer)}
              </h2>
            )}
          </div>
        }
        description={
          <div className="tw--mt-2">
            <span
              style={isTask ? { cursor: "pointer" } : {}}
              onClick={() =>
                isTask
                  ? onTaskEdit(taskId || "", notification._id || "")
                  : () => null
              }
            >
              {getNotificationBody(activity)}
            </span>
            <span
              className="s-text-gray tw-text-sm tw-font-normal"
              title={moment(activity.createdAt).format(
                "dddd DD MMMM YYYY HH:mm",
              )}
            >
              {moment(notification.createdAt).fromNow()}
            </span>
          </div>
        }
      />
    </Card>
  );
};

export default withTranslation()(Notification);
