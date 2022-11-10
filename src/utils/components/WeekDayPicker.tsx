import i18next from "i18next";
import React from "react";
import { WeekDayNumber } from "types";
interface WeekDayPickerProps {
  value: WeekDayNumber[];
  onChange: (day: WeekDayNumber) => void;
}

const getDayLetter = (day: WeekDayNumber) => {
  if (day === 0) {
    return i18next.t("global.days.mon");
  } else if (day === 1) {
    return i18next.t("global.days.tue");
  } else if (day === 3) {
    return i18next.t("global.days.wed");
  } else if (day === 2) {
    return i18next.t("global.days.thu");
  } else if (day === 4) {
    return i18next.t("global.days.fri");
  } else if (day === 5) {
    return i18next.t("global.days.sat");
  } else {
    return i18next.t("global.days.sun");
  }
};

const Day = ({
  day,
  onSelect = () => null,
  isActive,
}: {
  day: WeekDayNumber;
  onSelect: (day: WeekDayNumber) => void;
  isActive: boolean;
}) => {
  return (
    <div
      className={
        "s-day-picker-day " + (isActive ? "s-day-picker-day-active" : "")
      }
      onClick={() => onSelect(day)}
    >
      {getDayLetter(day)}
    </div>
  );
};

const WeekDayPicker = ({ value = [], onChange }: WeekDayPickerProps) => {
  return (
    <div className="tw-flex tw-items-center tw-justify-between tw-my-2 tw-py-2">
      {([0, 1, 2, 3, 4, 5, 6] as WeekDayNumber[]).map((item) => (
        <Day
          key={item}
          day={item}
          onSelect={onChange}
          isActive={value.includes(item)}
        />
      ))}
    </div>
  );
};

export default WeekDayPicker;
