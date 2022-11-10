import { message } from "antd";
import Appshell from "Appshell";
import logger from "logger";
import { debounce, equals } from "rambdax";
import React, {
  Key,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import UserContext from "UserContext";

import { TaskService } from "../../../services";
import { PaginatedFeathersResponse, Task } from "../../../types";
import { tasksInitialState } from "../helpers";
import TaskEdit from "../TaskEdit";
import taskDuplicator from "../TaskEdit/Components/taskDuplicator";
import areFiltersEmpty from "../TaskHeader/areFiltersEmpty";
import { TaskFilters } from "../TaskHeader/TaskFiltersFormProps";
import TaskHeader from "../TaskHeader/TaskHeader";
import prepareQueryFromFilters from "../utils/prepareQueryFromFilters";
import MainTaskTable from "./Components/MainTaskTable";
import Placeholder from "./Components/Placeholder";

const MainTasksContainer = () => {
  const [t] = useTranslation();
  const { hasPermission }: any = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [taskEditing, setTaskEditing] = useState({
    visible: false,
    task: {} as Task,
  });
  const [tasks, setTasks] = useState(tasksInitialState);
  const [ripple, setRipple] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([] as Key[]);
  const [filters, setFilters] = useState<TaskFilters>({} as TaskFilters);
  const [sorts, setSorts] = useState({});
  const { total, skip = 0, limit = 25 } = tasks;

  const applyFilters = (filters: TaskFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...filters,
    }));
  };
  const clearFilters = () => {
    setFilters({} as TaskFilters);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchTasks = useCallback(
    debounce((query: any, filtersEmpty: boolean) => {
      setIsLoading(true);
      TaskService.find({ query }).then(
        (res: PaginatedFeathersResponse<Task>) => {
          if ((res.total || 0) === 0 && filtersEmpty) {
            TaskService.find({
              query: {
                ...query,
                recurringTasks: true,
                $limit: 0,
              },
            }).then(
              (res2: PaginatedFeathersResponse<Task>) => {
                // bottom syntax saves us from self-induced DOS attack!
                if ((res2?.total || 0) === 0) {
                  setIsEmpty(true);
                  setIsLoading(false);
                } else {
                  setIsEmpty(false);
                  applyFilters({ recurringTasks: true } as TaskFilters);
                  message.info(t("tasks.info.fetchingRepeated"));
                }
              },
              (error: Error) => {
                // console.log(
                //   "Error in checking the availability of repeated tasks: ",
                //   error,
                // );
                message.error(t("tasks.checkRepeatedError"));
                setIsLoading(false);
              },
            );
          } else {
            setIsEmpty(false);
            setTasks(res);
            setIsLoading(false);
          }
        },
        (error: Error) => {
          // console.log("Could not fetch tasks: ", error);
          setIsLoading(false);
          message.error(t("taskList.fetchError"));
        },
      );
    }, 300),
    [t],
  );

  const filtersRef = useRef(filters);
  const sortsRef = useRef(sorts);

  useEffect(() => {
    let $skip = skip;

    if (!equals(filters, filtersRef.current)) {
      filtersRef.current = filters;
      $skip = 0;
    }

    if (!equals(sorts, sortsRef.current)) {
      sortsRef.current = sorts;
    }
    const defaultSorting = { endAt: -1 };
    const $sort = Object.keys(sorts)?.length > 0 ? sorts : defaultSorting;

    const query = {
      ...prepareQueryFromFilters(filters),
      $sort,
      $limit: limit,
      $skip,
    };

    fetchTasks(query, areFiltersEmpty(filters));
  }, [filters, fetchTasks, limit, skip, ripple, sorts]);

  useEffect(() => {
    let isUnmounted = false;
    const handleCreated = (res: Task) => {
      if (
        isUnmounted ||
        res.isSubtask ||
        (!filters.recurringTasks && res.isRecurring && res.parentId)
      ) {
        return;
      }
      setTasks((old) => {
        let taskExist = old.data.findIndex((item) => item._id === res._id);
        let data = [] as Task[];
        let total = old.total;
        if (taskExist === -1) {
          data = [res, ...old.data];
          total += 1;
        } else {
          data = old.data.map((item) => (item._id === res._id ? res : item));
        }
        if (data.length > limit) {
          data.pop();
        }
        setIsEmpty(false);
        return {
          ...old,
          total,
          data,
        };
      });
    };

    const handlePatched = (res: Task) => {
      if (isUnmounted) {
        return;
      }

      setTasks((old) => ({
        ...old,
        data: old.data.map((item: Task) => (item._id === res._id ? res : item)),
      }));
    };

    const handleRemoved = (res: Task) => {
      if (isUnmounted || res.isTemplate) {
        return;
      }

      setTasks((old) => {
        const data = old.data.filter((item: Task) => item._id !== res._id);
        if ((data?.length || 0) === 0 && areFiltersEmpty(filters)) {
          setRipple((old) => !old);
        }
        return {
          ...old,
          data,
          total: old.total - 1,
        };
      });

      setSelectedRowKeys((old) => old.filter((item) => item !== res._id));
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

  const deleteTask = (id: string) => {
    TaskService.remove(id).then(
      (res: Task) => {
        setTasks((old) => ({
          ...old,
          data: old.data.filter((task) => task._id !== res._id),
        }));
        setSelectedRowKeys((old) => old.filter((item) => item !== res._id));
        message.success(t("tasks.removeSuccess"));
      },
      (error: Error) => message.error(t("tasks.removeError")),
    );
  };

  const bulkDeleteTasks = (currentTotal: number) => {
    setIsLoading(true);
    message.loading({
      content: `${t("bulkActions.deleting")} ${selectedRowKeys.length} ${t(
        "bulkActions.records",
      )}`,
      key: "deletingTasks",
      duration: 0,
    });
    TaskService.remove(null, { query: { _id: { $in: selectedRowKeys } } }).then(
      (res: Task[]) => {
        const deleted = res?.length || 0;
        if (skip === 0) {
          setRipple((old) => !old);
        } else {
          setTasks((old) => ({
            ...old,
            skip: 0,
          }));
        }
        setIsLoading(false);
        message.success({
          content: `${t("bulkActions.deleted")} ${deleted} ${t(
            "bulkActions.selectedRecords",
          )}`,
          key: "deletingTasks",
        });
      },
      (error: Error) => {
        // console.log("Could not bulk delete tasks", error);
        setIsLoading(false);
        message.error({
          content: t("tasks.bulkDeleteError"),
          key: "deletingTasks",
        });
      },
    );
  };

  const updateTasks = (
    task: Task,
    action: "create" | "update" | "delete" | "deleteChildren",
    shouldCloseDrawer = false,
  ) => {
    switch (action) {
      case "create":
        setTasks((old) => {
          let taskExist = old.data.findIndex((item) => item._id === task._id);

          if (taskExist === -1) {
            return {
              ...old,
              total: old.total + 1,
              data: [task, ...old.data],
            };
          }

          return {
            ...old,
            data: old.data.map((item) => (item._id === task._id ? task : item)),
          };
        });
        break;
      case "update":
        setTasks((old) => ({
          ...old,
          data: old.data.map((item: Task) =>
            item._id === task._id ? task : item,
          ),
        }));
        break;
      case "delete":
        setTasks((old) => {
          const data = old.data.filter((item: Task) => item._id !== task._id);
          return {
            ...old,
            total: old.total - (old.total - data.length),
            data,
          };
        });
        break;
      case "deleteChildren":
        setTasks((old) => {
          const data = old.data.filter(
            (item: Task) => item.parentId !== task._id,
          );
          const total =
            data.length !== old.data.length ? old.total - 1 : old.total;
          return {
            ...old,
            total,
            data,
          };
        });
        setRipple((old) => !old);
        break;
    }
    setTaskEditing({ visible: !shouldCloseDrawer, task: {} as Task });
  };

  const deleteAllRepetitions = (parentId: string) => {
    message.loading({
      content: t("repeatedTasks.deletingAll"),
      key: "deletingAllTasks",
      duration: 0,
    });
    TaskService.remove(parentId, {
      query: { removeAllOccurrences: true },
    }).then(
      (res: Task) => {
        message.success({
          content: t("repeatedTasks.deleteAllSuccess"),
          key: "deletingAllTasks",
        });
        updateTasks(res, "deleteChildren", true);
      },
      (error: Error) => {
        logger.error("Error in deleting tasks: ", error);
        message.error({
          content: t("repeatedTasks.deletingAllError"),
          key: "deletingAllTasks",
        });
      },
    );
  };

  const duplicateTask = (task: Task) => {
    taskDuplicator(task, setIsLoading, (task) =>
      setTaskEditing({ visible: true, task }),
    );
  };

  return (
    <Appshell activeLink={["tasks", "task-list"]}>
      <TaskHeader
        filters={filters}
        appliedFilters={{} as TaskFilters}
        applyFilters={applyFilters}
        clearFilters={clearFilters}
        selectedRowKeys={selectedRowKeys}
        setSelectedRowKeys={setSelectedRowKeys}
        bulkDeleteTasks={() => bulkDeleteTasks(total)}
        page={t("header.list")}
      />
      {isEmpty ? (
        <Placeholder
          primaryAction={
            hasPermission("canCreateTasks")
              ? () => setTaskEditing({ visible: true, task: {} as Task })
              : undefined
          }
          primaryText={t("dataPlaceholder.jobs.title")}
          secondaryText={t("dataPlaceholder.jobs.description")}
          primaryBtnText={t("dataPlaceholder.jobs.action")}
          heightReduction={72}
          topBorder={true}
        />
      ) : (
        <MainTaskTable
          tasks={tasks.data}
          isLoading={isLoading}
          selectedRowKeys={selectedRowKeys}
          onRowSelectionChange={setSelectedRowKeys}
          startEditingTask={(task) => setTaskEditing({ visible: true, task })}
          deleteTask={deleteTask}
          deleteAllRepetitions={deleteAllRepetitions}
          duplicateTask={duplicateTask}
          sorts={sorts}
          setSorts={(val) => setSorts(val)}
          pagination={{ total, limit, skip }}
          handlePageChange={(pageNum, pageSize) =>
            setTasks((old) => ({
              ...old,
              skip: (pageNum - 1) * pageSize,
              limit: pageSize,
            }))
          }
        />
      )}
      <TaskEdit
        {...taskEditing}
        duplicateTask={duplicateTask}
        onClose={() => setTaskEditing({ visible: false, task: {} as Task })}
        onSave={updateTasks}
      />
    </Appshell>
  );
};

export default MainTasksContainer;
