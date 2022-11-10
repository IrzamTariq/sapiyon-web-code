import { DownOutlined } from "@ant-design/icons";
import mixpanel from "analytics/mixpanel";
import { Dropdown, Menu, message } from "antd";
import logger from "logger";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RFQService, TaskStatusService } from "services";
import {
  PaginatedFeathersResponse,
  RFQ,
  TaskStatus,
  UserContextType,
} from "types";
import UserContext from "UserContext";
import {
  getConversionStatusText,
  getTaskStatusLabel,
  getTaskStatusStyles,
} from "utils/helpers/utils";

interface RFQStatusContorlProps {
  rfq: RFQ;
  onStatusChange: (changes: Partial<RFQ>) => void;
  onConvertToQuote: () => void;
  onConvertToTask: () => void;
}

const RFQStatusContorl = ({
  rfq,
  onStatusChange,
  onConvertToQuote,
  onConvertToTask,
}: RFQStatusContorlProps) => {
  const [t] = useTranslation();
  const [allStatuses, setAllStatuses] = useState([] as TaskStatus[]);
  const { hasPermission, hasFeature } = useContext(
    UserContext,
  ) as UserContextType;
  //   const completedStatusId = firm?.completedTaskStatusId;

  useEffect(() => {
    if (!!rfq._id) {
      TaskStatusService.find({ query: { category: "rfq", $limit: 500 } }).then(
        (res: PaginatedFeathersResponse<TaskStatus>) => {
          setAllStatuses(res.data);
        },
        () => message.error(t("status.fetchError")),
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const updateStatus = (key: string) => {
    RFQService.patch(rfq._id, {
      statusId: key === "open" ? null : key,
    }).then(
      ({ statusId, status, ...rest }: RFQ) => {
        mixpanel.track("RFQ status updated", { _id: rest._id });
        message.success(t("global.statusUpdateSuccess"));
        onStatusChange({ statusId, status });
      },
      (error: Error) => {
        logger.error("Could not update status: ", error);
        message.error(t("global.statusUpdateError"));
      },
    );
  };

  const availableStatuses: TaskStatus[] = allStatuses.filter(
    (status) => status._id !== rfq.statusId,
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
  ].concat(
    availableStatuses
      .filter((item) => item.type === "system")
      .map((item) => (
        <Menu.Item className="s-main-text-color" key={item._id}>
          {getTaskStatusLabel(item, t("Pending"))}
        </Menu.Item>
      )),
  );

  let conversionOptions = [] as any[];
  if (hasPermission("canCreateTasks")) {
    conversionOptions.push(
      <Menu.Item className="s-main-text-color" key="convertToJob">
        {t("status.convertToJob")}
      </Menu.Item>,
    );
  }
  if (hasFeature("extendedTasks") && hasPermission("canManageQuotes")) {
    conversionOptions.push(
      <Menu.Item className="s-main-text-color" key="convertToQuote">
        {t("status.convertToQuote")}
      </Menu.Item>,
    );
  }

  if (conversionOptions.length > 0) {
    conversionOptions.unshift(<Menu.Divider key="divider2" />);
  } else {
    conversionOptions = [];
  }

  const handleSelection = (key: string) => {
    if (key === "convertToQuote") {
      onConvertToQuote();
    } else if (key === "convertToJob") {
      onConvertToTask();
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
          ...getTaskStatusStyles(rfq.status, rfq?.isInvoiceCreated),
          maxWidth: "160px",
        }}
        title={getConversionStatusText(rfq, t("Pending"))}
      >
        <div className="tw-truncate tw-mr-2">
          {getConversionStatusText(rfq, t("Pending"))}
        </div>
        <DownOutlined />
      </div>
    </Dropdown>
  );
};

export default RFQStatusContorl;
