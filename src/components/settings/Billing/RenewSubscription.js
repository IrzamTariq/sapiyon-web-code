import "@ant-design/compatible/assets/index.css";

import { Form } from "@ant-design/compatible";
import { Button, Input } from "antd";
import ButtonGroup from "antd/lib/button/button-group";
import moment from "moment";
import { path } from "rambdax";
import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import { currencyFormatter } from "utils/helpers/currencyFormatter";

class ReNewSubscription extends Component {
  constructor() {
    super();
    this.state = {
      pricePerUser: 25,
      annualDiscountRate: 20,
      tax: 18,
    };
  }

  getTaxAmount = (price) => {
    const tax = this.state.tax;
    return (price * tax) / 100;
  };

  calculateAnnualDiscount = (price) => {
    return (+price * this.state.annualDiscountRate) / 100;
  };

  render() {
    const { form, t } = this.props;
    const { setFieldsValue, getFieldValue, getFieldDecorator } = form;

    const { pricePerUser, annualDiscountRate, tax } = this.state;
    const discount = (pricePerUser * annualDiscountRate) / 100;

    const paymentInterval = getFieldValue("billingPlan.paymentInterval");
    const totalUsers = getFieldValue("billingPlan.usersCount");

    const amountWithTax = () => {
      let totalAmount = 0;
      if (paymentInterval === "YEARLY") {
        totalAmount =
          12 *
          totalUsers *
          (pricePerUser - this.calculateAnnualDiscount(pricePerUser));
      } else {
        totalAmount = +totalUsers * +pricePerUser;
      }
      return totalAmount + this.getTaxAmount(totalAmount);
    };

    const amountWithoutTax = () => {
      let totalAmount = 0;
      if (paymentInterval === "YEARLY") {
        totalAmount =
          12 *
          totalUsers *
          (pricePerUser - this.calculateAnnualDiscount(pricePerUser));
        return totalAmount;
      } else {
        totalAmount = totalUsers * pricePerUser;
        return totalAmount;
      }
    };

    const setUsersCount = (num) => {
      if (num > 0) {
        setFieldsValue({ "billingPlan.usersCount": num });
      }
    };

    return (
      <div>
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
            className="card tw-px-4 tw-pt-1 tw-pb-2 tw-rounded-lg tw-w-full tw-mr-2"
            style={{
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
                      ? "tw-font-bold s-font-roboto tw-text-2xl tw-text-white"
                      : "tw-font-bold s-font-roboto tw-text-2xl"
                  }
                >
                  {currencyFormatter(pricePerUser - discount, true)}
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
                  {t("subscription.save")} {annualDiscountRate}%
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
            className="card tw-px-4 tw-pt-1 tw-pb-2 tw-rounded-lg tw-w-full"
            style={{
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
                      ? "tw-font-bold s-font-roboto tw-text-2xl"
                      : "tw-font-bold s-font-roboto tw-text-2xl tw-text-white"
                  }
                >
                  {currencyFormatter(pricePerUser, true)}
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
                {getFieldValue("billingPlan.usersCount")}
              </span>
              <ButtonGroup>
                <Button
                  size="small"
                  className="s-title-font s-text-dark tw-font-medium tw-px-3"
                  onClick={() =>
                    setUsersCount(getFieldValue("billingPlan.usersCount") - 1)
                  }
                >
                  -
                </Button>
                <Button
                  size="small"
                  className="s-title-font s-text-dark tw-font-medium tw-px-3"
                  onClick={() =>
                    setUsersCount(getFieldValue("billingPlan.usersCount") + 1)
                  }
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
              {currencyFormatter(amountWithoutTax(), true)}
            </p>
          </div>
          <div className="tw-flex tw-justify-between tw-items-center tw-my-6">
            <p className="s-title-font s-text-light-black tw-text-sm">
              {t("subscription.tax")}({tax}%)
            </p>
            <p className="s-title-font s-text-light-black tw-text-sm">
              {currencyFormatter(this.getTaxAmount(amountWithoutTax()), true)}
            </p>
          </div>
          <div className="tw-flex tw-justify-between tw-items-center tw-my-6">
            <p className="tw-font-medium s-title-font s-text-light-black tw-text-sm">
              {t("subscription.amountIncTax")}
            </p>
            <p className="tw-font-medium s-title-font s-text-light-black tw-text-sm">
              {currencyFormatter(amountWithTax(), true)}
            </p>
          </div>
        </div>
      </div>
    );
  }
}

const PlanForm = Form.create({
  name: "plan-form",
  mapPropsToFields({ editedRecord = {} }) {
    return {
      "billingPlan.paymentInterval": Form.createFormField({
        value: path("billingPlan.paymentInterval", editedRecord) || "MONTHLY",
      }),
      "billingPlan.usersCount": Form.createFormField({
        value: path("billingPlan.usersCount", editedRecord) || 1,
      }),
    };
  },
})(ReNewSubscription);

export default withTranslation()(PlanForm);
