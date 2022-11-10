import "moment/locale/tr";

import { message } from "antd";
import Appshell from "Appshell";
import moment, { Moment } from "moment";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { TaskService } from "../../../services";
import { Task } from "../../../types";
import TaskEdit from "../TaskEdit";
import taskDuplicator from "../TaskEdit/Components/taskDuplicator";
import { TaskFilters } from "../TaskHeader/TaskFiltersFormProps";
import TaskHeader from "../TaskHeader/TaskHeader";
import prepareQueryFromFilters from "../utils/prepareQueryFromFilters";
import TaskCalendar from "./Components/TaskCalendar";

moment.locale("tr");

interface TaskByDateReport {
  year: number;
  month: number;
  count: number;
}

const TaskCalendarContainer = () => {
  const [t] = useTranslation();
  const [tasks, setTasks] = useState([] as Task[]);
  const [loading, setLoading] = useState(false);
  const [monthlyCount, setMonthlyCount] = useState({});
  const [editingState, setEditingState] = useState({
    isEditing: false,
    editedTask: {} as Task,
  });

  const countMonthlyTasks = (res: TaskByDateReport[]) => {
    const monthlyCount: any = res.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.month]: (acc[curr.month]?.count || 0) + curr.count,
      }),
      {} as any,
    );

    setMonthlyCount(monthlyCount);
    setLoading(false);
  };

  const [filters, setFilters] = useState<TaskFilters>({} as TaskFilters);
  const applyFilters = (filters: TaskFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...filters,
    }));
  };
  const clearFilters = () => {
    setFilters({} as TaskFilters);
  };

  const duplicateTask = (task: Task) => {
    taskDuplicator(task, setLoading, (task) =>
      setEditingState({ editedTask: task, isEditing: true }),
    );
  };

  useEffect(() => {
    setLoading(true);
    TaskService.find({
      query: {
        $sort: { createdAt: -1 },
        endAt: {
          $gte: moment().startOf("month"),
          $lte: moment().endOf("month"),
        },
        ...prepareQueryFromFilters({
          ...filters,
        }),
        recurringTasks: true,
        subTasks: false,
        paginate: false,
      },
    }).then(
      (res: Task[]) => {
        //TODO: review this
        setTasks(res);
        setLoading(false);
      },
      (error: Error) => {
        // console.log("Could not fetch tasks: ", error);
        message.error(t("taskList.fetchError"));
        setLoading(false);
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    setLoading(true);
    TaskService.find({
      query: {
        endAt: {
          $gte: moment().startOf("year"),
          $lte: moment().endOf("year"),
        },
        ...prepareQueryFromFilters({
          ...filters,
        }),
        recurringTasks: true,
        subTasks: false,
        reportName: "TaskByDate",
      },
    }).then(countMonthlyTasks, (error: Error) => {
      // console.log("Error", error);
      setLoading(false);
    });
  }, [filters]);

  useEffect(() => {
    let isUnmounted = false;
    const handleCreated = (res: Task) => {
      if (isUnmounted || res.isSubtask) {
        return;
      }

      setTasks((old) => [res, ...old]);
      if (
        filters.endAt &&
        moment(res.endAt).isSame(filters.endAt[0], "month")
      ) {
        const month = moment(res.endAt).month() + 1;
        setMonthlyCount((old: any) => ({
          ...old,
          [month]: (old[month] || 0) + 1,
        }));
      }
    };

    const handlePatched = (res: Task) => {
      if (isUnmounted) {
        return;
      }

      setTasks((old) =>
        old.map((item: Task) => (item._id === res._id ? res : item)),
      );
    };

    const handleRemoved = (res: Task) => {
      if (isUnmounted) {
        return;
      }
      setTasks((old) => old.filter((item: Task) => item._id !== res._id));
      if (
        filters.endAt &&
        moment(res.endAt).isSame(filters.endAt[0], "month")
      ) {
        const month = moment(res.endAt).month() + 1;
        setMonthlyCount((old: any) => ({
          ...old,
          [month]: (old[month] || 0) - 1,
        }));
      }
    };

    TaskService.on("created", handleCreated);
    TaskService.on("patched", handlePatched);
    TaskService.on("removed", handleRemoved);
    return () => {
      isUnmounted = true;
      TaskService.off("created", handleCreated);
      TaskService.off("patched", handlePatched);
      TaskService.off("removed", handleRemoved);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Appshell activeLink={["tasks", "task-calendar"]}>
      <TaskHeader
        showRangePicker={false}
        filters={filters}
        appliedFilters={{} as TaskFilters}
        applyFilters={applyFilters}
        clearFilters={clearFilters}
        page={t("header.calendar")}
      />
      <TaskCalendar
        tasks={tasks}
        monthlyTaskCount={monthlyCount}
        dateFilter={filters.endAt}
        duplicateTask={duplicateTask}
        startEditingTask={(record) =>
          setEditingState({ isEditing: true, editedTask: record })
        }
        onDateChange={(endAt: Moment) => {
          if (!filters.endAt || !endAt.isSame(filters.endAt[0], "month")) {
            applyFilters({
              endAt: [
                endAt.clone().startOf("month"),
                endAt.clone().endOf("month"),
              ],
            } as TaskFilters);
          }
        }}
        loading={loading}
      />
      <TaskEdit
        visible={editingState.isEditing}
        task={editingState.editedTask}
        duplicateTask={duplicateTask}
        onClose={() =>
          setEditingState({ isEditing: false, editedTask: {} as Task })
        }
        onSave={(task, action, shouldClose) =>
          setEditingState({
            isEditing: !shouldClose,
            editedTask: shouldClose ? ({} as Task) : task,
          })
        }
      />
    </Appshell>
  );
};

export default TaskCalendarContainer;
