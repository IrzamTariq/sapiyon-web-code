import { Dropdown } from "antd";
import React from "react";
import { isColorWhite } from "utils/helpers";

const ColorOption = ({ color, onSelect }) => (
  <div
    style={{ backgroundColor: color }}
    className="tw-w-4 tw-h-4 tw-m-2 tw-rounded-full"
    onClick={() => onSelect(color)}
  />
);

export const colors = [
  "#e966c3",
  "#ea5688",
  "#bc3f54",
  "#7e5347",
  "#eb6033",
  "#facb3e",
  "#cab741",
  "#9cd32d",
  "#3e7f4d",
  "#66ccfa",
  "#a363dc",
  "#7a59d1",
  "#808080",
  "#333333",
  "#ec7273",
  "#eea0f0",
  "#f2acac",
  "#7e3f8a",
  "#9badbc",
  "#68a1be",
  "#214f90",
  "#60cdc7",
  "#555ce0",
  "#453c94",
];

const ColorSelect = ({
  value = "#fff",
  colors = [],
  trigger = ["hover"],
  onSelect,
  disable = false,
}) => (
  <Dropdown
    disabled={disable}
    trigger={trigger}
    overlay={
      <div className="tw-bg-white tw-shadow tw-rounded tw-flex tw-flex-wrap">
        <div className="tw-flex tw-flex-wrap tw-w-48">
          {colors &&
            colors.map((color) => (
              <ColorOption
                key={color}
                color={color}
                onSelect={(choice) => onSelect(choice)}
              />
            ))}
        </div>
      </div>
    }
  >
    <div
      style={{ backgroundColor: value }}
      className={`tw-m-2 tw-rounded-full ${
        isColorWhite(value) ? "tw-shadow-md" : ""
      } ${disable ? "tw-h-4 tw-w-4" : "tw-h-6 tw-w-6"}`}
    />
  </Dropdown>
);

export default ColorSelect;
