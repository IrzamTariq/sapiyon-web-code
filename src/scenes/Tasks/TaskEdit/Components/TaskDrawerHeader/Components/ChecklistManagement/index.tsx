import mixpanel from "analytics/mixpanel";
import { Modal, Tabs, message } from "antd";
import React, { useEffect, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";

import {
  ChecklistService,
  ChecklistTemplateService,
} from "../../../../../../../services";
import {
  Checklist,
  ChecklistBucket,
  PaginatedFeathersResponse,
} from "../../../../../../../types";
import { queryMaker } from "../../../../../helpers";
import AddChecklist from "./AddChecklist";
import ChecklistTemplates from "./ChecklistTemplates";

interface ChecklistManagementProps extends WithTranslation {
  visible: boolean;
  taskId?: string;
  orphanId: string;
  updateChecklistOrphanIds: (docId: string) => void;
  updateChecklistBuckets: (changes: {
    [docId: string]: ChecklistBucket;
  }) => void;
  handleClose: () => void;
}

const ChecklistManagement = ({
  t,
  visible,
  taskId,
  orphanId,
  updateChecklistOrphanIds,
  updateChecklistBuckets,
  handleClose,
}: ChecklistManagementProps) => {
  const [templateBuckets, setTemplateBuckets] = useState(
    {} as { [s: string]: ChecklistBucket },
  );
  const templates = Object.values(templateBuckets).reduce(
    (acc, curr) => [
      ...acc,
      ...curr.checklists.map((item) => ({ ...item, bucketId: curr._id })),
    ],
    [] as Checklist[],
  );
  useEffect(() => {
    if (visible) {
      ChecklistTemplateService.find({}).then(
        (res: PaginatedFeathersResponse<ChecklistBucket>) =>
          setTemplateBuckets(
            res.data.reduce((acc, curr) => ({ ...acc, [curr._id]: curr }), {}),
          ),
        (error: Error) => message.error(t("checklists.templates.fetchError")),
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const addChecklist = (title: string) => {
    const checklist = {
      ...(taskId ? { taskId } : { uid: orphanId }),
      title,
      items: [
        {
          title: t("checklists.editItem"),
        },
      ],
    };
    ChecklistService.create(checklist, queryMaker("createChecklist", {})).then(
      (res: ChecklistBucket) => {
        mixpanel.track("Checklist created");
        updateChecklistBuckets({ [res._id]: res });
        if (!taskId) {
          updateChecklistOrphanIds(res._id);
        }
        handleClose();
        message.success(t("checklists.createSuccess"));
      },
      (error: Error) => {
        // console.log("Couldn't create checklist: ", error);
        message.error(t("checklists.cantAddChecklist"));
      },
    );
  };
  const attachTemplate = (docId: string, templateId: string) => {
    ChecklistService.create(
      { templateId, docId, ...(taskId ? { taskId } : { uid: orphanId }) },
      queryMaker("createChecklistFromTemplate", {}),
    ).then(
      (res: ChecklistBucket) => {
        mixpanel.track("Checklist created from template");
        updateChecklistBuckets({ [res._id]: res });
        if (!taskId) {
          updateChecklistOrphanIds(res._id);
        }
        handleClose();
        message.success(t("checklists.templates.attachSuccess"));
      },
      (error: Error) => {
        // console.log("Couldn't attach template: ", error);
        message.error(t("checklists.templates.attachError"));
      },
    );
  };

  return (
    <Modal
      visible={visible}
      onCancel={handleClose}
      footer=""
      destroyOnClose
      className="s-modal-p-0"
      closable={false}
    >
      <Tabs className="s-modal-tabs-mt-16">
        <Tabs.TabPane tab={t("checklists.addChecklistTab")} key="adding">
          <AddChecklist
            templates={templates}
            addChecklist={addChecklist}
            attachTemplate={attachTemplate}
            closeModal={handleClose}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab={t("checklists.templatesTab")} key="templates">
          <ChecklistTemplates
            templates={templates}
            updateTemplateBuckets={(changes) =>
              setTemplateBuckets((old) => ({ ...old, ...changes }))
            }
            closeModal={handleClose}
          />
        </Tabs.TabPane>
      </Tabs>
    </Modal>
  );
};

export default withTranslation()(ChecklistManagement);
