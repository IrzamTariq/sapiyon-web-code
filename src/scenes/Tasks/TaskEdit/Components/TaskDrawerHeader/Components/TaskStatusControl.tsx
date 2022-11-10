import { DownOutlined } from "@ant-design/icons";
import mixpanel from "analytics/mixpanel";
import { Dropdown, Menu, message } from "antd";
import React, { useContext, useEffect, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";

import { TaskService, TaskStatusService } from "../../../../../../services";
import {
  PaginatedFeathersResponse,
  Subtask,
  Task,
  TaskStatus,
} from "../../../../../../types";
import UserContext from "../../../../../../UserContext";
import { isTaskCompleted } from "../../../../../../utils/helpers";
import {
  getConversionStatusText,
  getTaskStatusLabel,
  getTaskStatusStyles,
} from "../../../../../../utils/helpers/utils";

interface TaskStatusContorlProps extends WithTranslation {
  task: Task | Subtask;
  hasFiles?: boolean;
  onStatusChange: (changes: Task | Subtask) => void;
  onConvertToInvoice: () => void;
}

const TaskStatusContorl = ({
  t,
  task,
  hasFiles,
  onStatusChange,
  onConvertToInvoice,
}: TaskStatusContorlProps) => {
  const [allStatuses, setAllStatuses] = useState([] as TaskStatus[]);
  const { firm, hasPermission, hasFeature }: any = useContext(UserContext);
  const { _id: taskId, isImgRequired } = task;
  const completedStatusId = firm?.completedTaskStatusId;

  useEffect(() => {
    if (!!task._id) {
      TaskStatusService.find({ query: { category: "task", $limit: 500 } }).then(
        (res: PaginatedFeathersResponse<TaskStatus>) => {
          setAllStatuses(res.data);
        },
        () => message.error(t("status.fetchError")),
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const updateStatus = (key: string) => {
    TaskService.patch(taskId, {
      statusId: key === "open" ? null : key,
    }).then(
      ({ statusId, status, ...rest }: Task | Subtask) => {
        mixpanel.track(
          `${rest.isSubtask ? "Subtask" : "Task"} status updated`,
          { _id: rest._id },
        );
        message.success(t("global.statusUpdateSuccess"));
        onStatusChange({ statusId, status } as Task | Subtask);
      },
      (error: Error) => {
        // console.log("Could not update status: ", error);
        message.error(t("global.statusUpdateError"));
      },
    );
  };

  const availableStatuses: TaskStatus[] = allStatuses.filter(
    (status) => status._id !== task.statusId,
  );

  const userStatuses = ([] as JSX.Element[]).concat(
    availableStatuses
      .filter((item) => item.type !== "system")
      .map((item) => (
        <Menu.Item className="s-main-text-color" key={item._id}>
          {getTaskStatusLabel(item, t("Open"))}
        </Menu.Item>
      )),
  );

  const systemStatuses = [
    <Menu.Divider key="divider1" />,
    <Menu.Item key="open" className="s-main-text-color">
      {t("Open")}
    </Menu.Item>,
  ].concat(
    availableStatuses
      .filter((item) => item.type === "system")
      .map((item) => (
        <Menu.Item className="s-main-text-color" key={item._id}>
          {getTaskStatusLabel(item, t("Open"))}
        </Menu.Item>
      )),
  );

  let conversionOptions = [];
  if (hasFeature("extendedTasks") && hasPermission("canManageInvoices")) {
    conversionOptions.push(
      <Menu.Item className="s-main-text-color" key="convertToInvoice">
        {t("status.convertToInvoice")}
      </Menu.Item>,
    );
  }

  if (conversionOptions.length > 0 && hasFeature("extendedTasks")) {
    conversionOptions.unshift(<Menu.Divider key="divider2" />);
  }

  const handleSelection = (key: string) => {
    if (key === "convertToInvoice") {
      onConvertToInvoice();
    } else if (key === completedStatusId) {
      if (isImgRequired && !hasFiles) {
        message.error(t("taskEdit.attachImage"));
      } else {
        updateStatus(key);
      }
    } else {
      updateStatus(key);
    }
  };

  return (
    <Dropdown
      overlay={
        <Menu onClick={(e) => handleSelection(e.key as string)}>
          {userStatuses}

          {systemStatuses}

          {task.isSubtask ? null : conversionOptions}
        </Menu>
      }
      disabled={
        isTaskCompleted(task.status) &&
        !hasPermission("canManageCompletedTasks")
      }
    >
      <div
        className="s-primary-btn-bg tw-text-white tw-inline-flex tw-items-center s-pointer"
        style={{
          ...getTaskStatusStyles(task.status, task?.isInvoiceCreated),
          maxWidth: "160px",
        }}
        title={getConversionStatusText(task, t("Open"))}
      >
        <div className="tw-truncate tw-mr-2">
          {getConversionStatusText(task, t("Open"))}
        </div>
        <DownOutlined />
      </div>
    </Dropdown>
  );
};

export default withTranslation()(TaskStatusContorl);
