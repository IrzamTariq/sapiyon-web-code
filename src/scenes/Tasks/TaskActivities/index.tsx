import { message } from "antd";
import React, { useEffect, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { Activity, PaginatedFeathersResponse } from "types";

import { TaskActivitiesService } from "../../../services/index";
import TaskActivitiesView from "./Components/TaskActivitiesView";

const INITIAL_STATE = {
  total: 0,
  skip: 0,
  limit: 10,
  data: [] as Activity[],
};
interface TaskActivitiesProps extends WithTranslation {
  taskId: string;
}

const TaskActivities = ({ t, taskId }: TaskActivitiesProps) => {
  const [activities, setActivities] = useState<
    PaginatedFeathersResponse<Activity>
  >(INITIAL_STATE);
  const { limit, skip } = activities;

  useEffect(() => {
    if (!!taskId) {
      TaskActivitiesService.find({
        query: {
          "task._id": taskId,
          $limit: limit,
          $skip: skip,
          $sort: { createdAt: -1 },
        },
      }).then(
        (res: PaginatedFeathersResponse<Activity>) => {
          setActivities((prev) => ({
            ...res,
            data: [...prev.data, ...res.data],
          }));
          // console.log("Activities: ", res.data);
        },
        (error: Error) => {
          // console.log("Error in fetching task activities: ", error);
          message.error(t("activities.fetchError"));
        },
      );
    }
  }, [taskId, limit, skip, t]);
  useEffect(() => {
    const handleCreated = (activity: Activity) => {
      if (activity?.task?._id === taskId) {
        setActivities((prev) => ({
          ...prev,
          total: prev.total + 1,
          data: [activity, ...prev.data],
        }));
      }
    };

    TaskActivitiesService.on("created", handleCreated);
    return () => {
      TaskActivitiesService.off("created", handleCreated);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TaskActivitiesView
      activities={activities}
      fetchMore={() =>
        setActivities((prev) => ({ ...prev, skip: skip + limit }))
      }
    />
  );
};

export default withTranslation()(TaskActivities);
