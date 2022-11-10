import { Spin, Tag } from "antd";
import logger from "logger";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TaskService } from "services";
import { PaginatedFeathersResponse, User, UserContextType } from "types";
import UserContext from "UserContext";
import { getUsableScreenHeight } from "utils/helpers";

import EmployeeCard from "./EmployeeCard";

interface UsersTabProps {
  users: PaginatedFeathersResponse<User>;
  isLoading: boolean;
  setSelectedUser: (id: string) => void;
  handleTabScroll: (event: any, entity: "tasks" | "users") => void;
}
interface Report {
  count: number;
  assigneeId: string;
  assignee: User;
}

const UsersTab = ({
  users,
  setSelectedUser,
  handleTabScroll,
  isLoading,
}: UsersTabProps) => {
  const [t] = useTranslation();
  const [report, setReport] = useState({} as { [assigneeId: string]: Report });
  const [reportLoading, setReportLoading] = useState(false);
  const { firm } = useContext(UserContext) as UserContextType;
  const completedStatusId = firm?.completedTaskStatusId;
  const cancelledStatusId = firm?.cancelledTaskStatusId;
  const { data = [], total = 0 } = users;

  useEffect(() => {
    setReportLoading(true);
    TaskService.find({
      query: {
        reportName: "AssigneeByTaskCount",
        statusId: { $nin: [completedStatusId, cancelledStatusId] },
      },
    }).then(
      (res: Report[]) => {
        setReport(
          res.reduce((acc, curr) => ({ ...acc, [curr.assigneeId]: curr }), {}),
        );
        setReportLoading(false);
      },
      (e: Error) => {
        logger.error("Error in fetching assignee by task count report: ", e);
        setReportLoading(false);
      },
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="tw-overflow-y-auto"
      style={{ ...getUsableScreenHeight(64 + 72 + 32) }}
      onScroll={(event) => handleTabScroll(event, "users")}
    >
      {data.map((item) => (
        <EmployeeCard
          key={item._id}
          handleUserClick={() => setSelectedUser(item._id || "")}
          employee={item}
          jobCount={report[item._id]?.count}
          countLoading={reportLoading}
        />
      ))}
      <div className="tw-text-center tw-p-4">
        {isLoading && <Spin />}
        {data.length >= total ? (
          <div>
            <Tag>{t("global.noMoreData")}</Tag>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default UsersTab;
