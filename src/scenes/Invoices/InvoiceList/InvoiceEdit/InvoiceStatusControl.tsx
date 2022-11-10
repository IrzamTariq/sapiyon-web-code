import { DownOutlined } from "@ant-design/icons";
import mixpanel from "analytics/mixpanel";
import { Dropdown, Menu, message } from "antd";
import logger from "logger";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { InvoiceService, PDFService, TaskStatusService } from "services";
import {
  Invoice,
  PaginatedFeathersResponse,
  TaskStatus,
  UserContextType,
} from "types";
import UserContext from "UserContext";
import { getTaskStatusLabel, getTaskStatusStyles } from "utils/helpers/utils";

interface InvoiceStatusContorlProps {
  invoice: Invoice;
  onStatusChange: (changes: Partial<Invoice>) => void;
}

const InvoiceStatusContorl = ({
  invoice,
  onStatusChange,
}: InvoiceStatusContorlProps) => {
  const [t] = useTranslation();
  const [allStatuses, setAllStatuses] = useState([] as TaskStatus[]);
  const { hasPermission } = useContext(UserContext) as UserContextType;

  useEffect(() => {
    if (!!invoice._id) {
      TaskStatusService.find({
        query: { category: "invoice", $limit: 500 },
      }).then(
        (res: PaginatedFeathersResponse<TaskStatus>) => {
          setAllStatuses(res.data);
        },
        () => message.error(t("status.fetchError")),
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const updateStatus = (key: string) => {
    InvoiceService.patch(invoice._id, {
      statusId: key === "open" ? null : key,
    }).then(
      ({ statusId, status, ...rest }: Invoice) => {
        mixpanel.track("Invoice status updated", { _id: rest._id });
        message.success(t("global.statusUpdateSuccess"));
        onStatusChange({ statusId, status });
      },
      (error: Error) => {
        logger.error("Could not update status: ", error);
        message.error(t("global.statusUpdateError"));
      },
    );
  };
  const sendEmail = () => {
    message.loading({
      content: t("invoices.sendingEmail"),
      duration: 0,
      key: "mailingInvoice",
    });
    PDFService.create({
      type: "invoice",
      id: invoice.uid,
    }).then(
      () =>
        message.success({
          content: t("invoices.emailSent"),
          key: "mailingInvoice",
        }),
      () =>
        message.error({
          content: t("invoices.emailError"),
          key: "mailingInvoice",
        }),
    );
  };
  const availableStatuses: TaskStatus[] = allStatuses.filter(
    (status) => status._id !== invoice.statusId,
  );

  const userStatuses = ([] as JSX.Element[]).concat(
    availableStatuses
      .filter((item) => item.type !== "system")
      .map((item) => (
        <Menu.Item className="s-main-text-color" key={item._id}>
          {getTaskStatusLabel(item, t("Pending"))}
        </Menu.Item>
      )),
  );

  const systemStatuses = [
    <Menu.Divider key="divider1" />,
    <Menu.Item key="open" className="s-main-text-color">
      {t("Pending")}
    </Menu.Item>,
  ]
    .concat(
      availableStatuses
        .filter((item) => item.type === "system")
        .map((item) => (
          <Menu.Item className="s-main-text-color" key={item._id}>
            {getTaskStatusLabel(item, t("Pending"))}
          </Menu.Item>
        )),
    )
    .concat(<Menu.Item key="sendEmail">{t("status.sendEmail")}</Menu.Item>);

  const handleSelection = (key: string) => {
    if (key === "sendEmail") {
      sendEmail();
    } else {
      updateStatus(key);
    }
  };

  return (
    <Dropdown
      disabled={!hasPermission("canManageInvoices")}
      overlay={
        <Menu onClick={(e) => handleSelection(e.key as string)}>
          {userStatuses}

          {systemStatuses}
        </Menu>
      }
    >
      <div
        className="s-primary-btn-bg tw-text-white tw-inline-flex tw-items-center s-pointer"
        style={{
          ...getTaskStatusStyles(invoice.status),
          maxWidth: "160px",
        }}
        title={getTaskStatusLabel(invoice.status, t("Pending"))}
      >
        <div className="tw-truncate tw-mr-2">
          {getTaskStatusLabel(invoice.status, t("Pending"))}
        </div>
        <DownOutlined />
      </div>
    </Dropdown>
  );
};

export default InvoiceStatusContorl;
