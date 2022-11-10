import { DeleteOutlined } from "@ant-design/icons";
import mixpanel from "analytics/mixpanel";
import { Collapse, Popconfirm, message } from "antd";
import React, { useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";

import { CustomFormService } from "../../../../../../services";
import {
  CustomForm,
  CustomFormBucket,
  CustomFormField,
} from "../../../../../../types";
import { getFieldInput, getFieldValue } from "./helpers";

interface CusutomFormsViewProps extends WithTranslation {
  forms: CustomForm[];
  updateBuckets: (bucket: CustomFormBucket) => void;
}

const CusutomFormsView = ({
  t,
  forms,
  updateBuckets,
}: CusutomFormsViewProps) => {
  const [editingState, setEditingState] = useState({
    editingId: "",
    newValue: "",
  });
  const { editingId } = editingState;
  const updateEditingState = (changes: {
    editingId?: string;
    newValue?: string;
  }) => setEditingState((old) => ({ ...old, ...changes }));

  const saveFieldValue = (
    form: CustomForm,
    field: CustomFormField,
    value: any,
  ) => {
    CustomFormService.patch(
      form.bucketId,
      { ...field, value },
      {
        query: {
          action: "updateFormField",
          formId: form._id,
          fieldId: field._id,
        },
      },
    ).then(
      (res: CustomFormBucket) => {
        mixpanel.track("Custom form updated");
        updateBuckets(res);
        updateEditingState({ editingId: "", newValue: undefined });
        message.success(t("customForms.field.saveSuccess"));
      },
      (error: Error) => {
        // console.log("Could not update field: ", error);
        message.error("customForms.field.saveError");
      },
    );
  };

  const deleteForm = (bucketId: string, templateId: string) => {
    CustomFormService.remove(bucketId, {
      query: { action: "removeForm", templateId },
    }).then(
      (res: CustomFormBucket) => {
        mixpanel.track("Custom form removed");
        updateBuckets(res);
        message.success(t("customForms.formRemoved"));
      },
      (error: Error) => {
        // console.log("Could not delete form: ", error);
        message.error(t("customForms.cantRemoveForm"));
      },
    );
  };

  return (
    <div>
      <div className="tw-mr-5 tw-my-10">
        <div className="tw-flex tw-items-center tw-mb-4">
          <h1 className="tw-text-dark tw-text-xl">{t("customForms.forms")}</h1>
        </div>
        <Collapse accordion>
          {forms.map((form) => (
            <Collapse.Panel
              header={form.title}
              key={form._id || ""}
              extra={
                <Popconfirm
                  title={t("customForms.confirmFormRemove")}
                  onConfirm={() => deleteForm(form.bucketId, form._id || "")}
                  okText={t("global.delete")}
                  cancelText={t("global.cancel")}
                  okButtonProps={{ danger: true }}
                >
                  <DeleteOutlined
                    className="s-text-gray s-hover-target"
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                  />
                </Popconfirm>
              }
            >
              {form.fields.map((field) => {
                return (
                  <div className="tw-mb-10" key={field._id}>
                    <div className="s-main-text-color s-main-font s-semibold tw-mb-1">
                      {field.label}
                    </div>
                    <div>
                      {editingId === field._id
                        ? getFieldInput(
                            field,
                            editingState,
                            updateEditingState,
                            (value: any) => saveFieldValue(form, field, value),
                          )
                        : getFieldValue(
                            field,
                            updateEditingState,
                            (value: any) => saveFieldValue(form, field, value),
                          )}
                    </div>
                  </div>
                );
              })}
            </Collapse.Panel>
          ))}
        </Collapse>
      </div>
    </div>
  );
};

export default withTranslation()(CusutomFormsView);
