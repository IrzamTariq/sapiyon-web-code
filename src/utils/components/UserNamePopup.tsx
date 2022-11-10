import { MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { Popover } from "antd";
import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { User } from "types";
import { getUsername } from "utils/helpers";

import UserAvatar from "./UserAvatar";

interface UserNamePopupProps extends WithTranslation {
  user: User;
  simple?: boolean;
}

const UserNamePopup = ({
  t,
  user = {} as User,
  simple,
}: UserNamePopupProps) => {
  const name = getUsername(user);
  return simple ? (
    <>{name}</>
  ) : (
    <span>
      <Popover
        placement="topLeft"
        content={
          <div className="s-main-font">
            <div
              className="tw-flex tw-items-start tw-mb-2"
              style={{ minWidth: "250px" }}
            >
              <div className="tw-mr-4 s-semibold tw-text-lg">
                <div>{name}</div>
                <div className="tw-text-xs tw-text-gray-600 tw--mt-1 tw-italic">
                  {user?.role?.title}
                </div>
              </div>
              <UserAvatar user={user} className="tw-ml-auto" />
            </div>
            {!!user.email ? (
              <div className="tw-flex tw-items-center">
                <MailOutlined className="tw-text-gray-500 tw-mr-2" />
                <span className="text-text-lg">{user.email}</span>
              </div>
            ) : null}
            {!!user.phone ? (
              <div className="tw-flex tw-items-center">
                <PhoneOutlined className="tw-text-gray-500 tw-mr-2" />
                {user.phone}
              </div>
            ) : null}
          </div>
        }
      >
        <span className="s-main-font clickAble s-semibold">{name}</span>
      </Popover>
    </span>
  );
};

export default withTranslation()(UserNamePopup);
