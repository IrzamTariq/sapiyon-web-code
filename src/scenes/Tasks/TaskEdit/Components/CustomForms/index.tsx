import React from "react";
import { withTranslation, WithTranslation } from "react-i18next";
import { CustomForm, CustomFormBucket } from "../../../../../types";
import CustomFormsView from "./Components/CustomFormsView";

interface CustomFormsContainerProps extends WithTranslation {
  customForms: CustomForm[];
  updateBuckets: (bucket: CustomFormBucket) => void;
}

const CustomFormsContainer = ({
  t,
  customForms,
  updateBuckets,
}: CustomFormsContainerProps) => {
  return <CustomFormsView forms={customForms} updateBuckets={updateBuckets} />;
};

export default withTranslation()(CustomFormsContainer);
