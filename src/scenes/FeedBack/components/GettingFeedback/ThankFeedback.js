import React from "react";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { path } from "rambdax";
import { s3BucketURL } from "../../../../utils/helpers";

const ThanksForFeedback = ({ t, logo }) => {
  return (
    <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-w-full lg:tw-w-6/12 lg:tw-mx-auto tw-px-8">
      {logo && (
        <div className="tw-mt-8 lg:tw-mt-12 tw-mb-16 lg:tw-mb-32">
          <img
            src={s3BucketURL({ url: logo })}
            alt="Company logo"
            className="lg:tw-mt-2 s-feedback-logo"
          />
        </div>
      )}
      <p className="s-text-dark s-font-roboto tw-text-center tw-text-2xl tw-font-medium tw-mt-3 lg:tw-mt-6 tw-mb-8 s-feedback-form-width">
        {t("feedback.thanks")}
      </p>
      <p className="s-text-dark s-font-roboto tw-text-center text-lg tw-mt-1 tw-mb-6">
        {t("feedback.thankNote")}
      </p>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    logo: path("firm.logoImgUrl", state.customerActions),
  };
};

const Translated = withTranslation()(ThanksForFeedback);
export default connect(mapStateToProps, null)(Translated);
