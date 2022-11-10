import { Avatar } from "antd";
import { CustomIcon } from "assets/user-icons/IconsModule";
import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { User } from "types";
import { getUsername, isColorWhite } from "utils/helpers";

interface UserAvatarProps extends WithTranslation {
  user: User;
  className?: string;
  showIcon?: boolean;
}

const UserAvatar = ({
  t,
  user = {} as User,
  showIcon = true,
  className = "",
}: UserAvatarProps) => {
  return (
    <Avatar
      className={
        "tw-flex tw-items-center tw-justify-center tw-shadow tw-uppercase s-std-text s-semibold " +
        className
      }
      icon={
        showIcon ? (
          <CustomIcon type={user?.mapIcon} className="tw-text-xl" />
        ) : null
      }
      style={{
        backgroundColor: user.color || "#ffffff",
        color: isColorWhite(user.color) ? "#aaaaaa" : "#ffffff",
      }}
    >
      {getUsername(user).substr(0, 1)}
    </Avatar>
  );
};

export default withTranslation()(UserAvatar);
