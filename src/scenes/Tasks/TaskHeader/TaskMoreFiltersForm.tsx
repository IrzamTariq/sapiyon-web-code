import { Checkbox, Col, Drawer, Form, Input, Row } from "antd";
import React, { useContext, useEffect } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import UserContext from "UserContext";

import { CustomField, UserContextType } from "../../../types";
import {
  mapCustomFieldValuesToFormFields,
  mapFormFieldValuesToCustomFields,
} from "../../../utils/helpers";
import getFieldInput from "../../../utils/helpers/getFieldInput";
import { CustomFieldFilter, TaskFilters } from "./TaskFiltersFormProps";

interface TaskMoreFiltersFormProps extends WithTranslation {
  filters: TaskFilters;
  visible: boolean;
  applyFilters: (filters: TaskFilters) => void;
  handleClose: () => void;
}

function TaskMoreFiltersForm({
  t,
  visible,
  handleClose,
  filters = {} as TaskFilters,
  applyFilters,
}: TaskMoreFiltersFormProps) {
  const { firm } = useContext(UserContext) as UserContextType;
  const [form] = Form.useForm();
  const taskCustomFields: CustomField[] = React.useMemo(
    () => firm?.forms?.tasks || [],
    // .sort((a, b) => (a?.rank > b?.rank ? 1 : -1)),
    [firm?.forms?.tasks],
  );
  useEffect(() => {
    if (visible) {
      const {
        fields = [],
        state = "",
        city = "",
        unassigned,
        unscheduled,
        recurringTasks,
        isRecurring,
      } = filters;
      const customFields = mapCustomFieldValuesToFormFields(
        taskCustomFields,
        fields as CustomField[],
      );
      const initValues = {
        unassigned,
        unscheduled,
        recurringTasks,
        isRecurring,
        state,
        city,
        ...customFields,
      };
      form.resetFields();
      form.setFieldsValue(initValues);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Drawer
      destroyOnClose={true}
      title={
        <span className="s-modal-title">{t("taskFilters.pageTitle")}</span>
      }
      visible={visible}
      onClose={handleClose}
      width={390}
      closable={false}
    >
      <Form
        form={form}
        name="task-more-filters-form"
        onValuesChange={(changed: TaskFilters) => {
          const { fields: older = [] } = filters;
          const { fields: cFields, ...rest } = changed;
          const newer = mapFormFieldValuesToCustomFields(
            taskCustomFields,
            cFields,
          ) as CustomFieldFilter[];
          const fields = newer.concat(
            older.filter((item) => !cFields?.hasOwnProperty(item._id)),
          );

          applyFilters({ fields, ...rest } as TaskFilters);
        }}
        className="tw-mb-16"
        labelCol={{ span: 24 }}
      >
        <Row>
          <Col>
            <Form.Item
              name="unscheduled"
              valuePropName="checked"
              className="tw-mb-0"
            >
              <Checkbox>{t("filters.unscheduled")}</Checkbox>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Item
              name="unassigned"
              valuePropName="checked"
              className="tw-mb-0"
            >
              <Checkbox>{t("filters.unassigned")}</Checkbox>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Item
              name="isRecurring"
              valuePropName="checked"
              className="tw-mb-0"
            >
              <Checkbox>{t("filters.showRepeatedOnly")}</Checkbox>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Item
              name="recurringTasks"
              valuePropName="checked"
              className="tw-mb-6"
            >
              <Checkbox>{t("filters.disbandRepeated")}</Checkbox>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name="state"
          label={
            <span className="tw-font-medium">{t("customerList.state")}</span>
          }
          className="tw-mb-8"
        >
          <Input
            placeholder={t("filters.byState")}
            className="st-field-color st-placeholder-color"
            allowClear
          />
        </Form.Item>
        <Form.Item
          name="city"
          label={
            <span className="tw-font-medium">{t("customerList.city")}</span>
          }
          className="tw-mb-8"
        >
          <Input
            placeholder={t("filters.byCity")}
            className="st-field-color st-placeholder-color"
            allowClear
          />
        </Form.Item>
        {Array.isArray(taskCustomFields) &&
          taskCustomFields
            // .filter((item: CustomField) => item.type !== "toggleSwitch")
            .map((field: CustomField = {} as CustomField) => {
              let options = {};
              if (field.type === "toggleSwitch") {
                options = { ...options, valuePropName: "checked" };
              }
              return (
                <Form.Item
                  name={["fields", field._id || ""]}
                  {...options}
                  key={field._id}
                  label={<span className="tw-font-medium">{field.label}</span>}
                  className="tw-mb-8"
                >
                  {getFieldInput(field)}
                </Form.Item>
              );
            })}
      </Form>
    </Drawer>
  );
}
export default withTranslation()(TaskMoreFiltersForm);
