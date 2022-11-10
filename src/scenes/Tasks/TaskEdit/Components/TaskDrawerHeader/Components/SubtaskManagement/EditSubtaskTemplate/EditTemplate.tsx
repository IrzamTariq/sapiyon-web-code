import { Button, Form, Input, Modal, Spin, message } from "antd";
import logger from "logger";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SubtaskTemplateItemsService, SubtaskTemplateService } from "services";
import ValidationMessage from "utils/components/ValidationMessage";
import midString from "utils/helpers/midString";

import {
  PaginatedFeathersResponse,
  SubtaskItem,
  SubtaskTemplate,
} from "../../../../../../../../types";
import { getRandomAlphaNumericString } from "../../../../../../../../utils/helpers";
import TemplateItemsList from "./TemplateItemsList";

interface EditSubtaskTemplateProps {
  visible: boolean;
  editedTemplate: SubtaskTemplate;
  handleCancel: () => void;
}

const EditSubtaskTemplate = ({
  visible,
  editedTemplate,
  handleCancel,
}: EditSubtaskTemplateProps) => {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const [items, setItems] = useState([] as SubtaskItem[]);
  const [state, setState] = useState({
    isLoading: false,
    editedId: "",
    itemsInvalid: false,
  });
  const [localTemplate, setLocalTemplate] = useState({
    title: "",
    items: [] as SubtaskItem[],
  });

  useEffect(() => {
    form.resetFields();
    setLocalTemplate({ title: "", items: [] });
    if (visible) {
      form.setFieldsValue({ title: editedTemplate.title });
      if (editedTemplate._id) {
        setState((old) => ({ ...old, isLoading: true }));
        SubtaskTemplateItemsService.find({
          query: { templateId: editedTemplate._id, $limit: 500 },
        })
          .then((res: PaginatedFeathersResponse<SubtaskItem>) =>
            setItems(res.data),
          )
          .catch((e: Error) => {
            logger.error("Error in fetching template items: ", e);
            message.error("subtasks.templates.fetchError");
          })
          .finally(() => setState((old) => ({ ...old, isLoading: false })));
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const addItem = () => {
    if (editedTemplate._id) {
      setState((old) => ({ ...old, isLoading: true }));
      const lastRank =
        items?.sort((a, b) => (a.rank > b.rank ? 1 : 0))?.[items.length - 1]
          ?.rank || "";
      SubtaskTemplateItemsService.create({
        title: t("global.edit"),
        templateId: editedTemplate._id,
        rank: midString(lastRank, ""),
      })
        .then(
          (res: SubtaskItem) => setItems((old) => [...old, res]),
          (e: Error) => {
            logger.error("Error in creating template item: ", e);
            message.error(t("subtasks.item.createError"));
          },
        )
        .finally(() => setState((old) => ({ ...old, isLoading: false })));
    } else {
      const lastRank =
        localTemplate?.items?.sort((a, b) => (a.rank > b.rank ? 1 : 0))?.[
          localTemplate.items.length - 1
        ]?.rank || "";

      const newItem = {
        title: t("global.edit"),
        _id: `NEW-${getRandomAlphaNumericString(10)}`,
        rank: midString(lastRank, ""),
      } as SubtaskItem;
      setLocalTemplate({
        ...editedTemplate,
        items: [...localTemplate.items, newItem],
      });
    }
  };

  const updateItem = (item: SubtaskItem) => {
    const { _id, ...rest } = item;
    if (editedTemplate._id) {
      setState((old) => ({ ...old, isLoading: true }));
      SubtaskTemplateItemsService.patch(_id, rest)
        .then(
          (res: SubtaskItem) => {
            setItems((old) =>
              old.map((item) => (item._id === res._id ? res : item)),
            );
            setState((old) => ({ ...old, editedId: "" }));
          },
          (e: Error) => {
            logger.error("Error in updating template item: ", e);
            message.error(t("subtasks.item.updateError"));
          },
        )
        .finally(() => setState((old) => ({ ...old, isLoading: false })));
    } else {
      setLocalTemplate({
        ...editedTemplate,
        items: localTemplate.items.map((localItem) =>
          localItem._id === item._id ? item : localItem,
        ),
      });
      setState((old) => ({ ...old, editedId: "" }));
    }
  };

  const deleteItem = (itemId: string) => {
    if (editedTemplate._id) {
      setState((old) => ({ ...old, isLoading: true }));
      SubtaskTemplateItemsService.remove(itemId)
        .then(
          (res: SubtaskItem) =>
            setItems((old) => old.filter((item) => item._id !== res._id)),
          (e: Error) => {
            logger.error("Error in removing template item: ", e);
            message.error(t("subtasks.item.removeError"));
          },
        )
        .finally(() => setState((old) => ({ ...old, isLoading: false })));
    } else {
      setLocalTemplate({
        ...editedTemplate,
        items: localTemplate.items.filter((needle) => needle._id !== itemId),
      });
    }
  };

  const validateItems = () => {
    if (localTemplate.items.length === 0) {
      setState((old) => ({ ...old, itemsInvalid: true }));
      return false;
    }
    setState((old) => ({ ...old, itemsInvalid: false }));
    return true;
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        if (editedTemplate._id) {
          if (values?.title?.trim() !== editedTemplate.title) {
            setState((old) => ({ ...old, isLoading: true }));
            SubtaskTemplateService.patch(editedTemplate._id, values)
              .then(
                () => handleCancel(),
                (e: Error) => {
                  logger.error("Error in updating template: ", e);
                  message.error("subtasks.templates.saveError");
                },
              )
              .finally(() => setState((old) => ({ ...old, isLoading: false })));
          } else {
            handleCancel();
          }
        } else {
          if (validateItems()) {
            setState((old) => ({ ...old, isLoading: true }));
            SubtaskTemplateService.create({
              ...values,
              items: localTemplate.items.reduce(
                (acc, { title, rank }) => [...acc, { title, rank }],
                [] as any[],
              ),
            })
              .then(() => handleCancel())
              .finally(() => setState((old) => ({ ...old, isLoading: false })));
          }
        }
      })
      .catch(validateItems);
  };

  return (
    <Modal
      visible={visible}
      onCancel={handleCancel}
      title={
        <span className="s-modal-title">{t("subtasks.createTemplate")}</span>
      }
      onOk={handleSubmit}
      closable={false}
      okText={t("global.save")}
      okButtonProps={{
        className: "tw-mr-2",
        disabled: state.isLoading || !!state.editedId,
      }}
      cancelText={t("global.cancel")}
      bodyStyle={{ padding: "24px" }}
    >
      <div className="tw-mb-4">
        <Form form={form} scrollToFirstError>
          <Form.Item
            name="title"
            rules={[
              {
                required: true,
                message: t("checklists.templateNameRequired"),
              },
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
      <Spin spinning={state.isLoading}>
        <TemplateItemsList
          items={editedTemplate._id ? items : localTemplate.items}
          updateItem={updateItem}
          removeItem={deleteItem}
          editItem={(itemId: string) =>
            setState((old) => ({ ...old, editedId: itemId }))
          }
          editedId={state.editedId}
        />
        <Button type="link" onClick={addItem} className="tw-text-sm tw-px-0">
          {t("templates.addItem")}
        </Button>
        <ValidationMessage
          visible={state.itemsInvalid && localTemplate.items.length === 0}
          message={t("subtasks.addOneSubtaskError")}
        />
      </Spin>
    </Modal>
  );
};

export default EditSubtaskTemplate;
