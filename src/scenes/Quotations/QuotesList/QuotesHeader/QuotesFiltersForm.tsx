import { Button, DatePicker, Form, Input, Select } from "antd";
import { Moment } from "moment";
import { debounce } from "rambdax";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  getCustomerSelectInfo,
  getPresetDateRanges,
  getUsername,
} from "utils/helpers";

import AutocompleteField from "../../../../utils/components/AutocompleteField";
import ElasticSearchField from "../../../../utils/components/ElasticSearchField";
import { getTaskStatusLabel } from "../../../../utils/helpers/utils";

interface QuotesFiltersFormProps {
  filters: QuotesFilters;
  applyFilters: (filters: QuotesFilters) => void;
}

export interface QuotesFilters {
  createdAt: Moment[];
  title: string;
  customerIds: string[];
  statusIds: string[];
  createdByIds: string[];
}

export const areQuotesFiltersEmpty = (filters: QuotesFilters) => {
  return (
    Object.values(filters).filter((item = "") => item?.length > 0).length === 0
  );
};

const QuotesFiltersForm = ({
  filters,
  applyFilters,
}: QuotesFiltersFormProps) => {
  const [t] = useTranslation();
  const [form] = Form.useForm();

  const { customerIds, createdByIds = [], statusIds = [] } = filters;

  return (
    <Form
      name="quotes-filters-form"
      form={form}
      onValuesChange={debounce(
        (changes: Partial<QuotesFilters>, all: QuotesFilters) =>
          applyFilters(all),
        500,
      )}
      className="lg:tw-flex lg:tw-mt-0  tw-flex tw-items-center"
    >
      <Form.Item name="createdAt" className="tw-w-2/12 tw-mr-2 tw-mb-0">
        <DatePicker.RangePicker
          ranges={getPresetDateRanges()}
          className="tw-w-full st-field-color st-placeholder-color"
        />
      </Form.Item>
      <Form.Item
        name="title"
        className="tw-mr-2 tw-mb-0"
        style={{ width: "14%" }}
      >
        <Input
          allowClear
          placeholder={t("filters.searchByTitle")}
          className="tw-w-full st-field-color st-placeholder-color"
        />
      </Form.Item>
      <Form.Item
        name="statusIds"
        className="tw-mr-2 tw-mb-0"
        style={{ width: "14%" }}
      >
        <AutocompleteField
          styleClasses="tw-w-full s-tags-color st-field-color st-placeholder-color"
          mode="multiple"
          maxTagCount={1}
          maxTagTextLength={2}
          placeholder={t("taskSubHeader.filterByStatus")}
          currentValue={statusIds}
          serviceUrl={"firm/task-status"}
          defaultQuery={{ category: "quote" }}
          serializeOptionsData
          transformOptionsData={[
            //@ts-ignore
            ({ _id, title, type, color }) => ({ _id, title, type, color }),
          ]}
          renderOptions={(items = [], Option: typeof Select.Option) =>
            items.map((item) => (
              <Option key={item} value={item}>
                {getTaskStatusLabel(JSON.parse(item))}
              </Option>
            ))
          }
        />
      </Form.Item>
      <Form.Item
        name="customerIds"
        className="tw-mr-2 tw-mb-0"
        style={{ width: "14%" }}
      >
        <ElasticSearchField
          entity="customers"
          currentValue={customerIds}
          mode="multiple"
          stringifyJSON={true}
          renderOptions={(options) =>
            options.map((option) => {
              const parsed = JSON.parse(option);
              return (
                <Select.Option key={option} value={option}>
                  {getCustomerSelectInfo(parsed)}
                </Select.Option>
              );
            })
          }
          maxTagCount={1}
          maxTagTextLength={2}
          className="tw-w-full s-tags-color st-field-color st-placeholder-color"
          placeholder={t("taskSubHeader.filterByCustomer")}
        />
      </Form.Item>
      <Form.Item
        name="createdByIds"
        className="tw-mr-2 tw-mb-0"
        style={{ width: "14%" }}
      >
        <ElasticSearchField
          entity="users"
          currentValue={createdByIds}
          mode="multiple"
          stringifyJSON={true}
          renderOptions={(options) =>
            options.map((option) => (
              <Select.Option key={option} value={option}>
                {getUsername(JSON.parse(option))}
              </Select.Option>
            ))
          }
          maxTagCount={1}
          maxTagTextLength={2}
          className="tw-w-full s-tags-color st-field-color st-placeholder-color"
          placeholder={t("taskSubHeader.filterByEmployee")}
        />
      </Form.Item>
      <Button
        type="primary"
        onClick={() => {
          form.resetFields();
          applyFilters({} as QuotesFilters);
        }}
        disabled={areQuotesFiltersEmpty(filters)}
        danger
      >
        {t("filters.clearFilters")}
      </Button>
    </Form>
  );
};
export default QuotesFiltersForm;
