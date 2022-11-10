import i18next from "i18next";

export const isWhiteBG = (status) =>
  !status ||
  !status.color ||
  status.color === "#fff" ||
  status.color === "#ffffff" ||
  status.color === "rgb(255, 255, 255)" ||
  status.color === "rgba(255, 255, 255, 1)";

export const openTaskStatusColor = "#808080";

export function getTaskStatusStyles(status, isConverted = false) {
  const common = {
    textAlign: "center",
    padding: "4px 10px",
    fontFamily: "Roboto",
    fontWeight: "500",
  };
  const convertedStyle = {
    border: "1px solid #453c94",
    backgroundColor: "#453c94",
    color: 'white',
  };
  let returnValue = {};

  if (!status) {
    returnValue = {
      color: "white",
      backgroundColor: openTaskStatusColor,
      border: `1px solid ${openTaskStatusColor}`,
      ...common,
    };
  } else if (status.type === "system" && status.title === "Completed") {
    returnValue = {
      color: `${status.color ? "white" : "#2f54eb"}`,
      border: `1px solid ${status.color || "#d9d9d9"}`,
      backgroundColor: status.color || "#f0f5ff",
      ...common,
    };
  } else if (status.type === "system" && status.title === "Cancelled") {
    returnValue = {
      color: `${status.color ? "white" : "#f5222d"}`,
      backgroundColor: status.color || "#fff1f0",
      border: `1px solid ${status.color || "#ffa39e"}`,
      ...common,
    };
  } else {
    returnValue = {
      color: isWhiteBG(status) ? "#1890ff" : "white",
      backgroundColor: isWhiteBG(status) ? "#e6f7ff" : status.color,
      border: `1px solid ${isWhiteBG(status) ? "#91d5ff" : status.color}`,
      ...common,
    };
  }
  return isConverted ? { ...returnValue, ...convertedStyle } : returnValue;
}

export function getTaskStatusLabel(
  status,
  initialStatus = i18next.t("dashboard.open"),
) {
  if (!status || !status._id) {
    return initialStatus;
  }

  if (status.type === "system") {
    return i18next.t(status.title);
  }

  return status.title;
}

export const getConversionStatusText = (
  record = {},
  defaultText = i18next.t("dashboard.open"),
) => {
  if (record.isQuoteCreated && record.isTaskCreated) {
    return i18next.t("status.convertedToQuoteAndTask");
  } else if (record.isInvoiceCreated && record.isTaskCreated) {
    return i18next.t("status.convertedToInvoiceAndTask");
  } else if (record.isQuoteCreated || record.isTaskCreated) {
    return record.isQuoteCreated
      ? i18next.t("Converted to quote")
      : i18next.t("Converted to task");
  } else if (record.isInvoiceCreated || record.isTaskCreated) {
    return record.isInvoiceCreated
      ? i18next.t("Converted to invoice")
      : i18next.t("Converted to task");
  } else {
    return getTaskStatusLabel(record.status, defaultText);
  }
};

export const getTaskStatusButtonStyles = (status) =>
  status
    ? {
      color: "white",
      backgroundColor: status.color,
      borderColor: status.color,
    }
    : { color: "white", backgroundColor: "#006fd6", borderColor: "#006fd6" };
