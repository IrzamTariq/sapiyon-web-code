import mixpanel from "analytics/mixpanel";
import { Button, Empty, message } from "antd";
import logger from "logger";
import React, { useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";

import { SubtaskTemplateService } from "../../../../../../../services";
import { SubtaskTemplate as Template } from "../../../../../../../types";
import EditTemplate from "./EditSubtaskTemplate/EditTemplate";
import SubtaskTemplate from "./SubtaskTemplate";

interface SubtaskTemplatesProps extends WithTranslation {
  templates: Template[];
  closeModal: () => void;
}

const SubtaskTemplates = ({
  t,
  templates,
  closeModal,
}: SubtaskTemplatesProps) => {
  const [templateState, setTemplateState] = useState({
    visible: false,
    editedTemplate: {} as Template,
  });

  const removeSubtaskTemplate = (templateId: string) => {
    SubtaskTemplateService.remove(templateId).then(
      () => {
        mixpanel.track("Subtask template removed");
        message.success(t("subtasks.templates.deleteSuccess"));
      },
      (error: Error) => {
        logger.error("Error in removing subtask template", error);
        message.error(t("subtasks.templates.deleteError"));
      },
    );
  };

  return (
    <>
      {templates?.length > 0 ? (
        templates.map((template) => (
          <SubtaskTemplate
            key={template._id}
            template={template}
            removeSubtaskTemplate={removeSubtaskTemplate}
            editTemplate={() =>
              setTemplateState({ visible: true, editedTemplate: template })
            }
            duplicateTemplate={() =>
              setTemplateState({
                visible: true,
                editedTemplate: { title: template.title } as Template,
              })
            }
          />
        ))
      ) : (
        <Empty description={t("templates.noTemplates")} />
      )}
      <div className="tw-flex tw-justify-end tw-mt-6 s-modal-footer">
        <Button type="default" onClick={closeModal} className="tw-mr-2">
          {t("global.cancel")}
        </Button>
        <Button
          type="primary"
          onClick={() =>
            setTemplateState({
              visible: true,
              editedTemplate: {} as Template,
            })
          }
        >
          {t("subtasks.createTemplate")}
        </Button>
      </div>
      <EditTemplate
        visible={templateState.visible}
        editedTemplate={templateState.editedTemplate}
        handleCancel={() =>
          setTemplateState({
            visible: false,
            editedTemplate: {} as Template,
          })
        }
      />
    </>
  );
};

export default withTranslation()(SubtaskTemplates);
