import React from "react";
import TextArea from "antd/lib/input/TextArea";
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Input } from "antd";
import { withTranslation } from "react-i18next";

const NoteForm = ({ form, handleSubmit, handleCancel, t }) => {
  const { getFieldDecorator, validateFields } = form;
  const submitNote = () => {
    validateFields((errors, values) => {
      if (!errors) {
        handleSubmit(values);
      }
    });
  };

  return (
    <Form>
      {getFieldDecorator("_id")(<Input hidden />)}
      <Form.Item>
        {getFieldDecorator("body", {
          rules: [{ required: true, message: t("notes.reqValidation") }],
        })(
          <TextArea placeholder={t("notes.enterNote")} autoFocus allowClear />,
        )}
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
        >
          {t("global.save")}
        </Button>
      </div>
    </Form>
  );
};

const AntForm = Form.create({
  name: "task-note-form",
  mapPropsToFields({ editedNote }) {
    const { _id, body } = editedNote;
    return {
      _id: Form.createFormField({
        value: _id,
      }),
      body: Form.createFormField({ value: body }),
    };
  },
})(NoteForm);

export default withTranslation()(AntForm);
