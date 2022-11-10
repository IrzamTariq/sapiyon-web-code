import { Button, Form, Input, Select, message } from "antd";
import React, { useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";

import { SubtaskTemplate } from "../../../../../../../types";

interface AddSubtaskTemplateProps extends WithTranslation {
  templates: SubtaskTemplate[];
  addSubtaskTemplate: (title: string) => void;
  attachTemplate: (templateId: string) => void;
  closeModal: () => void;
}

const AddSubtaskTemplate = ({
  t,
  templates,
  addSubtaskTemplate,
  attachTemplate,
  closeModal,
}: AddSubtaskTemplateProps) => {
  const [inputValues, setInputValues] = useState({
    subtaskName: "",
    templateId: undefined,
  } as { subtaskName: string; templateId: string | undefined });

  const onSubmit = () => {
    const { subtaskName, templateId = "" } = inputValues;
    const name = subtaskName.trim();

    if (!(!!name || !!templateId)) {
      message.error(t("subtasks.selectAnOption"));
    } else if (!!name) {
      addSubtaskTemplate(name);
    } else {
      attachTemplate(templateId);
    }
  };

  return (
    <>
      <Form className="s-modal-body-p-16" labelCol={{ span: 24 }}>
        <Form.Item label={t("subtasks.title")} className="s-label-margin">
          <Input
            className="st-field-color st-placeholder-color"
            placeholder={t("subtasks.enterSubtaskTitle")}
            value={inputValues.subtaskName}
            onChange={(e) => {
              const subtaskName = e.target.value || "";
              setInputValues({ templateId: undefined, subtaskName });
            }}
          />
        </Form.Item>
        <Form.Item label={t("subtasks.template")} className="s-label-margin">
          <Select
            className="st-field-color st-placeholder-color"
            placeholder={t("subtasks.selectFromTemplates")}
            onSelect={(templateId: string) =>
              setInputValues({ subtaskName: "", templateId })
            }
            value={inputValues.templateId}
            showArrow
          >
            {templates &&
              templates.map((template) => (
                <Select.Option key={template._id} value={template._id}>
                  {template.title}
                </Select.Option>
              ))}
          </Select>
        </Form.Item>
      </Form>
      <div className="tw-flex tw-justify-end tw-mt-6 s-modal-footer">
        <Button type="default" onClick={closeModal} className="tw-mr-2">
          {t("global.cancel")}
        </Button>
        <Button type="primary" className="s-dark-primary" onClick={onSubmit}>
          {t("subtasks.addSubtask")}
        </Button>
      </div>
    </>
  );
};

export default withTranslation()(AddSubtaskTemplate);
