import React from "react";
import { useTranslation } from "react-i18next";

import AppStoreBadge from "../../../../assets/images/appStore.svg";

interface SubscriptionPaymentReminderProps {
  lateDays: number;
}

const SubscriptionPaymentReminder = ({
  lateDays,
}: SubscriptionPaymentReminderProps) => {
  const [t] = useTranslation();

  return (
    <div className="tw-px-4 md:tw-flex tw-items-center tw-border tw-shadow-lg s-main-font tw-text-base tw-bg-white tw-text-red-500">
      <span>
        {t("subscription.paymentReminder").replace(
          "<daysLeft>",
          lateDays?.toString() || "0",
        )}
      </span>
      <div className="tw-flex tw-justify-center tw-items-center md:tw-ml-auto tw-mt-3 md:tw-mt-0">
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
        {/* <a href="mailto:info@sapiyon.com" className="tw-text-blue-500">
          info@sapiyon.com
        </a>
        <span className="tw-mx-4">|</span>
        <a href="tel:+90 212 875 7220">+90 212 875 7220</a> */}
      </div>
    </div>
  );
};

export default SubscriptionPaymentReminder;
