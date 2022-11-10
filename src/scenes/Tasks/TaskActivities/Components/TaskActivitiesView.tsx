import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Timeline, Tooltip } from "antd";
import moment from "moment";
import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { getUpdateAvatar } from "scenes/Dashboard/Components/LatestUpdates/utils";
import { Activity, PaginatedFeathersResponse } from "types";
import { isColorWhite } from "utils/helpers";

import ActivityStatement from "./ActivityStatement";

interface TaskActivitiesProps extends WithTranslation {
  activities: PaginatedFeathersResponse<Activity>;
  fetchMore: () => void;
}

const TaskActivitiesView = ({
  t,
  activities,
  fetchMore,
}: TaskActivitiesProps) => {
  const { data, total, skip, limit } = activities;
  return data?.length > 0 ? (
    <div>
      <div className="tw-mb-4 tw-flex tw-items-center">
        <h1 className="tw-text-dark tw-text-xl">{t("activities.pageTitle")}</h1>
      </div>
      <Timeline>
        {data.map((activity) => (
          <Timeline.Item
            key={activity._id}
            dot={
              <FontAwesomeIcon
                icon={getUpdateAvatar(activity, "default", true) as IconProp}
                style={{
                  color: isColorWhite(activity?.from?.color)
                    ? "orange"
                    : activity?.from?.color,
                }}
              />
            }
          >
            <Tooltip
              title={moment(activity.createdAt).format(
                "dddd DD MMMM YYYY HH:mm",
              )}
            >
              <span className="tw-text-gray-500">
                {moment(activity.createdAt).isAfter(moment().startOf("day"))
                  ? moment(activity.createdAt).fromNow()
                  : moment(activity.createdAt).format("DD/MM/YYYY HH:mm")}
              </span>
            </Tooltip>
            <div>
              <ActivityStatement activity={activity} />
            </div>
          </Timeline.Item>
        ))}
      </Timeline>
      {skip + limit < total ? (
        <>
          <span className="tw-ml-auto">{`${skip + limit} / ${total}`}</span>
          <Button type="link" onClick={fetchMore}>
            {t("subtasks.showMore")}
          </Button>
        </>
      ) : null}
    </div>
  ) : null;
};

export default withTranslation()(TaskActivitiesView);
