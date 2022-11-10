import { Collapse } from "antd";
import Appshell from "Appshell";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { UserContextType } from "types";

import UserContext from "../../../UserContext";
import CustomStatusTable from "./Components/CustomStatusTable";

const FirmCustomStatusContainer = () => {
  const [t] = useTranslation();
  const { hasPermission } = useContext(UserContext) as UserContextType;

  return (
    <Appshell activeLink={["settings", "status"]}>
      <div className="md:tw-mx-20 xl:tw-mx-32">
        <h1 className="s-page-title tw-mb-5">{t("statuses.pageTitle")}</h1>
        {hasPermission("canManageSettings") ? (
          <Collapse accordion defaultActiveKey="task">
            <Collapse.Panel key="task" header={t("statuses.task")}>
              <CustomStatusTable category="task" />
            </Collapse.Panel>
            <Collapse.Panel key="rfq" header={t("statuses.rfq")}>
              <CustomStatusTable category="rfq" />
            </Collapse.Panel>
            <Collapse.Panel key="quote" header={t("statuses.quote")}>
              <CustomStatusTable category="quote" />
            </Collapse.Panel>
            <Collapse.Panel key="invoice" header={t("statuses.invoice")}>
              <CustomStatusTable category="invoice" />
            </Collapse.Panel>
          </Collapse>
        ) : (
          <h1 className="tw-font-medium tw-text-center tw-text-3xl tw-mt-10">
            {t("firmStatus.noPermissions")}
          </h1>
        )}
      </div>
    </Appshell>
  );
};

export default FirmCustomStatusContainer;
