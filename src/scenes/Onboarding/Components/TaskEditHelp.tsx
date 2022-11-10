import { SmileFilled } from "@ant-design/icons";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";

import SapiyonGuide from "..";

// interface TaskEditHelpProps {}

const TaskEditHelp = () => {
  const [t] = useTranslation();
  const { joyrideState, guideState } = useContext(SapiyonGuide);

  if (
    joyrideState.tourInProgress &&
    guideState.currentStage === "intro-tour-3"
  ) {
    return (
      <div className="tw-mb-5">
        <ol className="s-fancy-list tw-mt-4">
          <li className="s-fancy-list-item">
            <span className="tw-mr-2 tw-text-xl tw-font-bold">1.</span>
            <div>{t("introTour.tasks.help1-1")}</div>
          </li>
          <li className="s-fancy-list-item">
            <span className="tw-mr-2 tw-text-xl tw-font-bold">2.</span>
            <div>{t("introTour.tasks.help2-1")}</div>
          </li>
          <li className="s-fancy-list-item">
            <span className="tw-mr-2 tw-text-xl tw-font-bold">3.</span>
            <div>{t("introTour.tasks.help3-1")}</div>
          </li>
          <li className="s-fancy-list-item">
            <span className="tw-mr-2 tw-text-xl tw-font-bold">4.</span>
            <div>{t("introTour.tasks.help4-1")}</div>
          </li>
          <li className="s-fancy-list-item">
            <span className="tw-mr-2 tw-text-xl tw-font-bold">5.</span>
            <span>{t("introTour.tasks.help5-1")}</span>
            <SmileFilled className="tw-ml-2 tw-text-2xl" />
          </li>
        </ol>
      </div>
    );
  } else {
    return null;
  }
};

export default TaskEditHelp;
