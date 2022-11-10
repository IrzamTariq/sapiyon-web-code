import { Button, message } from "antd";
import i18n from "i18n";
import logger from "logger";
import React, { Key } from "react";
import client from "services/client";
import { ExportRequest } from "types";

const exportRecords = (
  data: ExportRequest,
  setSelectedRowKeys?: (keys: Key[]) => void,
) => {
  client
    .service("export-data")
    .create(data)
    .then(() => {
      const closeMessage = message.open({
        type: "info",
        content: (
          <span>
            {i18n.t("exports.exportNotify")}
            <Button
              className="tw-ml-3"
              type="link"
              size="small"
              onClick={() => closeMessage()}
            >
              {i18n.t("global.ok")}
            </Button>
          </span>
        ),
        duration: 0,
        icon: "",
      });
      if (setSelectedRowKeys) {
        setSelectedRowKeys([]);
      }
    })
    .catch((err: any) => {
      logger.log(err);
      message.error(i18n.t("exports.cantExport"));
    });
};

export default exportRecords;
