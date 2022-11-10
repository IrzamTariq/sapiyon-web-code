import { faFrown, faMeh, faSmile } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";

import numberFormatter from "../../../../utils/helpers/numberFormatter";
import { NPSReport } from "../dashboard";

interface NPSSummaryBodyProps extends WithTranslation {
  data: NPSReport;
}

const NPSSummaryBody = ({ t, data = {} as NPSReport }: NPSSummaryBodyProps) => {
  return (
    <div className="tw-p-12">
      <div className="tw-flex s-main-font tw-mb-20">
        <div className="tw-mr-5 md:tw-mr-10 lg:tw-mr-24">
          <div className="s-light-text-color tw-text-base tw-leading-4">
            {t("nps.score")}
          </div>
          <div className="s-main-text-color tw-font-bold tw-text-4xl">
            {(data.score || 0).toFixed(0)}
          </div>
        </div>
        <div>
          <div className="s-light-text-color tw-text-base tw-leading-7">
            {t("nps.responseCount")}
          </div>
          <div className="s-main-text-color tw-font-bold tw-text-2xl">
            {numberFormatter(data.totalResponses || 0)}
          </div>
        </div>
      </div>
      <div className="tw-flex tw-justify-between tw-items-center s-main-font">
        <div>
          <div className="s-light-text-color tw-text-base">
            {t("nps.promoters")} {(data.promotersPercentage || 0).toFixed(0)}%
          </div>
          <span className="s-main-text-color tw-font-bold tw-text-2xl">
            {numberFormatter(data.promotersCount || 0)}
          </span>
          <FontAwesomeIcon
            icon={faSmile}
            className="tw-text-green-500 tw-text-xl tw-ml-3"
          />
        </div>
        <div>
          <div className="s-light-text-color tw-text-base">
            {t("nps.passives")} {(data.passivesPercentage || 0).toFixed(0)}%
          </div>
          <span className="s-main-text-color tw-font-bold tw-text-2xl">
            {numberFormatter(data.passivesCount || 0)}
          </span>
          <FontAwesomeIcon
            icon={faMeh}
            className="tw-text-yellow-500 tw-text-xl tw-ml-3"
          />
        </div>
        <div>
          <div className="s-light-text-color tw-text-base">
            {t("nps.detractors")} {(data.detractorsPercentage || 0).toFixed(0)}%
          </div>
          <span className="s-main-text-color tw-font-bold tw-text-2xl">
            {numberFormatter(data.detractorsCount || 0)}
          </span>
          <FontAwesomeIcon
            icon={faFrown}
            className="tw-text-red-500 tw-text-xl tw-ml-3"
          />
        </div>
      </div>
    </div>
  );
};

export default withTranslation()(NPSSummaryBody);
