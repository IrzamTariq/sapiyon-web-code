import React, { CSSProperties, ReactNode } from "react";
import { withTranslation, WithTranslation } from "react-i18next";
import "./logoBG.css";

interface SapiyonLogoBackgroundProps extends WithTranslation {
  children: ReactNode;
  dimensions: CSSProperties;
}

const SapiyonLogoBackground = ({
  t,
  children,
  dimensions,
}: SapiyonLogoBackgroundProps) => {
  return (
    <div className="bg-container">
      <div className="box" style={dimensions}>
        <div className="strip-container">
          <div className="strip strip-1 strip-1-3"></div>
          <div className="strip strip-2"></div>
          <div className="strip strip-3 strip-1-3"></div>
        </div>
      </div>
      <div className="foreground">{children}</div>
    </div>
  );
};

export default withTranslation()(SapiyonLogoBackground);
