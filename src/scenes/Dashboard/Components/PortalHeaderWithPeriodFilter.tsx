import { DatePicker } from "antd";
import { Moment } from "moment";
import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { getPresetDateRanges } from "utils/helpers";
interface PortalHeaderWithFilterProps extends WithTranslation {
  title: string;
  period: Moment[];
  setPeriod: (dateRange: Moment[]) => void;
  allowClear?: boolean;
}

const PortalHeaderWithPeriodFilter = ({
  period,
  setPeriod,
  title,
  allowClear = true,
}: PortalHeaderWithFilterProps) => (
  <div className="tw-flex tw-justify-between tw-items-center tw-h-full tw-px-6">
    <div className="s-modal-title">{title}</div>
    <div className="tw-hidden sm:tw-block">
      <DatePicker.RangePicker
        value={period as [Moment, Moment]}
        onChange={(values) => setPeriod(values as Moment[])}
        ranges={getPresetDateRanges()}
        allowClear={allowClear}
      />
    </div>
  </div>
);

export default withTranslation()(PortalHeaderWithPeriodFilter);
