import { WarningOutlined } from "@ant-design/icons";
import { Alert, Button, Col, Form, Input, Modal, Row, Select } from "antd";
import { hasPath, path } from "rambdax";
import { debounce } from "rambdax";
import React, { useContext, useEffect } from "react";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import SapiyonGuide from "scenes/Onboarding";
import UserEditHelp from "scenes/Onboarding/Components/UserEditHelp";
import { UserService } from "services";
import getFieldInput from "utils/helpers/getFieldInput";

import { doFirmRoleFetchRequest } from "../../../store/firm/roles";
import {
  doCancelEditing,
  doEditingSaveError,
  doEditingSaveSuccess,
  doEndEditing,
  doSaveChangesLocally,
} from "../../../store/users";
import { IconPicker } from "../../../utils/components/IconPicker";
import {
  getCustomFieldRules,
  isOwner,
  mapCustomFieldValuesToFormFields,
  mapFormFieldValuesToCustomFields,
} from "../../../utils/helpers";

const { Option } = Select;

const EmployeeForm = ({
  isEditing,
  doCancelEditing,
  error,
  t,
  roles,
  teams,
  doFirmRoleFetchRequest,
  doSaveChangesLocally,
  doEditingSaveError,
  doEditingSaveSuccess,
  editedRecord = {},
  firmCustomFields = [],
  doEndEditing,
}) => {
  const [form] = Form.useForm();
  const { joyrideState, runTourStage, guideState } = useContext(SapiyonGuide);

  const handleOk = () =>
    form.validateFields().then(
      (values) => {
        if (
          joyrideState.tourInProgress &&
          guideState.currentStage === "intro-tour-1"
        ) {
          UserService.create(values).then(
            (user) => {
              doEditingSaveSuccess({ user, updated: false });
              runTourStage("guideOverview2");
            },
            (error) => doEditingSaveError(error),
          );
        } else {
          doEndEditing(values);
        }
      },
      () => null,
    );
  const getErrorMessage = () => {
    let msg = t("userEdit.saveError");
    if (
      error.className === "conflict" ||
      error.message === "Username is not available"
    ) {
      msg = t("userEdit.emailTaken");
    } else if (error.message === "User limit on your plan has reached.") {
      msg = t("users.limitReached");
    }
    return msg;
  };

  const handleCancel = () => {
    if (
      joyrideState.tourInProgress &&
      guideState.currentStage === "intro-tour-1"
    ) {
      return;
    }
    doCancelEditing();
  };

  useEffect(() => {
    if (isEditing) {
      const {
        _id,
        fullName,
        email,
        phone,
        roleId,
        teamIds,
        color = "#ffffff",
        mapIcon = "default",
        password = null,
        fields = [],
        confirmPassword = null,
      } = editedRecord;

      const customFields = mapCustomFieldValuesToFormFields(
        firmCustomFields,
        fields,
      );
      const initialValues = {
        _id,
        fullName,
        email,
        phone,
        roleId,
        teamIds,
        color,
        mapIcon,
        password,
        fields,
        confirmPassword,
        ...customFields,
      };

      form.setFieldsValue(initialValues);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  return (
    <Modal
      title={
        <span className="s-modal-title tw-mx-4">
          {t("employeeEdit.pageTitle")}
        </span>
      }
      onCloseDestroy={true}
      visible={isEditing}
      onCancel={handleCancel}
      width={600}
      bodyStyle={{ padding: "24px 40px" }}
      footer={
        <div className="tw-flex tw-justify-end tw-mr-6">
          <Button onClick={handleCancel}>{t("global.cancel")}</Button>
          <Button
            type="primary"
            onClick={handleOk}
            className="s-primary-btn-bg"
          >
            {t("global.save")}
          </Button>
        </div>
      }
      maskClosable={
        !(
          joyrideState.tourInProgress &&
          guideState.currentStage === "intro-tour-1"
        )
      }
    >
      {error ? (
        <Alert
          type="error"
          showIcon
          icon={<WarningOutlined />}
          message={getErrorMessage()}
          className="tw-mb-3 s-semibold"
        />
      ) : null}

      <UserEditHelp />

      <Form
        name="employee-edit-form"
        form={form}
        onValuesChange={debounce((changes, all) => {
          let update = {};
          if (Object.keys(changes).includes("fields")) {
            const fields = mapFormFieldValuesToCustomFields(
              firmCustomFields,
              all.fields,
            );
            update = Object.assign({}, update, { fields });
          } else {
            update = changes;
          }
          doSaveChangesLocally({ ...update });
        }, 300)}
        labelCol={{ span: 24 }}
        scrollToFirstError
      >
        <Form.Item name="_id" hidden noStyle>
          <Input />
        </Form.Item>
        <Form.Item name="mapIcon" hidden noStyle>
          <Input />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12} className="tw-mb-0">
            <Form.Item
              name="fullName"
              label={
                <span className="s-label-color">
                  {t("employeeEdit.nameLabel")}
                </span>
              }
            >
              <Input
                placeholder={t("employeeEdit.namePlaceholder")}
                className="st-field-color st-placeholder-color"
              />
            </Form.Item>
          </Col>
          <Col span={12} className="tw-mb-0">
            <Form.Item
              name="email"
              rules={[
                { required: true, message: t("employeeEdit.emailReq") },
                {
                  pattern: "^[A-Za-z0-9_@.]{1,}$",
                  message: t("global.englishOnly"),
                },
              ]}
              label={
                <span className="s-label-color">{t("employeeEdit.email")}</span>
              }
            >
              <Input
                placeholder={t("employeeEdit.email")}
                className="st-field-color st-placeholder-color"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12} className="tw-mb-0">
            <Form.Item
              name="phone"
              rules={[
                {
                  pattern: "^[0-9]{10}$",
                  message: t("global.phoneFormat"),
                },
              ]}
              label={
                <span className="s-label-color">
                  {t("employeeEdit.telephone")}
                </span>
              }
            >
              <Input
                placeholder={t("employeeEdit.phone")}
                className="st-field-color st-placeholder-color"
              />
            </Form.Item>
          </Col>
          <Col span={12} className="tw-mb-0">
            <Form.Item
              name="roleId"
              rules={[{ required: true, message: t("employeeEdit.roleReq") }]}
              label={
                <span className="s-label-color">{t("employeeEdit.role")}</span>
              }
              style={isOwner(editedRecord.role) ? { display: "none" } : {}}
            >
              <Select
                placeholder="Role..."
                className="st-field-color st-placeholder-color"
                onFocus={() => doFirmRoleFetchRequest()}
              >
                {hasPath("role._id", editedRecord) && (
                  <Option
                    disabled={path("role.deleted", editedRecord)}
                    key={path("role._id", editedRecord)}
                    value={path("role._id", editedRecord)}
                  >
                    {path("role.title", editedRecord)}
                  </Option>
                )}
                {roles
                  .filter(
                    (item) =>
                      !(
                        isOwner(item) ||
                        item._id === path("role._id", editedRecord)
                      ),
                  )
                  .map((role) => (
                    <Option key={role._id} value={role._id}>
                      {role.title}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12} className="tw-mb-0">
            <Form.Item
              name="teamIds"
              label={
                <span className="s-label-color">{t("employeeEdit.team")}</span>
              }
            >
              <Select
                placeholder={t("employeeEdit.team")}
                mode="multiple"
                className="st-field-color st-placeholder-color s-tags-color"
                maxTagCount={3}
                maxTagText={10}
                allowClear
              >
                {teams.map((team) => (
                  <Option key={team._id} value={team._id}>
                    {team.title}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6} className="tw-mb-0">
            <Form.Item
              name="color"
              label={
                <span className="s-label-color" style={{ lineHeight: "26px" }}>
                  {t("employeeEdit.color")}
                </span>
              }
            >
              <Input
                type="color"
                className="st-field-color st-placeholder-color"
              />
            </Form.Item>
          </Col>
          <Col
            offset={2}
            span={4}
            className="tw-mb-0 tw-flex tw-items-end tw-justify-end"
          >
            <Form.Item name="mapIcon">
              <IconPicker
                className="tw-mb-6"
                value={form.getFieldValue("mapIcon")}
                onSelect={(iconKey) => {
                  const changes = { mapIcon: iconKey };
                  form.setFieldsValue(changes);
                  doSaveChangesLocally({ ...changes });
                }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
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
                  <Col span={12} key={field._id}>
                    <Form.Item
                      name={["fields", field._id]}
                      {...additionalProps}
                      key={field._id}
                      label={field.label}
                    >
                      {getFieldInput(field)}
                    </Form.Item>
                  </Col>
                );
              })}
        </Row>
        {!editedRecord._id && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="password"
                rules={[
                  {
                    required: true,
                    message: t("employeeInvite.passwordReq"),
                  },
                ]}
                label={
                  <span className="s-label-color">
                    {t("employeeInvite.password")}
                  </span>
                }
              >
                <Input.Password
                  type="password"
                  className="st-field-color st-placeholder-color"
                  placeholder={t("employeeInvite.enterPassword")}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="confirmPassword"
                rules={[
                  {
                    validator: (rule, value) => {
                      if (!value || form.getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        t("employeeInvite.confirmValidation"),
                      );
                    },
                  },
                ]}
                label={
                  <span className="s-label-color">
                    {t("employeeInvite.confirmPassword")}
                  </span>
                }
              >
                <Input.Password
                  type="password"
                  className="st-field-color st-placeholder-color"
                  placeholder={t("employeeInvite.enterConfirmPassword")}
                />
              </Form.Item>
            </Col>
          </Row>
        )}
      </Form>
    </Modal>
  );
};

const mapStateToProps = (state) => {
  return {
    teams: Object.values(state.teams.byIds),
    firmCustomFields: path("firm.data.forms.users", state),
    roles: Object.values(state.firmRoles.byIds),
    isEditing: state.users.isEditing,
    error: state.users.error,
    editedRecord: state.users.editedRecord,
  };
};

const mapDispatchToProps = {
  doCancelEditing,
  doEndEditing,
  doSaveChangesLocally,
  doFirmRoleFetchRequest,
  doEditingSaveError,
  doEditingSaveSuccess,
};
const EmployeeEdit = withTranslation()(EmployeeForm);
export default connect(mapStateToProps, mapDispatchToProps)(EmployeeEdit);
