import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { Activity } from "types";
import UserNamePopup from "utils/components/UserNamePopup";
import {
  getUserActivityStatement,
  getUserActivityStatementBody,
} from "utils/helpers";

interface ActivityStatementProps extends WithTranslation {
  activity: Activity;
  shortened?: boolean;
}

const ActivityStatement = ({
  t,
  activity,
  shortened,
}: ActivityStatementProps) => {
  const { from } = activity;
  return shortened ? (
    <>{getUserActivityStatement(activity)}</>
  ) : (
    <div>
      <UserNamePopup user={from} />
      {` ${getUserActivityStatement(activity)}`}
      {getUserActivityStatementBody(activity)}
    </div>
  );
};

export default withTranslation()(ActivityStatement);
