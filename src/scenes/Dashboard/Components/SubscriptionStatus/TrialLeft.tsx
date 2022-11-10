import { Button } from "antd";
import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";

import AppStoreBadge from "../../../../assets/images/appStore.svg";
import Subscription from "../../../Subscription";

interface SubscriptionStatusProps extends WithTranslation {}

const SubscriptionStatus = ({ t }: SubscriptionStatusProps) => {
  return (
    <div className="tw-px-4 md:tw-flex tw-items-center tw-justify-between tw-border tw-shadow-lg s-main-font s-semibold tw-text-base tw-bg-white">
      <Subscription />
      <Button
        type="primary"
        href="/iframes"
        className="s-primary-btn-bg s-semibold s-main-font tw-mx-auto"
      >
        {t("header.tutorial")}
      </Button>
      <div className="tw-flex tw-justify-center tw-items-center tw-mt-3 md:tw-mt-0">
        <a
          target="_blank"
          rel="noreferrer"
          href="https://play.google.com/store/apps/details?id=com.sapiyon&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"
        >
          <img
            alt="Google Play'den alın"
            src="https://play.google.com/intl/en_us/badges/static/images/badges/tr_badge_web_generic.png"
            width={150}
          />
        </a>
        <a
          target="_blank"
          rel="noreferrer"
          href="https://apps.apple.com/us/app/sapiyon/id1496930567?ls=1"
        >
          <img
            src={AppStoreBadge}
            alt="Link to Sapiyon iOS app"
            style={{ filter: "blur(0.6px)" }}
          />
        </a>
      </div>
      {/* <div className="tw-mt-3 md:tw-mt-0 tw-text-center">
        <a href="mailto:info@sapiyon.com" className="tw-text-blue-500">
          info@sapiyon.com
        </a>
        <span className="tw-mx-4">|</span>
        <a href="tel:+90 212 875 7220">+90 212 875 7220</a>
      </div> */}
    </div>
  );
};

export default withTranslation()(SubscriptionStatus);
