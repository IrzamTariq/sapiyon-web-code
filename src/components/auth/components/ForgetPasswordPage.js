import { UserOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input, Spin } from "antd";
import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { Link, Redirect } from "react-router-dom";

import logo from "./../../../assets/logo/logo-dark.png";
import { doForgetPasswordRequest } from "./../../../store/auth";

class ForgetPasswordPage extends Component {
  render() {
    const {
      auth,
      location,
      forgetPasswordRequest,
      doForgetPasswordRequest,
      t,
    } = this.props;

    if (auth.isLoggedIn) {
      return <Redirect to="/" />;
    }

    if (forgetPasswordRequest.isLoading) {
      return (
        <React.Fragment>
          <div className="tw-h-screen tw-flex">
            <div className="tw-m-auto tw-text-center">
              <Spin />
              <h2 className="tw-text-2xl">
                {t("forgotPassword.sendingEmail")}
              </h2>
            </div>
          </div>
        </React.Fragment>
      );
    }

    if (forgetPasswordRequest.isDone) {
      return (
        <div className="tw-h-screen tw-flex">
          <div className="tw-m-auto tw-text-center">
            <React.Fragment>
              <h2 className="tw-stext-2xl tw-mb-4">
                {t("forgotPassword.checkMail")}
              </h2>
              <Link to="/login">
                <Button type="primary" className="s-dark-primary">
                  {t("forgotPassword.proceed")}
                </Button>
              </Link>
            </React.Fragment>
          </div>
        </div>
      );
    }

    return (
      <div className="tw-h-screen tw-flex">
        <div className="tw-m-auto">
          <img
            src={logo}
            alt="Sapiyon Logo"
            className="tw-ml-8 s-mb-25 s-logo-dimensions"
          />
          <div className="s-shadow tw-rounded s-bg-gray tw-px-8 tw-border tw-shadow-md">
            <h1 className="tw-pt-5 tw-font-medium tw-text-base tw-text-black">
              {t("forgotPassword.forgot")}
            </h1>
            {forgetPasswordRequest.error && (
              <React.Fragment>
                <Alert
                  type="error"
                  message={forgetPasswordRequest.error.message}
                />
              </React.Fragment>
            )}
            {location.state && location.state.error && (
              <div className="tw-my-2">
                <Alert type="error" message={location.state.error} />
              </div>
            )}

            <p>{t("forgotPassword.enterEmail")}</p>

            <Form
              name="forget-password-form"
              onFinish={doForgetPasswordRequest}
              className="tw-m-0"
            >
              <Form.Item
                name="email"
                rules={[{ required: true, message: t("login.emailReq") }]}
              >
                <Input
                  placeholder={t("forgotPassword.username")}
                  prefix={<UserOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="tw-font-medium"
                  disabled={forgetPasswordRequest.isLoading}
                  block
                >
                  {t("forgotPassword.resetBtn")}
                </Button>
                <Link className="tw-text-blue-600 s-text-dark" to="/login">
                  {t("forgotPassword.login")}
                </Link>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    );
  }
}

const ForgotPassword = connect(
  (state) => ({
    auth: state.auth,
    forgetPasswordRequest: state.forgetPasswordRequest,
  }),
  { doForgetPasswordRequest },
)(ForgetPasswordPage);

export default withTranslation()(ForgotPassword);
