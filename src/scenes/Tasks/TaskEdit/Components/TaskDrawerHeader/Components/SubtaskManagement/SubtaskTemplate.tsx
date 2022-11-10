import { Button, Popconfirm } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";
import { SubtaskTemplate as TemplateType } from "types";

interface SubtaskTemplateProps {
  template: TemplateType;
  editTemplate: () => void;
  duplicateTemplate: () => void;
  removeSubtaskTemplate: (templateId: string) => void;
}

const SubtaskTemplate = ({
  template,
  editTemplate,
  duplicateTemplate,
  removeSubtaskTemplate,
}: SubtaskTemplateProps) => {
  const [t] = useTranslation();

  return (
    <div
      key={template._id}
      className="tw-h-8 tw-flex tw-justify-between tw-items-center tw-text-sm s-text-dark s-font-roboto s-hover-parent s-modal-body-p-16"
    >
      <p className="tw-text-sm s-text-dark s-font-roboto">{template.title}</p>
      <div className="s-text-gray s-hover-target">
        <Button
          type="link"
          className="tw-text-sm tw-p-0 s-text-gray s-font-roboto"
          onClick={duplicateTemplate}
        >
          {t("checklists.duplicate")}
        </Button>
        <Button
          type="link"
          className="tw-text-sm tw-p-0 s-text-gray s-font-roboto tw-mx-2"
          onClick={editTemplate}
        >
          {t("global.edit")}
        </Button>
        <Popconfirm
          title={t("global.deleteSurety")}
          onConfirm={() => removeSubtaskTemplate(template._id)}
          okText={t("global.delete")}
          cancelText={t("global.cancel")}
          okButtonProps={{ danger: true }}
        >
          <Button
            type="link"
            className="tw-text-sm tw-p-0 s-text-gray s-font-roboto"
          >
            {t("global.delete")}
          </Button>
        </Popconfirm>
      </div>
    </div>
  );
};

export default SubtaskTemplate;
