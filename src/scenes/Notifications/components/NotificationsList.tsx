import { Spin, message } from "antd";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import taskDuplicator from "scenes/Tasks/TaskEdit/Components/taskDuplicator";

import { TaskService } from "../../../services";
import { NotificationProps, Task } from "../../../types";
import TaskEdit from "../../Tasks/TaskEdit";
import Notification from "./Notification";

interface NotificationsListProps extends WithTranslation {
  notificationsList: NotificationProps[];
  markOneAsRead: (notiId: string) => void;
}

const NotificationsList = ({
  notificationsList,
  markOneAsRead,
}: NotificationsListProps) => {
  const [t] = useTranslation();
  const [taskEditState, setTaskEditState] = useState({
    isLoading: false,
    isEditingTask: false,
    notiId: "",
    task: {} as Task,
  });
  const editTask = (_id: string, notiId: string) => {
    setTaskEditState((old) => ({ ...old, notiId, isLoading: true }));
    TaskService.get(_id).then(
      (res: Task) =>
        setTaskEditState((old) => ({
          ...old,
          isLoading: false,
          isEditingTask: true,
          task: res,
        })),
      (error: Error) => {
        message.error(t("notifications.taskNotFound"));
        setTaskEditState((old) => ({
          ...old,
          isLoading: false,
          isEditingTask: false,
          task: {} as Task,
        }));
      },
    );
  };
  const duplicateTask = (task: Task) => {
    taskDuplicator(
      task,
      (isLoading) => setTaskEditState((old) => ({ ...old, isLoading })),
      (task) =>
        setTaskEditState((old) => ({ ...old, isEditingTask: true, task })),
    );
  };
  return (
    <div>
      {notificationsList.map((notification: NotificationProps) => (
        <Spin
          spinning={
            taskEditState.isLoading && notification._id === taskEditState.notiId
          }
          key={notification._id}
        >
          <Notification
            onTaskEdit={editTask}
            notification={notification}
            onMarkAsRead={markOneAsRead}
          />
        </Spin>
      ))}
      <TaskEdit
        visible={taskEditState.isEditingTask}
        task={taskEditState.task}
        duplicateTask={duplicateTask}
        onClose={() =>
          setTaskEditState({
            notiId: "",
            isLoading: false,
            isEditingTask: false,
            task: {} as Task,
          })
        }
        onSave={(task, action, shouldClose) =>
          setTaskEditState({
            notiId: "",
            isLoading: false,
            isEditingTask: !shouldClose,
            task: shouldClose ? ({} as Task) : task,
          })
        }
      />
    </div>
  );
};

export default NotificationsList;
