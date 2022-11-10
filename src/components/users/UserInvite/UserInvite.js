import "@ant-design/compatible/assets/index.css";

import { Form } from "@ant-design/compatible";
import { Button, Col, Input, Modal, Row, Select } from "antd";
import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import * as Yup from "yup";

const { Option } = Select;

class EmployeeInvite extends Component {
  render() {
    const {
      t,
      visible,
      handleOk,
      handleCancel,
      roles = [],
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      doFirmRoleFetchRequest,
    } = this.props;
    return (
      <div>
        <Modal
          title={
            <span className="s-modal-title tw-mx-4">
              {t("employeeList.bulkInvite")}
            </span>
          }
          onCloseDestroy={true}
          visible={visible}
          onCancel={handleCancel}
          width={600}
          bodyStyle={{ padding: "24px 40px" }}
          footer={
            <div className="tw-flex tw-justify-end tw-mx-6">
              <Button onClick={handleCancel}>{t("global.cancel")}</Button>
              <Button
                type="primary"
                className="s-primary-btn-bg"
                onClick={handleOk}
              >
                {t("global.ok")}
              </Button>
            </div>
          }
        >
          <Form.Item
            label={
              <span className="s-label-color">{t("employeeEdit.role")}</span>
            }
            className="s-label-margin"
          >
            {getFieldDecorator("roleId", {
              rules: [
                {
                  required: true,
                  message: t("global.requiredField"),
                },
              ],
            })(
              <Select
                placeholder={t("employeeInvite.role") + "..."}
                className="tw-w-full st-field-color st-placeholder-color"
                onFocus={() => doFirmRoleFetchRequest()}
              >
                {roles.map((role) => (
                  <Option key={role._id} value={role._id}>
                    {role.title}
                  </Option>
                ))}
              </Select>,
            )}
          </Form.Item>
          <Form.Item
            label={
              <span className="s-label-color">{t("employeeEdit.email")}</span>
            }
            className="s-label-margin"
          >
            {getFieldDecorator("emails", {
              rules: [
                {
                  required: true,
                  message: t("global.requiredField"),
                },
              ],
            })(
              <Select
                className="st-field-color st-placeholder-color s-tags-color tw-w-full"
                mode="tags"
                tokenSeparators={[","]}
                onSelect={(item) => {
                  Yup.string()
                    .validate(item)
                    .catch(() => {
                      let emails = getFieldValue("emails");
                      emails.splice(emails.length - 1, 1);
                      setFieldsValue({ emails });
                    });
                }}
                placeholder={t("employeeInvite.emails") + "..."}
              />,
            )}
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="s-label-color">
                    {t("employeeInvite.password")}
                  </span>
                }
                className="s-label-margin"
              >
                {getFieldDecorator("password", {
                  rules: [
                    {
                      required: true,
                      message: t("employeeInvite.passwordReq"),
                    },
                    {
                      min: 8,
                      message: t("employeeInvite.passwordLength"),
                    },
                  ],
                })(
                  <Input.Password
                    placeholder={t("employeeInvite.enterPassword")}
                    className="st-field-color st-placeholder-color"
                  />,
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="s-label-color">
                    {t("employeeInvite.confirmPassword")}
                  </span>
                }
                className="s-label-margin"
              >
                {getFieldDecorator("confirmPassword", {
                  rules: [
                    {
                      validator: (rule, value) => {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          t("employeeInvite.confirmValidation"),
                        );
                      },
                    },
                  ],
                })(
                  <Input.Password
                    className="st-field-color st-placeholder-color"
                    placeholder={t("employeeInvite.enterConfirmPassword")}
                  />,
                )}
              </Form.Item>
            </Col>
          </Row>
        </Modal>
      </div>
    );
  }
}
const AntForm = Form.create({ name: "invite-multiple-employees" })(
  EmployeeInvite,
);
const Translated = withTranslation()(AntForm);
export default Translated;
