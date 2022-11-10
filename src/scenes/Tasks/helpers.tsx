import {
  ApiOutlined,
  CalculatorOutlined,
  CalendarOutlined,
  DownCircleOutlined,
  FileOutlined,
  FontSizeOutlined,
  LinkOutlined,
  MailOutlined,
  PercentageOutlined,
  PhoneOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Checkbox, message } from "antd";
import i18next from "i18next";
import React, { CSSProperties } from "react";

import {
  ChecklistItem,
  CustomFieldType,
  PaginatedFeathersResponse,
  Task,
} from "../../types";

export const mainTasksRowSelection = (
  selectedRowKeys: string[],
  onRowSelectionChange: (rowIds: string[], action: "add" | "remove") => void,
  checkState: "all" | "some" | "disabled" | "none",
  selectAllButRepeating: (checkAllFlag: boolean) => void,
) => {
  const selectOneIfNotRepeating = (isSelected: boolean, row: Task) => {
    if (!row.isRecurring && !row.parentId) {
      if (isSelected) {
        onRowSelectionChange([row._id || ""], "add");
      } else {
        onRowSelectionChange([row._id || ""], "remove");
      }
    } else {
      message.info(i18next.t("tasks.openForBulkActions"));
    }
  };

  return {
    selectedRowKeys,
    columnTitle: (
      <Checkbox
        checked={checkState === "all"}
        indeterminate={checkState === "some"}
        onChange={(e) => selectAllButRepeating(e.target.checked)}
        disabled={checkState === "disabled"}
      />
    ),
    onSelect: (row: Task, isSelected: boolean) =>
      selectOneIfNotRepeating(isSelected, row),
  };
};

/**
 * Returns the completed percentage of a checklist as a number
 * @param items items of a checklist
 */
export const getChecklistProgress = (items = [] as ChecklistItem[]) =>
  Math.floor((items.filter((todo) => todo.isDone).length / items.length) * 100);

declare type BucketItemAction =
  | "createChecklistItem"
  | "updateChecklistItem"
  | "removeChecklistItem"
  | "createChecklist"
  | "createChecklistFromTemplate"
  | "updateChecklist"
  | "removeChecklist"
  | "createForm";
export interface BucketQuery {
  query: {
    action: BucketItemAction;
    docId?: string;
    checklistId?: string;
    itemId?: string;
  };
}

export const queryMaker = (
  action: BucketItemAction,
  params: { docId?: string; recordId?: string; itemId?: string },
): BucketQuery => {
  return {
    query: {
      action,
      ...params,
    },
  };
};

export const getCustomFieldIcon = (
  fieldType: CustomFieldType,
  className = "",
) => {
  if (fieldType === "dropdown") {
    return <DownCircleOutlined className={className} />;
  } else if (fieldType === "shortText") {
    return <FontSizeOutlined className={className} />;
  } else if (fieldType === "toggleSwitch") {
    return <ApiOutlined className={className} />;
  } else if (fieldType === "floatNumber") {
    return <CalculatorOutlined className={className} />;
  } else if (fieldType === "date") {
    return <CalendarOutlined className={className} />;
  } else if (fieldType === "file") {
    return <FileOutlined className={className} />;
  } else if (fieldType === "percentage") {
    return <PercentageOutlined className={className} />;
  } else if (fieldType === "email") {
    return <MailOutlined className={className} />;
  } else if (fieldType === "phone") {
    return <PhoneOutlined className={className} />;
  } else if (fieldType === "url") {
    return <LinkOutlined className={className} />;
  } else if (fieldType === "currency") {
    return <WalletOutlined className={className} />;
  }
};

export const CustomFormFieldTypes = [
  { type: "shortText", title: i18next.t("customForms.textInput") },
  { type: "floatNumber", title: i18next.t("customForms.numberInput") },
  { type: "dropdown", title: i18next.t("customForms.dropdown") },
  { type: "toggleSwitch", title: i18next.t("customForms.toggle") },
  { type: "date", title: i18next.t("customForms.date") },
  { type: "file", title: i18next.t("customForms.file") },
];

/**
 * Returns styled pagination component with next and prev buttons
 *
 * @param {number} page provided by ant design table
 * @param {string} type provided by ant design table
 * @param {number} active current page of the table
 * @param {boolean} isLast whether current page is the last page
 * @param {boolean} [largeSize=true] whether table is large sized
 * @returns styled pagination component
 */
export const getPaginationButtons = (
  page: number,
  type: string,
  active: number,
  isLast: boolean,
  largeSize = true,
) => {
  const style: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ...(type === "page" && +active === +page
      ? { color: "white", backgroundColor: "#1890FF" }
      : { height: largeSize ? "32px" : "22px" }),
  };

  if (type === "prev") {
    return (
      <div style={style}>
        <FontAwesomeIcon
          icon={faAngleLeft}
          className={
            "tw-text-2xl " +
            (active === 1 ? "tw-text-gray-300" : "s-icon-color") +
            (largeSize ? "" : " tw-mr-5")
          }
        />
      </div>
    );
  } else if (type === "next") {
    return (
      <div style={style}>
        <FontAwesomeIcon
          icon={faAngleRight}
          className={
            "tw-text-2xl " +
            (isLast ? "tw-text-gray-300" : "s-icon-color") +
            (largeSize ? "" : " tw-ml-5")
          }
        />
      </div>
    );
  } else {
    return <div style={style}>{page}</div>;
  }
};

export const tasksInitialState = {
  total: 0,
  limit: 50,
  skip: 0,
  data: [] as Task[],
} as PaginatedFeathersResponse<Task>;
