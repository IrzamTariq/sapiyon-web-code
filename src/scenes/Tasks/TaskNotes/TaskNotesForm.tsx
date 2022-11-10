import { Button, Form, Input } from "antd";
import TextArea from "antd/lib/input/TextArea";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { TaskNote } from "../../../types";

interface TaskNotesFormProps {
  editedNote: TaskNote;
  handleCancel: () => void;
  addNote: (note: TaskNote) => void;
  loading: boolean;
}

const TaskNotesForm = ({
  handleCancel,
  addNote,
  editedNote,
  loading,
}: TaskNotesFormProps) => {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const submitNote = () => {
    form.validateFields().then((values) => {
      addNote(values);
    });
  };

  useEffect(() => {
    const { body, _id } = editedNote || {};
    form.setFieldsValue({ body, _id });
  }, [editedNote, form]);

  return (
    <Form form={form} scrollToFirstError>
      <Form.Item name="_id" rules={[{ required: true }]} noStyle hidden>
        <Input />
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
          onClick={() => submitNote()}
          disabled={loading}
        >
          {t("global.save")}
        </Button>
      </div>
    </Form>
  );
};

export default TaskNotesForm;
