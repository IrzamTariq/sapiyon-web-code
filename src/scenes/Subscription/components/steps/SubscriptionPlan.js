import "@ant-design/compatible/assets/index.css";

import { Form } from "@ant-design/compatible";
import { Button, Input, message } from "antd";
import ButtonGroup from "antd/lib/button/button-group";
import moment from "moment";
import { path } from "rambdax";
import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { currencyFormatter } from "utils/helpers/currencyFormatter";

const annualPrice = 30;
const discountRate = 20;
const tax = 18;

const getTaxAmount = (price = 0) => (price * tax) / 100;

const calculateAnnualDiscount = (price = 0) => (+price * discountRate) / 100;

const planPriceWithoutTax = (paymentInterval, totalUsers) =>
  paymentInterval === "YEARLY"
    ? 12 * totalUsers * annualPrice
    : totalUsers * (annualPrice + calculateAnnualDiscount(annualPrice));

export const planPriceWithTax = (paymentInterval, totalUsers) => {
  const price = planPriceWithoutTax(paymentInterval, totalUsers);
  return price + getTaxAmount(price);
};

class Subscription extends Component {
  savePlan = () => {
    const {
      form,
      userCount,
      doSaveChangesLocally,
      currentStep,
      setCurrentStep,
    } = this.props;
    form.validateFields((err, values) => {
      if (!err && values.billingPlan.usersCount >= userCount) {
        doSaveChangesLocally(values);
        setCurrentStep(currentStep + 1);
      } else {
        message.error(this.props.t("subscription.planInvalid"));
      }
    });
  };

  render() {
    const { form, currentStep, setCurrentStep, t } = this.props;
    const { setFieldsValue, getFieldValue, getFieldDecorator } = form;

    const paymentInterval = getFieldValue("billingPlan.paymentInterval");
    const totalUsers = getFieldValue("billingPlan.usersCount");

    const setUsersCount = (num) => {
      if (num >= this.props.userCount) {
        if (num > 0) {
          setFieldsValue({ "billingPlan.usersCount": num });
        }
      } else {
        message.error(
          `${t("subscription.invalidUsers1")} ${this.props.userCount} ${t(
            "subscription.invalidUsers2",
          )}`,
        );
      }
    };

    return (
      <div>
        <div className="add-checklist-form">
          <div className="tw-hidden">
            {getFieldDecorator("billingPlan.paymentInterval", {
              rules: [{ required: true }],
            })(<Input />)}
            {getFieldDecorator("billingPlan.usersCount", {
              rules: [{ required: true }],
            })(<Input />)}
          </div>
          <div className="tw-flex">
            <div
              className="card tw-px-4 tw-pt-1 tw-pb-2 tw-rounded-lg tw-w-full tw-mr-2 s-pointer"
              style={{
                transition: "all 500ms",
                backgroundColor:
                  paymentInterval === "YEARLY" ? "#0086FF" : "#F9F9F9",
                border:
                  paymentInterval === "YEARLY"
                    ? "1px solid  #0086FF"
                    : "1px solid  #EBEBEB",
              }}
              onClick={() => {
                setFieldsValue({ "billingPlan.paymentInterval": "YEARLY" });
              }}
            >
              <div>
                <h3
                  className={
                    paymentInterval === "YEARLY"
                      ? "tw-font-medium s-font-roboto tw-text-white"
                      : "tw-font-medium s-font-roboto"
                  }
                >
                  {t("subscription.billedAnually")}
                </h3>
                <div className="tw-mb-0 tw-mt-2 tw-flex tw-justify-between tw-items-center">
                  <h2
                    className={
                      paymentInterval === "YEARLY"
                        ? "tw-font-bold s-font-roboto tw-text-2xl tw-mb-1 tw-text-white"
                        : "tw-font-bold s-font-roboto tw-text-2xl tw-mb-1"
                    }
                  >
                    {currencyFormatter(annualPrice, true)}
                  </h2>
                  <div
                    className={
                      paymentInterval === "YEARLY"
                        ? "s-font-roboto tw-text-sm tw-px-2 tw-leading-loose tw-rounded"
                        : "s-font-roboto tw-text-sm tw-px-2 tw-leading-loose tw-rounded tw-text-white"
                    }
                    style={{
                      backgroundColor:
                        paymentInterval === "YEARLY" ? "#E2F7FF" : "#0086FF",
                      color: paymentInterval === "YEARLY" ? "#0086FF" : "white",
                    }}
                  >
                    {discountRate}% {t("subscription.save")}
                  </div>
                </div>
                <p
                  className={
                    paymentInterval === "YEARLY"
                      ? "tw-font-medium s-font-roboto tw-text-sm tw--mt-2 tw-text-white"
                      : "tw-font-medium s-font-roboto tw-text-sm tw--mt-2"
                  }
                >
                  {t("subscription.perMonthPerUser")}
                </p>
              </div>
            </div>
            <div
              className="card tw-px-4 tw-pt-1 tw-pb-2 tw-rounded-lg tw-w-full s-pointer"
              style={{
                transition: "all 500ms",
                backgroundColor:
                  paymentInterval === "YEARLY" ? "#F9F9F9" : "#0086FF",
                border:
                  paymentInterval === "YEARLY"
                    ? "1px solid  #EBEBEB"
                    : "1px solid  #0086FF",
              }}
              onClick={() => {
                setFieldsValue({ "billingPlan.paymentInterval": "MONTHLY" });
              }}
            >
              <div>
                <h3
                  className={
                    paymentInterval === "YEARLY"
                      ? "tw-font-medium s-font-roboto"
                      : "tw-font-medium s-font-roboto tw-text-white"
                  }
                >
                  {t("subscription.billedMonthly")}
                </h3>
                <div className="tw-mb-0 tw-mt-2 tw-flex tw-justify-between tw-items-center">
                  <h2
                    className={
                      paymentInterval === "YEARLY"
                        ? "tw-font-bold s-font-roboto tw-text-2xl tw-mb-1"
                        : "tw-font-bold s-font-roboto tw-text-2xl tw-mb-1 tw-text-white"
                    }
                  >
                    {currencyFormatter(
                      annualPrice + calculateAnnualDiscount(annualPrice),
                      true,
                    )}
                  </h2>
                </div>
                <p
                  className={
                    paymentInterval === "YEARLY"
                      ? "tw-font-medium s-font-roboto tw-text-sm tw--mt-2"
                      : "tw-font-medium s-font-roboto tw-text-sm tw--mt-2 tw-text-white"
                  }
                >
                  {t("subscription.perMonthPerUser")}
                </p>
              </div>
            </div>
          </div>
          <div className="tw-my-6">
            <h4 className="tw-text-lg tw-font-medium s-font-roboto">
              {t("subscription.membershipSummary")}
            </h4>
            <div className="tw-flex tw-justify-between tw-items-center tw-my-6">
              <p className="s-title-font s-text-dark">
                {t("subscription.totalUsers")}
              </p>
              <div>
                <span className="s-title-font s-text-dark tw-mr-5">
                  {totalUsers}
                </span>
                <ButtonGroup>
                  <Button
                    size="small"
                    className="s-title-font s-text-dark tw-font-medium tw-px-3"
                    onClick={() => setUsersCount(totalUsers - 1)}
                  >
                    -
                  </Button>
                  <Button
                    size="small"
                    className="s-title-font s-text-dark tw-font-medium tw-px-3"
                    onClick={() => setUsersCount(totalUsers + 1)}
                  >
                    +
                  </Button>
                </ButtonGroup>
              </div>
            </div>
            <div className="tw-flex tw-justify-between tw-items-center tw-my-6">
              <p className="s-title-font s-text-light-black tw-text-sm">
                {t("subscription.billingDate")}
              </p>
              <p className="s-title-font s-text-light-black tw-text-sm">
                {moment().format("DD MMMM YYYY")}
              </p>
            </div>
            <div className="tw-flex tw-justify-between tw-items-center tw-my-6">
              <p className="s-title-font s-text-light-black tw-text-sm">
                {t("subscription.amountExTax")}
              </p>
              <p className="s-title-font s-text-light-black tw-text-sm">
                {currencyFormatter(
                  planPriceWithoutTax(paymentInterval, totalUsers),
                  true,
                )}
              </p>
            </div>
            <div className="tw-flex tw-justify-between tw-items-center tw-my-6">
              <p className="s-title-font s-text-light-black tw-text-sm">
                {t("subscription.tax")}({tax}%)
              </p>
              <p className="s-title-font s-text-light-black tw-text-sm">
                {currencyFormatter(
                  getTaxAmount(
                    planPriceWithoutTax(paymentInterval, totalUsers),
                  ),
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
                  planPriceWithTax(paymentInterval, totalUsers),
                  true,
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="steps-action tw-flex tw-justify-end add-checklist-footer">
          <Link to="/employees">
            <Button className="tw-mr-2">{t("subscription.manageUsers")}</Button>
          </Link>
          {currentStep > 0 && (
            <Button
              className="tw-mr-2"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              {t("global.back")}
            </Button>
          )}
          {currentStep < 2 && (
            <Button
              type="primary"
              className="s-dark-primary"
              onClick={this.savePlan}
            >
              {t("global.next")}
            </Button>
          )}
        </div>
      </div>
    );
  }
}

const PlanForm = Form.create({
  name: "plan-form",
  mapPropsToFields({ userCount, editedRecord = {} }) {
    return {
      "billingPlan.paymentInterval": Form.createFormField({
        value: path("billingPlan.paymentInterval", editedRecord) || "YEARLY",
      }),
      "billingPlan.usersCount": Form.createFormField({
        value: path("billingPlan.usersCount", editedRecord) || userCount || 1,
      }),
    };
  },
})(Subscription);

export default withTranslation()(PlanForm);
