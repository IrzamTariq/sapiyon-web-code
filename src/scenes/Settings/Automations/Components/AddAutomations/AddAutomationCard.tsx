import { Button } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";

interface AddAutomationCardProps {
  title: string;
  onAdd: () => void;
  disabled?: boolean;
  disableMsg?: string;
}

const AddAutomationCard = ({
  title,
  onAdd,
  disableMsg = "",
  disabled = false,
}: AddAutomationCardProps) => {
  const [t] = useTranslation();

  return (
    <div
      className="tw-bordered tw-rounded tw-p-4 tw-flex tw-flex-col tw-justify-between s-std-text tw-text-lg"
      style={{
        minHeight: "180px",
        backgroundColor: "#F8F8F8",
        border: "1px solid #CBD6E2",
      }}
    >
      <span>{title}</span>
      <Button
        type="link"
        className="tw-ml-auto tw-text-lg tw-p-0"
        onClick={onAdd}
        disabled={disabled}
      >
        {disabled ? (
          <span className="tw-text-sm tw-text-red-500">{disableMsg}</span>
        ) : (
          t("global.add")
        )}
      </Button>
    </div>
  );
};

export default AddAutomationCard;
