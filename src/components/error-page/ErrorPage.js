import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./ErrorPage.scss";
import { withTranslation } from "react-i18next";

class ErrorPage extends Component {
  render() {
    const { t } = this.props;
    return (
      <div className="ErrorPage">
        <h1 className="">404</h1>
        <p className="">{t("errorPage.error")}</p>
        <div className="tw-mt-5 tw-text-center">
          <Link className="button" to="/">
            {t("errorPage.goToHome")}
          </Link>
        </div>
      </div>
    );
  }
}
export default withTranslation()(ErrorPage);
