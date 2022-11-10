import { message } from "antd";
import i18next from "i18next";
import logger from "logger";
import { queryMaker } from "scenes/Tasks/helpers";
import { ChecklistService, CustomFormService, TaskService } from "services";
import {
  Checklist,
  ChecklistBucket,
  CustomForm,
  CustomFormBucket,
  PaginatedFeathersResponse,
  Subtask,
  Task,
} from "types";

declare type TaskDuplicatorFC = (
  task: Task,
  setIsLoading: (isLoading: boolean) => void,
  onDuplicate: (task: Task) => void,
) => Promise<Task | Error>;
const keysToDuplicate: (keyof Task)[] = [
  "title",
  "endAt",
  "assigneeIds",
  "fields",
  "customerId",
  "addressId",
  "isImgRequired",
  "hideFromCustomer",
  "discount",
  "discountType",
  "copyNotesToInvoice",
];

const duplicateChecklists = (
  oldTaskId: string,
  newTaskId: string,
): Promise<Checklist[] | Error> => {
  return ChecklistService.find({
    query: { taskId: oldTaskId },
  }).then(
    async (fetchedCLBuckets: PaginatedFeathersResponse<ChecklistBucket>) => {
      const { data } = fetchedCLBuckets;
      const checklists = data
        .reduce(
          (acc, curr) => [...acc, ...(curr.checklists || [])],
          [] as Checklist[],
        )
        .map(({ items, title }) => ({
          title,
          taskId: newTaskId,
          items: (items || []).map(({ title }) => ({ title })),
        }));
      const clPromises = checklists.map((checklist) =>
        ChecklistService.create(checklist, queryMaker("createChecklist", {})),
      );
      return Promise.allSettled(clPromises);
    },
    (e: Error) => {
      logger.error("Error in finding checklists: ", e);
      return Promise.reject(e);
    },
  );
};
const duplicateCustomForms = (
  oldTaskId: string,
  newTaskId: string,
): Promise<CustomForm[] | Error> => {
  return CustomFormService.find({
    query: { taskId: oldTaskId },
  }).then(
    async (fetchedCFBuckets: PaginatedFeathersResponse<CustomFormBucket>) => {
      const { data } = fetchedCFBuckets;
      const customForms = data
        .reduce(
          (acc, curr) => [...acc, ...(curr.bucketItems || [])],
          [] as CustomForm[],
        )
        .map(({ fields, title }) => ({
          fields,
          title,
          taskId: newTaskId,
        }));
      const cfPromises = customForms.map((customForm) =>
        CustomFormService.create(customForm, queryMaker("createForm", {})),
      );
      return Promise.allSettled(cfPromises);
    },
    (e: Error) => {
      logger.error("Error in finding custom forms: ", e);
      return Promise.reject(e);
    },
  );
};
const duplicateSubtasks = (
  oldTaskId: string,
  newTaskId: string,
): Promise<Subtask[] | Error> => {
  return TaskService.find({
    query: { parentId: oldTaskId, subTasks: true, $limit: 500 },
  }).then(
    async (fetchedSubtasks: PaginatedFeathersResponse<Subtask>) => {
      const { data = [] } = fetchedSubtasks;
      const subtasks = data.map(({ title, rank, assigneeIds, endAt }) => ({
        title,
        rank,
        assigneeIds,
        parentId: newTaskId,
        endAt,
        isSubtask: true,
      }));
      const stPromises = subtasks.map((subtask) => TaskService.create(subtask));
      return Promise.allSettled(stPromises);
    },
    (e: Error) => {
      logger.error("Error in finding subtasks: ", e);
      return Promise.reject(e);
    },
  );
};

const taskDuplicator: TaskDuplicatorFC = async (
  task,
  setIsLoading,
  onDuplicate,
) => {
  setIsLoading(true);
  message.loading({
    content: i18next.t("task.duplicating"),
    key: "duplicating",
    duration: 0,
  });

  // Get the base task ready...
  let duplicateTask = keysToDuplicate.reduce(
    (acc, curr) => ({ ...acc, [curr]: task[curr] }),
    {},
  );
  duplicateTask = Object.assign({}, duplicateTask, {
    stock: (task?.stock || []).map(({ _id, ...rest }) => rest),
  });

  return TaskService.create(duplicateTask).then(
    async (newTask: Task) => {
      // Get the associated checklists of the task...
      await duplicateChecklists(task._id, newTask._id);
      // Get the associated forms of the task...
      await duplicateCustomForms(task._id, newTask._id);
      // Get the associated subtasks of the task...
      await duplicateSubtasks(task._id, newTask._id);

      onDuplicate(newTask);
      message.success({
        content: i18next.t("task.duplicateReady"),
        key: "duplicating",
        duration: 3,
      });
      setIsLoading(false);
    },
    (e: Error) => {
      logger.error("Error in creating duplicate task: ", e);
      setIsLoading(false);
      message.error({
        content: i18next.t("tasks.createError"),
        key: "duplicating",
        duration: 3,
      });
    },
  );
};

export default taskDuplicator;
