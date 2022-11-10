import { Tabs, message } from "antd";
import Appshell from "Appshell";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import ActiveAutomations from "./Components/ActiveAutomations/ActiveAutomations";
import AddAutomation from "./Components/AddAutomations/AddAutomation";

const Automation = () => {
  const [t] = useTranslation();
  const [activeTab, setActiveTab] = useState("add");

  return (
    <Appshell activeLink={["settings", "automations"]}>
      <div className="md:tw-mx-20 xl:tw-mx-32">
        <h1 className="s-page-title tw-mb-5">{t("automation.pageTitle")}</h1>
        <Tabs
          type="line"
          activeKey={activeTab}
          onChange={setActiveTab}
          animated
        >
          <Tabs.TabPane tab={t("automations.addAutomation")} key="add">
            <AddAutomation />
          </Tabs.TabPane>
          <Tabs.TabPane tab={t("automations.activeAutomations")} key="active">
            <ActiveAutomations
              viewAddTab={() => {
                setActiveTab("add");
                message.info(t("automations.addFirst"));
              }}
            />
          </Tabs.TabPane>
        </Tabs>
      </div>
    </Appshell>
  );
};

export default Automation;
