import mixpanel from "analytics/mixpanel";
import { Button, Popconfirm, message } from "antd";
import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";

import { CustomFormTemplateService } from "../../../../../../../../services";
import { CustomForm, CustomFormBucket } from "../../../../../../../../types";

type TabType = "adding" | "list" | "editting";
interface CustomFormTemplatesProps extends WithTranslation {
  templates: CustomForm[];
  handleClose: () => void;
  updateState: (changes: {
    activeTab?: TabType;
    editedTemplate?: CustomForm;
  }) => void;
  updateBuckets: (changes: { [docId: string]: CustomFormBucket }) => void;
}

const CustomFormTemplates = ({
  t,
  templates,
  updateState,
  updateBuckets,
  handleClose,
}: CustomFormTemplatesProps) => {
  const deleteForm = (docId: string, templateId: string) => {
    CustomFormTemplateService.remove(docId, {
      query: { action: "removeForm", templateId },
    }).then(
      (res: CustomFormBucket) => {
        mixpanel.track("Custom form template deleted");
        updateBuckets({ [res._id]: res });
        message.success(t("customForms.templateDeleted"));
      },
      (error: Error) => {
        // console.log("Could not delete template: ", error);
        message.error(t("customForms.cantDeleteTemplate"));
      },
    );
  };
  return (
    <>
      <div className="s-modal-body-p-16">
        {templates?.map((form) => (
          <div
            key={form._id}
            className="tw-h-8 tw-flex tw-justify-between tw-items-center tw-text-sm s-text-dark s-font-roboto s-hover-parent"
          >
            <p className="tw-text-sm s-text-dark s-font-roboto tw-w-8/12 tw-truncate">
              {form.title}
            </p>
            <div className="s-text-gray s-hover-target">
              <Button
                type="link"
                className="tw-text-sm tw-p-0 s-text-gray s-font-roboto"
                onClick={() => {
                  const { _id, ...duplicate } = form;
                  updateState({
                    activeTab: "editing" as TabType,
                    editedTemplate: duplicate,
                  });
                }}
              >
                {t("customForms.duplicate")}
              </Button>
              <Button
                type="link"
                className="tw-text-sm tw-p-0 s-text-gray s-font-roboto tw-mx-2"
                onClick={() =>
                  updateState({
                    activeTab: "editing" as TabType,
                    editedTemplate: form,
                  })
                }
              >
                {t("global.edit")}
              </Button>
              <Popconfirm
                title={t("global.deleteMsg")}
                okText={t("global.delete")}
                cancelText={t("global.cancel")}
                okButtonProps={{ danger: true }}
                onConfirm={() => deleteForm(form.bucketId, form._id || "")}
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
        ))}
      </div>
      <div className="tw-flex tw-justify-end tw-mt-6 s-modal-footer">
        <Button type="default" className="tw-mr-2" onClick={handleClose}>
          {t("global.cancel")}
        </Button>
        <Button
          type="primary"
          className="s-dark-primary"
          onClick={() =>
            updateState({
              activeTab: "editing" as TabType,
              editedTemplate: {} as CustomForm,
            })
          }
        >
          {t("customForms.createForm")}
        </Button>
      </div>
    </>
  );
};

export default withTranslation()(CustomFormTemplates);
