import { Menu } from "antd";
import SubMenu from "antd/lib/menu/SubMenu";
import React from "react";
import { withTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const ReportsMenu = ({ activeKey, selectedKey, t }) => {
  return (
    <Menu
      style={{ width: 256 }}
      defaultSelectedKeys={selectedKey}
      defaultOpenKeys={activeKey}
      mode="inline"
      className="s-font-roboto s-text-muted s-title-font"
    >
      <SubMenu key="jobs" title={t("reportsMenu.jobReports")}>
        <Menu.Item key="jobsByDate">
          <Link to="/reports/jobs/by-date">{t("reportsMenu.byDate")}</Link>
        </Menu.Item>
        <Menu.Item key="jobsByStatus">
          <Link to="/reports/jobs/by-status">{t("reportsMenu.byStatus")}</Link>
        </Menu.Item>
        <Menu.Item key="jobsByUsers">
          <Link to="/reports/jobs/by-users">{t("reportsMenu.byUsers")}</Link>
        </Menu.Item>
        <Menu.Item key="jobsByCustomers">
          <Link to="/reports/jobs/by-customers">
            {t("reportsMenu.byCustomers")}
          </Link>
        </Menu.Item>
      </SubMenu>
      {/* <SubMenu key="user" title={t("reportsMenu.userReports")}>
        <Menu.Item key="userByTime">
          <Link to="/reports/users/by-time">{t("reportsMenu.byTime")}</Link>
        </Menu.Item>
      </SubMenu> */}
      <SubMenu key="customer" title={t("reportsMenu.customerReports")}>
        <Menu.Item key="customerByLocation">
          <Link to="/reports/customers/by-location">
            {t("reportsMenu.byLocation")}
          </Link>
        </Menu.Item>
      </SubMenu>
      <SubMenu key="service" title={t("reportsMenu.serviceReports")}>
        <Menu.Item key="serviceGeneral">
          <Link to="/reports/services/general">{t("reportsMenu.general")}</Link>
        </Menu.Item>
        <Menu.Item key="serviceByDate">
          <Link to="/reports/services/by-date">{t("reportsMenu.byDate")}</Link>
        </Menu.Item>
      </SubMenu>
      <SubMenu key="products" title={t("reportsMenu.productsReports")}>
        <Menu.Item key="productsGeneral">
          <Link to="/reports/products/general">{t("reportsMenu.general")}</Link>
        </Menu.Item>
        <Menu.Item key="productsByWarehouse">
          <Link to="/reports/products/by-warehouse">
            {t("reportsMenu.byWarehouse")}
          </Link>
        </Menu.Item>
        <Menu.Item key="productsByDate">
          <Link to="/reports/products/by-date">{t("reportsMenu.byDate")}</Link>
        </Menu.Item>
      </SubMenu>
    </Menu>
  );
};

export default withTranslation()(ReportsMenu);
