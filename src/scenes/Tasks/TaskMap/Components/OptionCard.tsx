import { Switch } from "antd";
import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";

interface OptionCardProps extends WithTranslation {
  mapMode: "light" | "dark";
  handleThemeChange: (mode: string) => void;
}

const OptionCard = ({ t, handleThemeChange, mapMode }: OptionCardProps) => {
  return (
    <div
      className="tw-bg-white tw-px-2 tw-py-2 tw-bg-white tw-border-b tw-border-gray-300 tw-shadow-md"
      style={{ borderRadius: 10 }}
    >
      <div className="EmployeeCard tw-pl-6 tw-h-12 tw-bg-white tw-px-1">
        <div className="tw-flex tw-justify-between tw-items-center tw-h-12">
          <p className="s-text-dark tw-text-sm tw-font-medium tw-w-32 tw-truncate">
            {t("optionCard.mode")}
          </p>
          <Switch
            onChange={(value) => {
              handleThemeChange(value ? "dark" : "light");
            }}
            checked={mapMode === "dark" ? true : false}
          />
        </div>
      </div>
    </div>
  );
};

export default withTranslation()(OptionCard);
