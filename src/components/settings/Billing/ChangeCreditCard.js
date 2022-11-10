import React from "react";
import { withTranslation } from "react-i18next";
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Row, Col, Input, DatePicker, InputNumber } from "antd";
import { path } from "rambdax";

const ChangeCreditCard = ({ t, form }) => {
  const { getFieldDecorator } = form;
  return (
    <div>
      <Row gutter={16}>
        <Col span={12}>
          <Form layout="horizontal">
            <Row gutter={16}>
              <Col span={24} className="tw-mb-0">
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
                  })(<Input placeholder={t("subscription.nameOnCard")} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24} className="tw-mb-0">
                <Form.Item
                  label={t("subscription.creditCardNum")}
                  className="s-label-margin s-text-dark s-text-15"
                >
                  {getFieldDecorator("paymentCard.cardNumber", {
                    rules: [
                      {
                        required: true,
                        message: t("subscription.creditCardNumReq"),
                      },
                    ],
                  })(
                    <Input
                      placeholder={t("subscription.enterCreditCardNum")}
                    />,
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={8}>
              <Col span={12} className="tw-mb-0">
                <Form.Item
                  label={t("subscription.expiryDate")}
                  className="s-label-margin s-text-dark s-text-15"
                >
                  {getFieldDecorator("paymentCard.expiryDate", {
                    rules: [
                      {
                        required: true,
                        message: t("subscription.expiryDateReq"),
                      },
                    ],
                  })(
                    <DatePicker
                      placeholder={t("subscription.expiryDate")}
                      format={"YYYY/MM"}
                    />,
                  )}
                </Form.Item>
              </Col>
              <Col span={12} className="tw-mb-0">
                <Form.Item
                  label={t("subscription.cvcCode")}
                  className="s-label-margin s-text-dark s-text-15"
                >
                  {getFieldDecorator("paymentCard.cvc", {
                    rules: [
                      { required: true, message: t("subscription.cvcReq") },
                    ],
                  })(
                    <InputNumber
                      max={999}
                      placeholder={t("subscription.cvc")}
                    />,
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Col>
        <Col span={12}>
          <div className="tw-bg-gray-400 tw-h-40 tw-w-full tw-mt-2 tw-rounded-lg tw-flex tw-justify-center tw-items-center">
            {t("subscription.cardImage")}
          </div>
          <p className="s-text-dark tw-text-sm tw-mt-2">
            {t("subscription.paymentMechanism")}
          </p>
        </Col>
      </Row>
    </div>
  );
};

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
})(ChangeCreditCard);

export default withTranslation()(CreditCardInfoForm);
