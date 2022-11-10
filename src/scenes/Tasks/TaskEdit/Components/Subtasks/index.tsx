import mixpanel from "analytics/mixpanel";
import { message } from "antd";
import logger from "logger";
import React, { useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import midString from "utils/helpers/midString";

import { TaskService } from "../../../../../services";
import { PaginatedFeathersResponse, Subtask, User } from "../../../../../types";
import SubtasksView from "./Components/SubtasksView";

interface SubtasksContainerProps extends WithTranslation {
  parentId: string;
  assignees: User[];
  subtasks: PaginatedFeathersResponse<Subtask>;
  lastRank: string;
  setSubtasks: (changes: PaginatedFeathersResponse<Subtask>) => void;
  orphanSubtaskIds: string[];
  setOrphanSubtaskIds: (orphanIds: string[]) => void;
}

const SubtasksContainer = ({
  t,
  parentId,
  assignees,
  subtasks,
  lastRank,
  setSubtasks,
  orphanSubtaskIds,
  setOrphanSubtaskIds,
}: SubtasksContainerProps) => {
  const { total, limit, skip, data } = subtasks;
  const [editingState, setEditingState] = useState({
    editingId: "",
    newTitle: "",
    creatingTask: false,
  });

  const createSubtask = () => {
    if (!!editingState.newTitle.trim()) {
      TaskService.create({
        ...(parentId ? { parentId } : {}),
        isSubtask: true,
        rank: midString(lastRank, ""),
        title: editingState.newTitle,
      }).then(
        (res: Subtask) => {
          setSubtasks({
            total: subtasks.total + 1,
            data: [...subtasks.data, res],
          } as PaginatedFeathersResponse<Subtask>);
          mixpanel.track("Subtask created", { _id: res._id });
          setEditingState({ editingId: "", newTitle: "", creatingTask: false });
          if (!parentId) {
            setOrphanSubtaskIds([...orphanSubtaskIds, res._id]);
          }
          message.success(t("subtasks.saveSuccess"));
        },
        (error: Error) => {
          // console.log("Could not save subtasks", error);
          message.error(t("subtasks.cantCreate"));
        },
      );
    } else {
      message.error(t("subtasks.enterSubtaskTitleMsg"));
    }
  };
  const updateSubtask = (_id: string, changes: Subtask) => {
    TaskService.patch(_id, changes).then(
      (res: Subtask) => {
        setSubtasks({
          data: subtasks.data.map((item) =>
            item._id !== res._id ? item : res,
          ),
        } as PaginatedFeathersResponse<Subtask>);
        mixpanel.track("Subtask updated", { _id: res._id });
        setEditingState({ editingId: "", newTitle: "", creatingTask: false });
        message.success(t("subtasks.updateSuccess"));
      },
      (error: Error) => {
        // console.log("Could not update subtask", error);
        message.error(t("subtasks.canUpdate"));
      },
    );
  };
  const deleteSubtask = (_id: string) => {
    TaskService.remove(_id).then(
      (res: Subtask) => {
        mixpanel.track("Subtask removed", { _id: res._id });
        setSubtasks({
          total: subtasks.total - 1,
          data: subtasks.data.filter((item) => item._id !== res._id),
        } as PaginatedFeathersResponse<Subtask>);
        setOrphanSubtaskIds(orphanSubtaskIds.filter((id) => id !== res._id));
      },
      (error: Error) => {
        logger.error("Could not delete subtask: ", error);
        message.error(t("subtasks.cantDelete"));
      },
    );
  };

  const onStatusChange = (subtask: Subtask) => {
    setSubtasks({
      data: subtasks.data.map((item) =>
        item._id !== subtask._id ? item : { ...item, ...subtask },
      ),
    } as PaginatedFeathersResponse<Subtask>);
  };
  return (
    <SubtasksView
      {...editingState}
      subtasks={data}
      updateState={(changes) =>
        setEditingState((old) => ({ ...old, ...changes }))
      }
      canFetchMore={skip + limit < total}
      fetchMore={() =>
        setSubtasks({
          skip: skip + limit,
        } as PaginatedFeathersResponse<Subtask>)
      }
      assignees={assignees}
      createNewTask={createSubtask}
      updateSubtask={updateSubtask}
      deleteSubtask={deleteSubtask}
      saveFileOffline={() => null}
      removeFileOfline={() => null}
      onStatusChange={onStatusChange}
    />
  );
};

export default withTranslation()(SubtasksContainer);
