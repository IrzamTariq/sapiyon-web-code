import { DeleteOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, Modal, Row, Select, message } from "antd";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { CustomField } from "../../types";
import {
  CustomFieldTypes,
  getRandomAlphaNumericString,
} from "../../utils/helpers";

interface EditFieldProps {
  handleOk: (field: CustomField) => void;
  handleCancel: () => void;
  visible: boolean;
  editedRecord: CustomField;
  loading: boolean;
}

const EditField = ({
  handleOk,
  handleCancel,
  visible,
  editedRecord,
  loading,
}: EditFieldProps) => {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const { validateFields } = form;
  const [hasOptions, setHasOptions] = useState(false);

  useEffect(() => {
    if (visible) {
      const { label, type, options = [], _id, rank } = editedRecord || {};
      setHasOptions(type === "dropdown");
      const initialValues = {
        _id,
        label,
        type,
        options,
        rank,
      };
      form.setFieldsValue(initialValues);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleSubmit = () => {
    validateFields().then(
      (values) => {
        const { options, ...rest } = values;
        const data = {
          ...rest,
          options: rest.type !== "dropdown" ? [] : options,
        };
        const destroyMessage = (save = false) => {
          message.destroy("typeChange");
          if (save) {
            handleOk(data);
          }
        };
        if (!!data._id && data.type !== editedRecord.type) {
          message.warning({
            content: (
              <div>
                {t("customfields.typeWarn")}
                <Button
                  size="small"
                  type="primary"
                  className="tw-mx-2"
                  onClick={() => destroyMessage(true)}
                >
                  {t("customfields.understood")}
                </Button>
                <Button size="small" onClick={() => destroyMessage(false)}>
                  {t("global.cancel")}
                </Button>
              </div>
            ),
            key: "typeChange",
            duration: 0,
            className: "s-anticon-v-align",
          });
        } else {
          handleOk(data);
        }
      },
      () => null,
    );
  };

  return (
    <Modal
      title={
        <span className="s-modal-title">{t("specialFields.pageTitle")}</span>
      }
      visible={visible}
      onCancel={() => {
        message.destroy("typeChange");
        handleCancel();
      }}
      onOk={handleSubmit}
      cancelText={t("global.cancel")}
      okText={t("global.ok")}
      bodyStyle={{ padding: "12px 24px" }}
      okButtonProps={{
        disabled: loading,
        loading,
        className: "s-btn-spinner-align tw-mr-2",
      }}
    >
      <Form form={form} labelCol={{ span: 24 }} hideRequiredMark>
        <Form.Item name="_id" noStyle hidden>
          <Input />
        </Form.Item>
        <Form.Item name="rank" noStyle hidden>
          <Input />
        </Form.Item>
        <Form.Item
          name="label"
          label={
            <span className="s-label-color">{t("customForms.fieldName")}</span>
          }
          className="s-label-margin mb-1"
          rules={[{ required: true, message: t("customForms.fieldNameReq") }]}
        >
          <Input
            placeholder={t("customForms.enterFieldName")}
            className="st-field-color st-placeholder-color"
          />
        </Form.Item>
        <Form.Item
          name="type"
          rules={[{ required: true, message: t("customForms.fieldTypeReq") }]}
          label={
            <span className="s-label-color">{t("customForms.fieldType")}</span>
          }
          className="s-label-margin"
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
            {CustomFieldTypes.map((fieldType) => (
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

export default EditField;
