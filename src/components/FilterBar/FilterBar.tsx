import { Button, Form } from "antd";
import { debounce } from "rambdax";
import React from "react";
import { useTranslation } from "react-i18next";
import { CustomField, CustomFieldType } from "types";
import getFieldInput from "utils/helpers/getFieldInput";

export const isFilterBarEmpty = (filters = {}) =>
  (Object.values(filters) || [])?.filter((val) => {
    if (typeof val === "string" || Array.isArray(val)) {
      return val && val.length > 0;
    } else if (typeof val === "object") {
      return (
        Object.values(val || {})?.filter(
          (item: any) => item && item?.length > 0,
        ).length > 0
      );
    } else {
      return false;
    }
  }).length === 0;

export interface FilterBarField {
  label: string;
  type: CustomFieldType;
  key: string;
  placeholder?: string;
  className?: string;
}

interface FilterBarProps {
  fields: FilterBarField[];
  styleClasses?: string;
  handleChange: (key: string, value: string) => void;
  resetFilters: () => void;
}

const FilterBar = ({
  fields = [],
  styleClasses = undefined,
  handleChange,
  resetFilters = () => null,
}: FilterBarProps) => {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const handleReset = () => {
    form.resetFields();
    resetFilters();
  };

  const { getFieldsValue } = form;

  return (
    <section
      className={
        styleClasses ||
        "lg:tw-flex tw-p-4 lg:tw-mt-0 tw-bg-white tw-border-t tw-border-b tw-w-full"
      }
    >
      <div className="tw-flex tw-flex-col lg:tw-flex-row tw-items-center tw-w-full">
        <Form
          form={form}
          className="tw-w-full"
          onValuesChange={debounce((delta: any) => {
            for (let key in delta) {
              if (key === "address") {
                for (let k in delta[key]) {
                  handleChange(`${key}.${k}`, delta[key][k]);
                }
              } else {
                handleChange(key, delta[key]);
              }
            }
          }, 500)}
        >
          {fields.map((field) => (
            <Form.Item
              name={field.key}
              key={field.key}
              className={"tw-inline-block tw-mb-0 " + (field.className || "")}
            >
              {getFieldInput((field as unknown) as CustomField)}
            </Form.Item>
          ))}
          <Button
            onClick={handleReset}
            disabled={isFilterBarEmpty(getFieldsValue())}
            danger
          >
            {t("taskSubHeader.clearFilter")}
          </Button>
        </Form>
      </div>
    </section>
  );
};

export default FilterBar;
