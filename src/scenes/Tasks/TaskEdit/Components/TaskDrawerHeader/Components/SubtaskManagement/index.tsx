import { Modal, Tabs, message } from "antd";
import logger from "logger";
import React, { useEffect, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import midString from "utils/helpers/midString";

import {
  SubtaskTemplateItemsService,
  SubtaskTemplateService,
  TaskService,
} from "../../../../../../../services";
import {
  PaginatedFeathersResponse,
  Subtask,
  SubtaskItem,
  SubtaskTemplate,
} from "../../../../../../../types";
import AddSubtaskTemplate from "./AddSubtask";
import SubtaskTemplates from "./SubtaskTemplates";

interface SubtaskManagementProps extends WithTranslation {
  visible: boolean;
  taskId?: string;
  lastRank: string;
  updateSubtaskOrphanIds: (subtaskId: string) => void;
  addNewSubtask: (subtask: Subtask) => void;
  handleClose: () => void;
}

const SubtaskManagement = ({
  t,
  visible,
  taskId,
  updateSubtaskOrphanIds,
  addNewSubtask,
  handleClose,
  lastRank,
}: SubtaskManagementProps) => {
  const [templates, setTemplates] = useState([] as SubtaskTemplate[]);
  useEffect(() => {
    if (visible) {
      SubtaskTemplateService.find({ query: { $limit: 500 } }).then(
        (res: PaginatedFeathersResponse<SubtaskTemplate>) =>
          setTemplates(res.data),
        (error: Error) => {
          logger.error("Could not fetch subtask templates: ", error);
          message.error(t("subtasks.templates.fetchError"));
        },
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const addSubtask = (title: string) => {
    const subtask = {
      title,
      isSubtask: true,
      rank: midString(lastRank, ""),
      ...(taskId ? { parentId: taskId } : {}),
    };

    TaskService.create(subtask).then(
      (res: Subtask) => {
        addNewSubtask(res);
        if (!taskId) {
          updateSubtaskOrphanIds(res._id || "");
        }
        handleClose();
        message.success(t("subtasks.createSuccess"));
      },
      (error: Error) => {
        // console.log("Couldn't create subtask: ", error);
        message.error(t("subtasks.cantCreate"));
      },
    );
  };

  const attachTemplate = (templateId: string) => {
    if (templateId) {
      message.loading({
        content: t("subtasks.addingTemplate"),
        key: "attachingTemplates",
        duration: 0,
      });
      try {
        SubtaskTemplateItemsService.find({
          query: { templateId, $limit: 500 },
        }).then((res: PaginatedFeathersResponse<SubtaskItem>) => {
          const promises: Promise<Subtask>[] = res.data.map((item) => {
            return TaskService.create({
              title: item.title,
              isSubtask: true,
              rank: item.rank,
              ...(taskId ? { parentId: taskId } : {}),
            });
          });

          Promise.allSettled(promises).then((responses) => {
            responses.forEach((res) => {
              if (res.status === "fulfilled") {
                addNewSubtask(res.value);
                if (!taskId) {
                  updateSubtaskOrphanIds(res.value._id || "");
                }
              }
            });
            if (responses.some((item) => item.status === "rejected")) {
              message.error(t("templates.attachError"));
            } else {
              message.success({
                content: t("subtasks.templateAdded"),
                key: "attachingTemplates",
              });
            }
            handleClose();
          });
        });
      } catch (error) {
        message.error({
          content: t("checklists.templates.attachError"),
          key: "attachingTemplates",
        });
      }
    }
  };

  useEffect(() => {
    const handleCreated = (res: SubtaskTemplate) =>
      setTemplates((old) => [res, ...old]);

    const handlePatched = (res: SubtaskTemplate) =>
      setTemplates((old) =>
        old.map((item) => (item._id === res._id ? res : item)),
      );

    const handleRemoved = (res: SubtaskTemplate) =>
      setTemplates((old) => old.filter((item) => item._id !== res._id));

    SubtaskTemplateService.on("created", handleCreated);
    SubtaskTemplateService.on("patched", handlePatched);
    SubtaskTemplateService.on("removed", handleRemoved);
    return () => {
      SubtaskTemplateService.off("created", handleCreated);
      SubtaskTemplateService.off("patched", handlePatched);
      SubtaskTemplateService.off("removed", handleRemoved);
    };
  }, []);

  return (
    <Modal
      visible={visible}
      onCancel={handleClose}
      footer=""
      closable={false}
      destroyOnClose
      className="s-modal-p-0"
    >
      <Tabs className="s-modal-tabs-mt-16">
        <Tabs.TabPane tab={t("subtasks.addSubtask")} key="adding">
          <AddSubtaskTemplate
            templates={templates}
            addSubtaskTemplate={addSubtask}
            attachTemplate={attachTemplate}
            closeModal={handleClose}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab={t("subtasks.templates")} key="templates">
          <SubtaskTemplates templates={templates} closeModal={handleClose} />
        </Tabs.TabPane>
      </Tabs>
    </Modal>
  );
};

export default withTranslation()(SubtaskManagement);
