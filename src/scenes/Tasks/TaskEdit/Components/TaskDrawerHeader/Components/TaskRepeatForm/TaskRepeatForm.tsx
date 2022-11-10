import {
  Button,
  Col,
  DatePicker,
  Form,
  InputNumber,
  Modal,
  Radio,
  Row,
  Select,
  TimePicker,
  message,
} from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import RRule from "rrule";
import MonthDayPicker from "utils/components/MonthDayPicker";
import WeekDayPicker from "utils/components/WeekDayPicker";
import { getFreqString } from "utils/helpers";

import {
  HourNumber,
  RecurrenceConfig,
  WeekDayNumber,
} from "../../../../../../../types";

moment.locale("tr");

const workingHoursRange: HourNumber[] = [9, 18];
const TimeZone = -1 * Math.round(new Date().getTimezoneOffset() / 60);

const getWorkingHours = (
  workingHours: HourNumber[],
  tz = TimeZone,
): HourNumber[] => {
  let wh = [] as HourNumber[];
  const from = workingHours[0] || 0;
  const to = workingHours[1] || 0;
  for (let i = from; i < to; i++) {
    const hour = (i - tz >= 0 ? i - tz : 23 + (i - tz)) as HourNumber;
    wh.push(hour);
  }
  return wh;
};
const getConfig = (
  recurrence: RecurrenceConfig,
  workingHours: HourNumber[],
  limitByDate: boolean,
) => {
  let config = Object.assign({}, recurrence);
  if (config.freq !== RRule.WEEKLY) {
    delete config.byweekday;
  }
  if (config.freq !== RRule.MONTHLY) {
    delete config.bymonthday;
  }
  if (config.freq === RRule.MINUTELY || config.freq === RRule.HOURLY) {
    config = Object.assign({}, config, {
      byhour: getWorkingHours(workingHours),
    });
  } else {
    delete config.byhour;
  }
  if (limitByDate) {
    delete config.count;
  } else {
    delete config.until;
  }
  return config;
};

interface TaskRepeatFormProps extends WithTranslation {
  updateRecurrence: (rec: RecurrenceConfig) => void;
  handleCancel: () => void;
  visible: boolean;
}

function TaskRepeatForm({
  t,
  visible,
  handleCancel,
  updateRecurrence,
}: TaskRepeatFormProps) {
  const [recurrence, setRecurrence] = useState<RecurrenceConfig>({
    dtstart: moment().startOf("minute").toDate(),
    until: undefined,
    count: undefined,
    freq: RRule.DAILY,
    interval: 1,
    byweekday: [0],
    byhour: getWorkingHours(workingHoursRange, TimeZone),
  });
  const [limitRecurrenceByDate, setLimitRecurrenceByDate] = useState(true);
  const [all, setAll] = useState(0);
  const [timeRange, setTimeRange] = useState(workingHoursRange);
  useEffect(() => {
    const config = getConfig(recurrence, timeRange, limitRecurrenceByDate);
    // console.log("Recurrence, config: ", recurrence, config);
    if (
      (recurrence.until || (recurrence.count || 0) > 0) &&
      (!(
        recurrence.freq === RRule.MINUTELY || recurrence.freq === RRule.HOURLY
      ) ||
        ((recurrence.freq === RRule.MINUTELY ||
          recurrence.freq === RRule.HOURLY) &&
          getWorkingHours(timeRange).length > 0))
    ) {
      if (
        (recurrence.freq === RRule.MINUTELY ||
          recurrence.freq === RRule.HOURLY) &&
        moment(recurrence.dtstart).isAfter(
          moment().hours(timeRange[1]).minutes(0),
        ) &&
        moment(recurrence.dtstart).format("H:m") !== `${timeRange[0]}:0`
      ) {
        let startDate = moment(recurrence.dtstart)
          .add(1, "day")
          .hours(timeRange[0])
          .minutes(0);
        const dtstart = startDate.toDate();
        setRecurrence((prev) => ({ ...prev, dtstart }));
      }
      const rrule = new RRule(config);
      setAll(rrule.all().length);
    } else {
      setAll(0);
    }
  }, [recurrence, limitRecurrenceByDate, timeRange]);

  const handleSubmit = () => {
    if (recurrence.until || (recurrence.count || 0) > 0) {
      if (all > 0) {
        const config = getConfig(recurrence, timeRange, limitRecurrenceByDate);
        updateRecurrence(config);
        // console.log("Repetitions: ", config, new RRule(config).all());
      } else {
        message.error(t("taskRepeat.noSeparation"));
      }
    } else {
      message.error(t("taskRepeat.noLimit"));
    }
  };

  const updateWeekday = (day: WeekDayNumber) => {
    const weekdays = new Set<WeekDayNumber>(recurrence.byweekday);
    weekdays.has(day) ? weekdays.delete(day) : weekdays.add(day);
    if (weekdays.size === 0) {
      weekdays.add(0);
    }
    setRecurrence((prev) => ({ ...prev, byweekday: Array.from(weekdays) }));
  };

  return (
    <Modal
      destroyOnClose={true}
      visible={visible}
      title={<span className="s-modal-title">{t("taskRepeat.pageTitle")}</span>}
      onCancel={handleCancel}
      width={500}
      okButtonProps={{ className: "tw-mr-2" }}
      bodyStyle={{ padding: "24px" }}
      footer={
        <div className="s-main-text-color s-main-font tw-flex tw-items-center tw-mx-2">
          <span className="s-semibold tw-mr-auto">
            {t("taskRepeat.repeats")} {all} {t("taskRepeat.time")}
          </span>
          <Button onClick={handleCancel}>{t("global.cancel")}</Button>
          <Button type="primary" onClick={handleSubmit}>
            {t("global.save")}
          </Button>
        </div>
      }
    >
      <Row className="tw-mb-6">
        <Col span={24}>
          <div className="tw-flex tw-items-center tw-w-full">
            <span className="s-main-font s-main-text-color">
              {t("taskRepeat.repeatEvery")}
            </span>
            <InputNumber
              min={1}
              disabled={recurrence.freq === RRule.MINUTELY}
              value={recurrence.interval}
              onChange={(interval = 1) =>
                setRecurrence((prev) => ({
                  ...prev,
                  interval: (interval as number) > 0 ? (interval as number) : 1,
                }))
              }
              className="st-field-color st-placeholder-color tw-flex-grow tw-mx-5"
            />
            <Select
              className="st-field-color st-placeholder-color tw-w-6/12"
              value={{
                key: `${recurrence.freq}`,
                value: recurrence.freq,
                label: t(`taskRepeat.${getFreqString(recurrence.freq)}`),
              }}
              onChange={(value) => {
                setRecurrence((prev) => ({
                  ...prev,
                  freq: +value?.key,
                  interval: +value.key === RRule.MINUTELY ? 30 : 1,
                  dtstart: moment().toDate(),
                }));
              }}
              labelInValue
            >
              <Select.Option key={RRule.MINUTELY} value={RRule.MINUTELY}>
                {t("taskRepeat.minute")}
              </Select.Option>
              <Select.Option key={RRule.HOURLY} value={RRule.HOURLY}>
                {t("taskRepeat.hour")}
              </Select.Option>
              <Select.Option key={RRule.DAILY} value={RRule.DAILY}>
                {t("taskRepeat.day")}
              </Select.Option>
              <Select.Option key={RRule.WEEKLY} value={RRule.WEEKLY}>
                {t("taskRepeat.week")}
              </Select.Option>
              <Select.Option key={RRule.MONTHLY} value={RRule.MONTHLY}>
                {t("taskRepeat.month")}
              </Select.Option>
              <Select.Option key={RRule.YEARLY} value={RRule.YEARLY}>
                {t("taskRepeat.year")}
              </Select.Option>
            </Select>
          </div>
        </Col>
      </Row>
      {recurrence.freq === RRule.WEEKLY ? (
        <Row>
          <Col span={24}>
            <Form.Item>
              <WeekDayPicker
                value={recurrence.byweekday || []}
                onChange={updateWeekday}
              />
            </Form.Item>
          </Col>
        </Row>
      ) : null}
      {recurrence.freq === RRule.MONTHLY ? (
        <Row>
          <Col span={24}>
            <Form.Item
              label={t("taskRepeat.on")}
              labelAlign="left"
              labelCol={{ span: 12 }}
            >
              <div className="tw-text-right">
                <MonthDayPicker
                  value={recurrence.bymonthday || 1}
                  onChange={(bymonthday) =>
                    setRecurrence((prev) => ({ ...prev, bymonthday }))
                  }
                />
              </div>
            </Form.Item>
          </Col>
        </Row>
      ) : null}
      {recurrence.freq === RRule.HOURLY ||
      recurrence.freq === RRule.MINUTELY ? (
        <Row className="tw-mb-6">
          <Col span={24}>
            <div className="tw-flex tw-items-center">
              <span className="s-main-font s-main-text-color tw-flex-grow">
                {t("taskRepeat.workingHours")}
              </span>
              <div className="tw-w-6/12 tw-flex">
                <TimePicker
                  format="HH:00"
                  value={moment().hours(timeRange[0])}
                  onChange={(d, hours) => {
                    const h = parseInt(hours);
                    setTimeRange(() => [
                      +h as HourNumber,
                      (+h + 8 <= 23 ? +h + 8 : +h + (23 - +h)) as HourNumber,
                    ]);
                  }}
                />
                <span className="s-main-font s-main-text-color tw-text-xl s-semibold tw-mx-5">
                  -
                </span>
                <TimePicker
                  format="HH:00"
                  value={moment().hours(timeRange[1])}
                  disabledHours={() => {
                    const hours = [];
                    for (let i = 0; i <= timeRange[0]; i++) {
                      hours.push(i);
                    }
                    return hours;
                  }}
                  onChange={(d, hours) => {
                    const h = parseInt(hours);
                    setTimeRange((prev) => [prev[0], +h as HourNumber]);
                  }}
                />
              </div>
            </div>
          </Col>
        </Row>
      ) : null}
      <Row className="tw-mb-6">
        <Col span={24}>
          <div className="tw-flex tw-items-center">
            <span className="s-main-font s-main-text-color tw-flex-grow">
              {t("taskRepeat.startOn")}
            </span>
            <DatePicker
              format="DD-MM-YYYY HH:mm"
              value={moment(recurrence.dtstart)}
              disabledDate={(current) => {
                if (!current) {
                  return false;
                }
                return current.isBefore(moment().startOf("day"));
              }}
              onChange={(dtstart) => {
                if (dtstart) {
                  setRecurrence((prev) => ({
                    ...prev,
                    dtstart: dtstart.toDate(),
                    until: undefined,
                  }));
                }
              }}
              className="st-field-color st-placeholder-color tw-w-6/12"
              showTime={
                recurrence.freq !== RRule.MINUTELY &&
                recurrence.freq !== RRule.HOURLY
                  ? { format: "HH:mm" }
                  : false
              }
              allowClear={false}
            />
          </div>
        </Col>
      </Row>
      <Row className="tw-mb-6">
        <Col span={24}>
          <div className="tw-flex tw-items-center">
            <Radio
              checked={limitRecurrenceByDate}
              onClick={() => {
                setLimitRecurrenceByDate(true);
                setRecurrence((prev) => ({ ...prev, count: undefined }));
              }}
              className="tw-flex-grow s-main-font s-main-text-color"
            >
              {t("taskRepeat.endOn")}
            </Radio>
            <DatePicker
              format="DD-MM-YYYY"
              value={recurrence.until ? moment(recurrence.until) : undefined}
              disabledDate={(current) => {
                if (!current) {
                  return false;
                }
                return (
                  current.isBefore(
                    moment(recurrence.dtstart).add(
                      recurrence.freq < 4 ? 1 : 0,
                      getFreqString(recurrence.freq),
                    ),
                  ) || current.isAfter(moment(recurrence.until).add(10, "year"))
                );
              }}
              disabled={
                !moment.isMoment(moment(recurrence.dtstart)) ||
                !limitRecurrenceByDate
              }
              onChange={(until) => {
                if (until) {
                  setRecurrence((prev) => ({
                    ...prev,
                    until: until.endOf("day").toDate(),
                    count: undefined,
                  }));
                } else {
                  setRecurrence((prev) => ({
                    ...prev,
                    until: undefined,
                    count: undefined,
                  }));
                }
              }}
              placeholder={t("taskRepeat.selectEndDate")}
              className="st-field-color st-placeholder-color tw-w-6/12"
            />
          </div>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <div className="tw-flex tw-items-center">
            <Radio
              checked={!limitRecurrenceByDate}
              onClick={() => {
                setLimitRecurrenceByDate(false);
                setRecurrence((prev) => ({ ...prev, until: undefined }));
              }}
              className="tw-flex-grow s-main-font s-main-text-color"
            >
              {t("taskRepeat.count")}
            </Radio>
            <InputNumber
              min={1}
              value={recurrence.count}
              onChange={(count = 1) =>
                setRecurrence((prev) => ({
                  ...prev,
                  count: (count as number) > 0 ? (count as number) : 1,
                  until: undefined,
                }))
              }
              disabled={limitRecurrenceByDate}
              placeholder={t("taskRepeat.enterCount")}
              className="st-placeholder-color st-field-color tw-w-6/12"
            />
          </div>
        </Col>
      </Row>
    </Modal>
  );
}

export default withTranslation()(TaskRepeatForm);
