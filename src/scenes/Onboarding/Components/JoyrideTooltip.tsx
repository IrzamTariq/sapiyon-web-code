import { Button, Divider } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";
import { TooltipRenderProps } from "react-joyride";

interface JoyrideTooltipProps extends TooltipRenderProps {
  cancelTour: () => void;
}

const JoyrideTooltip = ({
  tooltipProps,
  step,
  cancelTour,
}: JoyrideTooltipProps) => {
  const [t] = useTranslation();
  const { title, content } = step;
  return (
    <div
      {...tooltipProps}
      className="tw-bg-white tw-p-4 tw-rounded-md s-std-text"
      style={{ minWidth: "400px", zIndex: 10000 }}
    >
      {title ? (
        <>
          <div className="s-semibold tw-text-lg">{title}</div>
          <Divider className="tw-mt-0 tw-mb-3" />
        </>
      ) : null}
      {content ? <div className="tw-text-base">{content}</div> : null}
      <div className="tw-flex tw-justify-end tw-mt-10">
        <Button size="small" type="link" danger onClick={cancelTour}>
          {t("introTour.skip")}
        </Button>
      </div>
    </div>
  );
};

export default JoyrideTooltip;
