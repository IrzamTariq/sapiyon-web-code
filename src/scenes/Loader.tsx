import { Spin } from "antd";
import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";

interface LoaderProps extends WithTranslation {}

function Loader(props: LoaderProps) {
  return (
    <div
      className={
        "tw-flex tw-flex-column tw-justify-center tw-items-center tw-h-full tw-w-full"
      }
    >
      <div className="tw-text-center">
        <Spin />
        <h2 className="tw-text-2xl tw-block">{props.t("general.loading")}</h2>
      </div>
    </div>
  );
}

export default withTranslation()(Loader);
