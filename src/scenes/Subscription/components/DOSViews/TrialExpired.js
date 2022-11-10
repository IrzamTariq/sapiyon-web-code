import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
// import { Button } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "antd";
import React from "react";
import { withTranslation } from "react-i18next";
import { Link, Redirect } from "react-router-dom";

import logo from "../../../../assets/logo/logo-dark.png";
import UserContext from "../../../../UserContext";
import SubscriptionModal from "../../index";

const moment = require("moment");

const TrialExpired = ({ t }) => {
  return (
    <div>
      <UserContext.Consumer>
        {({ subscription }) => {
          //TODO: check for tenure
          const { trialEndAt, subscriptionStatus = "" } = subscription;
          let today = moment();
          if (
            (subscriptionStatus === "TRIAL" &&
              moment(trialEndAt).isAfter(today, "day")) ||
            ["ACTIVE", "PENDING"].includes(subscriptionStatus)
          ) {
            return <Redirect to="/" />;
          }
        }}
      </UserContext.Consumer>
      <div
        style={{ height: "10vh" }}
        className="tw-flex tw-justify-between tw-items-center"
      >
        <a href="https://sapiyon.com" target="_blank" rel="noopener noreferrer">
          <div className="tw-pl-8 lg:tw-pl-16 tw-pt-10">
            <img src={logo} alt="Sapiyon" className="tw-w-48 sm:tw-w-32" />
          </div>
        </a>
        <Link to="/logout">
          <Button className="tw-mr-8 lg:tw-mr-16 tw-mt-10 tw-invisible lg:tw-visible">
            {t("header.logout")}
          </Button>
          <FontAwesomeIcon
            icon={faSignOutAlt}
            className="tw-mr-8 tw-mt-12 lg:tw-invisible tw-text-2xl"
          />
        </Link>
      </div>
      <div
        className="tw-flex tw-justify-around tw-items-center tw-flex-col tw-px-8 lg:tw-w-6/12 tw-mx-auto"
        style={{ height: "90vh" }}
      >
        <div>
          <SubscriptionModal />
        </div>
        <div className="tw-w-full tw-mb-5">
          <p
            className="s-main-text-color tw-mb-10 s-main-font tw-font-medium tw-text-center tw-text-2xl"
            style={{ fontSize: "22px" }}
          >
            {t("subscription.talkToSalesDept")}
          </p>
          <div className="tw-flex tw-justify-between lg:tw-justify-around tw-items-center tw-w-full">
            <div>
              <a
                href="tel:+902125026105"
                className="tw-text-lg s-main-text-color"
              >
                {t("subscription.telephone")} - +90 212 875 7220
              </a>
            </div>
            <div>
              <a
                href="mailto:sales@sapiyon.com"
                className="tw-text-lg s-main-text-color"
              >
                {t("subscription.ourEmail")} -{" "}
                <a href="mailto:info@sapiyon.com">info@sapiyon.com</a>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withTranslation()(TrialExpired);
