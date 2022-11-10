import "@ant-design/compatible/assets/index.css";

import { Form } from "@ant-design/compatible";
import { Button, Col, Divider, Drawer, Input, Row, message } from "antd";
import moment from "moment";
import { path } from "rambdax";
import React, { useState } from "react";
import { withTranslation } from "react-i18next";
import { getRTEMarkup } from "utils/components/RTE/RTE";
import getFieldInput from "utils/helpers/getFieldInput";

import CustomerDetailDrawer from "../../../components/customers/CustomerDetails/CustomerDetailDrawer";
import CustomerAddressEdit from "../../../components/customers/CustomerList/CustomerAddressEdit";
import {
  getCustomFieldRules,
  getCustomerName,
  getUsername,
  mapCustomFieldValuesToFormFieldsLegacy,
} from "../../../utils/helpers";

const FeedbackEdit = ({
  visible,
  handleClose,
  editedRecord,
  form,
  t,
  onSubmit,
  firmCustomFields = [],
}) => {
  const [state, setState] = useState({
    customerDetailsVisible: false,
    customerDetails: {},
    isEditingAddress: false,
  });

  const getDrawerTitle = () => {
    return (
      <div className="tw-flex tw-items-center">
        <div
          style={{
            padding: editedRecord?.completionFeedbackByCustomer?.receivedAt
              ? "0px"
              : "11px 0px",
          }}
          className="s-main-text-color tw-mr-20"
        >{`#${(editedRecord._id || "").substr(-5)}`}</div>
        {path("completionFeedbackByCustomer.receivedAt", editedRecord) ? (
          <div className="tw-flex tw-flex-col">
            <span
              className="s-main-font tw-text-sm"
              style={{
                color: "#516F90",
                fontWeight: "400",
              }}
            >
              {t("feedbackEdit.feedbackTime")}
            </span>
            <span className="s-main-font s-main-text-color tw-text-sm">
              {moment(
                editedRecord.completionFeedbackByCustomer.receivedAt,
              ).format("DD/MM/YYYY HH:mm")}
            </span>
          </div>
        ) : (
          ""
        )}
      </div>
    );
  };
  const { getFieldValue, setFieldsValue, getFieldDecorator } = form;

  const ScoreBox = ({ score, isActive, getScore }) => (
    <div
      className={isActive ? "scorebox-active" : "scorebox"}
      onClick={() => getScore(score)}
    >
      {score}
    </div>
  );

  const renderScoreBoxes = (score) => {
    let boxes = [];
    for (let i = 1; i <= 10; i++) {
      boxes = boxes.concat(
        <ScoreBox
          score={i}
          isActive={score === i}
          key={i}
          getScore={(score) => setFieldsValue({ rating: score })}
        />,
      );
    }
    return boxes;
  };

  const handleSubmit = () => {
    form.validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (values.rating < 0) {
          message.error(t("feedbackEdit.ratingReq"));
        } else {
          onSubmit(values);
        }
      }
    });
  };

  return (
    <Drawer
      title={getDrawerTitle()}
      placement="right"
      closable={false}
      onClose={handleClose}
      visible={visible}
      width={890}
      headerStyle={{
        padding: "6px 40px 6px 24px",
      }}
    >
      <div
        className="s-main-text-color s-main-font tw-text-2xl tw--mt-2 clickAble"
        onClick={() =>
          setState({
            customerDetails: editedRecord.customer,
            customerDetailsVisible: true,
            isEditingAddress: false,
          })
        }
      >
        {getCustomerName(editedRecord?.customer)}
      </div>
      {path("customer.phone", editedRecord) && (
        <div className="tw-text-sm s-main-text-color">
          {t("customerDetails.telephone")}:{" "}
          {path("customer.phone", editedRecord)}
        </div>
      )}
      {path("customer.email", editedRecord) && (
        <div className="tw-text-sm s-main-text-color">
          {t("customerDetails.email")}: {path("customer.email", editedRecord)}
        </div>
      )}
      {path("customer.address.formatted", editedRecord) && (
        <div className="tw-text-sm s-main-text-color">
          {path("customer.address.formatted", editedRecord)}
        </div>
      )}
      <Form labelCol={{ span: 24 }}>
        <Row gutter={26} className="tw-mt-10">
          <Col span={24} className="tw-mb-10">
            <Form.Item
              className="tw-mb-0 s-label-margin"
              colon={false}
              label={
                <span className="tw-font-medium s-main-text-color">
                  {t("feedbackEdit.jobDetails")}
                </span>
              }
            >
              {getRTEMarkup(editedRecord.title)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={26}>
          <Col span={12} className="tw-mb-8">
            <Form.Item
              className="s-label-margin tw-mb-0"
              label={
                <span className="tw-font-medium s-main-text-color">
                  {t("taskedit.dueDate")}
                </span>
              }
            >
              <div>
                <Input
                  readOnly
                  placeholder={t("taskedit.dueDate")}
                  className="st-field-color st-placeholder-color tw-w-full"
                  value={
                    path("endAt", editedRecord)
                      ? moment(editedRecord.endAt).format("DD/MM/YYYY HH:mm")
                      : ""
                  }
                />
              </div>
            </Form.Item>
          </Col>
          <Col span={12} className="tw-mb-8">
            <Form.Item
              className="s-label-margin tw-mb-0"
              label={
                <span className="tw-font-medium s-main-text-color">
                  {t("taskEdit.employee")}
                </span>
              }
            >
              <Input
                readOnly
                value={(editedRecord.assignees || [])
                  .map((user) => getUsername(user))
                  .join(", ")}
                className="st-field-color st-placeholder-color"
                placeholder={t("taskEdit.employee")}
              />
            </Form.Item>
          </Col>
        </Row>
        {getFieldDecorator("rating", { rules: [{ required: true }] })(
          <Input hidden readOnly />,
        )}
        <Divider />
        <div className="tw-mb-10">
          <p className="s-main-text-color s-main-font tw-tw-text-lg tw-mb-2">
            {t("feedbackEdit.sapiyonRecommendation")}
          </p>
          <div>
            <div className="tw-inline-block">
              <div className="tw-flex tw-items-start">
                {renderScoreBoxes(getFieldValue("rating"))}
              </div>
              <div className="tw-flex tw-justify-between tw-mt-1">
                <span>{t("feedbackEdit.notLikely")}</span>
                <span className="tw-text-right tw-mr-2">
                  {t("feedbackEdit.mostLikely")}
                </span>
              </div>
            </div>
          </div>
        </div>
        <Row gutter={26}>
          <Col span={24} className="tw-mb-10">
            <Form.Item
              className="tw-mb-0 s-label-margin"
              colon={false}
              label={
                <span className="tw-font-medium s-main-text-color">
                  {t("feedbackEdit.feedbackNotes")}
                </span>
              }
            >
              {getFieldDecorator("text", {
                rules: [
                  {
                    required: true,
                    message: t("feedbackEdit.feedbackNoteReq"),
                    whitespace: true,
                  },
                ],
              })(
                <Input.TextArea
                  rows="2"
                  className="st-field-color st-placeholder-color"
                  placeholder={t("feedbackEdit.enterFeedback")}
                />,
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={26}>
          {Array.isArray(firmCustomFields) &&
            (firmCustomFields || [])
              .sort((a, b) => (a?.rank > b?.rank ? 1 : -1))
              .map((field) => {
                const rules = getCustomFieldRules(field);
                let additionalProps = { rules };
                if (field.type === "toggleSwitch") {
                  additionalProps = {
                    ...additionalProps,
                    valuePropName: "checked",
                  };
                }

                return (
                  <Col span={12} className="tw-mb-10" key={field._id}>
                    <Form.Item
                      label={
                        <span className="tw-font-medium s-main-text-color">
                          {field.label}
                        </span>
                      }
                      className="tw-mb-0 s-label-margin"
                      colon={false}
                    >
                      {getFieldDecorator(
                        `fields.${field._id}`,
                        additionalProps,
                      )(getFieldInput(field))}
                    </Form.Item>
                  </Col>
                );
              })}
        </Row>
      </Form>
      <CustomerDetailDrawer
        visible={state.customerDetailsVisible}
        customer={state.customerDetails}
        handleCancel={() =>
          setState({
            customerDetailsVisible: false,
            customerDetails: {},
            isEditingAddress: false,
          })
        }
        editAddress={() =>
          setState((old) => ({ ...old, isEditingAddress: true }))
        }
      />
      <CustomerAddressEdit
        //@ts-ignore
        visible={state.isEditingAddress}
        customerId={state?.customerDetails?._id}
        editedRecord={{}}
        handleOk={() =>
          setState((old) => ({ ...old, isEditingAddress: false }))
        }
        handleCancel={() =>
          setState((old) => ({ ...old, isEditingAddress: false }))
        }
      />
      <div
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          width: "100%",
          borderTop: "1px solid #e9e9e9",
          padding: "10px 37px",
          background: "#fff",
          textAlign: "right",
          zIndex: "1",
        }}
      >
        <Button onClick={handleClose} style={{ marginRight: 8 }}>
          {t("global.cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          type="primary"
          className="s-primary-btn-bg"
        >
          {t("global.save")}
        </Button>
      </div>
    </Drawer>
  );
};

const Translated = withTranslation()(FeedbackEdit);
const AntForm = Form.create({
  name: "feedback-edit-form",
  mapPropsToFields({ editedRecord, firmCustomFields = [] }) {
    const { completionFeedbackByCustomer } = editedRecord || {};
    const { rating, text, fields } = completionFeedbackByCustomer || {};

    let customFields = mapCustomFieldValuesToFormFieldsLegacy(
      firmCustomFields,
      fields,
    );

    return {
      rating: Form.createFormField({ value: rating || -1 }),
      text: Form.createFormField({ value: text }),
      ...customFields,
    };
  },
})(Translated);

export default AntForm;
