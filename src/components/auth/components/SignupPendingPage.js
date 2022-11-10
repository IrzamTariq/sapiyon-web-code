import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, Redirect } from "react-router-dom";
import { Button, Alert } from "antd";

import { doResendVerifyEmailRequest } from "./../../../store/auth";
import { withTranslation } from "react-i18next";

export class SignupPage extends Component {
  constructor(props) {
    super(props);
    this.resendVerifyEmail = this.resendVerifyEmail.bind(this);
  }
  resendVerifyEmail(email) {
    const { doResendVerifyEmailRequest } = this.props;
    doResendVerifyEmailRequest(email);
  }

  render() {
    const {
      auth,
      match: {
        params: { email },
      },
      resendAccountVerification,
      t,
    } = this.props;

    if (auth.isLoggedIn) {
      return <Redirect to="/" />;
    }

    return (
      <div className="tw-h-screen tw-flex">
        <div className="tw-text-center tw-bg-white tw-m-auto sm:tw-w-full md:tw-max-w-md tw-px-5">
          <h1 className="tw-text-4xl tw-pt-5 tw-text-gray-700">
            {t("signUpPending.confirmEmail")}
          </h1>
          <p>
            {t("signUpPending.check")} <strong>{email}</strong>{" "}
            {t("signUpPending.yourEmail")}
          </p>
          {resendAccountVerification.isDone && (
            <Alert type="success" message={t("signUpPending.reSent")} />
          )}
          <Button
            onClick={() => this.resendVerifyEmail(email)}
            className="tw-mt-5 tw-mb-1 tw-bg-gray-200"
            loading={resendAccountVerification.isLoading}
          >
            {resendAccountVerification.isLoading
              ? t("signUpPending.reSendingBtn")
              : t("signUpPending.reSendBtn")}
          </Button>
          <p>
            {t("signUpPending.haveAcc")}{" "}
            <Link to="/login" className="tw-text-blue-400">
              {t("signUpPending.login")}
            </Link>
          </p>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    auth: state.auth,
    signup: state.signup,
    resendAccountVerification: state.resendAccountVerification,
  };
};

const mapDispatchToProps = {
  doResendVerifyEmailRequest,
};

const SignUp = connect(mapStateToProps, mapDispatchToProps)(SignupPage);

export default withTranslation()(SignUp);
