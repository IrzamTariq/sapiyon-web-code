import { LoadingOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import { Alert, Button, Checkbox, Form, Input } from "antd";
import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { Link, Redirect } from "react-router-dom";

import logo from "./../../../assets/logo/logo-dark.png";
import { loginRequest } from "./../../../store/auth/authentication";

class LoginPage extends Component {
  constructor() {
    super();
    this.formRef = React.createRef();
  }

  render() {
    const { auth, t } = this.props;
    const { isLoggedIn, isLoading, error } = auth;
    if (isLoggedIn) {
      return <Redirect to="/" />;
    }

    return (
      <div
        className="tw-flex tw-justify-center tw-items-center tw-w-full tw-bg-white"
        style={{ height: "100vh" }}
      >
        <div className="tw-m-2 lg:tw-m-0 tw-w-full md:tw-w-6/12 lg:tw-w-4/12">
          <img
            src={logo}
            alt="Sapiyon Logo"
            className="tw-ml-3 md:tw-ml-8 s-mb-25 s-logo-dimensions"
          />
          <div className="tw-rounded s-bg-gray tw-border tw-p-3 md:tw-p-8 tw-shadow-md">
            <h1 className="tw-font-medium tw-text-base tw-text-black">
              {t("login.pageTitle")}
            </h1>
            {error && (
              <div className="tw-my-2">
                <Alert
                  type="error"
                  message={
                    <span className="s-main-font s-main-text-color s-semibold">
                      {t("login.error")}
                    </span>
                  }
                  className="tw-my-6"
                  showIcon
                />
              </div>
            )}
            <Form
              name="login-form"
              onFinish={this.props.loginRequest}
              className="tw-mt-2"
              ref={this.formRef}
            >
              <Form.Item
                name="email"
                rules={[{ required: true, message: t("login.emailReq") }]}
              >
                <Input
                  placeholder={t("login.username")}
                  prefix={<UserOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ required: true, message: t("login.passwordReq") }]}
              >
                <Input.Password
                  placeholder={t("login.password")}
                  prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                />
              </Form.Item>
              <Checkbox>{t("login.rememberMe")}</Checkbox>
              <Button
                type="primary"
                className="tw-mt-4 tw-mb-2"
                htmlType="submit"
                disabled={isLoading}
                block
              >
                <div className="tw-h-full tw-w-full tw-flex tw-items-center tw-justify-center">
                  {isLoading && <LoadingOutlined className="tw-mr-2" />}
                  {t("login.signIn")}
                </div>
              </Button>
            </Form>
            <div className="tw-flex tw-justify-between tw-flex-wrap tw-mt-5">
              <Link className="tw-text-blue-600" to="/forget-password">
                {t("login.forgotPassword")}
              </Link>
              <div>
                <span className="s-text-muted">{t("login.noAccount")}</span>
                <Link className="tw-ml-4 tw-text-blue-600" to="/signup">
                  {t("login.signUp")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const Translated = connect((state) => ({ auth: state.auth }), { loginRequest })(
  LoginPage,
);
export default withTranslation()(Translated);
