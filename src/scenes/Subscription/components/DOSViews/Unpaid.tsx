import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "antd";
import Appshell from "Appshell";
import moment from "moment";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Link, Redirect } from "react-router-dom";
import { Subscription, UserContextType } from "types";
import UserContext from "UserContext";

import logo from "../../../../assets/logo/logo-dark.png";

const SubscriptionUnpaid = () => {
  const { subscription = {} as Subscription } = useContext(
    UserContext,
  ) as UserContextType;
  const [t] = useTranslation();
  if (
    subscription.subscriptionStatus !== "UNPAID" ||
    (subscription.subscriptionStatus === "UNPAID" &&
      (moment().diff(moment(new Date(subscription.dueAt)), "day") || 0) < 7)
  ) {
    return <Redirect to="/" />;
  }

  return (
    <Appshell activeLink={["", ""]} hideSideMenu>
      <div className="s-std-text tw-px-4 md:tw-px-8 lg:tw-px-16">
        <div
          className="tw-flex tw-justify-between tw-pt-10"
          style={{ height: "40%" }}
        >
          <a
            href="https://sapiyon.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div>
              <img src={logo} alt="Sapiyon" className="tw-w-32 md:tw-w-48" />
            </div>
          </a>
          <Link to="/logout">
            <Button className="tw-invisible lg:tw-visible">
              {t("header.logout")}
            </Button>
            <FontAwesomeIcon
              icon={faSignOutAlt}
              className="lg:tw-mt-0 lg:tw-invisible tw-text-2xl"
            />
          </Link>
        </div>
        <div>
          <p className="tw-text-xl md:tw-text-3xl tw-text-center s-semibold">
            {t("subscription.unpaid")}
          </p>
          <p className="tw-mb-10 s-semibold tw-text-center tw-text-lg md:tw-text-2xl">
            {t("subscription.unpaidContact")}
          </p>
          <div className="tw-text-center md:tw-flex tw-justify-between lg:tw-justify-around tw-items-center tw-w-full">
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
                {t("subscription.ourEmail")} - info@sapiyon.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </Appshell>
  );
};

export default SubscriptionUnpaid;
