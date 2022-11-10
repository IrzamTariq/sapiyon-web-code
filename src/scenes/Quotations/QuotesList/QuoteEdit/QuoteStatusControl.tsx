import { DownOutlined } from "@ant-design/icons";
import mixpanel from "analytics/mixpanel";
import { Dropdown, Menu, message } from "antd";
import logger from "logger";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PDFService, QuoteService, TaskStatusService } from "services";
import {
  PaginatedFeathersResponse,
  Quote,
  TaskStatus,
  UserContextType,
} from "types";
import UserContext from "UserContext";
import {
  getConversionStatusText,
  getTaskStatusLabel,
  getTaskStatusStyles,
} from "utils/helpers/utils";

interface QuoteStatusContorlProps {
  quote: Quote;
  onStatusChange: (changes: Partial<Quote>) => void;
  onConvertToTask: () => void;
  onConvertToInvoice: () => void;
}

const QuoteStatusContorl = ({
  quote,
  onStatusChange,
  onConvertToInvoice,
  onConvertToTask,
}: QuoteStatusContorlProps) => {
  const [t] = useTranslation();
  const [allStatuses, setAllStatuses] = useState([] as TaskStatus[]);
  const { hasPermission, hasFeature } = useContext(
    UserContext,
  ) as UserContextType;
  //   const completedStatusId = firm?.completedTaskStatusId;

  useEffect(() => {
    if (!!quote._id) {
      TaskStatusService.find({
        query: { category: "quote", $limit: 500 },
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
    QuoteService.patch(quote._id, {
      statusId: key === "open" ? null : key,
    }).then(
      ({ statusId, status, ...rest }: Quote) => {
        mixpanel.track("Quote status updated", { _id: rest._id });
        message.success(t("global.statusUpdateSuccess"));
        onStatusChange({ statusId, status });
      },
      (error: Error) => {
        logger.error("Could not update status: ", error);
        message.error(t("global.statusUpdateError"));
      },
    );
  };
  const sendEmail = (data: any) => {
    message.loading({
      content: t("quotes.sendingEmail"),
      duration: 0,
      key: "mailing",
    });
    PDFService.create(data).then(
      () =>
        message.success({
          content: t("quotes.emailSent"),
          key: "mailing",
        }),
      () =>
        message.error({
          content: t("quotes.emailError"),
          key: "mailing",
        }),
    );
  };

  const availableStatuses: TaskStatus[] = allStatuses.filter(
    (status) => status._id !== quote.statusId,
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

  let conversionOptions = [];
  if (hasPermission("canCreateTasks")) {
    conversionOptions.push(
      <Menu.Item className="s-main-text-color" key="convertToJob">
        {t("status.convertToJob")}
      </Menu.Item>,
    );
  }
  if (hasFeature("extendedTasks") && hasPermission("canManageInvoices")) {
    conversionOptions.push(
      <Menu.Item className="s-main-text-color" key="convertToInvoice">
        {t("status.convertToInvoice")}
      </Menu.Item>,
    );
  }

  if (conversionOptions.length > 0 && hasFeature("extendedTasks")) {
    conversionOptions.unshift(<Menu.Divider key="divider2" />);
  }

  const handleSelection = (key: string) => {
    if (key === "convertToInvoice") {
      onConvertToInvoice();
    } else if (key === "convertToJob") {
      onConvertToTask();
    } else if (key === "sendEmail") {
      sendEmail({
        type: "quote",
        id: quote.uid,
      });
    } else {
      updateStatus(key);
    }
  };

  return (
    <Dropdown
      overlay={
        <Menu onClick={(e) => handleSelection(e.key as string)}>
          {userStatuses}

          {systemStatuses}

          {conversionOptions}
        </Menu>
      }
    >
      <div
        className="s-primary-btn-bg tw-text-white tw-inline-flex tw-items-center s-pointer"
        style={{
          ...getTaskStatusStyles(quote.status, quote?.isInvoiceCreated),
          maxWidth: "160px",
        }}
        title={getConversionStatusText(quote, t("Pending"))}
      >
        <div className="tw-truncate tw-mr-2">
          {getConversionStatusText(quote, t("Pending"))}
        </div>
        <DownOutlined />
      </div>
    </Dropdown>
  );
};

export default QuoteStatusContorl;
