import Icon from "@ant-design/icons";
import {
  faAddressBook,
  faCalculator,
  faCalendarCheck,
  faChartPie,
  faCog,
  faDiceThree,
  faFileAlt,
  faRedo,
  faScroll,
  faStickyNote,
  faTachometerAlt,
  faUserTie,
  faWrench,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu } from "antd";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { UserContextType } from "types";
import UserContext from "UserContext";
import { getActivePath } from "utils/helpers";

import logolg from "../assets/logo/logo.png";
import logosm from "../assets/logo/logosm.png";

const { SubMenu, Item } = Menu;
interface MainSideMenuProps {
  isCollapsed: boolean;
  activeLink: [string, string];
}

const MainSideMenu = ({ isCollapsed, activeLink }: MainSideMenuProps) => {
  const [t] = useTranslation();
  const history = useHistory();
  const { hasPermission, firm, isOwner } = useContext(
    UserContext,
  ) as UserContextType;
  const { featureFlags } = firm || {};
  const { extendedTasks, taskCompletionFeedback, dailyAccounting } =
    featureFlags || {};
  const [openKey, selectedKey] = activeLink;

  const changePage = (key: string) => {
    const path = getActivePath(key);
    history.push(path);
  };

  return (
    <div>
      <div className="tw-mb-5" onClick={() => changePage("dashboard")}>
        {isCollapsed ? (
          <img src={logosm} alt="Sapiyon" className="tw-mt-4 tw-ml-6" />
        ) : (
          <img src={logolg} alt="Sapiyon" className="tw-mt-4 tw-ml-6" />
        )}
      </div>
      <Menu
        mode="inline"
        theme="dark"
        defaultOpenKeys={[openKey]}
        defaultSelectedKeys={[selectedKey]}
        onSelect={({ key }) => changePage(key as string)}
        className="s-sidemenu s-menu-styles"
      >
        <Item key="dashboard" icon={<FontAwesomeIcon icon={faTachometerAlt} />}>
          {t("header.dashboard")}
        </Item>
        <SubMenu
          key="tasks"
          title={t("newHeader.jobs")}
          icon={
            <Icon>
              <FontAwesomeIcon icon={faCalendarCheck} />
            </Icon>
          }
        >
          <Item key="task-list">{t("header.list")}</Item>
          <Item key="task-map">{t("header.map")}</Item>
          <Item key="task-calendar">{t("header.calendar")}</Item>
        </SubMenu>
        {extendedTasks && hasPermission("canManageRFQs") ? (
          <Item key="rfqs" icon={<FontAwesomeIcon icon={faScroll} />}>
            {t("header.requests")}
          </Item>
        ) : null}
        {extendedTasks && hasPermission("canManageQuotes") ? (
          <Item key="quotes" icon={<FontAwesomeIcon icon={faStickyNote} />}>
            {t("header.quotes")}
          </Item>
        ) : null}
        {extendedTasks ? (
          <Item key="invoices" icon={<FontAwesomeIcon icon={faFileAlt} />}>
            {t("header.invoices")}
          </Item>
        ) : null}
        {taskCompletionFeedback && hasPermission("canManageFeedback") ? (
          <Item key="feedback" icon={<FontAwesomeIcon icon={faRedo} />}>
            {t("feedback.nav")}
          </Item>
        ) : null}
        {hasPermission("canViewCustomers") ? (
          <SubMenu
            key="customers"
            className="customers-nav"
            title={t("header.customers")}
            icon={
              <Icon>
                <FontAwesomeIcon icon={faAddressBook} />
              </Icon>
            }
          >
            <Item key="customers-list">{t("customers.list")}</Item>
            <Item key="customers-locations">
              {t("customersList.customerLocations")}
            </Item>
          </SubMenu>
        ) : null}
        {hasPermission("canEditUsers") ? (
          <Item
            key="employees"
            className="employees-nav"
            icon={<FontAwesomeIcon icon={faUserTie} />}
          >
            {t("header.employees")}
          </Item>
        ) : null}
        {hasPermission("canCreateStock") ? (
          <Item key="products" icon={<FontAwesomeIcon icon={faDiceThree} />}>
            {t("header.products")}
          </Item>
        ) : null}
        {hasPermission("canManageServices") ? (
          <Item key="services" icon={<FontAwesomeIcon icon={faWrench} />}>
            {t("header.services")}
          </Item>
        ) : null}
        {dailyAccounting ? (
          <Item key="accounting" icon={<FontAwesomeIcon icon={faCalculator} />}>
            {t("header.accounting")}
          </Item>
        ) : null}
        {hasPermission("canViewReports") ? (
          <SubMenu
            key="reports"
            title={t("header.reports")}
            icon={
              <Icon>
                <FontAwesomeIcon icon={faChartPie} />
              </Icon>
            }
          >
            <Item key="jobsByDate">{t("reports.menu.jobsByDate")}</Item>
            <Item key="jobsByStatus">{t("reports.menu.jobsByStatus")}</Item>
            <Item key="jobsByUsers">{t("reports.menu.jobsByUsers")}</Item>
            <Item key="jobsByCustomers">
              {t("reports.menu.jobsByCustomers")}
            </Item>
            <Item key="customerByLocation">
              {t("reports.menu.customersByLocation")}
            </Item>
            <Item key="serviceGeneral">
              {t("reports.menu.servicesGeneral")}
            </Item>
            <Item key="serviceByDate">{t("reports.menu.servicesByDate")}</Item>
            <Item key="productsGeneral">
              {t("reports.menu.productsGeneral")}
            </Item>
            <Item key="productsByWarehouse">
              {t("reports.menu.productsByWarehouse")}
            </Item>
            <Item key="productsByDate">{t("reports.menu.productsByDate")}</Item>
          </SubMenu>
        ) : null}
        {hasPermission("canManageSettings") ? (
          <SubMenu
            key="settings"
            title={t("header.settings")}
            icon={
              <Icon>
                <FontAwesomeIcon icon={faCog} />
              </Icon>
            }
          >
            {hasPermission("canManageSettings") && (
              <Item key="status">{t("settingsMenu.status")}</Item>
            )}
            <Item key="expenseCodes">{t("settingsMenu.expenseCodes")}</Item>
            <Item key="teams">{t("settingsMenu.teams")}</Item>
            <Item key="roles">{t("settingsMenu.roles")}</Item>
            <Item key="permissions">{t("settingsMenu.permissions")}</Item>
            <Item key="businessProfile">
              {t("settingsMenu.businessProfile")}
            </Item>
            <Item key="password">{t("settingsMenu.changePassword")}</Item>
            {isOwner && (
              <Item key="currentPlan">{t("settingsMenu.currentPlan")}</Item>
            )}
            <Item key="general">{t("appSettings.view")}</Item>
            <Item key="smsIntegration">{t("settingsMenu.smsIntegration")}</Item>
            <Item key="parasutIntegration">
              {t("settingsMenu.parasutIntegration")}
            </Item>
            <Item key="automations">{t("settingsMenu.SMSAutomation")}</Item>
          </SubMenu>
        ) : null}
      </Menu>
    </div>
  );
};

export default MainSideMenu;
