import React, { useEffect, useState } from "react";
import { message, Modal, Tabs } from "antd";
import mixpanel from "analytics/mixpanel";
import { withTranslation, WithTranslation } from "react-i18next";
import {
  CustomFormService,
  CustomFormTemplateService,
} from "../../../../../../../services";
import {
  CustomForm,
  CustomFormBucket,
  PaginatedFeathersResponse,
} from "../../../../../../../types";
import AddCustomForm from "./Components/AddCustomForm";
import CustomFormTemplates from "./Components/CustomFormTemplates";
import EditCustomFormTemplate from "./Components/EditCustomFormTemplate";

type TabType = "adding" | "list" | "editting";
interface State {
  activeTab: TabType;
  editedTemplate: CustomForm;
}

interface CustomFormsManagementProps extends WithTranslation {
  visible: boolean;
  orphanId: string;
  parentId?: string;
  updateCustomFormBuckets: (bucket: CustomFormBucket) => void;
  updateCustomFormOrphanIds: (docId: string) => void;
  handleClose: () => void;
}

const CustomFormsManagement = ({
  t,
  visible,
  orphanId,
  parentId,
  updateCustomFormBuckets,
  updateCustomFormOrphanIds,
  handleClose,
}: CustomFormsManagementProps) => {
  const [state, setState] = useState({
    activeTab: "adding" as TabType,
    editedTemplate: {},
  } as State);
  const updateState = (changes: {
    activeTab?: TabType;
    editedTemplate?: CustomForm;
  }) => setState((old) => ({ ...old, ...changes }));

  const [templateBuckets, setTemplateBuckets] = useState(
    {} as { [s: string]: CustomFormBucket },
  );
  const templates = Object.values(templateBuckets).reduce(
    (acc, curr) => [
      ...acc,
      ...curr.bucketItems.map((item) => ({ ...item, bucketId: curr._id })),
    ],
    [] as CustomForm[],
  );
  useEffect(() => {
    if (visible) {
      CustomFormTemplateService.find({}).then(
        (res: PaginatedFeathersResponse<CustomFormBucket>) =>
          setTemplateBuckets(
            res.data.reduce((acc, curr) => ({ ...acc, [curr._id]: curr }), {}),
          ),
        (error: Error) => message.error(t("customForms.templates.fetchError")),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const addFormTemplate = (templateId: string) => {
    const form = templates.find((item) => item._id === templateId);
    if (form) {
      CustomFormService.create(
        {
          templateId,
          docId: form.bucketId,
          ...(parentId ? { taskId: parentId } : { uid: orphanId }),
        },
        { query: { action: "createFormFromTemplate" } },
      ).then(
        (res: CustomFormBucket) => {
          mixpanel.track("Custom form template attached");
          updateCustomFormBuckets(res);
          if (!parentId) {
            updateCustomFormOrphanIds(res._id);
          }
          handleClose();
          message.success(t("customForms.templateAttached"));
        },
        (error: Error) => {
          // console.log("Could not attach template: ", error);
          message.error(t("customForms.cantAttachTemplate"));
        },
      );
    }
  };

  return (
    <Modal
      visible={visible}
      onCancel={handleClose}
      footer=""
      className="s-modal-p-0"
      closable={false}
      destroyOnClose
    >
      <Tabs
        activeKey={state.activeTab}
        onTabClick={(activeTab) =>
          updateState({ activeTab: activeTab as TabType })
        }
        className="s-modal-tabs-mt-16"
      >
        <Tabs.TabPane tab={t("customForms.addForm")} key="adding">
          <AddCustomForm
            templates={templates}
            addFormTemplate={addFormTemplate}
            handleClose={handleClose}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab={t("customForms.formsList")} key="list">
          <CustomFormTemplates
            templates={templates}
            updateState={updateState}
            updateBuckets={(changes) =>
              setTemplateBuckets((old) => ({ ...old, ...changes }))
            }
            handleClose={handleClose}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab={t("customForms.createFormTab")} key="editing">
          <EditCustomFormTemplate
            editedTemplate={state.editedTemplate}
            updateState={updateState}
            updateBuckets={(changes) =>
              setTemplateBuckets((old) => ({ ...old, ...changes }))
            }
          />
        </Tabs.TabPane>
      </Tabs>
    </Modal>
  );
};

export default withTranslation()(CustomFormsManagement);
