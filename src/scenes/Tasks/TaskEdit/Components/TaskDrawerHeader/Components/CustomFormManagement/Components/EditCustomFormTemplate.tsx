import mixpanel from "analytics/mixpanel";
import { Button, Form, Input, message } from "antd";
import React, { useEffect, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";

import { CustomFormTemplateService } from "../../../../../../../../services";
import {
  CustomForm,
  CustomFormBucket,
  CustomFormField,
} from "../../../../../../../../types";
import { getRandomAlphaNumericString } from "../../../../../../../../utils/helpers";
import { getCustomFieldIcon } from "../../../../../../helpers";
import EditCustomFormField from "./EditCustomFormField";

type TabType = "adding" | "list" | "editting";
interface EditCustomFormTemplateProps extends WithTranslation {
  editedTemplate: CustomForm;
  updateState: (changes: {
    activeTab?: TabType;
    editedTemplate?: CustomForm;
  }) => void;
  updateBuckets: (changes: { [bucketId: string]: CustomFormBucket }) => void;
}

const EditCustomFormTemplate = ({
  t,
  editedTemplate,
  updateState,
  updateBuckets,
}: EditCustomFormTemplateProps) => {
  const [form] = Form.useForm();
  const { validateFields } = form;
  const { bucketId, _id: templateId } = editedTemplate;
  const [state, setState] = useState({
    visible: false,
    editedField: {} as CustomFormField,
    fields: [] as CustomFormField[],
  });

  useEffect(() => {
    const { _id = "", title, fields = [] } = editedTemplate || {};
    const initValues = {
      _id,
      title,
    };
    setState((prev) => ({ ...prev, fields }));
    form.setFieldsValue(initValues);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editedTemplate]);

  const saveField = (field: CustomFormField) => {
    const { _id: fieldId = "", ...rest } = field;

    if (!!templateId) {
      if (fieldId.substr(0, 3) === "NEW") {
        CustomFormTemplateService.create(rest, {
          query: { action: "createFormField", docId: bucketId, templateId },
        }).then(
          (res: CustomFormBucket) => {
            mixpanel.track("Custom form template field created");
            updateBuckets({ [res._id]: res });
            const updated = res.bucketItems.find(
              (item) => item._id === templateId,
            );
            updateState({
              editedTemplate: {
                ...editedTemplate,
                fields: updated?.fields || [],
              },
            });
            setState({
              visible: false,
              editedField: {} as CustomFormField,
              fields: updated?.fields || ([] as CustomFormField[]),
            });
            message.success(t("customForms.FieldAdded"));
          },
          (error: Error) => {
            // console.log("Could not add field: ", error);
            message.error(t("customForms.cantAddField"));
          },
        );
      } else {
        CustomFormTemplateService.patch(bucketId, rest, {
          query: { action: "updateFormField", templateId, fieldId },
        }).then(
          (res: CustomFormBucket) => {
            mixpanel.track("Custom form template field updated");
            updateBuckets({ [res._id]: res });
            const updated = res.bucketItems.find(
              (item) => item._id === templateId,
            );
            updateState({
              editedTemplate: {
                ...editedTemplate,
                fields: updated?.fields || [],
              },
            });
            setState({
              visible: false,
              editedField: {} as CustomFormField,
              fields: updated?.fields || ([] as CustomFormField[]),
            });
            message.success(t("customForms.FieldUpdated"));
          },
          (error: Error) => {
            // console.log("Could not update field: ", error);
            message.error(t("customForms.cantUpdateField"));
          },
        );
      }
    } else {
      const newFields =
        fieldId.substr(0, 3) === "NEW"
          ? ([
              ...state.fields,
              { ...field, _id: getRandomAlphaNumericString(10) },
            ] as CustomFormField[])
          : state.fields.map((item) => (item._id === fieldId ? field : item));

      setState((prev) => ({
        ...prev,
        visible: false,
        editedField: {} as CustomFormField,
        fields: newFields,
      }));
    }
  };
  const removeField = (fieldId: string) => {
    if (!!templateId) {
      CustomFormTemplateService.remove(bucketId, {
        query: { action: "removeFormField", templateId, fieldId },
      }).then(
        (res: CustomFormBucket) => {
          mixpanel.track("Custom form template field removed");
          updateBuckets({ [res._id]: res });
          const updated = res.bucketItems.find(
            (item) => item._id === templateId,
          );
          updateState({
            editedTemplate: {
              ...editedTemplate,
              fields: updated?.fields || [],
            },
          });
          message.success(t("customForms.fieldDeleted"));
        },
        (error: Error) => {
          // console.log("Could not delete field: ", error);
          message.error(t("customForms.cantDeleteField"));
        },
      );
    } else {
      setState((prev) => ({
        ...prev,
        fields: state.fields.filter((item) => item._id !== fieldId),
      }));
    }
  };
  const handleSubmit = () => {
    validateFields().then(
      (values) => {
        let errors = false;
        if ((state.fields || []).length < 1) {
          message.error(t("customForms.noFieldsAdded"));
          errors = true;
        }
        if (!errors) {
          const { _id, ...rest } = values;
          const newForm = {
            ...rest,
            fields: (state.fields || []).map(
              ({ _id, ...others }) => others as CustomFormField,
            ),
          };

          if (!!templateId) {
            CustomFormTemplateService.patch(bucketId, newForm, {
              query: { action: "updateForm", templateId },
            }).then(
              (res: CustomFormBucket) => {
                mixpanel.track("Custom form template updated");
                updateBuckets({ [res._id]: res });
                updateState({
                  activeTab: "list",
                  editedTemplate: {} as CustomForm,
                });
                message.success(t("customForms.templateUpdated"));
              },
              (error: Error) => {
                // console.log("Could not update template: ", error);
                message.error(t("customForms.cantUpdateTemplate"));
              },
            );
          } else {
            CustomFormTemplateService.create(newForm, {
              query: { action: "createForm" },
            }).then(
              (res: CustomFormBucket) => {
                mixpanel.track("Custom form template created");
                updateBuckets({ [res._id]: res });
                updateState({
                  activeTab: "list",
                  editedTemplate: {} as CustomForm,
                });
                message.success(t("customForms.templateCreated"));
              },
              (error: Error) => {
                // console.log("Could not create template: ", error);
                message.error(t("customForms.cantCreateTemplate"));
              },
            );
          }
        }
      },
      () => null,
    );
  };

  return (
    <>
      <div className="s-modal-body-p-16">
        <Form hideRequiredMark={true} form={form} labelCol={{ span: 24 }}>
          <Form.Item name="_id" hidden noStyle>
            <Input />
          </Form.Item>
          <Form.Item
            name="title"
            rules={[{ required: true, message: t("customForms.formNameReq") }]}
            label={t("customForms.formName")}
            className="s-label-margin tw-mb-0"
          >
            <Input
              className="st-field-color st-placeholder-color"
              placeholder={t("customForms.enterFormName")}
            />
          </Form.Item>
        </Form>
        <div>
          {state.fields
            ?.filter((item) => !!item.label)
            .map((field) => (
              <div
                key={field._id}
                className="tw-h-8 tw-flex tw-justify-between tw-items-center tw-text-sm s-text-dark s-font-roboto s-hover-parent"
              >
                <p className="tw-text-sm tw-flex tw-items-center s-text-dark s-font-roboto">
                  {getCustomFieldIcon(
                    field.type,
                    "tw-mr-2 tw-mb-1 s-icon-color",
                  )}
                  {field.label}
                </p>
                <div className="s-text-gray s-hover-target">
                  <Button
                    type="link"
                    className="tw-text-sm tw-p-0 s-text-gray s-font-roboto"
                    onClick={() =>
                      setState((prev) => ({
                        ...prev,
                        editedField: Object.assign({}, field, {
                          _id: undefined,
                        }),
                        visible: true,
                      }))
                    }
                  >
                    {t("customForms.duplicate")}
                  </Button>
                  <Button
                    type="link"
                    className="tw-text-sm tw-p-0 s-text-gray s-font-roboto tw-mx-2"
                    onClick={() =>
                      setState((prev) => ({
                        ...prev,
                        editedField: field,
                        visible: true,
                      }))
                    }
                  >
                    {t("global.edit")}
                  </Button>
                  <Button
                    type="link"
                    className="tw-text-sm tw-p-0 s-text-gray s-font-roboto"
                    onClick={() => removeField(field._id || "")}
                  >
                    {t("global.delete")}
                  </Button>
                </div>
              </div>
            ))}
          <Button
            type="link"
            onClick={() => setState((old) => ({ ...old, visible: true }))}
            className="tw-px-0 tw-mt-2"
          >
            + {t("customForms.addFieldBtn")}
          </Button>
        </div>
      </div>
      <div className="tw-flex tw-justify-end tw-mt-6 s-modal-footer">
        <Button
          type="default"
          onClick={() =>
            updateState({
              activeTab: "list",
              editedTemplate: {} as CustomForm,
            })
          }
          className="tw-mr-2"
        >
          {t("global.cancel")}
        </Button>
        <Button
          type="primary"
          className="s-dark-primary"
          onClick={handleSubmit}
        >
          {t("global.save")}
        </Button>
      </div>
      <EditCustomFormField
        visible={state.visible}
        editedField={state.editedField}
        saveField={saveField}
        handleClose={() =>
          setState((prev) => ({
            ...prev,
            editedField: {} as CustomFormField,
            visible: false,
          }))
        }
      />
    </>
  );
};
export default withTranslation()(EditCustomFormTemplate);
