import {
  Button,
  Col,
  Form,
  Input,
  Popconfirm,
  Popover,
  Row,
  Select,
  Spin,
  message,
} from "antd";
import Appshell from "Appshell";
import logger from "logger";
import React, { ChangeEvent, useEffect, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";

import { FirmIntegrationService, SMSService } from "../../../services";
import { Integration, PaginatedFeathersResponse } from "../../../types";

interface SMSIntegrationProps extends WithTranslation {}

const SMSIntegration = ({ t }: SMSIntegrationProps) => {
  const [form] = Form.useForm();
  const [SMSIntegrationState, setSMSIntegrationState] = useState({
    integrationAdded: false,
    integrationData: {} as Integration,
    userIdHidden: false,
    loading: false,
  });

  const [smsTestState, setSmsTestState] = useState({
    visible: false,
    phone: "",
    text: "",
  });

  const saveIntegration = (res: Integration) => {
    const integrationAdded = !!res?._id && res.type === "customSMSAPI";
    const integrationData = integrationAdded ? res : ({} as Integration);
    hydrateForm(integrationData);
    setSMSIntegrationState({
      integrationAdded,
      integrationData,
      userIdHidden: integrationData.provider === "NETGSM",
      loading: false,
    });
  };

  const hydrateForm = (integrationData: Integration) => {
    const {
      _id,
      apiUserId,
      apiUserName,
      apiUserPassword,
      provider = "OZTEK",
      apiSender,
    } = integrationData;
    const initValues = {
      _id,
      apiUserId,
      apiUserName,
      apiUserPassword,
      provider,
      apiSender,
    };
    logger.log("Hydrated form with: ", initValues);
    form.setFieldsValue(initValues);
  };

  // CDM....
  useEffect(() => {
    setSMSIntegrationState((old) => ({ ...old, loading: true }));
    FirmIntegrationService.find({
      query: { type: "customSMSAPI" },
    }).then(
      (res: PaginatedFeathersResponse<Integration>) => {
        saveIntegration(res.data[0]);
      },
      (error: Error) => {
        // console.log("Could not fetch SMS integration", error);
        message.error(t("smsIntegration.fetchError"));
        setSMSIntegrationState((old) => ({ ...old, loading: false }));
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createIntegration = () => {
    form.validateFields().then(
      (values) => {
        const { _id, ...rest } = values;
        const integrationData = { ...rest, type: "customSMSAPI" };
        setSMSIntegrationState((old) => ({ ...old, loading: true }));
        if (_id) {
          FirmIntegrationService.patch(_id, integrationData)
            .then(
              (res: Integration) => {
                saveIntegration(res);
                message.success(t("smsIntegration.updateSuccess"));
              },
              (error: Error) => {
                // console.log("Error in updating integration: ", error);
                message.error(t("smsIntegration.updateError"));
              },
            )
            .finally(() =>
              setSMSIntegrationState((old) => ({ ...old, loading: false })),
            );
        } else {
          FirmIntegrationService.create(integrationData)
            .then(
              (res: Integration) => {
                message.success(t("smsIntegration.createSuccess"));
                saveIntegration(res);
              },
              (error: Error) => {
                // console.log("Error in creating integration: ", error);
                message.error(t("smsIntegration.createError"));
              },
            )
            .finally(() =>
              setSMSIntegrationState((old) => ({ ...old, loading: false })),
            );
        }
      },
      () => null,
    );
  };

  const deleteIntegration = () => {
    if (
      SMSIntegrationState.integrationAdded &&
      SMSIntegrationState?.integrationData?._id
    ) {
      FirmIntegrationService.remove(
        SMSIntegrationState.integrationData._id,
      ).then(
        (res: Integration) => {
          message.success(t("smsIntegration.removeSuccess"));
          saveIntegration({} as Integration);
        },
        (error: Error) => {
          // console.log("Could not delete integration: ", error);
          message.error(t("smsIntegration.removeError"));
        },
      );
    }
  };

  const testSMS = () => {
    if (RegExp("^[0-9]{10}$").test(smsTestState.phone)) {
      const { phone, text } = smsTestState;
      const smsData = { recipient: phone, text, type: "test" };
      message.loading({
        content: t("smsIntegration.sendingSMS"),
        key: "sendingSMS",
        duration: 0,
      });
      SMSService.create(smsData).then(
        (res: any) => {
          message.success({
            content: t("smsIntegration.smsSent"),
            key: "sendingSMS",
          });
          setSmsTestState({ visible: false, phone: "", text: "" });
        },
        (error: Error) => {
          // console.log("Couldn't send sms due to: ", error);
          message.error({
            content: t("smsIntegration.cantSendSMS"),
            key: "sendingSMS",
          });
        },
      );
    } else {
      message.error(t("global.phoneFormat"));
    }
  };

  return (
    <Appshell activeLink={["settings", "smsIntegration"]}>
      <div className="md:tw-mx-20 xl:tw-mx-32">
        <h1 className="s-page-title tw-mb-5">
          {t("smsIntegration.pageTitle")}
        </h1>
        <Spin spinning={SMSIntegrationState.loading}>
          <Form name="sms-integration-form" form={form} layout="vertical">
            <Form.Item name="_id" hidden noStyle>
              <Input />
            </Form.Item>
            <Row>
              <Col span={12}>
                <Form.Item
                  name="provider"
                  rules={[
                    {
                      required: true,
                      message: t("smsIntegration.providerReq"),
                    },
                  ]}
                  label={t("smsIntegration.provider")}
                >
                  <Select
                    placeholder={t("smsIntegration.selectProvider")}
                    onChange={(value) =>
                      setSMSIntegrationState((old) => ({
                        ...old,
                        userIdHidden: value === "NETGSM",
                      }))
                    }
                  >
                    <Select.Option key="OZTEK" value="OZTEK">
                      OZTEK
                    </Select.Option>
                    <Select.Option key="NETGSM" value="NETGSM">
                      NETGSM
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              {SMSIntegrationState.userIdHidden ? null : (
                <Col span={12}>
                  <Form.Item
                    name="apiUserId"
                    dependencies={["provider"]}
                    rules={[
                      {
                        required: true,
                        message: t("smsIntegration.userIdReq"),
                      },
                    ]}
                    label={t("smsIntegration.userId")}
                  >
                    <Input placeholder={t("smsIntegration.enterUserId")} />
                  </Form.Item>
                </Col>
              )}
              <Col span={8} offset={SMSIntegrationState.userIdHidden ? 14 : 2}>
                <Popover
                  visible={smsTestState.visible}
                  title={
                    <span className="s-main-font s-main-text-color s-semibold">
                      {t("smsIntegration.testPageTitle")}
                    </span>
                  }
                  placement="top"
                  trigger={"click"}
                  content={
                    <div className="tw-w-64">
                      <div>
                        <Input
                          placeholder={t("smsIntegration.enterMsg")}
                          maxLength={130}
                          className="tw-mb-3"
                          value={smsTestState.text}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            const text = e.target.value;
                            setSmsTestState((data) => ({
                              ...data,
                              text,
                            }));
                          }}
                        />
                        <Input
                          placeholder={t("smsIntegration.enterPhone")}
                          value={smsTestState.phone}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            const phone = e.target.value;
                            setSmsTestState((data) => ({
                              ...data,
                              phone,
                            }));
                          }}
                        />
                      </div>
                      <div className="tw-text-right tw-mt-3">
                        <Button
                          size="small"
                          className="tw-mr-2"
                          onClick={() =>
                            setSmsTestState({
                              visible: false,
                              phone: "",
                              text: "",
                            })
                          }
                        >
                          {t("global.cancel")}
                        </Button>
                        <Button
                          type="primary"
                          size="small"
                          onClick={testSMS}
                          disabled={
                            !(
                              !!smsTestState.text.trim() &&
                              !!smsTestState.phone.trim()
                            )
                          }
                        >
                          {t("smsIntegration.send")}
                        </Button>
                      </div>
                    </div>
                  }
                />
                <Form.Item label=" ">
                  <Button
                    className="tw-font-medium s-main-font"
                    type="dashed"
                    block
                    disabled={!SMSIntegrationState.integrationAdded}
                    onClick={() =>
                      setSmsTestState({
                        visible: true,
                        phone: "",
                        text: "",
                      })
                    }
                  >
                    {t("smsIntegration.smsTest")}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item
                  name="apiUserName"
                  rules={[
                    {
                      required: true,
                      message: t("smsIntegration.usernameReq"),
                    },
                  ]}
                  label={t("smsIntegration.username")}
                >
                  <Input placeholder={t("smsIntegration.enterUsername")} />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item
                  name="apiUserPassword"
                  rules={[
                    {
                      required: true,
                      message: t("smsIntegration.passwordReq"),
                    },
                  ]}
                  label={t("smsIntegration.password")}
                >
                  <Input.Password
                    placeholder={t("smsIntegration.enterPassword")}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item
                  name="apiSender"
                  rules={[
                    {
                      required: true,
                      message: t("smsIntegration.senderReq"),
                    },
                  ]}
                  label={t("smsIntegration.sender")}
                >
                  <Input placeholder={t("smsIntegration.enterSender")} />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12} className="tw-flex tw-justify-end">
                <Popconfirm
                  title={t("smsIntegration.deleteSurety")}
                  onConfirm={deleteIntegration}
                  okText={t("global.delete")}
                  cancelText={t("global.cancel")}
                  okButtonProps={{ danger: true }}
                  disabled={!SMSIntegrationState.integrationAdded}
                >
                  <Button
                    danger
                    disabled={!SMSIntegrationState.integrationAdded}
                  >
                    {t("global.delete")}
                  </Button>
                </Popconfirm>
                <Button
                  className="tw-ml-4 tw-font-medium s-main-font"
                  type="primary"
                  onClick={createIntegration}
                >
                  {t("global.save")}
                </Button>
              </Col>
            </Row>
          </Form>
        </Spin>
      </div>
    </Appshell>
  );
};

export default withTranslation()(SMSIntegration);
