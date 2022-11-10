import { Button, Popconfirm, message } from "antd";
import logger from "logger";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { FirmService, ParasutTokenService } from "services";
import { UserContextType } from "types";
import UserContext from "UserContext";

const ParasutIntegrated = () => {
  const [t] = useTranslation();
  const { firm } = useContext(UserContext) as UserContextType;
  const [loading, setLoading] = useState(false);

  const removeParasut = () => {
    setLoading(true);
    ParasutTokenService.remove(null, { query: { firmId: firm._id } })
      .then(() => {
        FirmService.patch(firm._id, {
          "featureFlags.parasutSync": false,
          parasutId: null,
        }).then(() => {
          message.success(t("parasutIntegration.removeSuccess"));
          setLoading(false);
        });
      })
      .catch((error: Error) => {
        setLoading(false);
        message.error(t("parasutIntegration.removeError"));
        logger.error("Could not remove parasut: ", error);
      });
  };

  return (
    <div className="s-std-text">
      <p className="tw-text-lg tw-mb-6">{t("parasutIntegration.alreadySet")}</p>
      <Popconfirm
        title={t("parasutIntegration.removeSurety")}
        okText={t("global.yes")}
        cancelText={t("global.cancel")}
        onConfirm={removeParasut}
        okButtonProps={{ danger: true }}
      >
        <Button
          loading={loading}
          disabled={loading}
          type="primary"
          className="s-btn-spinner-align"
          danger
          block
        >
          {t("parasutIntegration.remove")}
        </Button>
      </Popconfirm>
    </div>
  );
};

export default ParasutIntegrated;
