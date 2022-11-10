import { SmileFilled } from "@ant-design/icons";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";

import SapiyonGuide from "..";

// interface CustomerEditHelpProps {}

const CustomerEditHelp = () => {
  const [t] = useTranslation();
  const { joyrideState, guideState } = useContext(SapiyonGuide);

  if (
    joyrideState.tourInProgress &&
    guideState.currentStage === "intro-tour-2"
  ) {
    return (
      <div className="tw-mb-5">
        <ol className="s-fancy-list tw-mt-4">
          <li className="s-fancy-list-item">
            <span className="tw-mr-2 tw-text-xl tw-font-bold">1.</span>
            <div>{t("introTour.customers.help1-1")}</div>
          </li>
          <li className="s-fancy-list-item">
            <span className="tw-mr-2 tw-text-xl tw-font-bold">2.</span>
            <div>
              <div>{t("introTour.customers.help2-1")}</div>
              <div>{t("introTour.customers.help2-2")}</div>
            </div>
          </li>
          <li className="s-fancy-list-item">
            <span className="tw-mr-2 tw-text-xl tw-font-bold">3.</span>
            <span>{t("introTour.customers.help3-1")}</span>
            <SmileFilled className="tw-ml-2 tw-text-2xl" />
          </li>
        </ol>
      </div>
    );
  } else {
    return null;
  }
};

export default CustomerEditHelp;
