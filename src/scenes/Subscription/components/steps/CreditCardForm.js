import "@ant-design/compatible/assets/index.css";

import { Form } from "@ant-design/compatible";
import { Button, Col, DatePicker, Input, Row } from "antd";
import { path } from "rambdax";
import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import { currencyFormatter } from "utils/helpers/currencyFormatter";

import { planPriceWithTax } from "./SubscriptionPlan";

class CreditCardInfo extends Component {
  constructor() {
    super();
    this.state = {
      isProcessing: false,
    };
  }
  changeStepAfterValidation = (step) => {
    this.props.setCurrentStep(step);
  };

  handleOk = () => {
    this.props.form.validateFields((errors, values) => {
      if (!errors) {
        this.props.doSubscriptionSaveRequest(this.props.editedRecord);
      }
    });
  };
  render() {
    const { form, currentStep, editedRecord, isProcessing, t } = this.props;
    const { getFieldDecorator } = form;

    // Price total calculation section start
    const paymentInterval = path("billingPlan.paymentInterval", editedRecord);
    const totalUsers = path("billingPlan.usersCount", editedRecord);

    return (
      <div>
        <div className="add-checklist-form">
          <Form layout="vertical">
            <Row gutter={16}>
              <Col span={12} className="tw-mb-0">
                <Form.Item
                  label={t("subscription.nameOnCard")}
                  className="s-label-margin s-text-dark s-text-15"
                >
                  {getFieldDecorator("paymentCard.cardHolderName", {
                    rules: [
                      {
                        required: true,
                        message: t("subscription.cardNameReq"),
                      },
                    ],
                  })(
                    <Input
                      className="st-field-color st-placeholder-color"
                      placeholder={t("subscription.nameOnCard")}
                    />,
                  )}
                </Form.Item>
              </Col>
              <Col span={12} className="tw-mb-0">
                <Form.Item
                  label={t("subscription.creditCardNum")}
                  className="s-label-margin s-text-dark s-text-15"
                >
                  {getFieldDecorator("paymentCard.cardNumber", {
                    rules: [
                      {
                        required: true,
                        message: t("global.requiredField"),
                      },
                    ],
                  })(
                    <Input
                      className="st-field-color st-placeholder-color"
                      placeholder={t("subscription.enterCreditCardNum")}
                    />,
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12} className="tw-mb-0">
                <Form.Item
                  label={t("subscription.expiryDate")}
                  className="s-label-margin tw-mb-0 s-text-dark s-text-15"
                >
                  {getFieldDecorator("paymentCard.expiryDate", {
                    rules: [
                      {
                        required: true,
                        message: t("subscription.expiryDateReq"),
                      },
                    ],
                  })(
                    <DatePicker.MonthPicker
                      className="st-field-color st-placeholder-color tw-w-full"
                      placeholder={t("subscription.expiryDate")}
                      format={"YYYY/MM"}
                    />,
                  )}
                </Form.Item>
              </Col>
              <Col span={12} className="tw-mb-0">
                <Form.Item
                  label={t("subscription.cvcCode")}
                  className="s-label-margin tw-mb-0 s-text-dark s-text-15"
                >
                  {getFieldDecorator("paymentCard.cvc", {
                    rules: [
                      {
                        required: true,
                        message: t("subscription.cvcCodeReq"),
                      },
                      {
                        pattern: "^[0-9]{3}$",
                        message: t("subscription.invalidCvc"),
                      },
                    ],
                  })(
                    <Input
                      className="st-field-color st-placeholder-color"
                      placeholder={t("subscription.cvc")}
                      maxLength={3}
                    />,
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Form>
          <p className="tw-mb-2" style={{ fontSize: "11px" }}>
            {t("subscription.paymentMechanism")}
          </p>
          <Row className="tw-mb-5">
            <Col span={12} className="tw-mb-0">
              <h1 className="s-main-font s-main-text-color s-semibold">
                {t("subscription.amountIncTax")}
              </h1>
            </Col>
            <Col span={12} className="tw-mb-0 tw-text-right">
              <h1 className="s-main-font s-main-text-color s-semibold">
                {currencyFormatter(
                  planPriceWithTax(paymentInterval, totalUsers),
                  true,
                )}
              </h1>
            </Col>
          </Row>

          <div
            className="s-main-font tw-mb-5"
            style={{
              background: "#efefef",
              padding: "0.5rem 1rem",
              borderRadius: "5px",
              color: "#666",
            }}
          >
            <h3 className="s-semibold tw-mb-1" style={{ color: "#666" }}>
              Havale / EFT ödemesi için aşağıdaki bilgileri kullanabilirsiniz.
            </h3>
            <p>Kuvety Türk Katılım Bankası</p>
            <p>
              HESAP ADI: Karaja Bilişim Teknolojileri İnsan Kaynakları
              Hizmetleri İletişim Danışmanlık Ltd Şti
            </p>
            <p>IBAN: TR770020500001019037500001</p>
            <p className="tw-text-sm tw-mt-4">
              Ödeme makbuzunu info@sapiyon.com e-posta adresine göndermenizi
              rica ederiz
            </p>
          </div>
        </div>
        <div className="steps-action tw-flex tw-justify-end add-checklist-footer">
          {currentStep > 0 && (
            <Button
              className="tw-mr-2"
              onClick={() => this.changeStepAfterValidation(currentStep - 1)}
            >
              {t("global.back")}
            </Button>
          )}
          {currentStep === 2 && (
            <Button
              type="primary"
              className="s-dark-primary"
              onClick={this.handleOk}
              disabled={isProcessing}
              loading={isProcessing}
            >
              {t("subscription.getSubscription")}
            </Button>
          )}
        </div>
      </div>
    );
  }
}

const CreditCardInfoForm = Form.create({
  name: "credit-card-form",
  mapPropsToFields({ editedRecord = {} }) {
    return {
      "paymentCard.cardHolderName": Form.createFormField({
        value: path("paymentCard.cardHolderName", editedRecord),
      }),
      "paymentCard.cardNumber": Form.createFormField({
        value: path("paymentCard.cardNumber", editedRecord),
      }),
      "paymentCard.expiryDate": Form.createFormField({
        value: path("paymentCard.expiryDate", editedRecord),
      }),
      "paymentCard.cvc": Form.createFormField({
        value: path("paymentCard.cvc", editedRecord),
      }),
    };
  },
  onValuesChange(props, changed, all) {
    props.doSaveChangesLocally(all);
  },
})(CreditCardInfo);

export default withTranslation()(CreditCardInfoForm);
