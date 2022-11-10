import { Button, Form, Select, message } from "antd";
import React, { useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";

import { CustomForm } from "../../../../../../../../types";

interface AddCustomFormProps extends WithTranslation {
  templates: CustomForm[];
  handleClose: () => void;
  addFormTemplate: (templateId: string) => void;
}

const AddCustomForm = ({
  t,
  templates,
  addFormTemplate,
  handleClose,
}: AddCustomFormProps) => {
  const [choice, setChoice] = useState<undefined | string>(undefined);
  const handleSubmit = () => {
    return !!choice
      ? addFormTemplate(choice || "")
      : message.error(t("customForms.noTemplateSelected"));
  };

  return (
    <>
      <Form className="s-modal-body-p-16" labelCol={{ span: 24 }}>
        <Form.Item
          label={t("customForms.formTemplates")}
          className="s-label-margin"
        >
          <Select
            showArrow
            className="st-placeholder-color"
            placeholder={t("customForms.selectFromTemplates")}
            value={choice}
            onSelect={setChoice}
          >
            {templates?.map((form) => (
              <Select.Option key={form._id} value={form._id || ""}>
                {form.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
      <div className="tw-flex tw-justify-end tw-mt-6 s-modal-footer">
        <Button type="default" className="tw-mr-2" onClick={handleClose}>
          {t("global.cancel")}
        </Button>
        <Button type="primary" onClick={handleSubmit}>
          {t("customForms.addForm")}
        </Button>
      </div>
    </>
  );
};

export default withTranslation()(AddCustomForm);
