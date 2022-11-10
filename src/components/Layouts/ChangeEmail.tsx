import { Form, Input, Modal } from "antd";
import React, { useEffect } from "react";
import { WithTranslation, withTranslation } from "react-i18next";

interface ChangeEmailProps extends WithTranslation {
  visible: boolean;
  email: string;
  handleOk: (email: string) => void;
  handleCancel: () => void;
}

const ChangeEmail = ({
  visible,
  email,
  handleOk,
  handleCancel,
  t,
}: ChangeEmailProps) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.resetFields();
    if (visible) {
      form.setFieldsValue({ email });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const validateForm = () => {
    form.validateFields().then((values) => {
      handleOk(values.email);
    });
  };

  return (
    <Modal
      title={
        <span className="s-modal-title">{t("changeEmail.pageTitle")}</span>
      }
      visible={visible}
      onCancel={handleCancel}
      onOk={validateForm}
      okText={t("global.ok")}
      cancelText={t("global.cancel")}
      bodyStyle={{ padding: "12px 24px" }}
      okButtonProps={{ className: "tw-mr-2" }}
    >
      <Form form={form} labelCol={{ span: 24 }}>
        <Form.Item
          name="email"
          rules={[{ required: true, message: t("changeEmail.emailReq") }]}
          label={t("changeEmail.newEmail")}
        >
          <Input
            placeholder={t("changeEmail.enterEmail")}
            className="st-field-color st-placeholder-color"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const Translated = withTranslation()(ChangeEmail);
export default Translated;
