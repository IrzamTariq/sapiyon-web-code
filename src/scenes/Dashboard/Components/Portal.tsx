import "./Portal.scss";

import React from "react";

interface PortalProps {
  header?: React.ComponentType | JSX.Element;
  body?: React.ComponentType | JSX.Element;
  footer?: React.ComponentType | JSX.Element;
  className?: string;
}

const Portal: React.FC<PortalProps> = ({
  header,
  body,
  children,
  footer,
  className,
}) => {
  return (
    <div className={`Portal tw-bg-white tw-shadow-lg tw-relative`}>
      <div
        className="Portal-head s-modal-title tw-h-16"
        style={{ border: "1px solid #EBEBEB" }}
      >
        {header}
      </div>
      <div className="Portal-body">{body || children}</div>
      {footer ? (
        <div
          className="Portal-footer tw-absolute tw-bottom-0 tw-h-12 tw-w-full tw-px-4 tw-border-t tw-flex tw-items-center s-main-text-color s-main-font tw-text-lg"
          style={{ background: "#FAFAFA" }}
        >
          {footer}
        </div>
      ) : null}
    </div>
  );
};

export default Portal;
