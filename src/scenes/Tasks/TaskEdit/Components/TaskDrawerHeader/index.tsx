import { DownOutlined } from "@ant-design/icons";
import mixpanel from "analytics/mixpanel";
import { Button, Dropdown, Menu, Popconfirm, message } from "antd";
import moment from "moment";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import DailyExpenseForm from "scenes/Expenses/DailyExpenseForm";

import { TaskService } from "../../../../../services";
import {
  ChecklistBucket,
  CustomFormBucket,
  DailyExpense,
  RecurrenceConfig,
  Subtask,
  Task,
  TaskStockLine,
  User,
} from "../../../../../types";
import UserContext from "../../../../../UserContext";
import { getUsername, isTaskCompleted } from "../../../../../utils/helpers";
import CustomFieldsList from "../../../../CustomFields/CustomFieldsList";
import AddTaskStock from "../../../../EditStockUtilization";
import ChecklistManagement from "./Components/ChecklistManagement";
import CustomFormManagement from "./Components/CustomFormManagement";
import TaskPrintForm from "./Components/PDF/TaskPrintForm";
import SubtaskManagement from "./Components/SubtaskManagement";
import TaskRepeatForm from "./Components/TaskRepeatForm/TaskRepeatForm";
import TaskStatusContorl from "./Components/TaskStatusControl";

interface TaskDrawerHeaderProps {
  task: Task;
  orphanId: string;
  lastRank: string;
  updateChecklistOrphanIds: (docId: string) => void;
  updateChecklistBuckets: (changes: {
    [docId: string]: ChecklistBucket;
  }) => void;
  updateSubtaskOrphanIds: (subtaskId: string) => void;
  addNewSubtask: (subtask: Subtask) => void;
  onChange: (changes: Task) => void;
  onClose: Function;
  duplicateTask: Function;
  updateCustomFormOrphanIds: (docId: string) => void;
  updateCustomFormBuckets: (bucket: CustomFormBucket) => void;
  updateRecurrence: (rec: RecurrenceConfig) => void;
  deleteAllRepetitions: (parentId: string) => void;
  isEditingStock: boolean;
  setIsEditingStock: (shouldClose: boolean) => void;
  hasFiles: boolean;
  convertToInvoice: () => void;
}

const TaskDrawerHeader = ({
  task = {} as Task,
  orphanId,
  lastRank,
  updateChecklistOrphanIds,
  updateChecklistBuckets,
  onChange,
  onClose,
  duplicateTask,
  updateSubtaskOrphanIds,
  addNewSubtask,
  updateCustomFormBuckets,
  updateCustomFormOrphanIds,
  updateRecurrence,
  deleteAllRepetitions,
  isEditingStock,
  setIsEditingStock,
  hasFiles,
  convertToInvoice,
}: TaskDrawerHeaderProps) => {
  const [t] = useTranslation();
  const { hasPermission }: any = useContext(UserContext);
  const {
    _id = "",
    parentId = "",
    uid = "",
    stock,
    status,
    title,
    createdById,
    createdBy,
    createdAt,
    isRecurring,
  } = task;
  const isEditingTask = !!_id;
  // const [printModalVisible, setPrintModalVisible] = useState(false);
  // const [customFieldsModalVisible, setCustomFieldsModalVisible] = useState(
  //   false,
  // );
  // const [isManagingChecklists, setIsManagingChecklists] = useState(false);
  // const [isManagingSubtasks, setIsManagingSubtasks] = useState(false);
  // const [isManagingCustomForms, setIsManagingCustomForms] = useState(false);
  const [state, setState] = useState({
    printModalVisible: false,
    customFieldsModalVisible: false,
    isManagingChecklists: false,
    isManagingSubtasks: false,
    isManagingCustomForms: false,
    isManagingDailyExpenses: false,
  });

  const handleDelete = () => {
    if (_id) {
      TaskService.remove(_id).then(({ title, _id }: Task) => {
        mixpanel.track("Task Removed", {
          title,
          _id,
        });
        message.success(t("tasks.removeSuccess"));
        onClose();
      });
    }
  };
  const updateStock = (stock: TaskStockLine[], shouldClose: boolean) => {
    setIsEditingStock(!shouldClose);
    onChange({ stock } as Task);
  };

  const handleRecurrenceUpdate = (rec: RecurrenceConfig) => {
    updateRecurrence(rec);
    setRecurrenceFormVisible(false);
  };
  const [recurrenceFormVisible, setRecurrenceFormVisible] = useState(false);

  const sharedComponents = (
    <>
      <Dropdown
        overlay={
          <Menu>
            <Menu.Item
              className="s-menu-item"
              onClick={() =>
                setState((old) => ({ ...old, isManagingChecklists: true }))
              }
            >
              {t("checklists.add")}
            </Menu.Item>
            {hasPermission("canCreateTasks") && (
              <Menu.Item
                className="s-menu-item"
                onClick={() =>
                  setState((old) => ({ ...old, isManagingSubtasks: true }))
                }
              >
                {t("subtasks.addSubtaskMenu")}
              </Menu.Item>
            )}
            <Menu.Item
              className="s-menu-item"
              onClick={() =>
                setState((old) => ({ ...old, isManagingCustomForms: true }))
              }
            >
              {t("customForms.addCustomFormMenu")}
            </Menu.Item>
            {!isEditingTask && hasPermission("canManageCustomFields") && (
              <Menu.Item
                className="s-menu-item"
                onClick={() =>
                  setState((old) => ({
                    ...old,
                    customFieldsModalVisible: true,
                  }))
                }
              >
                {t("taskEdit.addCustomField")}
              </Menu.Item>
            )}
            {isEditingTask && (
              <Menu.Item
                className="s-menu-item"
                onClick={() => duplicateTask()}
              >
                {t("global.duplicate")}
              </Menu.Item>
            )}
            {!isEditingTask && (
              <Menu.Item
                className="s-menu-item"
                onClick={() => {
                  setRecurrenceFormVisible(true);
                }}
              >
                {t("taskRepeat.trigger")}
              </Menu.Item>
            )}
            <Menu.Item
              className="s-menu-item"
              onClick={() => setIsEditingStock(true)}
              disabled={
                isTaskCompleted(status) &&
                !hasPermission("canManageCompletedTasks")
              }
            >
              {t("taskEdit.showStock")}
            </Menu.Item>
            {isEditingTask ? (
              <Menu.Item
                className="s-menu-item"
                onClick={() =>
                  setState((old) => ({ ...old, isManagingDailyExpenses: true }))
                }
              >
                {t("accounting.addExpense")}
              </Menu.Item>
            ) : null}
            {isEditingTask && <Menu.Divider />}
            {isEditingTask && (
              <Menu.Item
                className="s-menu-item"
                onClick={() =>
                  setState((old) => ({ ...old, printModalVisible: true }))
                }
              >
                {t("PDFPrint.createPDFMenu")}
              </Menu.Item>
            )}
            {isEditingTask && hasPermission("canRemoveTasks") && (
              <Menu.Item className="s-menu-item">
                <Popconfirm
                  title={t("settings.deleteMsg")}
                  onConfirm={handleDelete}
                  arrowPointAtCenter={false}
                  okButtonProps={{ danger: true }}
                  okText={t("global.delete")}
                  cancelText={t("global.cancel")}
                  placement="right"
                >
                  <div className="tw-text-red-500">{t("tasklist.delete")}</div>
                </Popconfirm>
              </Menu.Item>
            )}
            {isEditingTask && isRecurring && hasPermission("canRemoveTasks") && (
              <Menu.Item className="s-menu-item">
                <Popconfirm
                  title={t("repeatedTasks.deleteAllMsg")}
                  onConfirm={() => deleteAllRepetitions(parentId || _id || "")}
                  placement="right"
                  okText={t("global.delete")}
                  cancelText={t("global.cancel")}
                  okButtonProps={{ danger: true }}
                  arrowPointAtCenter={false}
                >
                  <div className="tw-text-red-500">
                    {t("repeatedTasks.deleteAll")}
                  </div>
                </Popconfirm>
              </Menu.Item>
            )}
          </Menu>
        }
        placement="bottomRight"
      >
        <Button className="tw-inline-flex tw-items-center">
          {t("global.actions")}
          <DownOutlined />
        </Button>
      </Dropdown>

      <ChecklistManagement
        visible={state.isManagingChecklists}
        taskId={_id}
        orphanId={orphanId}
        updateChecklistOrphanIds={updateChecklistOrphanIds}
        updateChecklistBuckets={updateChecklistBuckets}
        handleClose={() =>
          setState((old) => ({ ...old, isManagingChecklists: false }))
        }
      />
      <SubtaskManagement
        visible={state.isManagingSubtasks}
        taskId={_id}
        lastRank={lastRank}
        updateSubtaskOrphanIds={updateSubtaskOrphanIds}
        addNewSubtask={addNewSubtask}
        handleClose={() =>
          setState((old) => ({ ...old, isManagingSubtasks: false }))
        }
      />
      <CustomFormManagement
        visible={state.isManagingCustomForms}
        orphanId={orphanId}
        parentId={_id}
        updateCustomFormOrphanIds={updateCustomFormOrphanIds}
        updateCustomFormBuckets={updateCustomFormBuckets}
        handleClose={() =>
          setState((old) => ({ ...old, isManagingCustomForms: false }))
        }
      />
      <AddTaskStock
        visible={isEditingStock}
        stock={stock}
        service="tasks"
        taskId={_id}
        onSave={updateStock}
        onCancel={() => setIsEditingStock(false)}
      />
    </>
  );

  // when creating new task
  if (!isEditingTask) {
    return (
      <div className="tw-flex tw-justify-between tw-items-center">
        <h2 className="tw-text-lg tw-font-medium">{t("taskEdit.pageTitle")}</h2>
        {sharedComponents}
        <CustomFieldsList
          visible={state.customFieldsModalVisible}
          form="tasks"
          handleClose={() =>
            setState((old) => ({ ...old, customFieldsModalVisible: false }))
          }
        />
        <TaskRepeatForm
          visible={recurrenceFormVisible}
          handleCancel={() => setRecurrenceFormVisible(false)}
          updateRecurrence={handleRecurrenceUpdate}
        />
      </div>
    );
  }

  // when updating existing task
  return (
    <div className="tw-flex tw-items-center">
      <TaskStatusContorl
        task={task}
        onStatusChange={(changes) => onChange(changes as Task)}
        hasFiles={hasFiles}
        onConvertToInvoice={convertToInvoice}
      />
      <span className="tw-ml-12 s-main-text-color">#{_id?.slice(-5)}</span>
      {createdAt && (
        <div className="tw-ml-12">
          <div
            className="tw-text-sm s-main-font"
            style={{ color: "#516F90", fontWeight: "initial" }}
          >
            {t("taskEdit.createdAt")}
          </div>
          <div className="s-main-text-color s-main-font tw-text-sm">
            <span className="tw-mr-3">
              {createdAt ? moment(createdAt).format("DD/MM/YYYY") : ""}
            </span>
            {moment(createdAt).format("HH:mm")}
          </div>
        </div>
      )}
      {createdById && (
        <div className="tw-ml-12">
          <div
            className="tw-text-sm s-main-font"
            style={{ color: "#516F90", fontWeight: "initial" }}
          >
            {t("taskEdit.createdBy")}
          </div>
          <div
            className="s-std-text tw-text-sm tw-truncate tw-w-48"
            title={getUsername(createdBy as User)}
          >
            {getUsername(createdBy as User)}
          </div>
        </div>
      )}
      <span className="tw-ml-auto">{sharedComponents}</span>

      <TaskPrintForm
        isOpen={state.printModalVisible}
        hasFiles={hasFiles}
        handleCancel={() =>
          setState((old) => ({ ...old, printModalVisible: false }))
        }
        taskUid={uid}
        task={{ _id, title } as Task}
      />
      <DailyExpenseForm
        visible={state.isManagingDailyExpenses}
        editedRecord={{ taskId: task._id } as DailyExpense}
        onSave={() =>
          setState((old) => ({ ...old, isManagingDailyExpenses: false }))
        }
        handleCancel={() =>
          setState((old) => ({ ...old, isManagingDailyExpenses: false }))
        }
        showSpenderField={hasPermission("canManageDailyCollection")}
        hideTaskField
      />
    </div>
  );
};

export default TaskDrawerHeader;
