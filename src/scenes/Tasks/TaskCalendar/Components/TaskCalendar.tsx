import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Badge, Button, Calendar, Spin, message } from "antd";
import { PickerLocale } from "antd/lib/date-picker/generatePicker";
import moment, { Moment } from "moment";
import React, { useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { getRTEText } from "utils/components/RTE/RTE";

import { TaskService } from "../../../../services";
import { Task } from "../../../../types";
import numberFormatter from "../../../../utils/helpers/numberFormatter";
import DateTasks from "./DateTasks";

interface TaskCalendarProps extends WithTranslation {
  startEditingTask: (record: Task) => void;
  monthlyTaskCount: any;
  onDateChange: (query: any) => void;
  duplicateTask: (task: Task) => void;
  dateFilter?: Moment[];
  tasks: Task[];
  loading: boolean;
}

const TaskCalendar = ({
  t,
  tasks = [] as Task[],
  startEditingTask,
  monthlyTaskCount,
  onDateChange,
  duplicateTask,
  dateFilter = [] as Moment[],
  loading,
}: TaskCalendarProps) => {
  const getListData = (value: Moment) => {
    let listData = tasks.filter((item) => {
      return item.endAt && moment(item.endAt).isSame(value, "day");
    });
    return listData || ([] as Task[]);
  };

  const [taskListModal, setTaskListModal] = useState({
    visible: false,
    date: {} as Moment,
    tasks: [] as Task[],
  });

  const deleteTask = (_id: string) => {
    TaskService.remove(_id).then(
      (res: Task) => {
        setTaskListModal((old) => ({
          ...old,
          tasks: old.tasks.filter((item) => item._id !== _id),
        }));
        message.success(t("tasks.removeSuccess"));
      },
      (error: Error) => message.error(t("tasks.removeError")),
    );
  };

  function dateCellRender(value: Moment) {
    let listData = getListData(value);
    const allTasks = listData;
    const totalTasks = listData.length;
    listData = totalTasks <= 3 ? listData : listData.slice(0, 3);

    return (
      <div
        className="s-date-cell"
        style={
          moment(value).isSame(moment(), "day")
            ? { borderTop: "2px solid #1890ff", backgroundColor: "#e6f7ff" }
            : {}
        }
      >
        <div className="tw-flex tw-items-start s-date-cell-header">
          <FontAwesomeIcon
            icon={faPlus}
            size="lg"
            className="s-pointer s-date-cell-btn s-a-grow-rotate"
            onClick={() =>
              startEditingTask(({
                preFill: true,
                endAt: moment(value),
              } as unknown) as Task)
            }
          />
          <span className="s-main-font s-main-text-color s-semibold tw-ml-auto">
            {moment(value).format("DD")}
          </span>
        </div>
        <ul className="events s-date-cell-content">
          {listData.map((item) => {
            return (
              <li key={item._id} onClick={() => startEditingTask(item)}>
                <Badge
                  className="tw-truncate tw-block"
                  color={item?.status?.color || "#808080"}
                  text={getRTEText(item.title)}
                />
              </li>
            );
          })}
          {totalTasks > 3 && (
            <Button
              type="link"
              className="s-main-font tw--mt-2 tw-ml-2 tw-pl-1"
              onClick={() =>
                setTaskListModal({
                  visible: true,
                  date: value,
                  tasks: allTasks,
                })
              }
            >
              + {totalTasks - 3} {t("taskCalendar.more")}
            </Button>
          )}
        </ul>
      </div>
    );
  }

  function monthCellRender(value: Moment) {
    const num = monthlyTaskCount?.[value.month() + 1] || 0;
    return num ? (
      <div className="notes-month">
        <section className="s-main-font s-main-text-color">
          {numberFormatter(num)}
        </section>
        <span className="s-main-font s-main-text-color">
          {t("taskCalendar.monthly")}
        </span>
      </div>
    ) : null;
  }

  return (
    <div className="tw-flex tw-border-t tw-border-b">
      <Spin spinning={loading}>
        <Calendar
          locale={
            {
              lang: {
                locale: "tr",
                year: "Yil",
                month: "Ay",
              },
            } as PickerLocale
          }
          dateFullCellRender={dateCellRender}
          monthCellRender={monthCellRender}
          value={dateFilter ? moment(dateFilter[1]) : moment()}
          onChange={(date) => date && onDateChange(date)}
        />
      </Spin>
      <DateTasks
        visible={taskListModal.visible}
        tasks={taskListModal.tasks}
        date={taskListModal.date}
        onClose={() =>
          setTaskListModal({ visible: false, date: {} as Moment, tasks: [] })
        }
        startEditingTask={startEditingTask}
        duplicateTask={duplicateTask}
        deleteTask={deleteTask}
      />
    </div>
  );
};

export default withTranslation()(TaskCalendar);
