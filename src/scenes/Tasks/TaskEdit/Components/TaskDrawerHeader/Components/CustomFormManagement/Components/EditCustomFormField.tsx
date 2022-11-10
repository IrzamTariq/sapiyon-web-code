import { DeleteOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, Modal, Row, Select } from "antd";
import React, { useEffect, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";

import { CustomFormField } from "../../../../../../../../types";
import { getRandomAlphaNumericString } from "../../../../../../../../utils/helpers";
import { CustomFormFieldTypes } from "../../../../../../helpers";

interface EditCustomFormFieldProps extends WithTranslation {
  visible: boolean;
  editedField: CustomFormField;
  saveField: (field: CustomFormField) => void;
  handleClose: () => void;
}

const EditCustomFormField = ({
  t,
  visible,
  saveField,
  editedField,
  handleClose,
}: EditCustomFormFieldProps) => {
  const [form] = Form.useForm();
  const [hasOptions, setHasOptions] = useState(false);
  useEffect(() => {
    if (visible) {
      const {
        label,
        type,
        options = [],
        _id = `NEW-${getRandomAlphaNumericString(10)}`,
      } = editedField || {};
      const initValues = {
        _id,
        label,
        type,
        options,
      };

      setHasOptions(type === "dropdown");
      form.setFieldsValue(initValues);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);
  const handleSubmit = () => {
    form.validateFields().then(
      (values) => {
        const { options, ...rest } = values;
        const data = {
          ...rest,
          options: rest.type !== "dropdown" ? [] : options,
        };
        saveField(data);
      },
      () => null,
    );
  };

  return (
    <Modal
      title={
        <span className="s-modal-title">{t("customForms.addFieldTitle")}</span>
      }
      visible={visible}
      onOk={handleSubmit}
      onCancel={handleClose}
      okText={t("customForms.addField")}
      cancelText={t("global.cancel")}
      okButtonProps={{ className: "tw-mr-2" }}
      bodyStyle={{ padding: "24px" }}
      destroyOnClose
    >
      <Form
        name="add-field-form"
        hideRequiredMark
        form={form}
        labelCol={{ span: 24 }}
      >
        <Form.Item name="_id" hidden noStyle>
          <Input />
        </Form.Item>
        <Form.Item
          name="label"
          rules={[{ required: true, message: t("customForms.fieldNameReq") }]}
          label={t("customForms.fieldName")}
        >
          <Input
            className="st-field-color st-placeholder-color"
            placeholder={t("customForms.enterFieldName")}
          />
        </Form.Item>
        <Form.Item
          name="type"
          rules={[{ required: true, message: t("customForms.fieldTypeReq") }]}
          label={t("customForms.fieldType")}
        >
          <Select
            onChange={(value) => {
              const isDropdown = value === "dropdown";
              setHasOptions(isDropdown);
              form.setFieldsValue({
                options: isDropdown ? [{ label: "" }] : [],
              });
            }}
            className="st-field-color st-placeholder-color"
            placeholder={t("customForms.selectAFieldType")}
            showArrow
          >
            {CustomFormFieldTypes.map((fieldType) => (
              <Select.Option value={fieldType.type} key={fieldType.type}>
                {fieldType.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <div style={{ display: hasOptions ? "block" : "none" }}>
          <Form.List name="options">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Row key={getRandomAlphaNumericString()}>
                    <Col span={22}>
                      <Form.Item
                        name={[field.name, "label"]}
                        rules={[
                          {
                            required: true,
                            whitespace: true,
                            message: t("customForms.enterOptionName"),
                          },
                        ]}
                      >
                        <Input placeholder={t("customForms.enterOptionName")} />
                      </Form.Item>
                    </Col>
                    <Col
                      span={2}
                      className="tw-justify-end"
                      style={{
                        display: fields.length === 1 ? "none" : "flex",
                      }}
                    >
                      <Button
                        onClick={() => remove(index)}
                        icon={<DeleteOutlined />}
                      />
                    </Col>
                  </Row>
                ))}
                <Button type="link" onClick={() => add()} className="px-0">
                  + {t("customForms.addOption")}
                </Button>
              </>
            )}
          </Form.List>
        </div>
      </Form>
    </Modal>
  );
};

export default withTranslation()(EditCustomFormField);
