import { Form, Input, Modal, message } from "antd";
import logger from "logger";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserService } from "services";

interface ChangePasswordProps {
  visible: boolean;
  handleClose: () => void;
  userId: string;
}

const ChangePassword = ({
  visible,
  handleClose,
  userId,
}: ChangePasswordProps) => {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    form.validateFields().then(
      (values) => {
        setLoading(true);
        UserService.patch(userId, { password: values.password }).then(
          () => {
            message.success(t("userEdit.passwordUpdateSuccess"));
            setLoading(false);
            handleClose();
          },
          (error: Error) => {
            logger.error("Error in changing password: ", error);
            message.error(t("userEdit.passwordUpdateError"));
          },
        );
      },
      (error) => logger.error("Validation error: ", error),
    );
  };

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({ _id: userId });
    }
    return () => form.resetFields();
  }, [visible, userId, form]);

  return (
    <Modal
      title={
        <span className="s-modal-title">{t("changePassword.pageTitle")}</span>
      }
      visible={visible}
      onOk={handleSubmit}
      onCancel={handleClose}
      okButtonProps={{
        loading,
        disabled: loading,
        className: "s-btn-spinner-align tw-mr-2",
      }}
      okText={t("global.save")}
      cancelText={t("global.cancel")}
      bodyStyle={{ padding: "12px 24px" }}
      destroyOnClose
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          name="_id"
          rules={[
            {
              required: true,
            },
          ]}
          noStyle
          hidden
        >
          <Input readOnly />
        </Form.Item>
        <Form.Item
          label={
            <span className="s-label-color">
              {t("changePassword.password")}
            </span>
          }
          name="password"
          rules={[
            { required: true, message: t("signUp.passwordReq") },
            { min: 8, message: t("changePassword.passwordLength") },
          ]}
        >
          <Input.Password
            type="password"
            placeholder={t("changePassword.enterPassword")}
            className="st-field-color st-placeholder-color"
          />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          dependencies={["password"]}
          label={
            <span className="s-label-color">
              {t("changePassword.confirmPassword")}
            </span>
          }
          rules={[
            { required: true, message: t("signUp.confirmPassword") },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(t("signUp.confirmPasswordValidation"));
              },
            }),
          ]}
        >
          <Input.Password
            type="password"
            placeholder={t("changePassword.enterConfirmPassword")}
            className="st-field-color st-placeholder-color"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePassword;
