import { LoadingOutlined } from "@ant-design/icons";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tag, Tooltip } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";
import { getUsername } from "utils/helpers";

import { User } from "../../../../../types";

interface EmployeeCardProps {
  employee: User;
  jobCount: number;
  handleUserClick: () => void;
  countLoading: boolean;
}

const EmployeeCard = ({
  employee,
  handleUserClick,
  jobCount,
  countLoading,
}: EmployeeCardProps) => {
  const [t] = useTranslation();

  return (
    <div onClick={handleUserClick} style={{ cursor: "pointer" }}>
      <div
        key={employee._id}
        className="EmployeeCard tw-border-b tw-border-gray-300 tw-shadow-md tw-pl-6 tw-h-12 tw-bg-white"
      >
        <div className="tw-flex tw-justify-between tw-items-center tw-h-12">
          <p
            className="s-main-font s-main-text-color tw-text-sm tw-font-medium tw-w-32 tw-truncate"
            title={getUsername(employee)}
          >
            {
              <FontAwesomeIcon
                icon={faMapMarkerAlt}
                style={{
                  color: employee.isSharingLocation ? "green" : "red",
                  fontWeight: "bold",
                  marginRight: "1rem",
                }}
              />
            }
            {getUsername(employee)}
          </p>
          <Tooltip placement="top" title={t("employeeCard.jobs")}>
            <Tag color="blue">
              {countLoading ? (
                <LoadingOutlined className="s-anticon-v-align" />
              ) : (
                jobCount || 0
              )}
            </Tag>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;
