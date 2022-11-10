import "@ant-design/compatible/assets/index.css";

import { Form } from "@ant-design/compatible";
import { Button, Col, Input, Row } from "antd";
import { path } from "rambdax";
import React from "react";
import { withTranslation } from "react-i18next";

const BillingInfo = ({
  t,
  form,
  currentStep,
  setCurrentStep,
  doSaveChangesLocally,
}) => {
  const { getFieldDecorator } = form;
  const validateForm = () => {
    form.validateFields((err, values) => {
      if (!err) {
        doSaveChangesLocally(values);
        setCurrentStep(currentStep + 1);
      }
    });
  };
  return (
    <div>
      <Form layout="vertical" className="add-checklist-form">
        <Row gutter={16}>
          <Col span={24} className="tw-mb-0">
            <Form.Item
              label={t("subscription.companyName")}
              className="s-label-margin s-text-dark s-text-15"
            >
              {getFieldDecorator("billingInfo.businessName", {
                rules: [
                  {
                    required: true,
                    message: t("customerEdit.businessNameReq"),
                  },
                ],
              })(
                <Input
                  className="st-field-color st-placeholder-color"
                  placeholder={t("subscription.enterCompanyName")}
                />,
              )}
            </Form.Item>
          </Col>
          <Col span={12} className="tw-mb-0">
            <Form.Item
              label={t("subscription.firstName")}
              className="s-label-margin s-text-dark s-text-15"
            >
              {getFieldDecorator("billingInfo.name", {
                rules: [{ required: true, message: t("global.requiredField") }],
              })(
                <Input
                  className="st-field-color st-placeholder-color"
                  placeholder={t("subscription.enterFirstName")}
                />,
              )}
            </Form.Item>
          </Col>
          <Col span={12} className="tw-mb-0">
            <Form.Item
              label={t("subscription.surname")}
              className="s-label-margin s-text-dark s-text-15"
            >
              {getFieldDecorator("billingInfo.surname", {
                rules: [{ required: true, message: t("global.requiredField") }],
              })(
                <Input
                  className="st-field-color st-placeholder-color"
                  placeholder={t("subscription.enterSurname")}
                />,
              )}
            </Form.Item>
          </Col>
          <Col span={12} className="tw-mb-0">
            <Form.Item
              label={t("subscription.email")}
              className="s-label-margin s-text-dark s-text-15"
            >
              {getFieldDecorator("billingInfo.email", {
                rules: [{ required: true, message: t("global.requiredField") }],
              })(
                <Input
                  type="email"
                  className="st-field-color st-placeholder-color"
                  placeholder={t("subscription.enterEmail")}
                />,
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12} className="tw-mb-0">
            <Form.Item
              label={t("subscription.taxNumber")}
              className="s-label-margin s-text-dark s-text-15"
            >
              {getFieldDecorator("billingInfo.taxIdNumber")(
                <Input
                  className="st-field-color st-placeholder-color"
                  placeholder={t("subscription.enterTaxNum")}
                />,
              )}
            </Form.Item>
          </Col>
          <Col span={12} className="tw-mb-0">
            <Form.Item
              label={t("subscription.taxOffice")}
              className="s-label-margin s-text-dark s-text-15"
            >
              {getFieldDecorator("billingInfo.taxOffice")(
                <Input
                  className="st-field-color st-placeholder-color"
                  placeholder={t("subscription.enterTaxOffice")}
                />,
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24} className="tw-mb-0">
            <Form.Item
              label={t("subscription.address")}
              className="s-label-margin s-text-dark s-text-15"
            >
              {getFieldDecorator("billingInfo.address", {
                rules: [{ required: true, message: t("global.requiredField") }],
              })(
                <Input
                  className="st-field-color st-placeholder-color"
                  placeholder={t("subscription.enterAddress")}
                />,
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12} className="tw-mb-0">
            <Form.Item
              label={t("subscription.state")}
              className="s-label-margin s-text-dark s-text-15"
            >
              {getFieldDecorator("billingInfo.state", {
                rules: [{ required: true, message: t("global.requiredField") }],
              })(
                <Input
                  className="st-field-color st-placeholder-color"
                  placeholder={t("subscription.state")}
                />,
              )}
            </Form.Item>
          </Col>
          <Col span={12} className="tw-mb-0">
            <Form.Item
              label={t("subscription.city")}
              className="s-label-margin s-text-dark s-text-15"
            >
              {getFieldDecorator("billingInfo.city", {
                rules: [{ required: true, message: t("global.requiredField") }],
              })(
                <Input
                  className="st-field-color st-placeholder-color"
                  placeholder={t("subscription.city")}
                />,
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <div className="steps-action tw-flex tw-justify-end add-checklist-footer">
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
            onClick={validateForm}
          >
            {t("global.next")}
          </Button>
        )}
      </div>
    </div>
  );
};

const BillingInfoForm = Form.create({
  name: "billing-info-form",
  mapPropsToFields({ editedRecord = {}, firm = {} }) {
    const {
      businessName,
      contactPerson = "",
      address = {},
      email,
      taxIdNumber,
      taxOffice,
    } = firm;

    const [name, ...surname] = contactPerson.trim().split(" ");
    const { formatted = "", state = "", city = "" } = address;
    return {
      "billingInfo.name": Form.createFormField({
        value: path("billingInfo.name", editedRecord) || name,
      }),
      "billingInfo.surname": Form.createFormField({
        value: path("billingInfo.surname", editedRecord) || surname.join(""),
      }),
      "billingInfo.businessName": Form.createFormField({
        value: path("billingInfo.businessName", editedRecord) || businessName,
      }),
      "billingInfo.taxIdNumber": Form.createFormField({
        value: path("billingInfo.taxIdNumber", editedRecord) || taxIdNumber,
      }),
      "billingInfo.taxOffice": Form.createFormField({
        value: path("billingInfo.taxOffice", editedRecord) || taxOffice,
      }),
      "billingInfo.address": Form.createFormField({
        value: path("billingInfo.address", editedRecord) || formatted,
      }),
      "billingInfo.state": Form.createFormField({
        value: path("billingInfo.state", editedRecord) || state,
      }),
      "billingInfo.city": Form.createFormField({
        value: path("billingInfo.city", editedRecord) || city,
      }),
      "billingInfo.email": Form.createFormField({
        value: path("billingInfo.email", editedRecord) || email,
      }),
    };
  },
})(BillingInfo);

export default withTranslation()(BillingInfoForm);
