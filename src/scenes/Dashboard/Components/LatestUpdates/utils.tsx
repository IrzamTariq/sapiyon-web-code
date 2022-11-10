import {
  faBoxOpen,
  faBoxes,
  faCheck,
  faClock,
  faComment,
  faDolly,
  faEdit,
  faExclamation,
  faFlag,
  faMinus,
  faPaperclip,
  faShoppingCart,
  faSlidersH,
  faSpinner,
  faTimes,
  faTrashAlt,
  faUnlink,
  faUserEdit,
  faWarehouse,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar } from "antd";
import i18next from "i18next";
import React, { ReactNode } from "react";

import { Activity, Customer, TaskStatus } from "../../../../types";
import {
  getCustomerName,
  isTaskCancelled,
  isTaskCompleted,
} from "../../../../utils/helpers";
import { getTaskStatusLabel } from "../../../../utils/helpers/utils";

const fillData = (activity = {} as Activity, str: string) => {
  const { product, toBin, fromBin, qty, customer = {}, status } = activity;
  let components = str
    .split(" ")
    .reduce((acc, curr) => [...acc, curr, " "], [] as ReactNode[]);

  if (components.indexOf("<customerName>") > -1) {
    components.splice(
      components.indexOf("<customerName>"),
      1,
      <span
        className="tw-truncate tw-mx-1 tw-text-blue-500 s-semibold"
        style={{ maxWidth: "100px" }}
        title={getCustomerName(customer as Customer)}
      >
        {getCustomerName(customer as Customer) ||
          i18next.t("requests.customer")}
      </span>,
    );
  }

  if (components.indexOf("<statusTitle>") > -1) {
    components.splice(
      components.indexOf("<statusTitle>"),
      1,
      <span
        className="tw-truncate tw-mx-1 s-semibold tw-text-blue-500"
        style={{ maxWidth: "100px" }}
        title={getTaskStatusLabel(status)}
      >
        {getTaskStatusLabel(status)}
      </span>,
    );
  }

  // if (components.indexOf("<assigneeNames>") > -1) {
  //   components.splice(
  //     components.indexOf("<assigneeNames>"),
  //     1,
  //     <span
  //       className="tw-truncate tw-mx-1"
  //       style={{ maxWidth: "150px" }}
  //       title={/* join assignee names in a string */}
  //     >
  //       {/* join assignee names in a string */}
  //     </span>,
  //   );
  // }

  if (components.indexOf("<units>") > -1) {
    components.splice(
      components.indexOf("<units>"),
      1,
      <span
        className="tw-truncate tw-mx-1"
        style={{ maxWidth: "100px" }}
        title={product?.unitOfMeasurement}
      >
        {product?.unitOfMeasurement || i18next.t("binActivities.unit")}
      </span>,
    );
  }

  if (components.indexOf("<product>") > -1) {
    components.splice(
      components.indexOf("<product>"),
      1,
      <span
        className="tw-truncate tw-mx-1"
        style={{ maxWidth: "120px" }}
        title={product?.title}
      >
        {product?.title || i18next.t("binActivities.product")}
      </span>,
    );
  }

  if (components.indexOf("<toBin>") > -1) {
    components.splice(
      components.indexOf("<toBin>"),
      1,
      <span
        className="tw-truncate tw-mx-1"
        style={{ maxWidth: "130px" }}
        title={toBin?.title}
      >
        {toBin?.title || i18next.t("binActivities.warehouse")}
      </span>,
    );
  }

  if (components.indexOf("<fromBin>") > -1) {
    components.splice(
      components.indexOf("<fromBin>"),
      1,
      <span
        className="tw-truncate tw-mx-1"
        style={{ maxWidth: "130px" }}
        title={fromBin?.title}
      >
        {fromBin?.title || i18next.t("binActivities.warehouse")}
      </span>,
    );
  }

  if (components.indexOf("<qty>") > -1) {
    components.splice(
      components.indexOf("<qty>"),
      1,
      <span className="tw-mx-1">
        {Number.isFinite(+(qty || 0))
          ? `${qty}`
          : i18next.t("binActivities.quantity")}
      </span>,
    );
  }
  if (components.indexOf("<jobCount>") > -1) {
    components.splice(
      components.indexOf("<jobCount>"),
      1,
      <span className="tw-mx-1">
        {/* @ts-ignore */}
        {(activity?.delayedTaskIds || []).length}
      </span>,
    );
  }

  return components;
};

export const getUpdateMessage = (notif = {} as Activity) => {
  let msgString = "";
  if (notif?.type === "TaskStatusUpdated") {
    if (isTaskCompleted(notif.status as TaskStatus)) {
      msgString = "updates.TaskCompleted";
    } else if (isTaskCancelled(notif.status as TaskStatus)) {
      msgString = "updates.TaskCancelled";
    } else if (notif?.status?.type === "user-defined") {
      msgString = `updates.${notif.type}`;
    } else {
      msgString = "updates.TaskOpened";
    }
  } else {
    msgString = `updates.${notif.type}`;
  }

  return fillData(notif, i18next.t(msgString));
};

export const getUpdateAvatar = (
  notif = {} as Activity,
  size = "default" as "default" | "small" | "large" | number,
  getIconOnly = false,
) => {
  const { type, status } = notif;
  let avatar = (type || "").substr(0, 4) === "Task" ? faCheck : faWarehouse;
  let bgColor = "orange";

  if (type === "TaskStatusUpdated") {
    bgColor = status?.color || "orange";
    if (isTaskCompleted(notif.status as TaskStatus)) {
      avatar = faCheck;
    } else if (isTaskCancelled(status as TaskStatus)) {
      avatar = faTimes;
    } else if (status?.type === "user-defined") {
      avatar = faSpinner;
    } else {
      avatar = faBoxOpen;
    }
  } else if (type === "TaskFileCreated") {
    avatar = faPaperclip;
    bgColor = "cornflowerblue";
  } else if (type === "TaskNoteCreated") {
    avatar = faComment;
    bgColor = "gray";
  } else if (type === "TaskFileRemoved") {
    avatar = faUnlink;
    bgColor = "pink";
  } else if (
    type === "TaskCreated" ||
    type === "InvoiceCreated" ||
    type === "RFQCreated" ||
    type === "QuoteCreated"
  ) {
    avatar = faFlag;
    bgColor = "pink";
  } else if (
    type === "TaskUpdated" ||
    type === "TaskNoteUpdated" ||
    type === "RFQUpdated" ||
    type === "QuoteUpdated" ||
    type === "InvoiceUpdated"
  ) {
    avatar = faEdit;
    bgColor = "green";
  } else if (type === "TaskAssigneesUpdated") {
    avatar = faUserEdit;
    bgColor = "purple";
  } else if (
    type === "TaskRemoved" ||
    type === "TaskNoteRemoved" ||
    type === "RFQRemoved" ||
    type === "QuoteRemoved" ||
    type === "InvoiceRemoved"
  ) {
    avatar = faTrashAlt;
    bgColor = "red";
  } else if (type === "StockAdd") {
    avatar = faBoxes;
    bgColor = "darkseagreen";
  } else if (type === "StockTransfer") {
    avatar = faDolly;
    bgColor = "gray";
  } else if (type === "StockRemove") {
    avatar = faMinus;
    bgColor = "red";
  } else if (type === "StockAdjust") {
    avatar = faSlidersH;
    bgColor = "orange";
  } else if (type === "StockSale") {
    avatar = faShoppingCart;
    bgColor = "blue";
  } else if (type === "SummaryNotification") {
    avatar = faClock;
    bgColor = "red";
  } else {
    avatar = faExclamation;
  }

  return getIconOnly ? (
    avatar
  ) : (
    <Avatar
      size={size}
      className="tw-flex tw-justify-center tw-items-center tw-text-white"
      icon={<FontAwesomeIcon icon={avatar} />}
      style={{
        backgroundColor: bgColor,
      }}
    />
  );
};
