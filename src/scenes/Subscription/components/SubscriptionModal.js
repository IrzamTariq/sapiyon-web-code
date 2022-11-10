import { Modal, Steps } from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { withTranslation } from "react-i18next";

import UserContext from "../../../UserContext";
import BillingInfoForm from "./steps/BillingInfoForm";
import CreditCardForm from "./steps/CreditCardForm";
import SubscriptionPlan from "./steps/SubscriptionPlan";

const SubscriptionModal = ({
  isSubscribing,
  editedRecord,
  doStartSubscription,
  doEndSubscription,
  doSaveChangesLocally,
  doSubscriptionSaveRequest,
  doSetFormProcessingState,
  userCount,
  isProcessing,
  firm,
  t,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  useEffect(() => {
    setCurrentStep(0);
    return () => {
      setCurrentStep(0);
    };
  }, [isSubscribing]);

  const subSteps = [
    {
      title: t("subscription.choosePlan"),
      content: (
        <SubscriptionPlan
          editedRecord={editedRecord}
          doSaveChangesLocally={doSaveChangesLocally}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          userCount={userCount}
        />
      ),
    },
    {
      title: t("subscription.reviewBillingInfo"),
      content: (
        <BillingInfoForm
          editedRecord={editedRecord}
          doSaveChangesLocally={doSaveChangesLocally}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          firm={firm}
        />
      ),
    },
    {
      title: t("subscription.paymentInfo"),
      content: (
        <CreditCardForm
          editedRecord={editedRecord}
          doSaveChangesLocally={doSaveChangesLocally}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          doSubscriptionSaveRequest={doSubscriptionSaveRequest}
          doSetFormProcessingState={doSetFormProcessingState}
          isProcessing={isProcessing}
        />
      ),
    },
  ];

  return (
    <>
      <UserContext.Consumer>
        {({ subscription }) => {
          const { trialEndAt, subscriptionStatus = "" } = subscription;
          let trialDaysLeft = moment(trialEndAt).diff(moment(), "days");

          //TODO: check for tenure
          if (
            (subscriptionStatus === "TRIAL" && trialDaysLeft < 14) ||
            subscriptionStatus === "CANCELLED"
          ) {
            return (
              <div
                className={
                  trialDaysLeft >= 0
                    ? "tw-flex tw-justify-between tw-items-center"
                    : "tw-flex tw-flex-col tw-justify-between tw-items-center"
                }
              >
                <span className="s-main-text-color tw-font-medium">
                  {trialDaysLeft >= 0 ? (
                    <div>
                      {trialDaysLeft > 0 ? trialDaysLeft : 0}{" "}
                      {t("subscription.trialLeft")}
                    </div>
                  ) : (
                    <div className="tw-mb-3 tw-text-2xl tw-text-center s-main-font s-main-text-color">
                      {t("subscription.expired")}
                    </div>
                  )}
                </span>
                {/* <button
                  className="popup-btn tw-ml-2"
                  onClick={doStartSubscription}
                >
                  {t("subscription.upgrade")}
                </button> */}
              </div>
            );
          }
        }}
      </UserContext.Consumer>

      <Modal
        title={
          <span className="s-modal-title tw-mx-4">
            {t("subscription.pageTitle")}
          </span>
        }
        visible={isSubscribing}
        onCancel={doEndSubscription}
        footer={false}
        closable={true}
        width={620}
        className="checklist-modal"
        bodyStyle={{ padding: "0px 16px" }}
      >
        <div>
          <div className="add-checklist-form">
            <Steps current={currentStep} className="tw-mt-5 subscription-steps">
              {subSteps.map((item) => (
                <Steps.Step key={item.title} title={item.title} />
              ))}
            </Steps>
          </div>
          <div className="steps-content tw-my-5">
            {subSteps[currentStep].content}
          </div>
        </div>
      </Modal>
    </>
  );
};

const Translated = withTranslation()(SubscriptionModal);
export default Translated;
