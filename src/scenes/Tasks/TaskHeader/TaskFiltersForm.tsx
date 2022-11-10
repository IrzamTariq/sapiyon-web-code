import { Button, DatePicker, Form, Input, Select, Tooltip } from "antd";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { getPresetDateRanges, getUsername } from "utils/helpers";

import UserContext from "../../../UserContext";
import AutocompleteField from "../../../utils/components/AutocompleteField";
import ElasticSearchField from "../../../utils/components/ElasticSearchField";
import { getTaskStatusLabel } from "../../../utils/helpers/utils";
import areFiltersEmpty from "./areFiltersEmpty";
import { TaskFilters, TaskFiltersFormProps } from "./TaskFiltersFormProps";
import TaskMoreFiltersForm from "./TaskMoreFiltersForm";

const TaskFiltersForm = ({
  filters = {
    assigneeIds: [] as string[],
  } as TaskFilters,
  clearFilters,
  applyFilters,
  showRangePicker = true,
}: TaskFiltersFormProps) => {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const { hasPermission }: any = useContext(UserContext);
  const [moreFiltersVisible, setMoreFiltersVisible] = useState(false);

  const handleApplyMoreFilters = (values: TaskFilters) => {
    form.validateFields().then((val) => {
      applyFilters({ ...val, ...values });
    });
  };

  const { unassigned, unscheduled, assigneeIds = [], statusIds = [] } = filters;

  return (
    <div>
      <Form
        name="task-filters-form"
        form={form}
        onValuesChange={(changed: TaskFilters) => applyFilters(changed)}
        className="tw-flex"
        layout="horizontal"
      >
        <Form.Item
          name="searchTerm"
          className="tw-mr-2 tw-mb-0"
          style={{ width: "25%" }}
        >
          <Input
            placeholder={t("taskSubHeader.filterByDetails")}
            className="tw-w-full st-field-color st-placeholder-color"
            allowClear
          />
        </Form.Item>

        {showRangePicker && (
          <Form.Item
            name="endAt"
            className="tw-mr-2 tw-mb-0"
            style={{ width: "225px" }}
          >
            <DatePicker.RangePicker
              disabled={!!unscheduled}
              ranges={getPresetDateRanges()}
              className="tw-w-full st-field-color st-placeholder-color"
            />
          </Form.Item>
        )}

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
            defaultQuery={{ category: "task" }}
            serializeOptionsData
            transformOptionsData={[
              ({ _id, title, type, color }: any) => ({
                _id,
                title,
                type,
                color,
              }),
            ]}
            renderOptions={(items = [], Option: any) =>
              items.map((item) => (
                <Option key={item}>
                  {getTaskStatusLabel(JSON.parse(item))}
                </Option>
              ))
            }
          />
        </Form.Item>

        {hasPermission("canViewAllTasks") && (
          <Form.Item
            name="assigneeIds"
            className="tw-mr-2 tw-mb-0"
            style={{ width: "14%" }}
          >
            <ElasticSearchField
              disabled={!!unassigned}
              entity="users"
              currentValue={assigneeIds}
              mode="multiple"
              stringifyJSON={true}
              renderOptions={(options: string[]) =>
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
        )}
        <Form.Item className="tw-mr-2 tw-mb-0">
          <Tooltip placement="bottom" title={t("taskFilters.clear")}>
            <Button
              disabled={areFiltersEmpty(filters)}
              danger
              onClick={() => {
                form.resetFields();
                clearFilters();
              }}
            >
              {t("filters.clearFilters")}
            </Button>
          </Tooltip>
        </Form.Item>
        <Form.Item className="tw-mb-0">
          <Button type="default" onClick={() => setMoreFiltersVisible(true)}>
            {t("filters.moreFilters")}
          </Button>
        </Form.Item>
      </Form>

      <TaskMoreFiltersForm
        visible={moreFiltersVisible}
        filters={filters}
        handleClose={() => setMoreFiltersVisible(false)}
        applyFilters={handleApplyMoreFilters}
      />
    </div>
  );
};
export default TaskFiltersForm;
