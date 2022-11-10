import Appshell from "Appshell";
import React from "react";
import { useTranslation } from "react-i18next";

import EditableExpenseCodeTable from "./Components/EditableExpenseCodeTable";

const FirmCustomFieldsContainer = () => {
  const [t] = useTranslation();

  return (
    <Appshell activeLink={["settings", "expenseCodes"]}>
      <div className="md:tw-mx-20 xl:tw-mx-32">
        <h1 className="s-page-title tw-mb-5">{t("Expense Codes")}</h1>
        <EditableExpenseCodeTable />
      </div>
    </Appshell>
  );
};

export default FirmCustomFieldsContainer;
