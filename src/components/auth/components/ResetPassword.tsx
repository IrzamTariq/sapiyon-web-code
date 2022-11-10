import { LockOutlined } from "@ant-design/icons";
import { Button, Form, Input } from "antd";
import logger from "logger";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Redirect, useParams } from "react-router-dom";
import { PasswordResetService } from "services";

const ResetPassword = () => {
  const [form] = Form.useForm();
  const [t] = useTranslation();
  const _id = useParams<{ _id: string }>()._id;
  const resetToken = useParams<{ resetToken: string }>().resetToken;
  const [state, setState] = useState({
    loading: false,
    isDone: false,
    error: false as any,
  });

  const handleSubmit = () => {
    setState((old) => ({ ...old, loading: true }));
    form.validateFields().then((accInfo) => {
      PasswordResetService.create(accInfo).then(
        (res: any) => {
          setState({ loading: false, isDone: true, error: false });
          form.resetFields();
        },
        (error: Error) => {
          logger.error("Error in resetting password: ", error);
          setState({ loading: false, isDone: false, error });
        },
      );
    });
  };

  useEffect(() => {
    form.setFieldsValue({ _id, resetToken });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state.error) {
    return (
      <Redirect
        to={{
          pathname: "/forget-password",
          state: { error: state?.error?.message },
        }}
      />
    );
  }

  return (
    <div className="tw-h-screen tw-flex">
      <div className="tw-bg-white tw-m-auto sm:tw-w-full md:tw-max-w-md tw-border tw-px-5 tw-shadow-md">
        <div className="tw-mt-2">
          {state.isDone ? (
            <div className="tw-p-5 tw-text-center">
              <h2 className="tw-text-2xl tw-mb-4">{t("resetPassword.msg")}</h2>
              <Link to="/login">
                <Button type="primary">{t("resetPassword.proceed")}</Button>
              </Link>
            </div>
          ) : (
            <React.Fragment>
              <h1 className="tw-text-center tw-text-4xl tw-pt-5 tw-text-gray-700">
                {t("resetPassword.pageTitle")}
              </h1>

              <Form name="reset-password-form" form={form}>
                <Form.Item name="_id" hidden noStyle>
                  <Input />
                </Form.Item>
                <Form.Item name="resetToken" hidden noStyle>
                  <Input />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: t("signUp.passwordReq") },
                    {
                      min: 8,
                      message: t("signUp.passwordValidation"),
                    },
                  ]}
                >
                  <Input.Password
                    placeholder={t("resetPassword.password")}
                    prefix={
                      <LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />
                    }
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
                >
                  <Input.Password
                    placeholder={t("resetPassword.confirm")}
                    prefix={
                      <LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />
                    }
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    className="s-btn-spinner-align"
                    type="primary"
                    onClick={handleSubmit}
                    loading={state.loading}
                    disabled={state.loading}
                    block
                  >
                    {state.loading
                      ? t("resetPassword.resetting")
                      : t("resetPassword.submit")}
                  </Button>
                </Form.Item>
              </Form>
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
