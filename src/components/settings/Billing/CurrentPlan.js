import { Popconfirm } from "antd";
import Appshell from "Appshell";
import moment from "moment";
import { path } from "rambdax";
import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";

import SubscriptionModalContainer from "../../../scenes/Subscription";
import {
  doCancelSubscription,
  doSubscriptionFetchRequest,
} from "../../../store/subscription";
import { currencyFormatter } from "../../../utils/helpers/currencyFormatter";

class CurrentBillingPlan extends Component {
  constructor() {
    super();
    this.state = {
      renewModalOpen: false,
      credictCardModalOpen: false,
    };
  }

  componentDidMount() {
    this.props.doSubscriptionFetchRequest();
  }

  toggleRenewModal = () => {
    this.setState({ renewModalOpen: !this.state.renewModalOpen });
  };

  toggleCreditCardModal = () => {
    this.setState({ credictCardModalOpen: !this.state.credictCardModalOpen });
  };

  render() {
    const { t, current, doCancelSubscription } = this.props;
    const status = path("subscriptionStatus", current) || "";
    const paymentInterval = path("plan.paymentInterval", current) || "N/A";
    let date = path("orders", current);
    date = date ? date[0] : undefined;
    date = date ? date.startPeriod : undefined;

    //TODO: check for tenure
    return (
      <Appshell activeLink={["settings", "currentPlan"]}>
        <div className="md:tw-mx-20 xl:tw-mx-32">
          {!["ACTIVE", "PENDING", "UNPAID", "UPGRADED"].includes(
            current.subscriptionStatus,
          ) && (
            <div className="tw-flex tw-flex-col tw-justify-center tw-items-center tw-w-full">
              <h1 className="tw-text-center tw-mb-5 tw-font-medium tw-text-xl s-font-roboto s-text-dark">
                {t("billing.notSubscribed")}
              </h1>
              <SubscriptionModalContainer />
            </div>
          )}
          {["ACTIVE", "PENDING", "UNPAID", "UPGRADED"].includes(
            current.subscriptionStatus,
          ) && (
            <div>
              <div className="tw-flex">
                <div className="tw-w-full tw-mr-12">
                  <h1 className="s-page-title tw-mb-5 s-font-roboto">
                    {t("subscription.membershipSummary")}
                  </h1>
                  <div>
                    <div className="tw-flex">
                      <div
                        className="card tw-px-4 tw-pt-1 tw-pb-2 tw-rounded-lg tw-w-full tw-mr-2"
                        style={{
                          backgroundColor: "#0086FF",
                        }}
                      >
                        <div>
                          <h3 className="tw-font-medium tw-text-white s-font-roboto">
                            {t("billing.status")}
                          </h3>
                          <div className="tw-mb-0 tw-mt-2 tw-flex tw-justify-between tw-items-center">
                            <h2 className="tw-font-bold tw-leading-loose s-font-roboto tw-text-2xl tw-text-white tw-capitalize">
                              {t(
                                `billing.subscriptionStatus.${status.toUpperCase()}`,
                              )}
                            </h2>
                          </div>
                        </div>
                      </div>
                      <div
                        className="card tw-px-4 tw-pt-1 tw-pb-2 tw-rounded-lg tw-w-full"
                        style={{
                          backgroundColor: "#F9F9F9",
                          border: "1px solid #EBEBEB",
                        }}
                      >
                        <div>
                          <h3 className="tw-font-medium s-font-roboto">
                            <span className="capitalize">
                              {paymentInterval === "MONTHLY"
                                ? t("billing.billedMonthly")
                                : t("billing.billedYearly")}
                            </span>
                          </h3>
                          <div className="tw-mb-0 tw-mt-2 tw-flex tw-justify-between tw-items-center">
                            <h2 className="tw-font-bold tw-text-2xl s-font-roboto">
                              {currencyFormatter(
                                path("plan.totalPriceAfterTax", current),
                                true,
                              )}
                            </h2>
                          </div>
                          <p className="tw-font-medium tw-text-sm tw--mt-2 s-font-roboto">
                            {paymentInterval === "MONTHLY"
                              ? t("billing.perMonth")
                              : t("billing.perYear")}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="tw-my-6">
                      <div className="tw-flex tw-justify-between tw-items-center tw-my-6">
                        <p className="s-title-font s-text-dark">
                          {t("billing.totalUsers")}
                        </p>
                        <div>
                          <span className="s-title-font s-text-dark tw-mr-5">
                            {path("plan.usersCount", current)}
                          </span>
                        </div>
                      </div>
                      <div className="tw-flex tw-justify-between tw-items-center tw-my-6">
                        <p className="s-title-font s-text-light-black tw-text-sm">
                          {t("billing.nextBillingDate")}
                        </p>
                        <p className="s-title-font s-text-light-black tw-text-sm">
                          {/* {this.getBillingDate(date)} */}
                          {date ? moment(date).format("DD MMM YYYY") : "N/A"}
                        </p>
                      </div>
                      <div className="tw-flex tw-justify-between tw-items-center tw-my-6">
                        <p className="s-title-font s-text-light-black tw-text-sm">
                          {t("subscription.amountExTax")}
                        </p>
                        <p className="s-title-font s-text-light-black tw-text-sm">
                          {currencyFormatter(
                            path("plan.totalPriceBeforeTax", current),
                            true,
                          )}
                        </p>
                      </div>
                      <div className="tw-flex tw-justify-between tw-items-center tw-my-6">
                        <p className="s-title-font s-text-light-black tw-text-sm">
                          {t("subscription.tax")}(
                          {path("plan.taxPercentage", current)}%)
                        </p>
                        <p className="s-title-font s-text-light-black tw-text-sm">
                          {currencyFormatter(
                            path("plan.taxAmount", current),
                            true,
                          )}
                        </p>
                      </div>
                      <div className="tw-flex tw-justify-between tw-items-center tw-my-6">
                        <p className="tw-font-medium s-title-font s-text-light-black tw-text-sm">
                          {t("subscription.amountIncTax")}
                        </p>
                        <p className="tw-font-medium s-title-font s-text-light-black tw-text-sm">
                          {currencyFormatter(
                            path("plan.totalPriceAfterTax", current),
                            true,
                          )}
                        </p>
                      </div>
                      <div className="tw-text-right">
                        <Popconfirm
                          title={t("billing.cancelSubscription")}
                          onConfirm={doCancelSubscription}
                          okButtonProps={{
                            danger: true,
                          }}
                          okText={t("global.ok")}
                          cancelText={t("global.cancel")}
                        >
                          <div
                            className="tw-px-2 tw-font-medium tw-text-sm tw-rounded tw-inline-block tw-mr-2 s-pointer"
                            style={{
                              backgroundColor: "lightred",
                              border: "2px solid #008600",
                              color: "#008600",
                            }}
                          >
                            {t("billing.cancelSubscriptionBtn")}
                          </div>
                        </Popconfirm>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="tw-w-full">
                  <h1 className="s-page-title tw-mb-5 s-font-roboto">
                    {t("billing.paymentMethod")}
                  </h1>
                  <div className="tw-flex tw-justify-between tw-items-center tw-my-6">
                    <p className="s-title-font s-text-light-black tw-text-sm">
                      {t("billing.creditCardOnFile")}
                    </p>
                    <p className="s-title-font s-text-light-black tw-text-sm">
                      {current.card ? t("billing.yes") : t("billing.no")}
                    </p>
                  </div>
                  <div className="tw-flex tw-justify-between tw-items-center tw-my-6">
                    <p className="s-title-font s-text-light-black tw-text-sm">
                      {t("billing.creditCardType")}
                    </p>
                    <p className="s-title-font s-text-light-black tw-text-sm">
                      {path("card.type", current) || t("billing.noRecord")}
                    </p>
                  </div>
                  <div className="tw-flex tw-justify-between tw-items-center tw-my-6">
                    <p className="s-title-font s-text-light-black tw-text-sm">
                      {t("billing.lastFourDigits")}
                    </p>
                    <p className="s-title-font s-text-light-black tw-text-sm">
                      {path("card.lastFourDigits", current) ||
                        t("billing.noRecord")}
                    </p>
                  </div>
                  <div className="tw-flex tw-justify-between tw-items-center tw-my-6">
                    <p className="s-title-font s-text-light-black tw-text-sm">
                      {t("billing.expiresOn")}
                    </p>
                    <p className="s-title-font s-text-light-black tw-text-sm">
                      {path("card.expireMonth", current) ||
                        t("billing.noMonth")}
                      /{path("card.expireYear", current) || t("billing.noYear")}
                    </p>
                  </div>
                  <div className="tw-text-right"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Appshell>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    current: state.subscription.current,
  };
};
const mapDispatchToProps = {
  doSubscriptionFetchRequest,
  doCancelSubscription,
};
const Translated = withTranslation()(CurrentBillingPlan);
export default connect(mapStateToProps, mapDispatchToProps)(Translated);
