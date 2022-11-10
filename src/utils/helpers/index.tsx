import { Form as LegacyForm } from "@ant-design/compatible";
import { Tag, message } from "antd";
import { ColumnProps } from "antd/lib/table";
import i18next from "i18next";
import logger from "logger";
import moment, { Moment } from "moment";
import { Rule } from "rc-field-form/lib/interface";
import React from "react";
import RRule, { Frequency, rrulestr } from "rrule";

import {
  Activity,
  AppEnv,
  ColumnLayout,
  CustomField,
  CustomFieldType,
  Customer,
  FeatureFlags,
  Firm,
  PrintField,
  Task,
  TaskStatus,
  TaskStockLine,
  UploadedFile,
  User,
  UserPermissions,
  UserRole,
  entitiesWithElasticSearch,
} from "../../types";
import { currencyFormatter } from "./currencyFormatter";
import { getTaskStatusLabel, openTaskStatusColor } from "./utils";

export function apiBaseURL(path = "") {
  let url = "http://localhost:7860";
  if (isEnv("production")) {
    url = "https://app.sapiyon.com/api";
  }

  if (isEnv("test")) {
    url = "https://dev.sapiyon.com/api";
  }
  if (path.trim().length) {
    return `${url}/${path}`;
  }
  return `${url}`;
}

export function webBaseURL(subpath = "") {
  let url = "http://localhost:3000";

  if (process.env.REACT_APP_ENV === "test") {
    url = "http://dev.sapiyon.com";
  }

  if (process.env.REACT_APP_ENV === "development") {
    url = "http://dev.sapiyon.com";
  }

  if (process.env.REACT_APP_ENV === "staging") {
    url = "http://staging.sapiyon.com";
  }

  if (process.env.REACT_APP_ENV === "production") {
    url = "http://app.sapiyon.com";
  }

  subpath = subpath.trim();

  if (subpath.length > 0) {
    url = `${url}/${subpath}`;
  }
  return url;
}

export function customerPortalBaseURL(subpath = "") {
  let url = "http://localhost:3001";

  if (process.env.REACT_APP_ENV === "test") {
    url = "http://dev-customer.sapiyon.com";
  }

  if (process.env.REACT_APP_ENV === "development") {
    url = "http://dev-customer.sapiyon.com";
  }

  if (process.env.REACT_APP_ENV === "staging") {
    url = "http://customer.sapiyon.com";
  }

  if (process.env.REACT_APP_ENV === "production") {
    url = "http://customer.sapiyon.com";
  }

  subpath = subpath.trim();

  if (subpath.length > 0) {
    url = `${url}/${subpath}`;
  }
  return url;
}

export function s3BucketURL(file = {} as UploadedFile) {
  let baseUrl = "https://sapiyon-user-content.s3-eu-west-1.amazonaws.com";

  if (file.baseUrl) {
    baseUrl = file.baseUrl;
  }

  return baseUrl + "/" + file.url;
}

export function isOwner(role: UserRole) {
  return role && role.title === "Owner" && role.type === "system";
}

export function hasPermission(
  role = {} as UserRole,
  permission: UserPermissions,
) {
  if (isOwner(role)) {
    return true;
  }

  return role && role.permissions && role.permissions[permission] === true;
}

export function hasFeature(firm = {} as Firm, flag: FeatureFlags) {
  return firm && firm.featureFlags && firm.featureFlags[flag] === true;
}

export const geoJSONToLatLng = (coordinates = [] as number[]) => {
  const [lng, lat] = coordinates || [];
  return {
    lat: +lat || 0.0,
    lng: +lng || 0.0,
  };
};

export function geoJSONToString([lng, lat] = [] as number[]) {
  lng = +lng;
  lat = +lat;

  if (!Number.isNaN(lng) && !Number.isNaN(lat)) {
    return `${lat},${lng}`;
  }
}

export function latLngToGeoJSON(
  { lat, lng } = {} as { lat: number; lng: number },
) {
  return [lng, lat];
}

export function getBase64(file: File | Blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

export function isValidLocation(coordinates: string[] | number[]) {
  return (
    Array.isArray(coordinates) &&
    !Number.isNaN(Number.parseFloat(coordinates[0] as string)) &&
    !Number.isNaN(Number.parseFloat(coordinates[1] as string))
  );
}

export function isScrolled(elem: Element, scrollPercentage = 100) {
  return (
    (elem.scrollTop + elem.clientHeight) / elem.scrollHeight >=
    scrollPercentage / 100
  );
}

export function canFetchMore(limit: number, skip: number, total: number) {
  return limit + skip < total;
}

export function currentEnv() {
  return process.env.REACT_APP_ENV;
}

export function isEnv(env: AppEnv) {
  return currentEnv() === env;
}

export const isScreenLarge = () => {
  return window.innerWidth >= 1024;
};

export function getCustomerName(customer = {} as Customer) {
  if (customer.accountType === "business") {
    return customer.businessName || customer.contactPerson;
  }
  return customer.contactPerson || customer.businessName;
}

export const getRandomAlphaNumericString = (length = 10) =>
  new Array(length)
    .fill(0)
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("");

export const getTotalWithTax = (record = {} as TaskStockLine) => {
  const { taxPercentage, qty, unitPrice } = record;
  const taxRate = Number.isFinite(+taxPercentage) ? taxPercentage : 18;

  let amount = (qty || 0) * (unitPrice || 0);
  amount += (amount * taxRate) / 100;
  return amount;
};

export const getUnitPriceFromGrossTotal = (record = {} as TaskStockLine) => {
  // @ts-ignore
  const { taxPercentage, cost } = record;
  const taxRate = Number.isFinite(+taxPercentage) ? taxPercentage : 18;

  let grossTotal = +cost || 0;
  const unitPrice = (100 * grossTotal) / (100 + taxRate);
  return unitPrice;
};

export const getTaxAmount = (record = {} as TaskStockLine) => {
  const taxRate = Number.isFinite(+record.taxPercentage)
    ? record.taxPercentage
    : 18;

  return ((taxRate * (record.unitPrice || 0)) / 100) * (record.qty || 0);
};

export const getGrandTotalWithoutTax = (stock = [] as TaskStockLine[]) =>
  stock.reduce((acc, curr) => acc + (curr.unitPrice || 0) * (curr.qty || 0), 0);

export const getGrandTotalWithTax = (stock = [] as TaskStockLine[]) =>
  stock.reduce((acc, curr) => acc + getTotalWithTax(curr), 0);

export const getGrandTaxAmount = (
  stock = [] as TaskStockLine[],
  taxRate?: 1 | 8 | 18,
) => {
  let filtered = stock;
  if (Number.isFinite(taxRate)) {
    filtered = stock.filter((item) => (item.taxPercentage || 18) === taxRate);
  }

  return filtered.reduce((acc, curr) => acc + getTaxAmount(curr), 0);
};

export const getUsableScreenHeight = (usedHeight = 64) => {
  return {
    height: `calc(100vh - ${usedHeight}px)`,
  };
};

export const mapCustomFieldValuesToFormFields = (
  customFields = [] as CustomField[],
  fields = [] as CustomField[],
) => {
  const formFields = customFields.reduce((p, field) => {
    let value;

    let savedField = {} as CustomField;
    if (Array.isArray(fields)) {
      savedField =
        fields.find((item) => item._id === field._id) || ({} as CustomField);
    }

    if (field.type !== savedField.type) {
      value = undefined;
    } else if (field.type === "date") {
      value =
        savedField.value && moment(savedField.value).isValid()
          ? moment(savedField.value)
          : null;
    } else if (field.type === "toggleSwitch") {
      value = typeof savedField.value === "boolean" ? savedField.value : false;
    } else if (field.type === "dropdown") {
      if (Array.isArray(savedField.value)) {
        value = savedField.value;
      } else if (typeof savedField.value === "string") {
        value = [savedField.value];
      } else {
        value = [];
      }
    } else {
      value = savedField.value;
    }

    return {
      ...p,
      [`${field._id}`]: value,
    };
  }, {});
  return { fields: formFields };
};

export const mapCustomFieldValuesToFormFieldsLegacy = (
  customFields = [] as CustomField[],
  fields = [] as CustomField[],
) => {
  const formFields = customFields.reduce((p, field) => {
    let value;

    let savedField = {} as CustomField;
    if (Array.isArray(fields)) {
      savedField =
        fields.find((item) => item._id === field._id) || ({} as CustomField);
    }

    if (field.type !== savedField.type) {
      value = undefined;
    } else if (field.type === "date") {
      value =
        savedField.value && moment(savedField.value).isValid()
          ? moment(savedField.value)
          : null;
    } else if (field.type === "toggleSwitch") {
      value = typeof savedField.value === "boolean" ? savedField.value : false;
    } else if (field.type === "dropdown") {
      if (Array.isArray(savedField.value)) {
        value = savedField.value;
      } else if (typeof savedField.value === "string") {
        value = [savedField.value];
      } else {
        value = [];
      }
    } else {
      value = savedField.value;
    }

    return {
      ...p,
      [`fields.${field._id}`]: LegacyForm.createFormField({ value }),
    };
  }, {});
  return formFields;
};

export const mapFormFieldValuesToCustomFields = (
  customFields = [] as CustomField[],
  updatedFields = {} as { [fieldId: string]: any },
) => {
  let savedFields = [] as CustomField[];
  for (let _id in updatedFields) {
    let field = customFields.find((item) => item._id === _id);
    if (field) {
      savedFields = savedFields.concat({ ...field, value: updatedFields[_id] });
    }
  }
  return savedFields;
};

export const isTaskCompleted = (status: TaskStatus) => {
  return status?.title === "Completed" && status?.type === "system";
};
export const isTaskCancelled = (status: TaskStatus) => {
  return status?.title === "Cancelled" && status?.type === "system";
};

/**
 * determines if B is an proper subset of A
 * @param {string[]} A set a
 * @param {string[]} B set b
 * @returns {boolean} true if B is an proper subset of A, false otherwise
 */
export const isProperSubset = (A = [] as string[], B = [] as string[]) => {
  if (Array.isArray(A) && Array.isArray(B) && A.length > 0 && B.length > 0) {
    const intersection = B.filter((item) => A.includes(item));
    return intersection.length > 0 && intersection.length !== B.length;
  } else {
    return false;
  }
};

/**
 * determines if B is an improper subset of A
 * @param {string[]} A set
 * @param {string[]} B set b
 * @returns {boolean} true if B is an improper subset of A, false otherwise
 */
export const isImproperSubset = (A = [] as string[], B = [] as string[]) => {
  if (Array.isArray(A) && Array.isArray(B) && A.length > 0 && B.length > 0) {
    const intersection = B.filter((item) => A.includes(item));
    return intersection.length > 0 && intersection.length === B.length;
  } else {
    return false;
  }
};

/**
 * Returns the query syntax for elastic search
 *
 * @param {entitiesWithElasticSearch} entity
 * @param {string} searchTerm
 * @returns query object for elastic search
 */

export const elasticQueryMaker = (
  entity: entitiesWithElasticSearch,
  searchTerm: string,
  extraQuery = {},
) => ({
  query: {
    $service: entity,
    $multi_match: { $query: searchTerm },
    ...extraQuery,
  },
});

export const getFreqString = (freq: Frequency) => {
  if (freq === 0) {
    return "year";
  } else if (freq === 1) {
    return "month";
  } else if (freq === 2) {
    return "week";
  } else if (freq === 3) {
    return "day";
  } else if (freq === 4) {
    return "hour";
  } else if (freq === 5) {
    return "minute";
  }
};

export const validateRruleString = (task = {} as Task) => {
  const ruleString: string = task.rrule as string;
  if (
    !ruleString ||
    ruleString?.trim()?.length === 0 ||
    ruleString.includes("undefined")
  ) {
    logger.warn("Warning!, RRule string is invalid: ", task, ruleString);
    return false;
  }
  return true;
};

export const getRecurrenceLabel = (task: Task) => {
  if (typeof task.rrule === "string" && validateRruleString(task)) {
    const ruleString: string = task.rrule as string;
    const recurrence = rrulestr(ruleString);
    const freq = recurrence.options.freq;
    return i18next.t(
      `taskRepeat.${freq === 3 ? "daily" : getFreqString(freq) + "ly"}`,
    );
  } else if (task?.recurrence?.recurrenceType) {
    return i18next.t(`taskRepeat.${task.recurrence.recurrenceType}`);
  } else {
    message.warning({
      content: i18next
        .t("taskRepeat.reccurenceSettingsError")
        .replace("<taskId>", (task._id || "").substr(-5)),
      key: "invalidRRule",
    });
    return i18next.t("taskRepeat.repeatingJob");
  }
};

export const getReccurenceString = (task: Task) => {
  if (typeof task.rrule === "string" && validateRruleString(task)) {
    const ruleString = task.rrule;
    const recurrence = rrulestr(ruleString).options;
    const rule = new RRule(recurrence);
    const freq = recurrence.freq;
    const interval = recurrence.interval;
    const lastDay = rule.all().pop();
    return (
      i18next.t("taskRepeat.every") +
      " " +
      (freq === 5 ? "" : interval) +
      " " +
      i18next.t(`taskRepeat.${getFreqString(freq)}`) +
      ", " +
      moment(recurrence.dtstart).format("DD/MMM/YYYY HH:mm") +
      " - " +
      moment(lastDay).format("DD/MMM/YYYY HH:mm")
    );
  } else if (typeof task.rrule === "object") {
    const freq = task?.rrule?.freq;
    const interval = task?.rrule.interval || 1;
    if (freq > -1 && freq < 7) {
      const recurrence = new RRule(task.rrule);
      const lastDay = recurrence.all().pop();

      return (
        i18next.t("taskRepeat.every") +
        " " +
        (freq === 5 ? "" : interval) +
        " " +
        i18next.t(`taskRepeat.${getFreqString(freq)}`) +
        ", " +
        moment(recurrence.options.dtstart).format("DD/MMM/YYYY HH:mm") +
        " - " +
        moment(lastDay).format("DD/MMM/YYYY HH:mm")
      );
    }
  } else if (task?.recurrence?.recurrenceType) {
    return (
      i18next.t(`taskRepeat.${task.recurrence.recurrenceType}`) +
      ", " +
      moment(task?.recurrence.startAt).format("DD/MMM/YYYY HH:mm") +
      " - " +
      moment(task?.recurrence.endAt).format("DD/MMM/YYYY HH:mm")
    );
  }
  message.warning({
    content: i18next
      .t("taskRepeat.reccurenceSettingsError")
      .replace("<taskId>", (task._id || "").substr(-5)),
    key: "invalidRRule",
  });
  return i18next.t("taskRepeat.repeatingJob");
};

export const getPresetDateRanges = (): {
  [rangeName: string]: [Moment, Moment];
} => {
  const now = moment();

  return {
    [i18next.t("datePresets.today")]: [
      now.clone().startOf("day"),
      now.clone().endOf("day"),
    ],
    [i18next.t("datePresets.tomorrow")]: [
      now.clone().add(1, "day").startOf("day"),
      now.clone().add(1, "day").endOf("day"),
    ],
    [i18next.t("datePresets.thisWeek")]: [
      now.clone().startOf("week"),
      now.clone().endOf("week"),
    ],
    [i18next.t("datePresets.coming7Days")]: [
      now.clone().add(1, "day").startOf("day"),
      now.clone().add(7, "day").endOf("day"),
    ],
    [i18next.t("datePresets.thisMonth")]: [
      now.clone().startOf("month"),
      now.clone().endOf("month"),
    ],
    [i18next.t("datePresets.coming30Days")]: [
      now.clone().add(1, "day").startOf("day"),
      now.clone().add(30, "day").endOf("day"),
    ],
    [i18next.t("datePresets.yesterday")]: [
      now.clone().add(-1, "day").startOf("day"),
      now.clone().add(-1, "day").endOf("day"),
    ],
    [i18next.t("datePresets.lastWeek")]: [
      now.clone().add(-1, "week").startOf("week"),
      now.clone().add(-1, "week").endOf("week"),
    ],
    [i18next.t("datePresets.last7Days")]: [
      now.clone().add(-7, "day").startOf("day"),
      now.clone().add(-1, "day").endOf("day"),
    ],
    [i18next.t("datePresets.lastMonth")]: [
      now.clone().add(-1, "month").startOf("month"),
      now.clone().add(-1, "month").endOf("month"),
    ],
    [i18next.t("datePresets.last30Days")]: [
      now.clone().add(-30, "day").startOf("day"),
      now.clone().add(-1, "day").endOf("day"),
    ],
    [i18next.t("datePresets.thisYear")]: [
      now.clone().startOf("year"),
      now.clone().endOf("year"),
    ],
    [i18next.t("datePresets.lastYear")]: [
      now.clone().add(-1, "year").startOf("year"),
      now.clone().add(-1, "year").endOf("year"),
    ],
  };
};

export const getCustomerSelectInfo = (customer = {} as Customer) => {
  let info = "";
  info = info.concat(getCustomerName(customer));
  if (customer.accountType === "business" && !!customer.contactPerson) {
    info = info.concat(` - ${customer.contactPerson}`);
  }
  if (!!customer.email) {
    info = info.concat(` - ${customer.email}`);
  }
  if (!!customer.phone) {
    info = info.concat(` - ${customer.phone}`);
  }
  return info;
};

export const getUserActivityStatement = (activity = {} as Activity) => {
  const { type } = activity;
  let statement = "";
  switch (type) {
    case "TaskCreated":
      statement = i18next.t("taskActivityStmt.TaskCreated");
      break;
    case "TaskUpdated":
      statement = i18next.t("taskActivityStmt.TaskUpdated");
      break;
    case "TaskFileCreated":
      statement = i18next.t("taskActivityStmt.TaskFileCreated");
      break;
    case "TaskFileRemoved":
      statement = i18next.t("taskActivityStmt.TaskFileRemoved");
      break;
    case "TaskNoteCreated":
      statement = i18next.t("taskActivityStmt.TaskNoteCreated");
      break;
    case "TaskNoteUpdated":
      statement = i18next.t("taskActivityStmt.TaskNoteUpdated");
      break;
    case "TaskNoteRemoved":
      statement = i18next.t("taskActivityStmt.TaskNoteRemoved");
      break;
    case "TaskAssigneesUpdated":
      statement = i18next.t("taskActivityStmt.TaskAssigneesUpdated");
      break;
    case "TaskStatusUpdated":
      statement = i18next.t("taskActivityStmt.TaskStatusUpdated");
      break;
    case "TaskRemoved":
      statement = i18next.t("taskActivityStmt.TaskRemoved");
      break;

    default:
      statement = "";
  }
  return statement;
};
export const getUserActivityStatementBody = (activity = {} as Activity) => {
  const {
    type,
    file,
    note,
    status,
    addedAssignees = [],
    removedAssignees = [],
  } = activity;
  let body = null;
  switch (type) {
    case "TaskFileCreated":
    case "TaskFileRemoved":
      body = (
        <a
          href={s3BucketURL(file)}
          target="_blank"
          rel="noreferrer"
          className="tw-text-blue-600"
        >
          {i18next.t("activities.viewFile")}
        </a>
      );
      break;
    case "TaskNoteCreated":
      body = <div>{note?.body}</div>;
      break;
    case "TaskNoteUpdated":
      body = <div>{note?.body}</div>;
      break;
    case "TaskNoteRemoved":
      body = <div>{note?.body}</div>;
      break;
    case "TaskAssigneesUpdated":
      body = (
        <div>
          {addedAssignees.length > 0 ? (
            <div>
              {i18next.t("activities.addedAssignees")}:{" "}
              {addedAssignees
                .map((assignee) => getUsername(assignee))
                .join(" | ")}
            </div>
          ) : null}
          {removedAssignees.length > 0 ? (
            <div>
              {i18next.t("activities.removedAssignees")}:{" "}
              {removedAssignees
                .map((assignee) => getUsername(assignee))
                .join(" | ")}
            </div>
          ) : null}
        </div>
      );
      break;
    case "TaskStatusUpdated":
      body = (
        <div>
          {i18next.t("activities.newStatus")}:
          <Tag className="tw-ml-2" color={status?.color || openTaskStatusColor}>
            {getTaskStatusLabel(status)}
          </Tag>
        </div>
      );
      break;

    default:
      body = null;
  }
  return !!body ? <div className="tw-mt-1">{body}</div> : null;
};

export const getUsername = (
  user = {} as User,
  fallback = i18next.t("global.unknown"),
) => user.fullName || user.email || fallback;

export const isColorWhite = (color = "") =>
  !color ||
  color === "#fff" ||
  color === "#ffffff" ||
  color === "rgb(255, 255, 255)" ||
  color === "rgba(255, 255, 255, 1)";

export const getUTCHours = (input = 0) => {
  const desiredHour = +input;
  const correction = Math.round(new Date().getTimezoneOffset() / 60);
  let corrected = desiredHour + correction;
  if (corrected < 0) {
    corrected += corrected;
  } else if (corrected > 23) {
    corrected -= 23;
  }
  return corrected;
};

export const getLocalHours = (input = 0) => {
  const desiredHour = +input;
  const correction = Math.round(new Date().getTimezoneOffset() / 60);
  let corrected = desiredHour - correction;
  if (corrected < 0) {
    corrected += corrected;
  } else if (corrected > 23) {
    corrected -= 23;
  }
  return corrected;
};

export const SystemTaskFields: PrintField[] = [
  { _id: "title", label: i18next.t("taskList.title"), shouldPrint: true },
  { _id: "customer", label: i18next.t("PDFPrint.customer"), shouldPrint: true },
  { _id: "dueDate", label: i18next.t("taskList.dueDate"), shouldPrint: true },
  {
    _id: "assignees",
    label: i18next.t("taskList.assignee"),
    shouldPrint: true,
  },
  { _id: "taskId", label: i18next.t("PDFPrint.jobId"), shouldPrint: true },
  { _id: "status", label: i18next.t("taskList.status"), shouldPrint: true },
  {
    _id: "stock",
    label: i18next.t("taskEdit.stockTabLabel"),
    shouldPrint: true,
  },
  { _id: "remarks", label: i18next.t("PDFPrint.remarks"), shouldPrint: true },
];
export const TaskAttacheMents: PrintField[] = [
  { _id: "images", label: i18next.t("pdf.attachedImages"), shouldPrint: true },
  {
    _id: "checklists",
    label: i18next.t("checklists.pageTitle"),
    shouldPrint: true,
  },
  {
    _id: "subtasks",
    label: i18next.t("subtasks.pageTitle"),
    shouldPrint: true,
  },
  { _id: "forms", label: i18next.t("customForms.forms"), shouldPrint: true },
  { _id: "notes", label: i18next.t("taskEdit.tabComments"), shouldPrint: true },
  {
    _id: "signatures",
    label: i18next.t("taskEdit.signatures"),
    shouldPrint: true,
  },
];

export const renderCustomFieldAsComponent = (
  type: CustomFieldType,
  value: string,
  firm: Firm,
) => {
  if (type === "phone") {
    return (
      <a
        href={`tel:${value}`}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
      >
        {value}
      </a>
    );
  } else if (type === "currency") {
    return <span>{currencyFormatter(+value, false, firm.currencyFormat)}</span>;
  } else if (type === "email") {
    return (
      <a
        href={`mailto:${value}`}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
      >
        {value}
      </a>
    );
  } else if (type === "percentage") {
    return <span>{Number(value).toFixed(2)}%</span>;
  } else if (type === "url") {
    return (
      <a
        href={`${value}`}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
      >
        {value}
      </a>
    );
  }
  return value;
};

export const getCustomFieldValue = (
  customField = {} as CustomField,
  renderAsNode: boolean,
  firm: Firm,
) => {
  const { type, value } = customField;
  let returnValue = "";
  if (!type) {
    returnValue = "";
  } else if (type === "date") {
    returnValue = value ? moment(value).format("DD/MM/YYYY HH:mm") : "";
  } else if (type === "dropdown") {
    let val = value || [];
    if (Array.isArray(val)) {
      returnValue = val.join(", ");
    } else {
      returnValue = val;
    }
  } else if (type === "toggleSwitch") {
    returnValue =
      value === true ? i18next.t("global.yes") : i18next.t("global.no");
  } else {
    returnValue = value ?? "";
  }

  if (renderAsNode) {
    return renderCustomFieldAsComponent(type, returnValue, firm);
  } else {
    return returnValue;
  }
};

export /**
 *
 *
 * @template T - record type
 * @param {CustomField[]} customFields - all custom fields
 * @returns {ColumnProps<T>[]} - Array of styleld antd columns for custom field values
 */
const mapCustomFieldValuesToColumns = <T extends { fields: CustomField[] }>(
  customFields = [] as CustomField[],
  firm: Firm,
): ColumnProps<T>[] =>
  customFields.map((field) => ({
    title: field.label,
    dataIndex: field._id,
    render: (text: any, record) => {
      let savedField = record?.fields?.find((item) => item._id === field._id);

      return (
        <div
          className="tw-truncate"
          style={{ width: "inherit" }}
          title={getCustomFieldValue(savedField, false, firm) as string}
        >
          {getCustomFieldValue(savedField, true, firm)}
        </div>
      );
    },
  }));

export const getDataIndex = <T,>(col: ColumnProps<T>, resolveArray = false) => {
  const dataIndex = col.dataIndex || "";
  if (resolveArray && Array.isArray(dataIndex)) {
    return dataIndex.join(".");
  }
  return dataIndex;
};

export const getOrderedColumns = <T,>(
  columns = {} as ColumnProps<T>[],
  layout = [] as ColumnLayout[],
) => {
  if (layout.length === 0) {
    return columns;
  }
  const byDataIndices: {
    [dataIndex: string]: ColumnLayout;
  } = layout.reduce((acc, curr) => ({ ...acc, [curr.dataIndex]: curr }), {});

  return columns
    .sort((a, b) => {
      if (byDataIndices[getDataIndex(a, true) as string]?.order === undefined) {
        return 1;
      }
      return byDataIndices[getDataIndex(a, true) as string]?.order >
        byDataIndices[getDataIndex(b, true) as string]?.order
        ? 1
        : -1;
    })
    .map((item) => ({
      ...item,
      cellWidth: byDataIndices[getDataIndex(item, true) as string]?.size || 350,
    }))
    .filter(
      (item) => !byDataIndices[getDataIndex(item, true) as string]?.isHidden,
    );
};

export const hasAddresses = (customer = {} as Customer) => {
  return Array.isArray(customer.addressIds) && customer.addressIds.length > 0;
};
export const getHomeAddressLabel = (customer = {} as Customer) => {
  return customer.address.tag || i18next.t("customer.defaultAddressLabel");
};

export const getPercentage = (partial = 0, total = 0) =>
  !total ? 0 : +((partial / total) * 100).toFixed(2);

export const getAmountFromPercentageTotal = (percentage = 0, total = 0) =>
  +((percentage * total) / 100).toFixed(2);

export const CustomFieldFormNames = [
  "invoices",
  "quotes",
  "rfq",
  "stockItems",
  "customers",
  "users",
  "taskCustomerFeedback",
  "tasks",
  "taskStock",
];
export const CustomFieldTypes: { type: CustomFieldType; title: string }[] = [
  { type: "shortText", title: i18next.t("customForms.textInput") },
  { type: "floatNumber", title: i18next.t("customForms.numberInput") },
  { type: "dropdown", title: i18next.t("customForms.dropdown") },
  { type: "toggleSwitch", title: i18next.t("customForms.toggle") },
  { type: "date", title: i18next.t("customForms.date") },
  { type: "phone", title: i18next.t("customFields.telephone") },
  { type: "email", title: i18next.t("customFields.email") },
  { type: "url", title: i18next.t("customFields.URL") },
  { type: "currency", title: i18next.t("customFields.currency") },
  { type: "percentage", title: i18next.t("customFields.percentage") },
];

export const getCustomFieldRules = (field = {} as CustomField): Rule[] => {
  const { type } = field;
  const rules: Rule[] = [];
  if (type === "phone") {
    rules.push({
      pattern: /^[0-9]+$/,
      message: i18next.t("customFields.phoneValidation"),
    });
  } else if (type === "email") {
    rules.push({
      type: "email",
      message: i18next.t("customFields.emailValidation"),
    });
  } else if (type === "url") {
    rules.push({
      type: "url",
      message: i18next.t("customFields.URLValidation"),
    });
  } else if (type === "percentage") {
    rules.push({
      type: "number",
      min: 0.0,
      max: 100.0,
      message: i18next.t("customFields.percentageValidation"),
    });
  }
  return rules;
};

export const arrayToChunks = (inputArr = [] as any[], chunkSize = 100) => {
  let arr = Array.from(inputArr);
  let chunks = [] as any[];

  while (arr.length > chunkSize) {
    chunks.push(arr.splice(0, chunkSize));
  }
  chunks.push(arr);
  return chunks;
};

export const getDiscountAmount = (task = {} as Task) => {
  const discountType = task.discountType;
  const discountValue = task.discount || 0;
  const totalAmount = getGrandTotalWithTax(task.stock) || 0;
  if (discountType === "fixed") {
    return discountValue;
  } else if (discountType === "%") {
    return getAmountFromPercentageTotal(discountValue, totalAmount);
  }
  return 0;
};

export const getActivePath = (key: string) => {
  switch (key) {
    case "dashboard":
      return "/dashboard";
    case "task-list":
      return "/task-list";
    case "task-map":
      return "/task-map";
    case "task-calendar":
      return "/task-calendar";
    case "rfqs":
      return "/rfqs";
    case "quotes":
      return "/quotes";
    case "invoices":
      return "/invoices";
    case "feedback":
      return "/feedback";
    case "customers-list":
      return "/customers?tab=list";
    case "customers-locations":
      return "/customers?tab=addresses";
    case "employees":
      return "/employees";
    case "products":
      return "/products?tab=products";
    case "services":
      return "/services";
    case "accounting":
      return "/accounting";
    case "reports":
      return "/reports";
    case "settings":
      return "/settings";
    case "jobsByDate":
      return "/reports/jobs/by-date";
    case "jobsByStatus":
      return "/reports/jobs/by-status";
    case "jobsByUsers":
      return "/reports/jobs/by-users";
    case "jobsByCustomers":
      return "/reports/jobs/by-customers";
    case "customerByLocation":
      return "/reports/customers/by-location";
    case "serviceGeneral":
      return "/reports/services/general";
    case "serviceByDate":
      return "/reports/services/by-date";
    case "productsGeneral":
      return "/reports/products/general";
    case "productsByWarehouse":
      return "/reports/products/by-warehouse";
    case "productsByDate":
      return "/reports/products/by-date";
    case "status":
      return "/settings";
    case "expenseCodes":
      return "/settings/expense-codes";
    case "teams":
      return "/settings/team/teams";
    case "roles":
      return "/settings/team/roles";
    case "permissions":
      return "/settings/team/permissions";
    case "businessProfile":
      return "/settings/account/business-profile";
    case "password":
      return "/settings/account/password-reset";
    case "currentPlan":
      return "/settings/billing/current-plan";
    case "general":
      return "/settings/app/general";
    case "smsIntegration":
      return "/settings/integrations/sms";
    case "parasutIntegration":
      return "/settings/integrations/parasut";
    case "automations":
      return "/settings/automations";
    default:
      return "/dashboard";
  }
};
