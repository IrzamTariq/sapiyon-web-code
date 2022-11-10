import React, { useEffect } from "react";
import { withTranslation } from "react-i18next";
import { Button, message } from "antd";
import { Link, useParams } from "react-router-dom";
import { doFetchCustomerAction } from "../../../../store/customerActions";
import { connect } from "react-redux";
import { path } from "rambdax";
import { s3BucketURL } from "../../../../utils/helpers";

const FeedbackWelcomePage = ({
  t,
  isValid,
  loading,
  doFetchCustomerAction,
  logo,
  businessName,
}) => {
  const _id = useParams().id;
  useEffect(() => {
    if (_id) {
      doFetchCustomerAction({ _id });
    } else {
      message.error("Invalid URL");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-w-full tw-px-8">
      {logo && (
        <div className="tw-mt-8 lg:tw-mt-12 tw-mb-24 lg:tw-mb-32">
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
      <h2 className="s-text-dark tw-text-center s-font-roboto tw-font-medium tw-mt-2 lg:tw-mt-6">
        {t("feedback.welcome")}
      </h2>
      <p className="s-text-dark s-font-roboto tw-text-center mt-10 lg:tw-mt-8 lg:tw-mb-1">
        {t("feedback.askFeedback")}
      </p>
      <Link to={`/get-rating/${_id}`}>
        <Button
          disabled={!isValid}
          loading={loading}
          size="large"
          type="primary"
          className="tw-mt-10 lg:tw-mt-16 tw-font-medium"
        >
          {loading ? t("feedback.loading") : t("feedback.getStarted")}
        </Button>
      </Link>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    isValid: state.customerActions.isValid,
    loading: state.customerActions.loading,
    logo: path("firm.logoImgUrl", state.customerActions),
    businessName: path("firm.businessName", state.customerActions),
  };
};

const Translated = withTranslation()(FeedbackWelcomePage);
export default connect(mapStateToProps, { doFetchCustomerAction })(Translated);
