import {
  CommentOutlined,
  MailOutlined,
  PhoneOutlined,
  WarningFilled,
} from "@ant-design/icons";
import { Button, Popover, Switch, message } from "antd";
import logger from "logger";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { FirmService } from "services";
import { Firm, UserContextType } from "types";
import UserContext from "UserContext";

interface SortByDistanceProps {
  status: boolean;
}

const SortByDistance = ({ status }: SortByDistanceProps) => {
  const [t] = useTranslation();
  const { firm = {} as Firm } = useContext(UserContext) as UserContextType;
  const [popoverVisibility, setPopoverVisibility] = useState(false);
  const [loading, setLoading] = useState(false);

  const disableDistanceSort = () => {
    setLoading(true);
    FirmService.patch(firm._id, {
      "featureFlags.sortByDistance": false,
    }).then(
      () => {
        setPopoverVisibility(false);
        setLoading(false);
        message.success(t("distanceSorting.disableSuccess"));
      },
      (error: Error) => {
        setLoading(false);
        message.error(t("distanceSorting.disableError"));
        logger.error("Error in disabling distance sorting: ", error);
      },
    );
  };

  return (
    <Popover
      content={
        status ? (
          <>
            <div className="s-main-font s-semibold">
              <WarningFilled className="s-anticon-v-align tw-text-xl tw-mr-2 tw-text-yellow-500" />
              {t("distanceSorting.disableSurety")}
            </div>
            <div className="tw-text-right tw-mt-5">
              <Button size="small" onClick={() => setPopoverVisibility(false)}>
                {t("global.cancel")}
              </Button>
              <Button
                size="small"
                type="primary"
                className="tw-ml-2 s-btn-spinner-align"
                disabled={loading}
                loading={loading}
                onClick={() => disableDistanceSort()}
              >
                {t("global.yes")}
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="s-main-font s-semibold tw-mb-2">
              {t("distanceSorting.enableInfo")}
            </p>
            <div className="tw-flex tw-items-center">
              <CommentOutlined className="tw-text-gray-500 tw-mr-2" />
              <span className="text-text-lg">{t("global.clickChat")}</span>
            </div>
            <div className="tw-flex tw-items-center">
              <PhoneOutlined className="tw-text-gray-500 tw-mr-2" />
              <span className="text-text-lg">+90 212 875 7220</span>
            </div>
            <div className="tw-flex tw-items-center">
              <MailOutlined className="tw-text-gray-500 tw-mr-2" />
              info@sapiyon.com
            </div>
            <div className="tw-text-right tw-mt-5">
              <Button
                size="small"
                type="primary"
                onClick={() => setPopoverVisibility(false)}
                block
              >
                {t("global.ok")}
              </Button>
            </div>
          </>
        )
      }
      placement="topLeft"
      visible={popoverVisibility}
    >
      <Switch
        checked={status}
        unCheckedChildren={t("distanceSorting.disabled")}
        checkedChildren={t("distanceSorting.enabled")}
        onClick={() => setPopoverVisibility(true)}
      />
    </Popover>
  );
};

export default SortByDistance;
