import moment from "moment";
import React, { Fragment } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import UserNamePopup from "utils/components/UserNamePopup";

import { NotificationProps } from "../../../../types";
import { getUpdateAvatar, getUpdateMessage } from "./utils";

interface LatestUpdateCardProps extends WithTranslation {
  notification: NotificationProps;
  onTaskEdit: (_id: string) => void;
}

const LatestUpdateCard = ({
  t,
  notification,
  onTaskEdit,
}: LatestUpdateCardProps) => {
  let { activity } = notification;
  // @ts-ignore
  if (notification.type === "SummaryNotification") {
    // @ts-ignore
    activity = { ...(notification || {}) };
  }
  const { task, from } = activity || {};
  const taskId = task?._id;
  return (
    <div
      style={{
        height: "73.57px",
      }}
      className={"tw-border-t s-main-font" + (!!taskId ? " s-pointer" : "")}
      onClick={() => (!!taskId ? onTaskEdit(taskId) : null)}
    >
      <div
        className="tw-mt-1 tw-flex tw-justify-between"
        style={{ height: "18px" }}
      >
        <div
          className="tw-text-gray-600 tw-text-xs s-semibold tw-truncate"
          style={{ maxWidth: "200px" }}
        >
          {activity.type === "SummaryNotification" ? (
            t("notifications.jobReminder")
          ) : (
            <UserNamePopup user={from} />
          )}
        </div>
        <div className="tw-text-gray-600 tw-text-xs tw-italic">
          {moment(notification.createdAt).fromNow()}
        </div>
      </div>
      <div className="tw-flex tw-items-center" style={{ height: "47.57px" }}>
        <div className="tw-flex tw-items-center tw-flex-wrap s-main-font s-main-text-color tw-text-sm tw-h-full">
          {getUpdateMessage(activity).map((item, index) => (
            <Fragment key={index}>{item}</Fragment>
          ))}
        </div>
        <div className="tw-ml-auto tw-flex tw-items-center tw-h-full">
          {getUpdateAvatar(activity, "small", false)}
        </div>
      </div>
    </div>
  );
};

export default withTranslation()(LatestUpdateCard);
