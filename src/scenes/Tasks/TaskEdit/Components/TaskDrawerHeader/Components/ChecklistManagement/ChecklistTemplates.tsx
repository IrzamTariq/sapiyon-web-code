import mixpanel from "analytics/mixpanel";
import { Button, Popconfirm, message } from "antd";
import React, { useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";

import { ChecklistTemplateService } from "../../../../../../../services";
import {
  Checklist,
  ChecklistBucket,
  ChecklistItem,
} from "../../../../../../../types";
import { ChecklistsQuery, queryMaker } from "../../../../../helpers";
import EditTemplate from "./EditTemplate";

interface ChecklistTemplatesProps extends WithTranslation {
  templates: Checklist[];
  updateTemplateBuckets: (changes: {
    [docId: string]: ChecklistBucket;
  }) => void;
  closeModal: () => void;
}

const ChecklistTemplates = ({
  t,
  templates,
  updateTemplateBuckets,
  closeModal,
}: ChecklistTemplatesProps) => {
  const [templateState, setTemplateState] = useState({
    visible: false,
    editedTemplate: {} as Checklist,
  });

  const saveTemplate = (template: Checklist) => {
    const { items = [] } = template;

    if (items.length > 0) {
      if (template._id) {
        ChecklistTemplateService.patch(
          template.bucketId,
          template,
          queryMaker("updateChecklist", {
            docId: template.bucketId,
            checklistId: template._id,
          }),
        ).then(
          (res: ChecklistBucket) => {
            mixpanel.track("Checklist template updated");
            updateTemplateBuckets({ [res._id]: res });
            setTemplateState({
              visible: false,
              editedTemplate: {} as Checklist,
            });
            message.success(t("checklists.templates.saveSuccess"));
          },
          (error: Error) => {
            // console.log("Couldn't update checklist: ", error);
            message.error(t("checklists.templates.saveError"));
          },
        );
      } else {
        const newTemplate = {
          ...template,
          items: items.reduce(
            (acc, curr) => [...acc, { title: curr.title } as ChecklistItem],
            [] as ChecklistItem[],
          ),
        };
        ChecklistTemplateService.create(
          newTemplate,
          queryMaker("createChecklist", {}),
        ).then(
          (res: ChecklistBucket) => {
            mixpanel.track("Checklist template created");
            updateTemplateBuckets({ [res._id]: res });
            setTemplateState({
              visible: false,
              editedTemplate: {} as Checklist,
            });
            message.success(t("checklists.templates.saveSuccess"));
          },
          (error: Error) => {
            // console.log("Couldn't save template", error);
            message.error(t("checklists.templates.saveError"));
          },
        );
      }
    } else {
      message.error(t("checklists.noItemAdded"));
    }
  };

  const removeChecklist = (docId: string, query: ChecklistsQuery) => {
    ChecklistTemplateService.remove(docId, query).then(
      (res: ChecklistBucket) => {
        mixpanel.track("Checklist template removed");
        updateTemplateBuckets({ [res._id]: res });
        message.success(t("checklists.templates.deleteSuccess"));
      },
      (error: Error) => message.error(t("checklists.templates.deleteError")),
    );
  };
  const addChecklistItem = (item: ChecklistItem, query: ChecklistsQuery) => {
    ChecklistTemplateService.create({ item }, query).then(
      (res: ChecklistBucket) => {
        mixpanel.track("Checklist template item created");
        const updated = res.checklists.find(
          (item) => item._id === query.query.checklistId,
        );
        updateTemplateBuckets({ [res._id]: res });
        if (updated) {
          setTemplateState((old) => ({
            ...old,
            editedTemplate: {
              ...old.editedTemplate,
              items: updated.items,
            },
          }));
        }
      },
      (error: Error) => message.error(t("checklists.item.createError")),
    );
  };
  const updateChecklistItem = (
    docId: string,
    item: ChecklistItem,
    query: ChecklistsQuery,
  ) => {
    ChecklistTemplateService.patch(docId, { item }, query).then(
      (res: ChecklistBucket) => {
        mixpanel.track("Checklist template item updated");
        updateTemplateBuckets({ [res._id]: res });
        const updated = res.checklists.find(
          (item) => item._id === query.query.checklistId,
        );
        updateTemplateBuckets({ [res._id]: res });
        if (updated) {
          setTemplateState((old) => ({
            ...old,
            editedTemplate: {
              ...old.editedTemplate,
              items: updated.items,
            },
          }));
        }
      },
      (error: Error) => {
        // console.log("Coudn't update checklist: ", error);
        message.error(t("checklists.item.removeError"));
      },
    );
  };
  const removeChecklistItem = (docId: string, query: ChecklistsQuery) => {
    ChecklistTemplateService.remove(docId, query).then(
      (res: ChecklistBucket) => {
        mixpanel.track("Checklist template item removed");
        updateTemplateBuckets({ [res._id]: res });
        const updated = res.checklists.find(
          (item) => item._id === query.query.checklistId,
        );
        updateTemplateBuckets({ [res._id]: res });
        if (updated) {
          setTemplateState((old) => ({
            ...old,
            editedTemplate: {
              ...old.editedTemplate,
              items: updated.items,
            },
          }));
        }
      },
      (error: Error) => message.error(t("checklists.item.removeError")),
    );
  };

  return (
    <>
      {templates &&
        templates.map((template) => (
          <div
            key={template._id}
            className="tw-h-8 tw-flex tw-justify-between tw-items-center tw-text-sm s-text-dark s-font-roboto s-hover-parent s-modal-body-p-16"
          >
            <p className="tw-text-sm s-text-dark s-font-roboto">
              {template.title}
            </p>
            <div className="s-text-gray s-hover-target">
              <Button
                type="link"
                className="tw-text-sm tw-p-0 s-text-gray s-font-roboto"
                onClick={() => {
                  const { _id, ...duplicate } = template;
                  setTemplateState({
                    visible: true,
                    editedTemplate: duplicate,
                  });
                }}
              >
                {t("checklists.duplicate")}
              </Button>
              <Button
                type="link"
                className="tw-text-sm tw-p-0 s-text-gray s-font-roboto tw-mx-2"
                onClick={() =>
                  setTemplateState({ visible: true, editedTemplate: template })
                }
              >
                {t("global.edit")}
              </Button>
              <Popconfirm
                title={t("global.deleteSurety")}
                onConfirm={() =>
                  removeChecklist(
                    template.bucketId,
                    queryMaker("removeChecklist", {
                      checklistId: template._id,
                    }),
                  )
                }
                okButtonProps={{ danger: true }}
                okText={t("global.delete")}
                cancelText={t("global.cancel")}
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
      <div className="tw-flex tw-justify-end tw-mt-6 s-modal-footer">
        <Button type="default" onClick={closeModal} className="tw-mr-2">
          {t("global.cancel")}
        </Button>
        <Button
          type="primary"
          className="s-dark-primary"
          onClick={() =>
            setTemplateState({
              visible: true,
              editedTemplate: {
                title: "",
                items: [],
                bucketId: "",
              } as Checklist,
            })
          }
        >
          {t("checklists.createTemplate")}
        </Button>
      </div>
      <EditTemplate
        visible={templateState.visible}
        editedTemplate={templateState.editedTemplate}
        updateTemplateLocally={(template: Checklist) =>
          setTemplateState((old) => ({ ...old, editedTemplate: template }))
        }
        addChecklistItem={addChecklistItem}
        updateChecklistItem={updateChecklistItem}
        removeChecklistItem={removeChecklistItem}
        handleSave={saveTemplate}
        handleCancel={() =>
          setTemplateState({ visible: false, editedTemplate: {} as Checklist })
        }
      />
    </>
  );
};

export default withTranslation()(ChecklistTemplates);
