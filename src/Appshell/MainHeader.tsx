import {
  AndroidOutlined,
  AppleOutlined,
  LogoutOutlined,
  ProfileOutlined,
  ReadOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Dropdown, Menu } from "antd";
import NotificationsCount from "components/Layouts/Header/NotificationsCount";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import TaskEdit from "scenes/Tasks/TaskEdit";

import { Task, User, UserContextType } from "../types";
import UserContext from "../UserContext";
import { getUsername } from "../utils/helpers";

const MainHeader = () => {
  const [t] = useTranslation();
  const { user, hasPermission } = useContext(UserContext) as UserContextType;
  const [isEditingTask, setIsEditingTask] = useState(false);

  const getUserMenu = (user: User) => (
    <Menu theme="dark" className="s-menu-styles">
      <Menu.Item>
        <Link
          to="/settings/account/business-profile"
          className="tw-items-center"
          style={{ display: "flex" }}
        >
          <ProfileOutlined className="tw-mr-2" style={{ fontSize: "14px" }} />
          <span>{getUsername(user)}</span>
        </Link>
      </Menu.Item>
      <Menu.Divider className="tw-bg-gray-800" />
      <Menu.Item>
        <Link
          to="/logout"
          className="tw-items-center"
          style={{ display: "flex" }}
        >
          <LogoutOutlined className="tw-mr-2" style={{ fontSize: "14px" }} />
          <span>{t("header.logout")}</span>
        </Link>
      </Menu.Item>
      <Menu.Divider className="tw-bg-gray-800" />
      <Menu.Item>
        <a
          href="https://apps.apple.com/us/app/sapiyon/id1496930567?ls=1"
          target="_blank"
          rel="noopener noreferrer"
          className="tw-items-center"
          style={{ display: "flex" }}
        >
          <AppleOutlined className="tw-mr-2" style={{ fontSize: "14px" }} />
          <span>{t("header.iosApp")}</span>
        </a>
      </Menu.Item>
      <Menu.Item>
        <a
          href="https://play.google.com/store/apps/details?id=com.sapiyon"
          target="_blank"
          rel="noopener noreferrer"
          className="tw-items-center"
          style={{ display: "flex" }}
        >
          <AndroidOutlined className="tw-mr-2" style={{ fontSize: "14px" }} />
          <span>{t("header.androidApp")}</span>
        </a>
      </Menu.Item>
      <Menu.Item>
        <Link
          to="/iframes"
          className="tw-items-center"
          style={{ display: "flex" }}
        >
          <ReadOutlined className="tw-mr-2" style={{ fontSize: "14px" }} />
          <span>{t("header.tutorial")}</span>
        </Link>
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <div className="tw-ml-auto tw-flex tw-items-center">
        {hasPermission("canCreateTasks") ? (
          <Button
            type="primary"
            className="tw-uppercase s-main-font s-semibold task-create-btn"
            onClick={() => setIsEditingTask(true)}
          >
            {t("tasks.addNew")}
          </Button>
        ) : null}
        <div className="tw-mx-8">
          <NotificationsCount />
        </div>
        <Dropdown overlay={getUserMenu(user)}>
          <Avatar className="ant-btn-primary s-pointer">
            {getUsername(user).toUpperCase().slice(0, 1)}
          </Avatar>
        </Dropdown>
      </div>

      <TaskEdit
        visible={isEditingTask}
        task={{} as Task}
        onClose={() => setIsEditingTask(false)}
        onSave={(task, action, shouldClose) => setIsEditingTask(!shouldClose)}
        duplicateTask={() => null}
      />
    </>
  );
};

export default MainHeader;
