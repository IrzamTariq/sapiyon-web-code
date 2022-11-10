import React from "react";
import { LoadingOutlined } from '@ant-design/icons';
import { Empty } from "antd";
import i18next from "i18next";

const noDataStyles = {
  height: "200px",
  width: "100%",
  border: "1px dashed #e8e8e8",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
};

export const NoData = ({ isLoading }) => (
  <Empty
    image={Empty.PRESENTED_IMAGE_SIMPLE}
    description={
      isLoading ? (
        <span>
          <LoadingOutlined /> {i18next.t("general.loading")}
        </span>
      ) : (
        <span>{i18next.t("general.noData")}</span>
      )
    }
    style={noDataStyles}
  />
);

export function getTaskStatusLabelForReports(status) {
  if (!status) {
    return i18next.t("dashboard.open");
  }

  if (status.type === "system" && status.title === "Completed") {
    return i18next.t("dashboard.completed");
  }

  if (status.type === "system" && status.title === "Cancelled") {
    return i18next.t("dashboard.cancelled");
  }

  return status.title;
}

export function getColor() {
  return `rgb(${Math.floor(Math.random() * 255)},${Math.floor(
    Math.random() * 255,
  )},${Math.floor(Math.random() * 255)})`;
}
