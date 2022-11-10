import { Button } from "antd";
import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";

import noDataImg from "../../../../assets/images/empty-folder.svg";

interface TasklistPlaceholderProps extends WithTranslation {
  primaryAction?: () => void;
  primaryText: string;
  secondaryText: string;
  auxiliaryText?: string;
  primaryBtnText: string;
  heightReduction?: number;
  topBorder?: boolean;
  fixHeight?: number | false;
}

const TasklistPlaceholder = ({
  t,
  primaryAction,
  primaryText,
  secondaryText,
  auxiliaryText,
  primaryBtnText,
  heightReduction = 142,
  topBorder = false,
  fixHeight = false,
}: TasklistPlaceholderProps) => {
  return (
    <div
      style={{
        height: fixHeight
          ? `${fixHeight}px`
          : `calc(100% - ${heightReduction}px)`,
        borderTop: topBorder ? "1px solid #f1f1f1" : "none",
      }}
      className="tw-flex tw-justify-center tw-items-center tw-bg-white tw-py-4"
    >
      <div className="tw-h-full tw-flex tw-flex-col tw-justify-center tw-text-center ">
        <img
          src={noDataImg}
          alt="No data"
          className="tw-hidden lg:tw-inline"
          style={{
            height: "20%",
            opacity: "0.6",
            maxHeight: "180px",
          }}
        />
        <h2
          className="tw-w-full sm:tw-text-lg md:tw-text-xl lg:tw-text-3xl s-main-font s-semibold"
          style={{ color: "#555" }}
        >
          {primaryText}
        </h2>
        <p
          className="s-main-font tw-text-lg tw-mx-auto tw-mt-2 tw-w-10/12 lg:tw-w-8/12"
          style={{ color: "#555" }}
        >
          {secondaryText}
        </p>
        {auxiliaryText ? (
          <p
            className="s-main-font tw-mx-auto lg:tw-w-8/12"
            style={{ color: "#555" }}
          >
            {auxiliaryText}
          </p>
        ) : null}
        {primaryAction ? (
          <Button
            size="large"
            onClick={primaryAction}
            className="tw:tw-px-2 lg:tw-px-16 tw-mx-auto tw-mt-10"
            type="primary"
          >
            <div className="s-main-font s-semibold tw-uppercase">
              {primaryBtnText}
            </div>
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default withTranslation()(TasklistPlaceholder);
