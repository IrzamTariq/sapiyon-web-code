import { FrownOutlined } from "@ant-design/icons";
import { Button } from "antd";
import React, { Component } from "react";
import { withTranslation } from "react-i18next";

class ErrorBoundary extends Component {
  state = { hasError: false, reloaded: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  reloadPage() {
    window.location.reload(1);
  }

  componentDidUpdate() {
    let clr = localStorage.getItem("clr");
    if (clr !== "1") {
      localStorage.setItem("clr", 1);
      if (process.env.REACT_APP_ENV === "production") {
        this.reloadPage();
      }
    } else {
      localStorage.setItem("clr", 0);
    }
  }

  render() {
    const { t } = this.props;

    if (this.state.hasError) {
      return (
        <div className="tw-flex tw-h-full tw-text-4xl tw-items-center tw-justify-center">
          <div className="tw-text-center">
            <div className="tw-mb-4">
              <FrownOutlined />
            </div>
            <div>
              <h1 className={"tw-text-gray-700 tw-mb-4"}>
                {t("globalErrorBoundary.text")}
              </h1>
            </div>
            <div>
              <Button onClick={this.reloadPage} type="primary">
                {t("globalErrorBoundary.reload")}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default withTranslation()(ErrorBoundary);
