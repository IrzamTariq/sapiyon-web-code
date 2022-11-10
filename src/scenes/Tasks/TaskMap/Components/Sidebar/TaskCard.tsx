import { Tag, Tooltip } from "antd";
import moment from "moment";
import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { getRTEText } from "utils/components/RTE/RTE";

import { Task, User } from "../../../../../types";
import { getCustomerName, getUsername } from "../../../../../utils/helpers";
import { getTaskStatusLabel } from "../../../../../utils/helpers/utils";

interface TaskCardProps extends WithTranslation {
  task: Task;
  handleTaskClick: () => void;
}

const TaskCard = ({ task, t, handleTaskClick }: TaskCardProps) => {
  const getTaskAssigneeTags = (assignees: User[]) => {
    let [assignee, ...rest] = assignees;

    return (
      <Tag
        color="blue"
        className={
          getUsername(assignee).length <= 15
            ? "s-main-font tw-text-center s-rightBadge s-light-text-color"
            : "s-main-font tw-text-center tw-truncate s-rightBadge s-light-text-color tw-w-32"
        }
      >
        <Tooltip
          autoAdjustOverflow
          title={
            <ol>
              {assignees.map((user: User, index: number) => (
                <li key={user._id}>{`${index + 1}. ${getUsername(user)}`}</li>
              ))}
            </ol>
          }
        >
          {getUsername(assignee)}
          {rest.length > 0 ? `, +${rest.length}...` : ""}
        </Tooltip>
      </Tag>
    );
  };

  const getTaskStatus = (record: Task) => {
    return (
      <Tooltip placement="topLeft" title={getTaskStatusLabel(record.status)}>
        <Tag
          className={
            (getTaskStatusLabel(record.status) || "").length <= 15
              ? "s-main-font tw-text-center s-rightBadge tw-text-white"
              : "s-main-font tw-text-center tw-truncate s-rightBadge tw-text-white tw-w-32"
          }
          style={{
            backgroundColor: record?.status?.color || "#808080",
            border: "1px solid " + record?.status?.color || "#808080",
          }}
        >
          {getTaskStatusLabel(record.status)}
        </Tag>
      </Tooltip>
    );
  };

  const { assignees = [] } = task;

  //TODO: Not Scheduled and No customer needs translation
  return (
    <div style={{ cursor: "pointer" }} onClick={() => handleTaskClick()}>
      <div className="JobCard tw-mb-2 tw-shadow-md tw-p-3 tw-bg-white tw-rounded">
        <p className="s-light-text-color tw-my-0 tw-text-sm">
          {task.endAt
            ? moment(task.endAt).format("HH:mm DD/MM/YYYY")
            : t("jobs.unscheduled")}
        </p>

        <p className="s-main-font s-main-text-color tw-text-base tw-font-medium tw-truncate">
          {getCustomerName(task.customer)}
        </p>
        <p className="s-main-font s-main-text-color s-text-15 tw-my-0 tw-truncate">
          {getRTEText(task.title)}
        </p>
        <div className="tw-flex tw-justify-between tw-items-center tw-mt-2">
          {getTaskStatus(task)}
          {assignees.length > 0 ? (
            getTaskAssigneeTags(assignees)
          ) : (
            <Tag color="red" className="s-main-font tw-text-center tw-truncate">
              {t("taskCard.notAssigned")}
            </Tag>
          )}
        </div>
      </div>
    </div>
  );
};

export default withTranslation()(TaskCard);
