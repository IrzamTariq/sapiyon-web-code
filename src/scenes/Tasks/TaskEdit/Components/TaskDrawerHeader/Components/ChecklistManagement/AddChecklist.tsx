import { Button, Form, Input, Select, message } from "antd";
import React, { useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";

import { Checklist } from "../../../../../../../types";

interface AddChecklistProps extends WithTranslation {
  templates: Checklist[];
  addChecklist: (title: string) => void;
  attachTemplate: (docId: string, templateId: string) => void;
  closeModal: () => void;
}

const AddChecklist = ({
  t,
  templates,
  addChecklist,
  attachTemplate,
  closeModal,
}: AddChecklistProps) => {
  const [inputValues, setInputValues] = useState({
    checklistName: "",
    templateId: undefined,
  } as { checklistName: string; templateId: string | undefined });

  const onSubmit = () => {
    const { checklistName, templateId } = inputValues;
    const name = checklistName.trim();

    if (!(!!name || !!templateId)) {
      message.error(t("checklists.noSelectionError"));
    } else if (!!name) {
      addChecklist(name);
    } else {
      const template =
        templates.find((item) => item._id === templateId) || ({} as Checklist);

      if (template._id && template.bucketId) {
        attachTemplate(template.bucketId, template._id);
      }
    }
  };

  return (
    <>
      <Form className="s-modal-body-p-16" labelCol={{ span: 24 }}>
        <Form.Item label={t("checklists.title")} className="s-label-margin">
          <Input
            className="st-field-color st-placeholder-color"
            placeholder={t("checklists.addTitle")}
            value={inputValues.checklistName}
            onChange={(e) => {
              const checklistName = e.target.value || "";
              setInputValues({ templateId: undefined, checklistName });
            }}
          />
        </Form.Item>
        <Form.Item label={t("checklists.templates")} className="s-label-margin">
          <Select
            className="st-field-color st-placeholder-color"
            placeholder={t("checklists.selectTemplate")}
            onSelect={(templateId: string) =>
              setInputValues({ checklistName: "", templateId })
            }
            value={inputValues.templateId}
            showArrow
          >
            {templates &&
              templates.map((template) => (
                <Select.Option key={template._id} value={template._id || ""}>
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
          {t("checklists.addChecklist")}
        </Button>
      </div>
    </>
  );
};

export default withTranslation()(AddChecklist);
