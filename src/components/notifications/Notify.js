import { notification } from "antd";
// import React from "react";

// import { I18nextProvider } from "react-i18next";
import i18n from "./../../i18n";

export const Notify = {
  createSuccess: record => {
    notification.open({
      message: i18n.t("notify.success"),
      description: `${record} ${i18n.t("notify.createSuccess")}`,
    });
  },

  createError: record => {
    notification.open({
      message: i18n.t("notify.error"),
      description: `${i18n.t("notify.createError")} ${record}`,
    });
  },

  updateSuccess: record => {
    notification.open({
      message: i18n.t("notify.success"),
      description: `${record} ${i18n.t("notify.updateSuccess")}`,
    });
  },

  updateError: record => {
    notification.open({
      message: i18n.t("notify.error"),
      description: `${i18n.t("notify.updateError")}  ${record}`,
    });
  },

  saveSuccess: record => {
    notification.open({
      message: i18n.t("notify.success"),
      description: `${record} ${i18n.t("notify.saveSuccess")}`,
    });
  },

  saveError: record => {
    notification.open({
      message: i18n.t("notify.error"),
      description: `${i18n.t("notify.saveError")}  ${record}`,
    });
  },

  removeError: record => {
    notification.open({
      message: i18n.t("notify.error"),
      description: `${i18n.t("notify.removeError")}  ${record}`,
    });
  },

  removeSuccess: record => {
    notification.open({
      message: i18n.t("notify.success"),
      description: `${record} ${i18n.t("notify.removeSuccess")}`,
    });
  },
};
