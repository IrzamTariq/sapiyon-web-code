import { DatePicker, Input, InputNumber, Select, Switch } from "antd";
import i18next from "i18next";
import moment from "moment";
import React from "react";

import { CustomFormField } from "../../../../../../types";
import FileInput from "./FileInput";

interface state {
  editingId?: string;
  newValue?: any;
}

export const getFieldInput = (
  field: CustomFormField,
  state: state,
  updateState: (change: state) => void,
  saveFieldValue: (newValue: any) => void,
) => {
  if (field.type === "toggleSwitch") {
    return (
      <Switch
        checked={!!field.value}
        onChange={(newValue) => saveFieldValue(newValue)}
        unCheckedChildren={i18next.t("global.no")}
        checkedChildren={i18next.t("global.yes")}
      />
    );
  } else if (field.type === "file") {
    return (
      <FileInput
        field={field}
        onChange={(newValue) => saveFieldValue(newValue)}
      />
    );
  } else if (field.type === "shortText") {
    return (
      <Input
        placeholder={field.label}
        value={state.newValue}
        onChange={(e) => {
          const newValue = e.target.value;
          updateState({ newValue });
        }}
        onPressEnter={() => saveFieldValue(state.newValue)}
        onBlur={() => saveFieldValue(state.newValue)}
        autoFocus
      />
    );
  } else if (field.type === "floatNumber") {
    return (
      <InputNumber
        placeholder={field.label}
        value={state.newValue || 0}
        className="tw-w-full"
        onChange={(newValue) => updateState({ newValue })}
        onPressEnter={() => saveFieldValue(state.newValue)}
        onBlur={() => saveFieldValue(state.newValue)}
        autoFocus
      />
    );
  } else if (field.type === "date") {
    return (
      <DatePicker
        format={"YYYY-MM-DD HH:mm"}
        showTime={true}
        allowClear
        placeholder={field.label}
        value={state.newValue ? moment(state.newValue) : null}
        onChange={(newValue) => saveFieldValue(newValue)}
        autoFocus
      />
    );
  } else if (field.type === "dropdown") {
    return (
      <Select
        placeholder={field.label}
        className="tw-w-full"
        value={state.newValue}
        onSelect={(newValue: string) => saveFieldValue(newValue)}
        onBlur={() => saveFieldValue(state.newValue)}
        autoFocus
      >
        {field?.options?.map((opt) => (
          <Select.Option key={opt._id} value={opt.label}>
            {opt.label}
          </Select.Option>
        ))}
      </Select>
    );
  } else {
    return "Invalid field";
  }
};

export const getFieldValue = (
  field: CustomFormField,
  updateState: (change: state) => void,
  saveFieldValue: (newValue: any) => void,
) => {
  if (field.type === "toggleSwitch") {
    return (
      <Switch
        checked={!!field.value}
        onChange={(newValue) => saveFieldValue(newValue)}
        unCheckedChildren={i18next.t("global.no")}
        checkedChildren={i18next.t("global.yes")}
      />
    );
  } else if (field.type === "file") {
    return (
      <FileInput
        field={field}
        onChange={(newValue) => saveFieldValue(newValue)}
      />
    );
  } else if (field.type === "shortText") {
    return (
      <div
        className="s-pointer"
        onClick={() =>
          updateState({ editingId: field._id, newValue: field.value })
        }
      >
        {!!field.value ? (
          <span className="s-main-text-color">{field.value}</span>
        ) : (
          <span className="s-light-text-color">{field.label}</span>
        )}
      </div>
    );
  } else if (field.type === "floatNumber") {
    return (
      <div
        className="s-pointer"
        onClick={() =>
          updateState({ editingId: field._id, newValue: field.value })
        }
      >
        {Number.isFinite(+field.value) ? (
          <span className="s-main-text-color">{field.value}</span>
        ) : (
          <span className="s-light-text-color">{field.label}</span>
        )}
      </div>
    );
  } else if (field.type === "date") {
    return (
      <div
        className="s-pointer"
        onClick={() =>
          updateState({ editingId: field._id, newValue: field.value })
        }
      >
        {!!field.value ? (
          <span className="s-main-text-color">
            {moment(field.value).format("DD/MM/YYYY HH:mm")}
          </span>
        ) : (
          <span className="s-light-text-color">{field.label}</span>
        )}
      </div>
    );
  } else if (field.type === "dropdown") {
    return (
      <div
        className="s-pointer"
        onClick={() =>
          updateState({ editingId: field._id, newValue: field.value })
        }
      >
        {!!field.value ? (
          <span className="s-main-text-color">
            {Array.isArray(field.value) ? field.value.join(", ") : field.value}
          </span>
        ) : (
          <span className="s-light-text-color">{field.label}</span>
        )}
      </div>
    );
  }
};
