import {
  AndroidOutlined,
  AppleOutlined,
  LogoutOutlined,
  ProfileOutlined,
  ReadOutlined,
} from "@ant-design/icons";
import { faBars, faCog, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Dropdown, Menu, MenuTheme, Tooltip } from "antd";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Task, User, UserContextType } from "types";

import logo from "./../../../assets/logo/logo.png";
import TaskEdit from "../../../scenes/Tasks/TaskEdit";
import UserContext from "../../../UserContext";
import { getUsername } from "../../../utils/helpers";
import VerifyEmailRibbon from "../VerifyEmailRibbon";
import NotificationsCount from "./NotificationsCount";

interface NavBarProps {
  activeLink: string;
}

const NavBar = ({ activeLink }: NavBarProps) => {
  const [t] = useTranslation();
  const [isEditingTask, setIsEditingTask] = useState(false);
  const { hasPermission, user, isOwner, firm } = useContext(
    UserContext,
  ) as UserContextType;
  const { extendedTasks, dailyAccounting, taskCompletionFeedback } =
    firm?.featureFlags || {};
  const getUserMenu = (user: User, theme: MenuTheme) => (
    <Menu theme={theme}>
      <Menu.Item>
        <Link
          to="/settings/account/business-profile"
          className="tw-items-center"
          style={{ display: "flex" }}
        >
          <ProfileOutlined
            className="tw-mr-2 s-icon-color"
            style={{ fontSize: "14px" }}
          />
          <span>{getUsername(user)}</span>
        </Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item>
        <Link
          to="/logout"
          className="tw-items-center"
          style={{ display: "flex" }}
        >
          <LogoutOutlined
            className="tw-mr-2 s-icon-color"
            style={{ fontSize: "14px" }}
          />
          <span>{t("header.logout")}</span>
        </Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item>
        <a
          href="https://apps.apple.com/us/app/sapiyon/id1496930567?ls=1"
          target="_blank"
          rel="noopener noreferrer"
          className="tw-items-center"
          style={{ display: "flex" }}
        >
          <AppleOutlined
            className="tw-mr-2 s-icon-color"
            style={{ fontSize: "14px" }}
          />
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
          <AndroidOutlined
            className="tw-mr-2 s-icon-color"
            style={{ fontSize: "14px" }}
          />
          <span>{t("header.androidApp")}</span>
        </a>
      </Menu.Item>
      <Menu.Item>
        <Link
          to="/iframes"
          className="tw-items-center"
          style={{ display: "flex" }}
        >
          <ReadOutlined
            className="tw-mr-2 s-icon-color"
            style={{ fontSize: "14px" }}
          />
          <span>{t("header.tutorial")}</span>
        </Link>
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <div className="tw-fixed tw-top-0 tw-z-10 s-bg-nav tw-h-16 tw-w-full tw-px-4 lg:tw-flex tw-items-center tw-hidden">
        <div className="sm:tw-py-0 lg:tw-mr-0">
          <Link to="/">
            <img src={logo} alt="Sapiyon" width="136" />
          </Link>
        </div>
        <div className="tw-flex tw-items-center tw-mx-auto">
          <Link to="/">
            <div
              className={
                activeLink === "/dashboard" || activeLink === "/"
                  ? "s-nav-btn-active"
                  : "s-nav-btn"
              }
            >
              {t("header.dashboard")}
            </div>
          </Link>
          <Link to="/task-list">
            <div
              className={
                activeLink === "/task-list" ? "s-nav-btn-active" : "s-nav-btn"
              }
            >
              {t("header.list")}
            </div>
          </Link>
          <Link to="/task-map">
            <div
              className={
                activeLink === "/task-map" ? "s-nav-btn-active" : "s-nav-btn"
              }
            >
              {t("header.map")}
            </div>
          </Link>
          <Link to="/task-calendar">
            <div
              className={
                activeLink === "/task-calendar"
                  ? "s-nav-btn-active"
                  : "s-nav-btn"
              }
            >
              {t("header.calendar")}
            </div>
          </Link>
          {extendedTasks ||
          (taskCompletionFeedback && hasPermission("canManageFeedback")) ||
          hasPermission("canViewCustomers") ||
          hasPermission("canEditUsers") ||
          hasPermission("canCreateStock") ||
          hasPermission("canManageServices") ||
          dailyAccounting ||
          hasPermission("canViewReports") ? (
            <Dropdown
              overlay={
                <Menu>
                  {extendedTasks && hasPermission("canManageRFQs") && (
                    <Menu.Item className="s-menu-item">
                      <Link to="/rfqs">
                        <div
                          className={activeLink === "/rfqs" ? "s-semibold" : ""}
                        >
                          {t("header.requests")}
                        </div>
                      </Link>
                    </Menu.Item>
                  )}
                  {extendedTasks && hasPermission("canManageQuotes") && (
                    <Menu.Item className="s-menu-item">
                      <Link to="/quotes">
                        <div
                          className={
                            activeLink === "/quotes" ? "s-semibold" : ""
                          }
                        >
                          {t("header.quotes")}
                        </div>
                      </Link>
                    </Menu.Item>
                  )}
                  {extendedTasks && (
                    <Menu.Item className="s-menu-item">
                      <Link to="/invoices">
                        <div
                          className={
                            activeLink === "/invoices" ? "s-semibold" : ""
                          }
                        >
                          {t("header.invoices")}
                        </div>
                      </Link>
                    </Menu.Item>
                  )}
                  {taskCompletionFeedback &&
                    hasPermission("canManageFeedback") && (
                      <Menu.Item className="s-menu-item">
                        <Link to="/feedback">
                          <div
                            className={
                              activeLink === "/feedback" ? "s-semibold" : ""
                            }
                          >
                            {t("feedback.nav")}
                          </div>
                        </Link>
                      </Menu.Item>
                    )}
                  {hasPermission("canViewCustomers") && (
                    <Menu.Item className="s-menu-item">
                      <Link to="/customers?tab=list">
                        <div
                          className={
                            activeLink === "/customers" ? "s-semibold" : ""
                          }
                        >
                          {t("header.customers")}
                        </div>
                      </Link>
                    </Menu.Item>
                  )}
                  {hasPermission("canEditUsers") && (
                    <Menu.Item className="s-menu-item">
                      <Link to="/employees">
                        <div
                          className={
                            activeLink === "/employees" ? "s-semibold" : ""
                          }
                        >
                          {t("header.employees")}
                        </div>
                      </Link>
                    </Menu.Item>
                  )}
                  {hasPermission("canCreateStock") && (
                    <Menu.Item className="s-menu-item">
                      <Link to="/products?tab=products">
                        <div
                          className={
                            activeLink === "/products" ? "s-semibold" : ""
                          }
                        >
                          {t("header.products")}
                        </div>
                      </Link>
                    </Menu.Item>
                  )}
                  {hasPermission("canManageServices") && (
                    <Menu.Item className="s-menu-item">
                      <Link to="/services">
                        <div
                          className={
                            activeLink === "/services" ? "s-semibold" : ""
                          }
                        >
                          {t("header.services")}
                        </div>
                      </Link>
                    </Menu.Item>
                  )}
                  {dailyAccounting && (
                    <Menu.Item className="s-menu-item">
                      <Link to="/accounting">
                        <div
                          className={
                            activeLink === "/accounting" ? "s-semibold" : ""
                          }
                        >
                          {t("header.accounting")}
                        </div>
                      </Link>
                    </Menu.Item>
                  )}
                  {hasPermission("canViewReports") && (
                    <Menu.Item className="s-menu-item">
                      <Link to="/reports">
                        <div
                          className={
                            activeLink.startsWith("/reports")
                              ? "s-semibold"
                              : ""
                          }
                        >
                          {t("header.reports")}
                        </div>
                      </Link>
                    </Menu.Item>
                  )}
                </Menu>
              }
              placement="bottomCenter"
            >
              <div className="s-nav-btn s-pointer">{t("header.more")}</div>
            </Dropdown>
          ) : null}
        </div>
        <div className="tw-flex tw-items-center">
          {hasPermission("canCreateTasks") && (
            <Button
              type="primary"
              className="s-primary-btn-bg tw-mr-6"
              onClick={() => setIsEditingTask(true)}
            >
              <span className="tw-uppercase s-semibold s-font-roboto">
                {t("tasks.addNew")}
              </span>
            </Button>
          )}
          {hasPermission("canManageSettings") && (
            <Tooltip
              autoAdjustOverflow
              placement="bottom"
              title={t("header.settings")}
            >
              <Link to="/settings">
                <FontAwesomeIcon
                  icon={faCog}
                  className="tw-text-xl tw-text-white tw-mt-1 s-a-rotate"
                />
              </Link>
            </Tooltip>
          )}
          <div className="tw-mx-8">
            <NotificationsCount />
          </div>
          <Dropdown
            overlay={getUserMenu(user, "light")}
            placement="bottomLeft"
            trigger={["click", "hover"]}
          >
            <div className="UserMenu user-btn s-pointer">
              {getUsername(user).toUpperCase().substr(0, 1)}
            </div>
          </Dropdown>
        </div>
      </div>

      {/***** Mobile Navbar below *****/}
      <div className="tw-z-10 tw-fixed tw-top-0 s-bg-nav tw-h-16 tw-w-full tw-px-4 tw-flex tw-flex-row tw-items-center lg:tw-hidden">
        <div className="sm:tw-py-0 tw-mr-auto lg:tw-mr-0">
          <Link to="/">
            <img src={logo} alt="Sapiyon" width="136" />
          </Link>
        </div>
        {hasPermission("canCreateTasks") && (
          <FontAwesomeIcon
            icon={faPlus}
            onClick={() => setIsEditingTask(true)}
            className="tw-text-2xl tw-mr-5 s-pointer"
            style={{ color: "#ff9c00" }}
          />
        )}
        {hasPermission("canManageSettings") && (
          <Tooltip autoAdjustOverflow title={t("navBar.createTaskTooltip")}>
            <Link to="/settings">
              <FontAwesomeIcon
                icon={faCog}
                className="tw-text-xl tw-text-white tw-mt-1 s-a-rotate"
              />
            </Link>
          </Tooltip>
        )}
        <Dropdown
          overlay={
            <Menu theme="dark">
              <Menu.Item>
                <Link to="/">
                  <div
                    className={activeLink === "dashboard" ? "s-semibold" : ""}
                  >
                    {t("header.dashboard")}
                  </div>
                </Link>
              </Menu.Item>
              {extendedTasks && hasPermission("canManageRFQs") && (
                <Menu.Item>
                  <Link to="/rfqs">
                    <div className={activeLink === "/rfqs" ? "s-semibold" : ""}>
                      {t("header.requests")}
                    </div>
                  </Link>
                </Menu.Item>
              )}
              {extendedTasks && hasPermission("canManageQuotes") && (
                <Menu.Item>
                  <Link to="/quotes">
                    <div
                      className={activeLink === "/quotes" ? "s-semibold" : ""}
                    >
                      {t("header.quotes")}
                    </div>
                  </Link>
                </Menu.Item>
              )}
              <Menu.Item>
                <Link to="/task-list">
                  <div
                    className={activeLink === "/task-list" ? "s-semibold" : ""}
                  >
                    {t("newHeader.jobs")}
                  </div>
                </Link>
              </Menu.Item>
              {extendedTasks && (
                <Menu.Item>
                  <Link to="/invoices">
                    <div
                      className={activeLink === "/invoices" ? "s-semibold" : ""}
                    >
                      {t("header.invoices")}
                    </div>
                  </Link>
                </Menu.Item>
              )}
              {taskCompletionFeedback && hasPermission("canManageFeedback") && (
                <Menu.Item>
                  <Link to="/feedback">
                    <div
                      className={activeLink === "feedback" ? "s-semibold" : ""}
                    >
                      {t("feedback.nav")}
                    </div>
                  </Link>
                </Menu.Item>
              )}
              {hasPermission("canViewCustomers") && (
                <Menu.Item>
                  <Link to="/customers?tab=list">
                    <div
                      className={activeLink === "customers" ? "s-semibold" : ""}
                    >
                      {t("header.customers")}
                    </div>
                  </Link>
                </Menu.Item>
              )}
              {hasPermission("canEditUsers") && (
                <Menu.Item>
                  <Link to="/employees">
                    <div
                      className={activeLink === "employees" ? "s-semibold" : ""}
                    >
                      {t("header.employees")}
                    </div>
                  </Link>
                </Menu.Item>
              )}
              {hasPermission("canCreateStock") && (
                <Menu.Item>
                  <Link to="/products?tab=products">
                    <div
                      className={activeLink === "products" ? "s-semibold" : ""}
                    >
                      {t("header.products")}
                    </div>
                  </Link>
                </Menu.Item>
              )}
              {hasPermission("canManageServices") && (
                <Menu.Item>
                  <Link to="/services">
                    <div
                      className={activeLink === "services" ? "s-semibold" : ""}
                    >
                      {t("header.services")}
                    </div>
                  </Link>
                </Menu.Item>
              )}
              {hasPermission("canViewReports") && (
                <Menu.Item>
                  <Link to="/reports">
                    <div
                      className={
                        activeLink.startsWith("/reports") ? "s-semibold" : ""
                      }
                    >
                      {t("header.reports")}
                    </div>
                  </Link>
                </Menu.Item>
              )}
              {dailyAccounting && (
                <Menu.Item>
                  <Link to="/accounting">
                    <div
                      className={
                        activeLink === "/accounting" ? "s-semibold" : ""
                      }
                    >
                      {t("header.accounting")}
                    </div>
                  </Link>
                </Menu.Item>
              )}
            </Menu>
          }
          placement="bottomCenter"
        >
          <FontAwesomeIcon
            icon={faBars}
            size="lg"
            className="tw-text-white s-pointer tw-mx-5"
          />
        </Dropdown>
        <div className="tw-mr-5">
          <NotificationsCount />
        </div>
        <Dropdown
          overlay={getUserMenu(user, "dark")}
          placement="bottomLeft"
          trigger={["click", "hover"]}
        >
          <div className="UserMenu user-btn">
            {getUsername(user).toUpperCase().substr(0, 1)}
          </div>
        </Dropdown>
      </div>
      <TaskEdit
        visible={isEditingTask}
        task={{} as Task}
        onClose={() => setIsEditingTask(false)}
        onSave={(task, action, shouldClose) => setIsEditingTask(!shouldClose)}
        duplicateTask={() => null}
      />

      {isOwner && !user?.isVerified && (
        <VerifyEmailRibbon email={user?.email} _id={user?._id} />
      )}
    </>
  );
};

export default NavBar;
