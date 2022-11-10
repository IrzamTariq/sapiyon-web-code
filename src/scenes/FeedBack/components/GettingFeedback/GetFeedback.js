import "@ant-design/compatible/assets/index.css";

import { Form } from "@ant-design/compatible";
import { Button, Col, Input, Row, message } from "antd";
import React from "react";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { useParams, withRouter } from "react-router-dom";
import getFieldInput from "utils/helpers/getFieldInput";

import {
  doCreateCustomerAction,
  doFetchCustomerAction,
} from "../../../../store/customerActions";
import { isScreenLarge, s3BucketURL } from "../../../../utils/helpers";

const GetFeedback = ({
  t,
  fields,
  form,
  history,
  doCreateCustomerAction,
  isValid,
  logo,
  businessName,
}) => {
  const _id = useParams().id;
  if (!isValid) {
    history.push(`/f/${_id}`);
  }
  const { getFieldDecorator, setFieldsValue, getFieldValue } = form;

  const ScoreBox = ({ score, isActive, getScore }) => (
    <div
      className={isActive ? "scorebox-active" : "scorebox"}
      onClick={() => getScore(score)}
      style={
        !isScreenLarge()
          ? {
              width: "100%",
              borderRadius: "5px",
              marginBottom: "6px",
              display: "flex",
              justifyContent: "space-between",
              padding: "0px 12px",
            }
          : {
              width: "49px",
              height: "49px",
              fontSize: "18px",
              marginRight: "0px",
            }
      }
    >
      {score}{" "}
      {!isScreenLarge() && score === 10 ? (
        <span
          className={
            isActive ? "tw-text-white tw-text-sm" : "s-text-gray tw-text-xs"
          }
        >
          {t("feedbackEdit.mostLikely")}
        </span>
      ) : (
        ""
      )}
      {!isScreenLarge() && score === 1 ? (
        <span
          className={
            isActive ? "tw-text-white tw-text-sm" : "s-text-gray tw-text-xs"
          }
        >
          {t("feedbackEdit.notLikely")}
        </span>
      ) : (
        ""
      )}
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
          getScore={(rating) => setFieldsValue({ rating })}
        />,
      );
    }
    return boxes;
  };

  const onSubmit = () => {
    form.validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (values.rating < 0) {
          message.error(t("feedbackEdit.ratingReq"));
        } else {
          doCreateCustomerAction({
            ...values,
            _id,
          });
          history.push("/feedback-success");
        }
      }
    });
  };

  return (
    <div className="s-feedback-form-width tw-flex tw-flex-col tw-items-center tw-justify-center lg:tw-mx-auto tw-px-8 lg:tw-px-0">
      {logo && (
        <div className="tw-mt-8 lg:tw-mt-12 tw-mb-12 lg:tw-mb-24">
          <img
            src={s3BucketURL({ url: logo })}
            alt="Company logo"
            className="lg:tw-mt-2 s-feedback-logo"
          />
        </div>
      )}
      <h1 className="s-text-dark s-font-roboto tw-text-center tw-text-2xl tw-font-medium tw-mt-2 lg:tw-mt-6">
        {businessName}
      </h1>
      <p className="s-text-dark s-font-roboto tw-text-center tw-text-xl tw-font-medium tw-mt-1 tw-mb-6">
        {t("feedbackEdit.sapiyonRecommendation")}
      </p>
      {getFieldDecorator("rating", { rules: [{ required: true }] })(
        <Input hidden readOnly />,
      )}
      {!isScreenLarge() ? (
        <div className="tw-flex tw-flex-col-reverse tw-w-full">
          {renderScoreBoxes(getFieldValue("rating"))}
        </div>
      ) : (
        <div className="tw-w-full">
          <div className="tw-inline-block tw-w-full">
            <div className="tw-flex tw-justify-between tw-w-full">
              {renderScoreBoxes(getFieldValue("rating"))}
            </div>
            <div className="tw-flex tw-justify-between mt-1 tw-w-full">
              <span>{t("feedbackEdit.notLikely")}</span>
              <span className="tw-text-right">
                {t("feedbackEdit.mostLikely")}
              </span>
            </div>
          </div>
        </div>
      )}
      <div className="tw-px-0 tw-w-full tw-mt-10">
        <Row className="tw-w-full">
          <Col span={24} className="tw-mb-10">
            <Form.Item
              className="tw-mb-0"
              colon={false}
              labelCol={{ span: 24 }}
              label={
                <span className="tw-font-medium s-text-dark">
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
        <Row className="tw-w-full">
          {Array.isArray(fields) &&
            (fields || [])
              // .sort((a, b) => (a?.rank > b?.rank ? 1 : -1))
              .map((field) => {
                let options = {};
                if (field.type === "toggleSwitch") {
                  options = { ...options, valuePropName: "checked" };
                }

                return (
                  <Col span={24} className="tw-mb-10" key={field._id}>
                    <Form.Item
                      label={
                        <span className="tw-font-medium s-text-dark">
                          {field.label}
                        </span>
                      }
                      className="tw-mb-0 s-label-margin"
                      colon={false}
                    >
                      {getFieldDecorator(
                        `fields.${field._id}`,
                        options,
                      )(getFieldInput(field))}
                    </Form.Item>
                  </Col>
                );
              })}
        </Row>
        <div className="tw-flex tw-justify-end tw-w-full tw-mb-10">
          <Button type="primary" size="large" onClick={onSubmit}>
            {t("global.submit")}
          </Button>
        </div>
      </div>
    </div>
  );
};

const AntForm = Form.create({
  name: "mobile-feedback-form",
  mapPropsToFields({ fields = [] }) {
    const customFields =
      Array.isArray(fields) &&
      fields.reduce((p, field) => {
        return {
          ...p,
          [`fields.${field._id}`]: Form.createFormField(),
        };
      }, {});

    return {
      rating: Form.createFormField({ value: -1 }),
      text: Form.createFormField(),
      ...customFields,
    };
  },
})(GetFeedback);

const mapStateToProps = (state) => {
  let fields = state.customerActions.fields || [];
  fields = fields.filter((item = {}) => {
    const { label, type } = item;
    return !(
      typeof label !== "string" ||
      typeof type !== "string" ||
      label.trim().length === 0 ||
      type.trim().length === 0
    );
  });

  return {
    fields,
    isValid: state.customerActions.isValid,
    logo: state?.customerActions?.firm?.logoImgUrl,
    businessName: state?.customerActions?.firm?.businessName,
  };
};

const mapDispatchToProps = {
  doFetchCustomerAction,
  doCreateCustomerAction,
};

const Translated = withTranslation()(AntForm);
const Routed = withRouter(Translated);
export default connect(mapStateToProps, mapDispatchToProps)(Routed);
