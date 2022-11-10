import { Empty, Spin, Tabs, Tag } from "antd";
import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";

import { PaginatedFeathersResponse, Task, User } from "../../../../../types";
import { getUsableScreenHeight } from "../../../../../utils/helpers";
import TaskCard from "./TaskCard";
import UsersTab from "./UsersTab";

interface SideBarProps extends WithTranslation {
  currentTab: "tasks" | "users";
  tasks: PaginatedFeathersResponse<Task>;
  users: PaginatedFeathersResponse<User>;
  tasksLoader: boolean;
  usersLoader: boolean;
  setCurrentTab: (tab: "tasks" | "users") => void;
  setSelectedTask: (id: string) => void;
  setSelectedUser: (id: string) => void;
  handleTabScroll: (event: any, entity: "tasks" | "users") => void;
}
const style = {
  position: "sticky",
  top: 0,
  color: "#666666",
  fontWeight: "500",
  textAlign: "center",
  marginBottom: "0rem",
  backgroundColor: "#e3e9ee",
};

const SideBar = ({
  t,
  currentTab,
  tasks,
  users,
  tasksLoader,
  usersLoader,
  setCurrentTab,
  setSelectedTask,
  setSelectedUser,
  handleTabScroll,
}: SideBarProps) => {
  const { total: taskTotal = 0, data: taskData = [] } = tasks;

  return (
    <Tabs
      defaultActiveKey="tasks"
      activeKey={currentTab}
      onChange={(tab) => setCurrentTab(tab as "tasks" | "users")}
      renderTabBar={(props, DefaultTabBar) => {
        return <DefaultTabBar {...props} style={style} />;
      }}
      className="s-tabs tw-h-full"
    >
      <Tabs.TabPane tab={t("taskMap.jobs")} key="tasks">
        <div
          className="tw-overflow-y-auto"
          style={{ ...getUsableScreenHeight(256 + 47) }}
          onScroll={(event: any) => handleTabScroll(event, "tasks")}
        >
          {taskData.length ? (
            taskData
              .filter((item: Task) => !item.isSubtask)
              .map((task: Task) => (
                <TaskCard
                  task={task}
                  handleTaskClick={() => setSelectedTask(task._id || "")}
                  key={task._id}
                />
              ))
          ) : (
            <div className="tw-mt-10">
              <Empty description={t("general.noData")} />
            </div>
          )}
          <div className="tw-text-center tw-p-4">
            {tasksLoader && <Spin />}
            {taskData.length > 0 && taskData.length >= taskTotal ? (
              <div>
                <Tag>{t("global.noMoreData")}</Tag>
              </div>
            ) : null}
          </div>
        </div>
      </Tabs.TabPane>
      <Tabs.TabPane tab={t("taskMap.employees")} key="users">
        <UsersTab
          users={users}
          handleTabScroll={handleTabScroll}
          setSelectedUser={setSelectedUser}
          isLoading={usersLoader}
        />
      </Tabs.TabPane>
    </Tabs>
  );
};

export default withTranslation()(SideBar);
