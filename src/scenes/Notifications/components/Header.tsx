import { Button } from "antd";
import React from "react";
import { withTranslation, WithTranslation } from "react-i18next";

interface NotificationsHeaderProps extends WithTranslation {
  showUnread: boolean;
  filterUnread: () => void;
  markAllAsRead: () => void;
}

const NotificationsHeader = ({
  t,
  showUnread,
  markAllAsRead,
  filterUnread,
}: NotificationsHeaderProps) => {
  return (
    <div className="tw-flex tw-items-center tw-py-2 t-notifications">
      <h1 className="s-text-dark s-font-roboto tw-text-base tw-font-medium tw-mr-auto tw-ml-6">
        {t("notifications.pageTitle")}
      </h1>
      <Button
        className="tw-px-0 tw-mr-2 lg:tw-mr-3"
        type="link"
        onClick={filterUnread}
      >
        {showUnread
          ? t("notifications.showAll")
          : t("notifications.filterUnread")}
      </Button>
      <Button
        type="link"
        onClick={markAllAsRead}
        className="tw-px-0 tw-mr-3 lg:tw-mr-6"
      >
        {t("notifications.markAllAsRead")}
      </Button>
    </div>
  );
};

export default withTranslation()(NotificationsHeader);
