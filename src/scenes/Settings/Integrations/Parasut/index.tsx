import Appshell from "Appshell";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { UserContextType } from "types";
import UserContext from "UserContext";

import ParasutIntegrated from "./Components/IntegratedScene";
import ParasutIntegrationForm from "./Components/IntegrationForm";

const ParasutIntegration = () => {
  const [t] = useTranslation();
  const { hasFeature } = useContext(UserContext) as UserContextType;

  return (
    <Appshell activeLink={["settings", "parasutIntegration"]}>
      <div className="md:tw-mx-20 xl:tw-mx-32">
        <h1 className="s-page-title tw-mb-5">
          {t("parasutIntegration.pageTitle")}
        </h1>
        <div className="tw-w-10/12 md:tw-w-8/12 lg:tw-w-5/12">
          {hasFeature("parasutSync") ? (
            <ParasutIntegrated />
          ) : (
            <ParasutIntegrationForm />
          )}
        </div>
      </div>
    </Appshell>
  );
};

export default ParasutIntegration;
