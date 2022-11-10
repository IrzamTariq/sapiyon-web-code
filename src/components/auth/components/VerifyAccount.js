import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Spin, Button } from "antd";

import { doVerifyAccountRequest } from "./../../../store/auth";
import { withTranslation } from "react-i18next";

class VerifyAccount extends React.Component {
  componentDidMount() {
    const {
      doVerifyAccountRequest,
      match: {
        params: { _id, verifyToken },
      },
    } = this.props;
    doVerifyAccountRequest({ _id, verifyToken });
  }

  render() {
    const { accountVerification, t } = this.props;
    return (
      <div className="tw-h-screen tw-flex">
        <div className="tw-m-auto tw-text-center">
          {accountVerification.isLoading && (
            <React.Fragment>
              <Spin />
              <h2 className="tw-text-2xl">{t("verifyAcc.verifying")}</h2>
            </React.Fragment>
          )}
          {accountVerification.isDone && (
            <React.Fragment>
              <h2 className="tw-text-2xl">{t("verifyAcc.verified")}</h2>
              <Link to="/login">
                <Button type="primary" className="s-dark-primary">
                  {t("verifyAcc.proceed")}
                </Button>
              </Link>
            </React.Fragment>
          )}
          {accountVerification.error && (
            <React.Fragment>
              <h2 className="tw-text-2xl">
                {accountVerification.error.message}
              </h2>
            </React.Fragment>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return { accountVerification: state.accountVerification };
};

const mapDispatchToProps = {
  doVerifyAccountRequest,
};

const VerifyAcc = connect(mapStateToProps, mapDispatchToProps)(VerifyAccount);

export default withTranslation()(VerifyAcc);
