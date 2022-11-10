import { message } from "antd";
import mixpanel from "analytics/mixpanel";
import React, { useState } from "react";
import { withTranslation, WithTranslation } from "react-i18next";
import { ChecklistService } from "../../../../../services";
import {
  Checklist,
  ChecklistBucket,
  ChecklistItem,
} from "../../../../../types";
import { ChecklistsQuery } from "../../../helpers";
import ChecklistsView from "./Components/ChecklistsView";

interface ChecklistsContainerProps extends WithTranslation {
  checklists: Checklist[];
  updateChecklistBuckets: (change: { [s: string]: ChecklistBucket }) => void;
}

const ChecklistsContainer = ({
  t,
  checklists,
  updateChecklistBuckets,
}: ChecklistsContainerProps) => {
  const [state, setState] = useState({ editingId: "", updatedName: "" });

  const updateChecklist = (
    docId: string,
    data: Checklist,
    query: ChecklistsQuery,
  ) => {
    ChecklistService.patch(docId, data, query).then(
      (res: ChecklistBucket) => {
        mixpanel.track("Checklist updated");
        updateChecklistBuckets({ [res._id]: res });
        setState({ editingId: "", updatedName: "" });
      },
      (error: Error) => {
        // console.log("Couldn't update checklist: ", error);
        message.error(t("checklists.cantUpdateChecklist"));
      },
    );
  };
  const removeChecklist = (docId: string, query: ChecklistsQuery) => {
    ChecklistService.remove(docId, query).then(
      (res: ChecklistBucket) => {
        mixpanel.track("Checklist removed");
        updateChecklistBuckets({ [res._id]: res });
      },
      (error: Error) => message.error(t("checklists.cantDeleteChecklist")),
    );
  };
  const addChecklistItem = (data: ChecklistItem, query: ChecklistsQuery) => {
    ChecklistService.create(data, query).then(
      (res: ChecklistBucket) => {
        mixpanel.track("Checklist item created");
        updateChecklistBuckets({ [res._id]: res });
      },
      (error: Error) => message.error(t("checklists.item.createError")),
    );
  };
  const updateChecklistItem = (
    docId: string,
    item: ChecklistItem,
    query: ChecklistsQuery,
  ) => {
    ChecklistService.patch(docId, item, query).then(
      (res: ChecklistBucket) => {
        mixpanel.track("Checklist item updated");
        updateChecklistBuckets({ [res._id]: res });
      },
      (error: Error) => message.error(t("checklists.item.removeError")),
    );
  };
  const removeChecklistItem = (docId: string, query: ChecklistsQuery) => {
    ChecklistService.remove(docId, query).then(
      (res: ChecklistBucket) => {
        mixpanel.track("Checklist item removed");
        updateChecklistBuckets({ [res._id]: res });
      },
      (error: Error) => message.error(t("checklists.item.removeError")),
    );
  };

  return (
    <ChecklistsView
      {...state}
      updateState={(change) => setState((old) => ({ ...old, ...change }))}
      checklists={checklists}
      updateChecklist={updateChecklist}
      removeChecklist={removeChecklist}
      addChecklistItem={addChecklistItem}
      updateChecklistItem={updateChecklistItem}
      removeChecklistItem={removeChecklistItem}
    />
  );
};

export default withTranslation()(ChecklistsContainer);
