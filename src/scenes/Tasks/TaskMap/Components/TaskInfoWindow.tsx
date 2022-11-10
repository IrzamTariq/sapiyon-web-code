import {
  CalendarOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Row } from "antd";
import moment from "moment";
import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { getRTEText } from "utils/components/RTE/RTE";

import { Customer, Task } from "../../../../types";
import { getCustomerName, getUsername } from "../../../../utils/helpers";

interface TaskInfoWindowProps extends WithTranslation {
  task: Task;
  onShowMoreDetails: () => void;
  returnJustBody: boolean;
}

const TaskInfoWindow = ({
  task = {} as Task,
  returnJustBody,
  onShowMoreDetails,
  t,
}: TaskInfoWindowProps) => {
  const { customer = {} as Customer } = task;

  let defaultTemplate = (InfoIcon: any, title: string, value: string) => {
    return (
      <Row className="tw-mb-2">
        <Col span={1} className="tw-mr-2">
          {InfoIcon}
        </Col>
        <Col span={5} className="tw-mt-1 s-text-muted">
          {getRTEText(title)}
        </Col>
        <Col className="tw-mt-1 tw-font-medium tw-truncate s-text-dark">
          {value}
        </Col>
      </Row>
    );
  };

  let body = (
    <>
      <h1 className="tw-text-lg tw-mt-0 tw-font-medium s-my-18">
        {getCustomerName(customer)}
      </h1>
      {defaultTemplate(
        <PhoneOutlined className="s-icon-color" />,
        t("jobPopup.jobDetails"),
        getRTEText(task.title),
      )}
      {defaultTemplate(
        <CalendarOutlined className="s-icon-color" />,
        t("jobPopup.dueDate"),
        task.endAt ? moment(task.endAt).format("MM/DD/YYYY HH:mm") : "",
      )}
      {defaultTemplate(
        <UserOutlined className="s-icon-color" />,
        t("jobPopup.assignee"),
        task?.assignees?.map((assignee) => getUsername(assignee)).join(" | "),
      )}
    </>
  );

  return returnJustBody ? (
    body
  ) : (
    <Card bordered={false} style={{ width: 500 }} className="job-popup-margin">
      {body}
      <div className="tw-flex tw-items-center tw-justify-end s-job-card-btn">
        <Button id={task._id} onClick={onShowMoreDetails}>
          {t("jobPopup.moreDetails")}
        </Button>
      </div>
    </Card>
  );
};

export default withTranslation()(TaskInfoWindow);
