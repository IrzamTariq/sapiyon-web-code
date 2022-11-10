import { DatePicker, Input, InputNumber, Select, Switch } from "antd";
import i18next from "i18next";
import React from "react";

import { CustomField } from "../../types";

interface CustomFieldProps extends CustomField {
  placeholder?: string;
}

const getFieldInput = (field = {} as CustomFieldProps) => {
  const { type, placeholder = i18next.t("fields.enterValue") } = field;

  switch (type) {
    case "shortText":
      return (
        <Input
          placeholder={placeholder}
          className="st-field-color st-placeholder-color"
          allowClear
        />
      );
    case "toggleSwitch":
      return <Switch />;
    case "date":
      return (
        <DatePicker
          className="tw-w-full st-field-color st-placeholder-color"
          format={"YYYY-MM-DD"}
          allowClear
        />
      );
    case "dropdown":
      return Array.isArray(field.options) && field.options.length ? (
        <Select
          filterOption={(input, option: any) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
            0
          }
          placeholder={placeholder}
          className="tw-w-full s-tags-color st-field-color st-placeholder-color"
          mode="multiple"
          showSearch
          allowClear
        >
          {field.options.map((option: any) => (
            <Select.Option key={option._id} value={option.label}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      ) : (
        <Input
          placeholder={placeholder}
          className="tw-w-full st-field-color st-placeholder-color"
        />
      );
    case "tags":
      return (
        <Select
          mode="tags"
          placeholder={placeholder}
          className="tw-w-full s-tags-color st-field-color st-placeholder-color"
          maxTagCount={2}
          maxTagTextLength={7}
          allowClear
        />
      );
    case "phone":
      return (
        <Input
          placeholder={placeholder}
          type="tel"
          className="st-field-color st-placeholder-color"
          allowClear
        />
      );
    case "email":
      return (
        <Input
          placeholder={placeholder}
          type="email"
          className="st-field-color st-placeholder-color"
          allowClear
        />
      );
    case "url":
      return (
        <Input
          placeholder={placeholder}
          type="url"
          className="st-field-color st-placeholder-color"
          allowClear
        />
      );
    case "currency":
    case "percentage":
    case "floatNumber":
      return (
        <InputNumber
          placeholder={placeholder}
          className="tw-w-full st-field-color st-placeholder-color"
        />
      );
    default:
      return (
        <Input
          placeholder={placeholder}
          className="st-field-color st-placeholder-color"
          allowClear
        />
      );
  }
};

export default getFieldInput;
