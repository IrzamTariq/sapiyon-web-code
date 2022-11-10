import {
  CommentOutlined,
  LoadingOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { faChevronCircleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Divider } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";
import { LocationTrackingData, User } from "types";
import UserAvatar from "utils/components/UserAvatar";
import { getRandomAlphaNumericString, getUsername } from "utils/helpers";

interface UserDetailsProps {
  expanded: boolean;
  collapsedHeight?: number;
  loading: boolean;
  data: LocationTrackingData;
  onExpandToggle: () => void;
}

const UserDetails = ({
  loading,
  expanded,
  onExpandToggle,
  data,
  collapsedHeight = 50,
}: UserDetailsProps) => {
  const [t] = useTranslation();
  const { businessName = "", locations = [] } = data;
  const { fullName, color, mapIcon } = locations[0]?.user || {};

  return (
    <div
      style={{
        backgroundColor: "white",
        maxHeight: expanded ? "50%" : `${collapsedHeight}px`,
        overflowY: expanded ? "auto" : "hidden",
        position: "absolute",
        width: "100%",
        top: "0px",
        zIndex: 10,
        transition: "all 400ms",
        padding: "0px 10px",
        boxShadow: "0px 1px 10px rgba(0, 0, 0, 0.5)",
      }}
    >
      <div
        style={{
          height: `${collapsedHeight}px`,
        }}
        className="tw-flex tw-justify-between tw-items-center"
      >
        {loading ? (
          <LoadingOutlined className="tw-text-lg tw-mr-2" />
        ) : (
          <UserAvatar
            user={{ fullName, mapIcon, color } as User}
            showIcon={false}
            className="tw-mr-2 tw-text-lg"
          />
        )}
        <div className="tw-mr-auto tw-w-9/12">
          {loading ? (
            <div>{t("global.loading")}</div>
          ) : (
            <>
              <div
                className="s-std-text s-semibold tw-truncate"
                title={fullName || t("global.unknown")}
              >
                {fullName}
              </div>
              <div
                className="s-main-font tw-text-gray-500 tw-truncate"
                style={{ lineHeight: 1 }}
              >
                {businessName}
              </div>
            </>
          )}
        </div>
        <div>
          <FontAwesomeIcon
            icon={faChevronCircleDown}
            className="tw-text-gray-500 tw-text-2xl s-pointer"
            rotation={expanded ? 180 : undefined}
            onClick={onExpandToggle}
            style={{ transition: "all 300ms" }}
          />
        </div>
      </div>
      <div className="tw-mt-1">
        <Divider className="tw-my-2" />
        {locations.map((location) => (
          <div className="tw-flex tw-mb-5" key={getRandomAlphaNumericString()}>
            <div
              title={getUsername(location?.user)}
              style={{ maxWidth: "70%" }}
              className="tw-truncate"
            >
              {getUsername(location?.user)}
            </div>
            <Button
              className="tw-ml-auto tw-mr-2"
              type="primary"
              size="small"
              icon={<PhoneOutlined className="s-anticon-v-align" />}
              href={`tel:${location?.user?.phone}`}
            >
              {t("global.call")}
            </Button>
            <Button
              type="default"
              size="small"
              icon={<CommentOutlined className="s-anticon-v-align" />}
              href={`sms:${location?.user?.phone}`}
            >
              {t("global.sms")}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserDetails;
