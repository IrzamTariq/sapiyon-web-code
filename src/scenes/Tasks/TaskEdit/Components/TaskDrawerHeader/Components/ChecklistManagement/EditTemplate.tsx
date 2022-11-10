import { Form, Input, Modal } from "antd";
import React, { useEffect } from "react";
import { WithTranslation, withTranslation } from "react-i18next";

import { Checklist, ChecklistItem } from "../../../../../../../types";
import { getRandomAlphaNumericString } from "../../../../../../../utils/helpers";
import { ChecklistsQuery, queryMaker } from "../../../../../helpers";
import ItemsTable from "../../../Checklists/Components/ItemsTable";

interface EditChecklistTemplateProps extends WithTranslation {
  visible: boolean;
  editedTemplate: Checklist;
  updateTemplateLocally: (template: Checklist) => void;
  handleSave: (template: Checklist) => void;
  handleCancel: () => void;
  addChecklistItem: (data: ChecklistItem, query: ChecklistsQuery) => void;
  updateChecklistItem: (
    docId: string,
    data: ChecklistItem,
    query: ChecklistsQuery,
  ) => void;
  removeChecklistItem: (docId: string, query: ChecklistsQuery) => void;
}

const EditChecklistTemplate = ({
  t,
  visible,
  editedTemplate,
  updateTemplateLocally,
  addChecklistItem,
  updateChecklistItem,
  removeChecklistItem,
  handleSave,
  handleCancel,
}: EditChecklistTemplateProps) => {
  const [form] = Form.useForm();
  const {
    _id: checklistId,
    bucketId: docId,
    items = [] as ChecklistItem[],
  } = editedTemplate;
  useEffect(() => {
    form.resetFields();
    if (visible) {
      form.setFieldsValue({ title: editedTemplate.title });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const addItem = (item: ChecklistItem) => {
    if (checklistId) {
      addChecklistItem(
        item,
        queryMaker("createChecklistItem", { docId, checklistId }),
      );
    } else {
      const newItem = {
        ...item,
        _id: `NEW-${getRandomAlphaNumericString(10)}`,
      };
      updateTemplateLocally({
        ...editedTemplate,
        items: [...editedTemplate.items, newItem],
      });
    }
  };

  const updateItem = (item: ChecklistItem) => {
    if (checklistId) {
      updateChecklistItem(
        docId,
        item,
        queryMaker("updateChecklistItem", { checklistId }),
      );
    } else {
      updateTemplateLocally({
        ...editedTemplate,
        items: items.map((needle) => (needle._id !== item._id ? needle : item)),
      });
    }
  };

  const deleteItem = (itemId: string) => {
    if (checklistId) {
      removeChecklistItem(
        docId,
        queryMaker("removeChecklistItem", { checklistId, itemId }),
      );
    } else {
      updateTemplateLocally({
        ...editedTemplate,
        items: items.filter((needle) => needle._id !== itemId),
      });
    }
  };

  const handleSubmit = () => {
    form.validateFields().then(
      (values) => {
        handleSave({ ...editedTemplate, ...values });
      },
      () => null,
    );
  };

  return (
    <Modal
      visible={visible}
      title={
        <span className="s-modal-title">
          {t("checklists.createTemplateTitle")}
        </span>
      }
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText={t("global.ok")}
      cancelText={t("global.cancel")}
      okButtonProps={{ className: "tw-mr-2" }}
      bodyStyle={{ padding: "24px" }}
      destroyOnClose
    >
      <div className="tw-mb-4">
        <Form
          form={form}
          onValuesChange={(changes) =>
            updateTemplateLocally({ ...editedTemplate, ...changes })
          }
          scrollToFirstError
        >
          <Form.Item
            name="title"
            rules={[
              { required: true, message: t("checklists.templateNameRequired") },
            ]}
            labelCol={{ span: 24 }}
            label={t("checklists.templateName")}
            className="st-main-text-color s-label-margin"
          >
            <Input
              className="st-field-color st-placeholder-color"
              placeholder={t("checklists.enterTemplateName")}
            />
          </Form.Item>
        </Form>
      </div>
      <ItemsTable
        items={items}
        selectAble={false}
        addItem={addItem}
        updateItem={updateItem}
        deleteItem={deleteItem}
      />
    </Modal>
  );
};

export default withTranslation()(EditChecklistTemplate);
