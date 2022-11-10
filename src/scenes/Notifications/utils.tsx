import { Tag, Tooltip } from "antd";
import i18next from "i18next";
import React from "react";
import { Activity, ActivityType } from "types";
import { getRTEText } from "utils/components/RTE/RTE";

import { getUsername, s3BucketURL } from "../../utils/helpers";
import { getTaskStatusLabel } from "../../utils/helpers/utils";

export const getNotificationTitle = (
  activity = {} as Activity,
  mini = false,
) => {
  const { type, status, note, file } = activity;
  if (type === "TaskStatusUpdated") {
    return (
      <span>
        {i18next.t("notifications.statusChange")}
        {mini ? (
          <Tooltip placement="topLeft" title={getTaskStatusLabel(status)}>
            <span className="tw-ml-2 s-main-font tw-truncate tw-align-bottom tw-w-16 tw-text-blue-500">
              {getTaskStatusLabel(status)}
            </span>
          </Tooltip>
        ) : (
          <Tag color={status?.color} className="tw-ml-2">
            {getTaskStatusLabel(status)}
          </Tag>
        )}
      </span>
    );
  } else if (type === "TaskCreated") {
    return <span>{i18next.t("notifications.createdTask")}</span>;
  } else if (type === "TaskNoteCreated") {
    return (
      <span>
        {i18next.t("notifications.commented")}{" "}
        <span className="s-text-muted">{note?.body || ""}</span>
      </span>
    );
  } else if (type === "TaskUpdated") {
    return i18next.t("notifications.updatedTask");
  } else if (type === "TaskAssigneesUpdated") {
    return i18next.t("notifications.updatedAssignee");
  } else if (type === "TaskRemoved") {
    return i18next.t("notifications.removedTask");
  } else if (type === "TaskFileCreated") {
    return (
      <span>
        {i18next.t("notifications.attachedFile")}{" "}
        <a
          href={s3BucketURL(file)}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#1890ff" }}
        >
          {file?.originalName || ""}
        </a>
      </span>
    );
  } else if (type === "TaskFileRemoved") {
    return (
      <span>
        {i18next.t("notifications.removedFile")}{" "}
        <a
          href={s3BucketURL(file)}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#1890ff" }}
        >
          {file?.originalName}
        </a>
      </span>
    );
  } else if (type === "SummaryNotification") {
    return (
      <span className="tw--ml-2">{i18next.t("notifications.jobReminder")}</span>
    );
  } else {
    return i18next.t(`notifications.${type}`);
  }
};

const fillData = (activity = {} as Activity, str: string) => {
  let filled = str;
  const { from, product, toBin, fromBin, qty } = activity;
  filled = filled.replace(
    "<user>",
    getUsername(from) || i18next.t("binActivities.user"),
  );
  filled = filled.replace(
    "<unit>",
    product?.unitOfMeasurement || i18next.t("binActivities.unit"),
  );
  filled = filled.replace(
    "<product>",
    product?.title || i18next.t("binActivities.product"),
  );
  filled = filled.replace(
    "<toBin>",
    toBin?.title || i18next.t("binActivities.warehouse"),
  );
  filled = filled.replace(
    "<fromBin>",
    fromBin?.title || i18next.t("binActivities.warehouse"),
  );
  filled = filled.replace(
    "<quantity>",
    qty ? `${qty}` : i18next.t("binActivities.quantity"),
  );
  filled = filled.replace(
    "<jobCount>",
    //@ts-ignore
    (activity?.delayedTaskIds || []).length,
  );
  return filled;
};

export const getNotificationBody = (activity = {} as Activity) => {
  const { type } = activity;
  if (
    type === "TaskStatusUpdated" ||
    type === "TaskFileCreated" ||
    type === "TaskNoteCreated" ||
    type === "TaskFileRemoved" ||
    type === "TaskUpdated" ||
    type === "TaskCreated" ||
    type === "TaskRemoved" ||
    type === "TaskNoteRemoved" ||
    type === "TaskNoteUpdated" ||
    type === "TaskAssigneesUpdated" ||
    type === "RFQCreated" ||
    type === "RFQUpdated" ||
    type === "RFQRemoved" ||
    type === "QuoteCreated" ||
    type === "QuoteUpdated" ||
    type === "QuoteRemoved" ||
    type === "InvoiceCreated" ||
    type === "InvoiceUpdated" ||
    type === "InvoiceRemoved"
  ) {
    return (
      <p className="s-text-15 tw--mt-2 s-text-light-black tw-font-normal">
        {getActivityTaskTitle(activity)}
      </p>
    );
  } else if (type === "SummaryNotification") {
    return (
      <p className="tw-text-lg">
        {fillData(activity, i18next.t("updates.SummaryNotification"))}
      </p>
    );
  } else {
    const key = (type || "").substr(5).toLowerCase();
    return (
      <p className="s-text-15 tw--mt-2 s-text-light-black font-normal">
        {fillData(activity, i18next.t(`stockActivities.${key}`))}
      </p>
    );
  }
};

export const isTaskType = (type = "" as ActivityType) =>
  type.includes("RFQ") || type.includes("Quote") || type.includes("Invoice");

export const getActivityTaskTitle = (activity = {} as Activity) => {
  const { rfq, quote, invoice, task, type = "" } = activity;
  if (type.includes("RFQ")) {
    return getRTEText(rfq?.title);
  } else if (type.includes("Invoice")) {
    return getRTEText(invoice?.title);
  } else if (type.includes("Quote")) {
    return getRTEText(quote?.title);
  } else {
    return getRTEText(task?.title);
  }
};
