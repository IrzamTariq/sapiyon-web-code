import React from "react";
import { useTranslation } from "react-i18next";

const NoLocation = () => {
  const [t] = useTranslation();

  return (
    <div className="tw-w-full tw-h-full tw-flex tw-items-center tw-justify-center tw-text-2xl tw-text-center s-std-text">
      <div>
        <p className="tw-mb-5">{t("automations.location.noLocation")}</p>
      </div>
    </div>
  );
};

export default NoLocation;
