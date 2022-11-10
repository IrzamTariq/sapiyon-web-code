import React from "react";
import { CSSProperties } from "styled-components";

interface ValidationMessageProps {
  message: string;
  visible: boolean;
  style?: CSSProperties;
  className?: string;
}

const ValidationMessage = ({
  message = "Invalid value",
  visible = false,
  style = {},
  className = "",
}: ValidationMessageProps) => {
  return (
    <div
      style={{
        color: "#ff4d4f",
        ...style,
        transition: "all 300ms",
        height: visible ? "20px" : "0px",
        overflow: "hidden",
        fontSize: "14px",
      }}
      className={className}
    >
      {message}
    </div>
  );
};

export default ValidationMessage;
