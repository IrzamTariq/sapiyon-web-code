import { Button, Col, Form, Input, Row, message } from "antd";
import Appshell from "Appshell";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { UserService } from "services";
import UserContext from "UserContext";

const PasswordReset = () => {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const { user }: any = useContext(UserContext);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      UserService.patch(user?._id, values).then(
        () => {
          message.success(t("userEdit.passwordChangeSuccess"));
          form.resetFields();
        },
        () => message.error(t("userEdit.passwordChangeError")),
      );
    });
  };

  return (
    <Appshell activeLink={["settings", "password"]}>
      <div className="md:tw-mx-20 xl:tw-mx-32">
        <h2 className="s-page-title tw-mb-5">{t("passwordSetting.title")}</h2>
        <Row>
          <Col sm={23} md={18} lg={12} xl={10} xxl={8}>
            <Form form={form} onFinish={handleSubmit} labelCol={{ span: 24 }}>
              <Form.Item
                name="oldPassword"
                label={
                  <span className="s-text-15 s-text-dark">
                    {t("passwordSetting.currentPassword")}
                  </span>
                }
                rules={[
                  {
                    required: true,
                    message: t("passwordSetting.currentPasswordReq"),
                  },
                ]}
              >
                <Input
                  type="password"
                  className="st-field-color st-placeholder-color"
                  placeholder={t("passwordSetting.currentPasswordPlaceholder")}
                />
              </Form.Item>
              <Form.Item
                label={
                  <span className="s-text-15 s-text-dark">
                    {t("passwordSetting.newPassword")}
                  </span>
                }
                className="s-label-margin"
                name="password"
                rules={[
                  {
                    required: true,
                    message: t("passwordSetting.newPasswordReq"),
                  },
                  {
                    min: 8,
                    message: t("passwordSetting.newPasswordValidation"),
                  },
                ]}
              >
                <Input.Password
                  className="st-field-color st-placeholder-color"
                  placeholder={t("passwordSetting.newPasswordPlaceholder")}
                />
              </Form.Item>
              <Form.Item
                label={
                  <span className="s-text-15 s-text-dark">
                    {t("passwordSetting.newPasswordAgain")}
                  </span>
                }
                className="s-label-margin"
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  {
                    required: true,
                    message: t("passwordSetting.newPasswordAgainReq"),
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        t("signUp.confirmPasswordValidation"),
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  className="st-field-color st-placeholder-color"
                  placeholder={t("passwordSetting.newPasswordAgainPlaceholder")}
                />
              </Form.Item>
              <Button
                className="tw-float-right tw-ml-4 tw-font-medium s-save-btn s-dark-primary"
                type="primary"
                htmlType={"submit"}
              >
                {t("passwordSetting.updatePassword")}
              </Button>
              <Button className="tw-float-right tw-font-medium s-cancel-btn s-text-muted">
                {t("settings.cancel")}
              </Button>
            </Form>
          </Col>
        </Row>
      </div>
    </Appshell>
  );
};

export default PasswordReset;
