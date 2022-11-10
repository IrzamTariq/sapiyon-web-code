import { Button } from "antd";
import React, { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import SapiyonGuide from "scenes/Onboarding";

interface UserCreateBtnProps {
  onClick: () => void;
}

const UserCreateBtn = ({ onClick }: UserCreateBtnProps) => {
  const [t] = useTranslation();
  const { joyrideState, updateGuideAndJoyrideState, guideState } = useContext(
    SapiyonGuide,
  );

  const handleClick = () => {
    updateGuideAndJoyrideState({}, { isRunning: false });
    onClick();
  };

  useEffect(() => {
    if (
      joyrideState.tourInProgress &&
      guideState.currentStage === "intro-tour-1"
    ) {
      updateGuideAndJoyrideState({}, { stepIndex: 1, isRunning: true });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Button
      type="primary"
      onClick={handleClick}
      ghost
      className="employees-add-btn"
    >
      <span className="tw-uppercase s-semibold s-font-roboto">
        {t("employeeList.addNewEmp")}
      </span>
    </Button>
  );
};

export default UserCreateBtn;
