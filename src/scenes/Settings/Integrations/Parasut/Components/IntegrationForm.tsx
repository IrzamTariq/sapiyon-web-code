import { Button, Form, Input, message } from "antd";
import logger from "logger";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { FirmService, ParasutTokenService } from "services";
import { UserContextType } from "types";
import UserContext from "UserContext";

const ParasutIntegrationForm = () => {
  const [t] = useTranslation();
  const [loading, setLoading] = useState(false);
  const { firm } = useContext(UserContext) as UserContextType;

  const handleSubmit = (values: any) => {
    setLoading(true);
    message.loading({
      content: t("parasutIntegration.integrating"),
      key: "integrating",
      duration: 0,
    });
    const data = { ...values, action: "getToken" };

    ParasutTokenService.create(data)
      .then(() => {
        FirmService.patch(firm._id, {
          "featureFlags.parasutSync": true,
        }).then(() => {
          message.success({
            content: t("parasutIntegration.integrateSuccess"),
            key: "integrating",
          });
          setLoading(false);
        });
      })
      .catch((error: Error) => {
        setLoading(false);
        message.error({
          content: t("parasutIntegration.integrateError"),
          key: "integrating",
        });
        logger.error("Error in integrating Paraşüt: ", error);
      });
  };

  return (
    <div>
      <Form layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label={
            <span className="s-semibold">
              {t("parasutIntegration.parasutLabel")}
            </span>
          }
        >
          <Button
            size="small"
            type="dashed"
            href="https://api.parasut.com/oauth/authorize?client_id=u3SGvSDd2qFmy5Fr8UWoKlZ62WXohZ4zGhNI4YiZ-7k&redirect_uri=urn:ietf:wg:oauth:2.0:oob&response_type=code"
            target="_blank"
            block
          >
            {t("parasutIntegration.parasutLink")}
          </Button>
        </Form.Item>
        <Form.Item
          name="code"
          label={t("parasutIntegration.keyLabel")}
          rules={[{ required: true, message: t("parasutIntegration.keyReq") }]}
        >
          <Input placeholder={t("parasutIntegration.enterKey")} />
        </Form.Item>
        <Form.Item>
          <Button
            loading={loading}
            disabled={loading}
            htmlType="submit"
            type="primary"
            size="large"
            className="s-btn-spinner-align"
            block
          >
            {t("parasutIntegration.integrate")}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ParasutIntegrationForm;
