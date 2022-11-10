import { SmileFilled } from "@ant-design/icons";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";

import SapiyonGuide from "..";

// interface UserEditHelpProps {}

const UserEditHelp = () => {
  const [t] = useTranslation();
  const { joyrideState, guideState } = useContext(SapiyonGuide);

  if (
    joyrideState.tourInProgress &&
    guideState.currentStage === "intro-tour-1"
  ) {
    return (
      <div className="tw-mb-5">
        <ol className="s-fancy-list tw-mt-4">
          <li className="s-fancy-list-item">
            <span className="tw-mr-2 tw-text-xl tw-font-bold">1.</span>
            <div>
              <div>{t("introTour.employees.help1-1")}</div>
              <div>{t("introTour.employees.help1-2")}</div>
            </div>
          </li>
          <li className="s-fancy-list-item">
            <span className="tw-mr-2 tw-text-xl tw-font-bold">2.</span>
            <div>
              <div>{t("introTour.employees.help2-1")}</div>
              <div>{t("introTour.employees.help2-2")}</div>
            </div>
          </li>
          <li className="s-fancy-list-item">
            <span className="tw-mr-2 tw-text-xl tw-font-bold">3.</span>
            <span>{t("introTour.employees.help3-1")}</span>
          </li>
          <li className="s-fancy-list-item">
            <span className="tw-mr-2 tw-text-xl tw-font-bold">4.</span>
            <span>{t("introTour.employees.help4-1")}</span>
            <SmileFilled className="tw-ml-2 tw-text-2xl" />
          </li>
        </ol>
      </div>
    );
  } else {
    return null;
  }
};

export default UserEditHelp;
