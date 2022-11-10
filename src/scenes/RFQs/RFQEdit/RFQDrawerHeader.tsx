import { DownOutlined } from "@ant-design/icons";
import { Button, Dropdown, Menu, Popconfirm, message } from "antd";
import logger from "logger";
import moment from "moment";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { RFQService } from "services";
import { RFQ, UserContextType } from "types";
import UserContext from "UserContext";

import RFQStatusControl from "./RFQStatusControl";

interface RFQDrawerHeaderProps {
  editedRFQ: RFQ;
  closeModal: () => void;
  updateRFQ: (rfq: Partial<RFQ>) => void;
  convertToQuote: () => void;
  convertToTask: () => void;
}

const RFQDrawerHeader = ({
  editedRFQ,
  closeModal,
  updateRFQ,
  convertToQuote,
  convertToTask,
}: RFQDrawerHeaderProps) => {
  const [t] = useTranslation();
  const { hasPermission } = useContext(UserContext) as UserContextType;

  const removeRFQ = () => {
    RFQService.remove(editedRFQ._id).then(
      () => {
        message.success(t("requests.removeSuccess"));
        closeModal();
      },
      (e: Error) => {
        logger.error("Error in removing RFQ: ", e);
        message.error(t("requests.removeError"));
      },
    );
  };

  const requestedAt = editedRFQ.createdAt ? (
    <div className="tw-ml-10">
      <div
        className="tw-text-sm s-std-text s-semibold"
        style={{ color: "#516F90" }}
      >
        {t("requests.requestDate")}
      </div>
      <div className="s-std-text tw-text-sm">
        <span className="tw-mr-1">
          {moment(editedRFQ.createdAt).format("HH:mm")}
        </span>
        -
        <span className="tw-ml-1">
          {moment(editedRFQ.createdAt).format("DD/MM/YYYY")}
        </span>
      </div>
    </div>
  ) : null;

  return !editedRFQ._id ? (
    <h2 className="tw-text-lg tw-font-medium">
      {t("requests.edit.pageTitle")}
    </h2>
  ) : (
    <div className="tw-flex tw-items-center">
      <RFQStatusControl
        rfq={editedRFQ}
        onStatusChange={updateRFQ}
        onConvertToQuote={convertToQuote}
        onConvertToTask={convertToTask}
      />
      {requestedAt}
      <div className="tw-ml-auto">
        {hasPermission("canManageRFQs") ? (
          <Dropdown
            placement="bottomRight"
            overlay={
              <Menu>
                <Menu.Item>
                  <Popconfirm
                    title={t("global.deleteSurety")}
                    okText={t("global.delete")}
                    cancelText={t("global.cancel")}
                    onConfirm={removeRFQ}
                    placement="bottomLeft"
                    okButtonProps={{ danger: true }}
                  >
                    <div className="tw-text-red-500">{t("global.delete")}</div>
                  </Popconfirm>
                </Menu.Item>
              </Menu>
            }
          >
            <Button className="tw-inline-flex tw-items-center">
              {t("global.actions")}
              <DownOutlined />
            </Button>
          </Dropdown>
        ) : null}
      </div>
    </div>
  );
};

export default RFQDrawerHeader;
