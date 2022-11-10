import React from "react";
import { Dropdown } from "antd";
import userIcons, { getUserIconByKey } from "../../assets/user-icons/userIcons";
import { UserIcon } from "../../types";

interface IconOptionProps {
  icon: UserIcon;
  hover?: boolean;
  onSelect?: (iconKey: string) => void;
}

interface IconPickerProps {
  className?: string;
  value?: string;
  onSelect?: (iconKey: string) => void;
}

const IconOption = ({
  icon = getUserIconByKey(),
  onSelect,
  hover = true,
}: IconOptionProps) => (
  <img
    src={icon.svg}
    alt={icon.key}
    className={
      "s-icon-option s-pointer tw-text-blue-500" +
      (hover ? " s-icon-option-hover" : "")
    }
    onClick={() => (onSelect ? onSelect(icon.key) : null)}
  />
);

export const IconPicker = ({ className, onSelect, value }: IconPickerProps) => {
  const selected = getUserIconByKey(value);

  return (
    <Dropdown
      className={className}
      placement="bottomCenter"
      overlay={
        <div
          className="tw-p-5 tw-bg-white tw-flex tw-flex-wrap tw-justify-between tw-shadow-lg tw-rounded"
          style={{ width: "275px" }}
        >
          {Object.values(userIcons).map((icon) => (
            <div className="tw-m-1" key={icon.key}>
              <IconOption icon={icon} onSelect={onSelect} />
            </div>
          ))}
        </div>
      }
    >
      <span>
        <IconOption icon={selected} hover={false} />
      </span>
    </Dropdown>
  );
};
