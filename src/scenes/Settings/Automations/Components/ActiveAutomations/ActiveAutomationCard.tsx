import { Button, Popconfirm, Switch } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";
import { Automation } from "types";

import ActiveAutomationText from "./ActiveAutomationText";

interface ActiveAutomationCardProps {
  automation: Automation;
  edit: () => void;
  remove: () => void;
  toggleActive: () => void;
  viewHistory: () => void;
  updating: boolean;
  disabled?: boolean;
  disableMsg?: string;
}

const ActiveAutomationCard = ({
  automation,
  updating,
  edit,
  remove,
  toggleActive,
  viewHistory,
  disabled = false,
  disableMsg = "",
}: ActiveAutomationCardProps) => {
  const [t] = useTranslation();
  const { isPaused } = automation;

  return (
    <div
      className="tw-bordered tw-rounded tw-px-4 tw-py-2 s-std-text"
      style={{
        backgroundColor: "#F8F8F8",
        border: "1px solid #CBD6E2",
      }}
    >
      <div className="tw-flex tw-justify-between">
        <span>
          <ActiveAutomationText automation={automation} />
        </span>
        <Switch
          loading={updating}
          onChange={toggleActive}
          checkedChildren={t("global.on")}
          unCheckedChildren={t("global.off")}
          className={isPaused ? "tw-bg-red-500" : "tw-bg-green-500"}
          checked={!isPaused}
          disabled={disabled}
          title={disableMsg}
        />
      </div>
      <div className="tw-flex tw-items-center tw-mt-5 tw-p-0">
        <Button type="link" className="tw-px-0 tw-ml-auto" onClick={edit}>
          {t("global.edit")}
        </Button>
        <span className="tw-mx-2 tw-text-gray-500">|</span>
        <Popconfirm
          onConfirm={remove}
          title={t("global.deleteSurety")}
          okText={t("global.delete")}
          cancelText={t("global.cancel")}
          okButtonProps={{ danger: true }}
        >
          <Button type="link" className="tw-px-0">
            {t("global.delete")}
          </Button>
        </Popconfirm>
        <span className="tw-mx-2 tw-text-gray-500">|</span>
        <Button type="link" className="tw-px-0" onClick={viewHistory}>
          {t("automations.active.history")}
        </Button>
      </div>
    </div>
  );
};

export default ActiveAutomationCard;
