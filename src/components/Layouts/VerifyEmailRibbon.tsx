import { message } from "antd";
import React, { useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { UserService } from "services";

import { doResendVerifyEmailRequest } from "../../store/auth";
import { isScreenLarge } from "../../utils/helpers";
import ChangeEmail from "./ChangeEmail";

interface VerifyEmailRibbonProps extends WithTranslation {
  doResendVerifyEmailRequest: (email: string) => void;
  email: string;
  _id: string;
}

const VerifyEmailRibbon = ({
  doResendVerifyEmailRequest,
  email,
  t,
  _id,
}: VerifyEmailRibbonProps) => {
  const [visible, setVisible] = useState(false);

  const handleOk = (newEmail: string) => {
    setVisible(false);
    message.loading({
      content: t("verifyEmail.updatingEmail"),
      duration: 0,
      key: "updatingEmail",
    });
    const payload = {
      email: newEmail,
    };
    UserService.patch(_id, payload).then(
      () => {
        message.success({
          content: t("verifyEmail.emailUpdated"),
          key: "updatingEmail",
        });
      },
      () => {
        message.error({
          content: t("verifyEmail.cantUpdateEmail"),
          key: "updatingEmail",
        });
        setVisible(true);
      },
    );
  };
  const handleCancel = () => setVisible(false);

  return (
    <>
      <div
        className="tw-flex tw-justify-center tw-items-center tw-text-center lg:tw-text-left"
        style={{
          padding: "3px",
          zIndex: 1,
          background: "#ff9c00",
        }}
      >
        <p className="tw-text-sm tw-text-white tw-font-medium tw-mr-2 lg:tw-mr-5 s-font-roboto">
          {t("verifyEmail.message")}
        </p>
        <div
          className={
            isScreenLarge()
              ? "verifyEmailBtn tw-mx-2 s-pointer"
              : "s-pointer tw-mx-2 tw-text-white"
          }
          onClick={() => setVisible(true)}
        >
          {t("verifyEmail.changeEmail")}
        </div>
        <div
          className={
            isScreenLarge()
              ? "verifyEmailBtn s-pointer"
              : "s-pointer tw-text-white"
          }
          onClick={() => doResendVerifyEmailRequest(email)}
        >
          {t("verifyEmail.resend")}
        </div>
      </div>
      <ChangeEmail
        visible={visible}
        handleOk={handleOk}
        handleCancel={handleCancel}
        email={email}
      />
    </>
  );
};

const Translated = withTranslation()(VerifyEmailRibbon);
export default connect(null, { doResendVerifyEmailRequest })(Translated);
