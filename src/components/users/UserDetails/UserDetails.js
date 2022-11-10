import {
  GoldOutlined,
  MailOutlined,
  TagOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Col, Modal, Row } from "antd";
import React, { useContext } from "react";
import { withTranslation } from "react-i18next";
import { getCustomFieldIcon } from "scenes/Tasks/helpers";
import UserContext from "UserContext";
import { getCustomFieldValue, getUsername } from "utils/helpers";

const EmployeeDetails = function EmployeeDetails({
  visible,
  employee = {},
  handleCancel,
  t,
}) {
  const { firm } = useContext(UserContext);
  return (
    <div>
      <Modal visible={visible} onCancel={handleCancel} footer={""}>
        <h1 className="tw-text-lg s-my-18 tw-font-medium s-text-dark">
          {getUsername(employee)}
        </h1>
        <Row gutter={10} className="tw-mb-2">
          <Col span={2}>
            <UserOutlined className="s-icon-color" />
          </Col>
          <Col span={5} className="s-ml-5 tw-mt-1 s-text-muted">
            {t("employeeDetails.telephone")}
          </Col>
          <Col span={17} className="tw-mt-1 tw-font-medium s-text-dark">
            {employee && employee.phone}
          </Col>
        </Row>
        <Row gutter={10} className="tw-mb-2">
          <Col span={2}>
            <MailOutlined className="s-icon-color" />
          </Col>
          <Col span={5} className="s-ml-5 tw-mt-1 s-text-muted">
            {t("employeeDetails.email")}
          </Col>
          <Col span={17} className="tw-mt-1 tw-font-medium s-text-dark">
            {employee && employee.email}
          </Col>
        </Row>
        <Row gutter={10} className="tw-mb-2">
          <Col span={2}>
            <TagOutlined className="s-icon-color" />
          </Col>
          <Col span={5} className="s-ml-5 tw-mt-1 s-text-muted">
            {t("employeeDetails.role")}
          </Col>
          <Col span={17} className="tw-mt-1 tw-font-medium s-text-dark">
            {employee && employee.role && employee.role.title}
          </Col>
        </Row>
        <Row gutter={10} className="tw-mb-2">
          <Col span={2}>
            <GoldOutlined className="s-icon-color" />
          </Col>
          <Col span={5} className="s-ml-5 tw-mt-1 s-text-muted">
            {t("employeeDetails.warehouse")}
          </Col>
          <Col span={17} className="tw-mt-1 tw-font-medium s-text-dark">
            {employee?.bin?.title}
          </Col>
        </Row>
        {Array.isArray(employee.fields) &&
          employee.fields
            .filter((item) => !!item.label)
            .map((field) => {
              return (
                <Row gutter={10} key={field._id} className="tw-mb-2">
                  <Col span={2}>
                    {getCustomFieldIcon(field.type, "s-icon-color")}
                  </Col>
                  <Col span={5} className="s-ml-5 tw-mt-1 s-text-muted">
                    {field.label}
                  </Col>
                  <Col span={17} className="tw-mt-1 tw-font-medium s-text-dark">
                    <span>{getCustomFieldValue(field, true, firm)}</span>
                  </Col>
                </Row>
              );
            })}
        {/* <Row gutter={10} className="tw-mb-2">
          <Col span={2}>
            <Icon type="team" className="s-icon-color" />
          </Col>
          <Col span={5} className="s-ml-5 tw-mt-1 s-text-muted">
            {t("employeeDetails.team")}
          </Col>
          <Col span={17} className="tw-mt-1 tw-font-medium s-text-dark">
            {employee && employee.teamIds}
          </Col>
        </Row>
        <Row gutter={10} className="tw-mb-2">
          <Col span={2}>
            <Icon type="home" className="s-icon-color" />
          </Col>
          <Col span={5} className="s-ml-5 tw-mt-1 s-text-muted">
            {t("employeeDetails.truck")}
          </Col>
          <Col span={17} className="tw-mt-1 tw-font-medium s-text-dark"></Col>
        </Row>
        <Row gutter={10} className="tw-mb-2">
          <Col span={2}>
            <Icon type="environment" className="s-icon-color" />
          </Col>
          <Col span={5} className="s-ml-5 tw-mt-1 s-text-muted">
            {t("employeeDetails.address")}
          </Col>
          <Col span={17} className="tw-mt-1 tw-font-medium s-text-dark">
            {employee && employee.address && employee.address.formatted}
          </Col>
        </Row> */}
      </Modal>
    </div>
  );
};

export default withTranslation()(EmployeeDetails);
