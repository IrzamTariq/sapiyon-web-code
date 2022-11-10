import { Button, DatePicker, Form, Input, Select } from "antd";
import { debounce } from "rambdax";
import React from "react";
import { useTranslation } from "react-i18next";
import AutocompleteField from "utils/components/AutocompleteField";
import ElasticSearchField from "utils/components/ElasticSearchField";
import { getCustomerSelectInfo, getPresetDateRanges } from "utils/helpers";
import { getTaskStatusLabel } from "utils/helpers/utils";

export interface InvoiceFilters {
  dueAt: string[];
  title: string;
  statusIds: string[];
  customerIds: string[];
}
interface InvoiceFiltersFormProps {
  filters: InvoiceFilters;
  applyFilters: (filters: InvoiceFilters) => void;
}
export const areInvoiceFiltersEmpty = (filters: InvoiceFilters) => {
  return (
    Object.values(filters).filter((item = "") => item?.length > 0).length === 0
  );
};

const InvoiceFiltersForm = ({
  filters,
  applyFilters,
}: InvoiceFiltersFormProps) => {
  const [t] = useTranslation();
  const [form] = Form.useForm();

  const { customerIds, statusIds = [] } = filters;

  return (
    <Form
      name="invoice-filters-form"
      form={form}
      onValuesChange={debounce(
        (changes: Partial<InvoiceFilters>, all: InvoiceFilters) =>
          applyFilters(all),
        500,
      )}
      className="lg:tw-flex lg:tw-mt-0  tw-flex tw-items-center"
    >
      <Form.Item name="dueAt" className="tw-w-3/12 tw-mr-2 tw-mb-0">
        <DatePicker.RangePicker
          ranges={getPresetDateRanges()}
          className="tw-w-full st-field-color st-placeholder-color"
        />
      </Form.Item>
      <Form.Item
        name="title"
        className="tw-mr-2 tw-mb-0"
        style={{ width: "20%" }}
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
        style={{ width: "20%" }}
      >
        <AutocompleteField
          styleClasses="tw-w-full s-tags-color st-field-color st-placeholder-color"
          mode="multiple"
          maxTagCount={1}
          maxTagTextLength={2}
          placeholder={t("taskSubHeader.filterByStatus")}
          currentValue={statusIds}
          serviceUrl={"firm/task-status"}
          defaultQuery={{ category: "invoice" }}
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
        style={{ width: "20%" }}
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

      <Button
        type="primary"
        onClick={() => {
          form.resetFields();
          applyFilters({} as InvoiceFilters);
        }}
        disabled={areInvoiceFiltersEmpty(filters)}
        danger
      >
        {t("filters.clearFilters")}
      </Button>
    </Form>
  );
};

export default InvoiceFiltersForm;
