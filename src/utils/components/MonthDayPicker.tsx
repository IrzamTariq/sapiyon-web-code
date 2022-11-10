import { Button, Dropdown } from "antd";
import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { MonthDayNumber } from "types";

interface MonthDayPickerProps extends WithTranslation {
  value: MonthDayNumber;
  onChange: (day: MonthDayNumber) => void;
}
const monthDays: MonthDayNumber[] = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,
  29,
  30,
  31,
];

const MonthDayPicker = ({ t, value, onChange }: MonthDayPickerProps) => {
  return (
    <Dropdown
      trigger={["click"]}
      overlay={
        <div className="tw-p-5 s-monthday-picker-tray">
          <h3 className="s-main-text-color s-main-font tw-text-center tw-border-b tw-mb-3">
            {t("monthDayPicker.title")}
          </h3>
          {monthDays.map((item) => (
            <div
              key={item}
              className={
                "s-monthday-picker-item" +
                (item === value ? " s-monthday-picker-item-active" : "")
              }
              onClick={() => onChange(item)}
            >
              {item}
            </div>
          ))}
        </div>
      }
    >
      <Button type="link" className="tw-px-0">
        {`${t("monthDayPicker.selected-tr-1")} ${value || 1}. ${t(
          "monthDayPicker.ofTheMonth",
        )}`}
      </Button>
    </Dropdown>
  );
};

export default withTranslation()(MonthDayPicker);
