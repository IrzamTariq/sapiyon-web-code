import { Empty, Modal, Table, message } from "antd";
import { ColumnProps } from "antd/lib/table";
import logger from "logger";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AutomationsHistoryService } from "services";
import { AutomationHistory, PaginatedFeathersResponse } from "types";

interface ActiveAutomationHistoryProps {
  visible: boolean;
  automationId: string;
  handleClose: () => void;
}
const INITIAL_STATE = {
  data: [],
  limit: 0,
  skip: 0,
  total: 0,
};

const ActiveAutomationHistory = ({
  visible,
  automationId,
  handleClose,
}: ActiveAutomationHistoryProps) => {
  const [t] = useTranslation();
  const [automationHistory, setAutomationHistory] = useState(
    INITIAL_STATE as PaginatedFeathersResponse<AutomationHistory>,
  );
  const [isLoading, setIsLoading] = useState(false);
  const columns: ColumnProps<AutomationHistory>[] = [
    {
      title: (
        <span className="s-col-title">{t("automations.history.dateTime")}</span>
      ),
      dataIndex: "createdAt",
      width: "70%",
      onCell: () => ({ className: "s-table-text" }),
      render: (createdAt) =>
        createdAt ? moment(createdAt).format("DD/MM/YYYY HH:mm") : null,
    },
    {
      title: (
        <span className="s-col-title">{t("automations.history.status")}</span>
      ),
      dataIndex: "status",
      onCell: () => ({ className: "s-table-text" }),
      render: (status) => {
        if (status === "success") {
          return (
            <div className="tw-bg-green-500 tw-text-white tw-w-32 tw-text-center tw-uppercase s-semibold">
              {t("automations.history.success")}
            </div>
          );
        } else if (status === "pending") {
          return (
            <div className="tw-bg-green-500 tw-text-white tw-w-32 tw-text-center tw-uppercase s-semibold">
              {t("automations.history.pending")}
            </div>
          );
        } else {
          return (
            <div className="tw-bg-red-500 tw-text-white tw-w-32 tw-text-center tw-uppercase s-semibold">
              {t("automations.history.failed")}
            </div>
          );
        }
      },
    },
  ];

  useEffect(() => {
    if (visible) {
      setIsLoading(true);
      AutomationsHistoryService.find({ query: { automationId } }).then(
        (res: PaginatedFeathersResponse<AutomationHistory>) => {
          setAutomationHistory(res);
          setIsLoading(false);
        },
        (error: Error) => {
          setIsLoading(false);
          message.error(t("automations.history.fetchError"));
          logger.error("Error in fetching automation history: ", error);
        },
      );
    }
  }, [visible, automationId, t]);

  return (
    <Modal
      title={
        <span className="s-modal-title">
          {t("automations.history.pageTitle")}
        </span>
      }
      visible={visible}
      onOk={handleClose}
      onCancel={handleClose}
      footer={null}
      closable={false}
    >
      <Table
        columns={columns}
        dataSource={automationHistory.data}
        loading={isLoading}
        locale={{
          emptyText: <Empty description={t("tables.noData")} />,
        }}
      />
    </Modal>
  );
};

export default ActiveAutomationHistory;
