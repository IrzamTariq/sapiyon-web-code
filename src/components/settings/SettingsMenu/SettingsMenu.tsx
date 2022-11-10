import { Menu } from "antd";
import SubMenu from "antd/lib/menu/SubMenu";
import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import UserContext from "../../../UserContext";

interface SettingsMenuProps extends WithTranslation {
  defaultOpenKeys: Array<string>;
  selectedKeys: Array<string>;
}

const SettingsMenu = ({
  defaultOpenKeys,
  selectedKeys,
  t,
}: SettingsMenuProps) => {
  return (
    <UserContext.Consumer>
      {({ hasPermission, user }: any) => (
        <Menu
          style={{ width: 256 }}
          defaultSelectedKeys={selectedKeys}
          defaultOpenKeys={defaultOpenKeys}
          mode="inline"
          className="s-font-roboto s-text-muted s-title-font mx-4 shadow"
        >
          <SubMenu key="customFields" title={t("settingsMenu.customFields")}>
            {hasPermission("canManageSettings") && (
              <Menu.Item key="status">
                <Link to="/settings">
                  <span
                    className={
                      selectedKeys[0] === "status" ? "" : "s-text-dark"
                    }
                  >
                    {t("settingsMenu.status")}
                  </span>
                </Link>
              </Menu.Item>
            )}
            <Menu.Item key="expenseCodes">
              <Link to="/settings/expense-codes">
                <span
                  className={
                    selectedKeys[0] === "expenseCodes" ? "" : "s-text-dark"
                  }
                >
                  {t("Expense Codes")}
                </span>
              </Link>
            </Menu.Item>
          </SubMenu>
          <SubMenu key="team" title={t("settingsMenu.team")}>
            <Menu.Item key="teams">
              <Link to="/settings/team/teams">
                <span
                  className={selectedKeys[0] === "teams" ? "" : "s-text-dark"}
                >
                  {t("settingsMenu.teams")}
                </span>
              </Link>
            </Menu.Item>
            <Menu.Item key="roles">
              <Link to="/settings/team/roles">
                <span
                  className={selectedKeys[0] === "roles" ? "" : "s-text-dark"}
                >
                  {t("settingsMenu.roles")}
                </span>
              </Link>
            </Menu.Item>
            <Menu.Item key="permissions">
              <Link to="/settings/team/permissions">
                <span
                  className={
                    selectedKeys[0] === "permissions" ? "" : "s-text-dark"
                  }
                >
                  {t("settingsMenu.permissions")}
                </span>
              </Link>
            </Menu.Item>
          </SubMenu>
          <SubMenu key="account" title={t("settingsMenu.account")}>
            <Menu.Item key="businessProfile">
              <Link to="/settings/account/business-profile">
                <span
                  className={
                    selectedKeys[0] === "businessProfile" ? "" : "s-text-dark"
                  }
                >
                  {t("settingsMenu.businessProfile")}
                </span>
              </Link>
            </Menu.Item>
            <Menu.Item key="password">
              <Link to="/settings/account/password-reset">
                <span
                  className={
                    selectedKeys[0] === "password" ? "" : "s-text-dark"
                  }
                >
                  {t("settingsMenu.changePassword")}
                </span>
              </Link>
            </Menu.Item>
          </SubMenu>
          {user.isOwner && (
            <SubMenu key="billing" title={t("settingsMenu.billing")}>
              <Menu.Item key="currentPlan">
                <Link to="/settings/billing/current-plan">
                  <span
                    className={
                      selectedKeys[0] === "currentPlan" ? "" : "s-text-dark"
                    }
                  >
                    {t("settingsMenu.currentPlan")}
                  </span>
                </Link>
              </Menu.Item>
              {/* <Menu.Item key="billingHistory">
                <Link to="/settings/billing/billing-history">
                  <span
                    className={
                      selectedKeys[0] === "billingHistory" ? "" : "s-text-dark"
                    }
                  >
                    {t("settingsMenu.billingHistory")}
                  </span>
                </Link>
              </Menu.Item> */}
            </SubMenu>
          )}
          <SubMenu key="appSettings" title={t("settingsMenu.appSettings")}>
            {/* <Menu.Item key="view">
              <Link to="/settings/app/view">
                <span
                  className={selectedKey[0] === "view" ? "" : "s-text-dark"}
                >
                  {t("appSettings.view")}
                </span>
              </Link>
            </Menu.Item> */}
            <Menu.Item key="general">
              <Link to="/settings/app/general">
                <span
                  className={selectedKeys[0] === "general" ? "" : "s-text-dark"}
                >
                  {t("settingsMenu.appSettings")}
                </span>
              </Link>
            </Menu.Item>
          </SubMenu>
          <SubMenu key="integrations" title={t("settingsMenu.integrations")}>
            <Menu.Item key="smsIntegration">
              <Link to="/settings/integrations/sms">
                <span
                  className={
                    selectedKeys[0] === "smsIntegration" ? "" : "s-text-dark"
                  }
                >
                  {t("settingsMenu.smsIntegration")}
                </span>
              </Link>
            </Menu.Item>
            <Menu.Item key="parasutIntegration">
              <Link to="/settings/integrations/parasut">
                <span
                  className={
                    selectedKeys[0] === "parasutIntegration"
                      ? ""
                      : "s-text-dark"
                  }
                >
                  {t("settingsMenu.parasutIntegration")}
                </span>
              </Link>
            </Menu.Item>
          </SubMenu>
          <SubMenu key="automation" title={t("settingsMenu.automation")}>
            <Menu.Item key="SMSAutomation">
              <Link to="/settings/automations">
                <span
                  className={
                    selectedKeys[0] === "SMSAutomation" ? "" : "s-text-dark"
                  }
                >
                  {t("settingsMenu.SMSAutomation")}
                </span>
              </Link>
            </Menu.Item>
          </SubMenu>
        </Menu>
      )}
    </UserContext.Consumer>
  );
};

export default withTranslation()(SettingsMenu);
