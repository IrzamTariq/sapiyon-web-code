import { Button, Form, Input } from "antd";
import TextArea from "antd/lib/input/TextArea";
import React, { useEffect } from "react";
import { WithTranslation, withTranslation } from "react-i18next";

import { CustomerNote } from "../../../../../types";

interface CustomerNotesFormProps extends WithTranslation {
  editedNote: CustomerNote;
  handleCancel: () => void;
  addNote: (note: CustomerNote) => void;
}

const CustomerNotesForm = ({
  t,
  addNote,
  editedNote,
  handleCancel,
}: CustomerNotesFormProps) => {
  const [form] = Form.useForm();
  useEffect(() => {
    const { _id, body } = editedNote;
    form.setFieldsValue({ _id, body });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editedNote._id]);
  return (
    <Form
      form={form}
      name="customer-notes-form"
      onFinish={(values) => addNote(values)}
    >
      <Form.Item name="_id" rules={[{ required: true }]} hidden>
        <Input hidden />
      </Form.Item>
      <Form.Item
        name="body"
        rules={[{ required: true, message: t("notes.reqValidation") }]}
      >
        <TextArea placeholder={t("notes.enterNote")} autoFocus allowClear />
      </Form.Item>
      <div className="tw-text-right tw-relative tw--mt-4">
        <Button size="small" onClick={handleCancel}>
          {t("global.cancel")}
        </Button>
        <Button
          type="primary"
          size="small"
          className="s-primary-btn-bg tw-ml-2"
          htmlType="submit"
        >
          {t("global.save")}
        </Button>
      </div>
    </Form>
  );
};

export default withTranslation()(CustomerNotesForm);
