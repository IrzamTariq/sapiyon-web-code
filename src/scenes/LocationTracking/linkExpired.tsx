import { Button } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";

const LocationTrackingExpired = () => {
  const [t] = useTranslation();
  return (
    <div className="tw-w-full tw-h-full tw-flex tw-items-center tw-justify-center tw-text-2xl tw-text-center s-std-text">
      <div>
        <p className="tw-mb-5">{t("automations.location.urlExpired")}</p>
        <Button type="primary" onClick={() => window.location.reload()}>
          {t("automations.location.retry")}
        </Button>
      </div>
    </div>
  );
};

export default LocationTrackingExpired;
