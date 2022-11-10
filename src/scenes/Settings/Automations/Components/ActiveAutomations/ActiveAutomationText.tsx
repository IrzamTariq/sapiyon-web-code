import { Popover } from "antd";
import i18next from "i18next";
import React from "react";
import { useTranslation } from "react-i18next";
import { Automation, AutomationAction, AutomationCause } from "types";
import { getTaskStatusLabel } from "utils/helpers/utils";

interface ActiveAutomationTextProps {
  automation: Automation;
}

const getTextString = (trigger: AutomationCause, action: AutomationAction) => {
  if (!trigger || !action) {
    return "";
  } else if (trigger === "taskCreated") {
    return i18next.t("automationText.taskCreated");
  } else if (action === "sendNPSMsg") {
    return i18next.t("automationText.sendNPSMsg");
  } else if (action === "sendTaskAssigneesTrackingURL") {
    return i18next.t("automationText.sendTaskAssigneesTrackingURL");
  } else {
    return i18next.t("automationText.informStatusUpdate");
  }
};

const ActiveAutomationText = ({ automation }: ActiveAutomationTextProps) => {
  const [t] = useTranslation();
  const {
    msgTemplate = "",
    trigger = "" as AutomationCause,
    actionToPerform = "" as AutomationAction,
    sendToAssignees,
    sendToCreator,
    sendToCustomer,
    otherRecipientIds = [],
    status = {},
  } = automation;
  const textString = getTextString(trigger, actionToPerform);
  let recipients = [];
  if (sendToAssignees) {
    recipients.push(t("automations.recipients.assignee"));
  }
  if (sendToCustomer) {
    recipients.push(t("automations.recipients.customer"));
  }
  if (sendToCreator) {
    recipients.push(t("automations.recipients.creator"));
  }
  if (otherRecipientIds.length > 0) {
    recipients.push(
      `+${otherRecipientIds.length} ${t("automations.active.more")}.`,
    );
  }
  const addedRecipients = textString.replace(
    "<thesePeople>",
    recipients.join(", "),
  );
  const addedStatus = addedRecipients.replace(
    "<thisStatus>",
    getTaskStatusLabel(status),
  );

  return (
    <span className="s-std-text tw-text-lg">
      {addedStatus.split("<this>")[0]}
      <Popover content={msgTemplate} overlayStyle={{ width: "300px" }}>
        <span className="tw-text-blue-500 s-pointer">
          {t("automations.active.this")}
        </span>
      </Popover>
      {addedStatus.split("<this>")[1]}
    </span>
  );
};

export default ActiveAutomationText;
