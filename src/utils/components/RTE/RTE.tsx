import "./rte.css";

import { Button, ButtonProps } from "antd";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import RichTextEditor, { EditorValue } from "react-rte";

interface RTEProps {
  value: string | undefined;
  onChange: (html: string) => void;
  latestValue?: string;
  extra?: React.ReactNode;
  actionBtns?: boolean;
  requiredMsg?: string;
  placeholder?: string;
  required?: boolean;
  touched?: boolean;
  lable?: string;
  handleOk?: () => void;
  handleCancel?: () => void;
  ripple?: boolean;
  okBtnProps?: Omit<ButtonProps, "size" | "type" | "onClick">;
}
export const getRTEText = (html = "") =>
  new DOMParser()
    .parseFromString(html, "text/html")
    .documentElement.innerText.trim() || "";

export const isRTEValueValid = (html = "") =>
  !!html && getRTEText(html).length > 0;

export const getRTEMarkup = (html = "") => (
  <div className="s-rte" dangerouslySetInnerHTML={{ __html: html }} />
);

const RTE = ({
  value = "",
  onChange,
  required,
  touched = true,
  requiredMsg,
  placeholder,
  lable,
  extra = null,
  actionBtns = false,
  handleCancel,
  handleOk,
  ripple = false,
  latestValue = "",
  okBtnProps,
}: RTEProps) => {
  const [t] = useTranslation();
  const [editor, setEditor] = useState(RichTextEditor.createEmptyValue());
  const rippleRef = React.useRef(ripple);

  const handleChange = (value: EditorValue) => {
    setEditor(value);
    onChange(value.toString("html"));
  };

  useEffect(() => {
    setEditor(RichTextEditor.createValueFromString(value, "html"));

    return () => setEditor(RichTextEditor.createEmptyValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (rippleRef.current !== ripple) {
      setEditor(RichTextEditor.createValueFromString(latestValue, "html"));
      rippleRef.current = ripple;
    }

    return () => setEditor(RichTextEditor.createEmptyValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ripple]);

  const RTEConfig: any = React.useMemo(
    () => ({
      display: [
        "INLINE_STYLE_BUTTONS",
        "BLOCK_TYPE_BUTTONS",
        "BLOCK_TYPE_DROPDOWN",
      ],
      INLINE_STYLE_BUTTONS: [
        { label: t("RTE.bold"), style: "BOLD", className: "custom-css-class" },
        { label: t("RTE.italic"), style: "ITALIC" },
        { label: t("RTE.underline"), style: "UNDERLINE" },
      ],
      BLOCK_TYPE_DROPDOWN: [
        { label: "Normal", style: "unstyled" },
        { label: t("RTE.heading1"), style: "header-one" },
        { label: t("RTE.heading2"), style: "header-two" },
        { label: t("RTE.heading3"), style: "header-three" },
      ],
      BLOCK_TYPE_BUTTONS: [
        { label: "UL", style: "unordered-list-item" },
        { label: "OL", style: "ordered-list-item" },
      ],
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div
      className="s-rte"
      style={{
        position: "relative",
        marginBottom: actionBtns ? "30px" : "20px",
      }}
    >
      <div className="tw-mb-2 tw-flex tw-items-center">
        <div className="tw-mr-auto">{lable}</div>
        <div>{extra}</div>
      </div>
      <RichTextEditor
        toolbarConfig={RTEConfig}
        value={editor}
        onChange={handleChange}
        placeholder={placeholder}
        toolbarStyle={{
          borderBottom: 0,
          margin: "0px",
          backgroundColor: "#f5f8fa",
          padding: "10px",
        }}
        editorStyle={{ fontFamily: "Roboto", backgroundColor: "#f5f8fa" }}
      />
      <div
        style={{
          height:
            required && touched && !isRTEValueValid(editor.toString("html"))
              ? "20px"
              : "0px",
          transition: "all 400ms",
          color: "#ff4d4f",
          overflow: "hidden",
          position: "absolute",
          bottom: actionBtns ? "-24px" : "-20px",
        }}
      >
        {requiredMsg}
      </div>
      {actionBtns ? (
        <div className="tw-absolute tw-right-0 tw-mt-1">
          <Button size="small" onClick={handleCancel} className="tw-mr-2">
            {t("global.cancel")}
          </Button>
          <Button
            size="small"
            type="primary"
            onClick={handleOk}
            {...okBtnProps}
          >
            {t("global.save")}
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default RTE;
