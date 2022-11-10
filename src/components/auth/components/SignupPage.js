import {
  LoadingOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  ShopOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Alert, Button, Checkbox, Form, Input } from "antd";
import React from "react";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { Link, Redirect } from "react-router-dom";

import logo from "./../../../assets/logo/logo-dark.png";
import { doSignupRequest } from "./../../../store/auth";

const SignupPage = ({ auth, signup, t, doSignupRequest }) => {
  const [form] = Form.useForm();

  if (auth.isLoggedIn) {
    return <Redirect to="/" />;
  }
  const getErrorMessage = (error) => {
    if (+error.code === 409) {
      return t("signup.emailTaken");
    } else {
      return error.message;
    }
  };
  const submit = () => {
    form.validateFields().then(doSignupRequest, () => null);
  };

  return (
    <div
      className="tw-flex tw-justify-center tw-items-center tw-w-full tw-bg-white"
      style={{ minHeight: "100vh" }}
    >
      <div className="tw-mx-2 md:tw-mx-0 tw-w-full md:tw-w-6/12 lg:tw-w-4/12">
        <img
          src={logo}
          alt="Sapiyon"
          className="tw-ml-3 md:tw-ml-8 s-mb-25 s-logo-dimensions"
        />
        <div className="tw-rounded s-bg-gray tw-border tw-p-3 md:tw-p-8 tw-shadow-md">
          <h1 className="tw-font-medium tw-text-base">
            {t("signUp.pageTitle")}
          </h1>
          {signup.error && (
            <Alert
              type="error"
              message={
                <span className="s-main-font s-main-text-color s-semibold">
                  {getErrorMessage(signup.error)}
                </span>
              }
              className="tw-my-6"
              showIcon
            />
          )}
          <Form form={form} className="tw-mt-2" scrollToFirstError>
            <Form.Item
              name="fullName"
              rules={[{ required: true, message: t("signUp.fullNameReq") }]}
              className="s-label-margin"
            >
              <Input
                className="st-placeholder-color"
                placeholder={t("signUp.fullName")}
                prefix={<UserOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
              />
            </Form.Item>
            <Form.Item name="firmBusinessName" className="s-label-margin">
              <Input
                className="st-placeholder-color"
                placeholder={t("signUp.companyName")}
                prefix={<ShopOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
              />
            </Form.Item>
            <Form.Item
              name="firmPhone"
              rules={[
                {
                  pattern: "^[+0-9]{10,14}$",
                  message: t("global.phoneFormat"),
                },
              ]}
              className="s-label-margin"
            >
              <Input
                className="st-placeholder-color"
                placeholder={t("signUp.telephone")}
                prefix={<PhoneOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
              />
            </Form.Item>
            <Form.Item
              name="email"
              rules={[
                { required: true, message: t("signUp.usernameReq") },
                { type: "email", message: t("signUp.validEmail") },
              ]}
              className="s-label-margin"
            >
              <Input
                className="st-placeholder-color"
                placeholder={t("signUp.username")}
                prefix={<MailOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: t("signUp.passwordReq"),
                },
                {
                  min: 8,
                  message: t("signUp.passwordValidation"),
                },
              ]}
              className="s-label-margin"
            >
              <Input.Password
                className="st-placeholder-color"
                placeholder={t("signUp.password")}
                prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
              />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: t("signUp.confirmPassword") },
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
              className="s-label-margin"
            >
              <Input.Password
                type="password"
                className="st-placeholder-color"
                placeholder={t("changePassword.confirmPassword")}
                prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
              />
            </Form.Item>

            <Form.Item
              name="termsAndConditions"
              valuePropName="checked"
              rules={[
                {
                  validator: (rule, value) =>
                    !!value
                      ? Promise.resolve()
                      : Promise.reject(t("signUp.checkTerms")),
                },
              ]}
              className="s-label-margin"
            >
              <Checkbox>
                <span className="s-main-font">
                  {t("signUP.agreement.eng1")}
                  <Button
                    type="link"
                    href="https://sapiyon.com/kullanici-sozlesmesi"
                    className="tw-m-0 tw-p-0"
                    target="_blank"
                  >
                    <span className="s-semibold">
                      {t("signUp.agreement.termsOfUse")}
                    </span>
                  </Button>
                  {t("signUp.and")}
                  <Button
                    type="link"
                    href="https://sapiyon.com/gizlilik-sozlesmesi"
                    className="tw-m-0 tw-p-0"
                    target="_blank"
                  >
                    <span className="s-semibold">
                      {t("signUp.agreement.privacyPolicy")}
                    </span>
                  </Button>
                  {t("signUp.agreement.tr2")}
                </span>
              </Checkbox>
            </Form.Item>
            <Button
              type="primary"
              className="tw-font-medium s-h-32 s-dark-primary"
              onClick={submit}
              disabled={signup.isLoading}
              block
            >
              <div className="tw-h-full tw-w-full tw-flex tw-items-center tw-justify-center">
                {signup.isLoading && <LoadingOutlined className="tw-mr-2" />}
                {t("signUp.submitBtn")}
              </div>
            </Button>
            <div className="tw-text-right s-text-muted tw-mt-5">
              {t("signUp.haveAcc")}
              <Link className="tw-ml-4 tw-mb-5 tw-text-blue-600" to="/login">
                {t("signUp.signIn")}
              </Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

const Translated = withTranslation()(SignupPage);

export default connect(
  (state) => ({
    auth: state.auth,
    signup: state.signup,
  }),
  { doSignupRequest },
)(Translated);
