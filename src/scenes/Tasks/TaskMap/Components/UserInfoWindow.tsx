import {
  ClusterOutlined,
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Card, Col, Row } from "antd";
import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { getUsername } from "utils/helpers";

import { Team, User } from "../../../../types";

interface UserInfoWindowProps extends WithTranslation {
  user: User;
}

const UserInfoWindow = ({ t, user }: UserInfoWindowProps) => {
  const defaultTemplate = (
    InfoIcon: JSX.Element,
    title: string,
    value: string,
  ) => {
    return (
      <Row className="tw-mb-2">
        <Col span={1} className="tw-mr-2">
          {InfoIcon}
        </Col>
        <Col span={5} className="s-text-muted">
          {title}
        </Col>
        <Col span={10} className="tw-font-medium s-text-dark">
          {value}
        </Col>
      </Row>
    );
  };

  return (
    <Card
      bordered={false}
      style={{ minWidth: 500, maxWidth: 600 }}
      className="job-popup-margin"
    >
      {defaultTemplate(
        <UserOutlined className="s-icon-color s-anticon-v-align" />,
        t("userPopup.user"),
        getUsername(user),
      )}
      {defaultTemplate(
        <PhoneOutlined className="s-icon-color s-anticon-v-align" />,
        t("userPopup.telephone"),
        user.phone,
      )}
      {defaultTemplate(
        <MailOutlined className="s-icon-color s-anticon-v-align" />,
        t("userPopup.email"),
        user.email,
      )}
      {defaultTemplate(
        <EnvironmentOutlined className="s-icon-color s-anticon-v-align" />,
        t("userPopup.role"),
        user.role && user.role.title,
      )}
      {defaultTemplate(
        <ClusterOutlined className="s-icon-color s-anticon-v-align" />,
        t("userPopup.team"),
        user?.teams
          ?.reduce((acc: string[], curr: Team) => [...acc, curr.title], [])
          .join(" | "),
      )}
    </Card>
  );
};

export default withTranslation()(UserInfoWindow);
