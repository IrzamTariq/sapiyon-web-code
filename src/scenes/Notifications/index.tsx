import { Col, Empty, Row, Spin, message } from "antd";
import Appshell from "Appshell";
import logger from "logger";
import React, { UIEventHandler, useContext, useEffect, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import UserContext from "UserContext";

import { NotificationService } from "../../services";
import { NotificationProps, PaginatedFeathersResponse } from "../../types";
import { isScrolled } from "../../utils/helpers";
import NotificationsHeader from "./components/Header";
import NotificationsList from "./components/NotificationsList";

interface NotificationsProps extends WithTranslation {}
const gridColProps = {
  xs: 24,
  md: 22,
  lg: 18,
  xl: 16,
  xxl: 14,
};
const INITIAL_STATE: PaginatedFeathersResponse<NotificationProps> = {
  total: 0,
  limit: 50,
  skip: 0,
  data: [],
};
const Notifications = ({ t }: NotificationsProps) => {
  const { user }: any = useContext(UserContext);
  const [notifications, setNotifications] = useState(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadFilter, setUnreadFilter] = useState(false);
  const { data, total, limit, skip } = notifications;

  useEffect(() => {
    setIsLoading(true);
    NotificationService.find({
      query: {
        $limit: limit,
        $skip: skip,
        $sort: { createdAt: -1 },
      },
    }).then(
      (res: PaginatedFeathersResponse<NotificationProps>) => {
        setNotifications((old) => ({
          ...res,
          data: [...old.data, ...res.data],
        }));
        setIsLoading(false);
      },
      (error: Error) => {
        message.error(t("notifications.fetchError"));
        // console.log("Error in fetching notifications", error);
        setIsLoading(false);
      },
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip]);
  useEffect(() => {
    const handleCreated = (notification: NotificationProps) => {
      if (user?._id === notification.recipientId) {
        setNotifications((old) => ({
          ...old,
          data: [notification, ...old.data],
        }));
      }
    };
    const handlePatched = (notification: NotificationProps) => {
      if (user?._id === notification.recipientId) {
        setNotifications((old) => ({
          ...old,
          data: old.data.map((item) =>
            item._id === notification._id ? notification : item,
          ),
        }));
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
  const handleScroll: UIEventHandler<HTMLDivElement> = (event) => {
    const target = event?.target as Element;
    if (isScrolled(target, 95) && skip + limit < total && !isLoading) {
      setIsLoading(true);
      setNotifications((old) => ({ ...old, skip: old.skip + old.limit }));
    }
  };

  const markOneAsRead = (notId: string) => {
    NotificationService.patch(notId, { isRead: true }).then(
      (res: NotificationProps) =>
        setNotifications((old) => ({
          ...old,
          data: old.data.map((item) => (item._id === res._id ? res : item)),
        })),
      (error: any) => logger.error("Error in updating notification: ", error),
    );
  };

  const markAllAsRead = () => {
    NotificationService.patch(null, { isRead: true }).then(
      (res: NotificationProps[]) => {
        setNotifications((old) => {
          const newByIds = res.reduce(
            (acc, curr) => ({ ...acc, [curr._id]: curr }),
            {},
          );
          const oldByIds = old.data.reduce(
            (acc, curr) => ({ ...acc, [curr._id]: curr }),
            {},
          );
          const temp = Object.assign({}, oldByIds, newByIds);
          return { ...old, data: Object.values(temp) };
        });
      },
      (error: Error) => logger.error("Could not update all: ", error),
    );
  };

  const visibleNotification = unreadFilter
    ? data.filter((noti) => !noti.isRead)
    : data;

  return (
    <Appshell onScroll={handleScroll} activeLink={["", ""]}>
      <div className="tw-mb-10">
        <Row justify="center">
          <Col className="tw-bg-white tw-shadow-lg" {...gridColProps}>
            <NotificationsHeader
              showUnread={unreadFilter}
              filterUnread={() => setUnreadFilter((old) => !old)}
              markAllAsRead={markAllAsRead}
            />
          </Col>
        </Row>
        <Row justify="center">
          <Col className="tw-bg-white tw-shadow-lg" {...gridColProps}>
            {visibleNotification.length > 0 ? (
              <div className="tw-w-full">
                <NotificationsList
                  notificationsList={visibleNotification}
                  markOneAsRead={markOneAsRead}
                />
                {isLoading && (
                  <div className="tw-w-full tw-flex tw-justify-center">
                    <Spin size="large" />
                  </div>
                )}
              </div>
            ) : (
              <Spin spinning={isLoading}>
                <Empty
                  description={t("notifications.noNotifications")}
                  className="no-notifications"
                />
              </Spin>
            )}
          </Col>
        </Row>
      </div>
    </Appshell>
  );
};

export default withTranslation()(Notifications);
