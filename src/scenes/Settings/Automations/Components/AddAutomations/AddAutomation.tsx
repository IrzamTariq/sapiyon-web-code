import i18next from "i18next";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Automation,
  AutomationAction,
  AutomationCause,
  UserContextType,
} from "types";
import UserContext from "UserContext";

import AddAutomationCard from "./AddAutomationCard";
import EditAutomationSMS from "./EditAutomationSMS";

interface AutomationCard {
  title: string;
  actionToPerform: AutomationAction;
  trigger: AutomationCause;
  msgTemplate: string;
}
// interface AddAutomationProps {}
const cards: AutomationCard[] = [
  {
    title: i18next.t("automations.addCard.jobCreate"),
    actionToPerform: "informSomeone",
    trigger: "taskCreated",
    msgTemplate: i18next.t("automations.add.taskCreateTemplate"),
  },
  {
    title: i18next.t("automations.addCard.locationTracking"),
    actionToPerform: "sendTaskAssigneesTrackingURL",
    trigger: "taskStatusUpdated",
    msgTemplate: i18next.t("automations.add.locationTrackingTemplate"),
  },
  {
    title: i18next.t("automations.addCard.statusUpdate"),
    actionToPerform: "informSomeone",
    trigger: "taskStatusUpdated",
    msgTemplate: i18next.t("automations.add.statusUpdateTemplate"),
  },
  {
    title: i18next.t("automations.addCard.NPSMsg"),
    actionToPerform: "sendNPSMsg",
    trigger: "taskStatusUpdated",
    msgTemplate: i18next.t("automations.add.npsTemplate"),
  },
];

const AddAutomation = () => {
  const [t] = useTranslation();
  const [state, setState] = useState({
    isEditingSMS: false,
    editedRecord: {} as Automation,
  });
  const { hasFeature } = useContext(UserContext) as UserContextType;

  return (
    <div>
      <div className="tw-flex tw-flex-wrap tw-justify-between">
        {cards.map((card, i) => (
          <div
            style={{ minWidth: "260px", width: "30%", marginBottom: "5%" }}
            key={i}
          >
            <AddAutomationCard
              {...card}
              onAdd={() =>
                setState({
                  isEditingSMS: true,
                  editedRecord: {
                    trigger: card.trigger,
                    actionToPerform: card.actionToPerform,
                    msgTemplate: card.msgTemplate,
                  } as Automation,
                })
              }
              disabled={
                card.actionToPerform === "sendNPSMsg" &&
                !hasFeature("taskCompletionFeedback")
              }
              disableMsg={
                card.actionToPerform === "sendNPSMsg"
                  ? t("automations.addCard.npsDisabled")
                  : ""
              }
            />
          </div>
        ))}
      </div>
      <EditAutomationSMS
        visible={!!state?.isEditingSMS}
        editedRecord={state.editedRecord}
        handleClose={() =>
          setState({ isEditingSMS: false, editedRecord: {} as Automation })
        }
      />
    </div>
  );
};

export default AddAutomation;
