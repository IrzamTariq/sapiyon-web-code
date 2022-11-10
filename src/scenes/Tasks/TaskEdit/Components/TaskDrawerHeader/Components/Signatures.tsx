import { Collapse } from "antd";
import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";

import { Task, UploadedFile } from "../../../../../../types";
import { getUsername, s3BucketURL } from "../../../../../../utils/helpers";

interface TaskSignaturesProps extends WithTranslation {
  editedRecord: Task;
}

const TaskSignatures = ({ t, editedRecord }: TaskSignaturesProps) => {
  return (
    <div className="tw-mt-4 tw-mb-8">
      {((editedRecord.customerSignature || {}).imgUrl ||
        (typeof editedRecord.customerSignature === "string" &&
          !!editedRecord.customerSignature)) && (
        <Collapse>
          <Collapse.Panel header={t("taskEdit.signatures")} key="1">
            <div>
              <div className="tw-flex tw-justify-between tw-px-6 s-main-font s-main-text-color tw-text-lg tw-bg-gray-100 tw-mb-5">
                <span>{t("PDFPrint.customerSignature")}</span>
                <span>{t("PDFPrint.employeeSignature")}</span>
              </div>
              <div className="tw-flex tw-justify-between tw-items-start">
                <div className="tw-w-4/12 tw-border tw-mb-2">
                  <img
                    style={{ width: "100%" }}
                    src={s3BucketURL({
                      url:
                        typeof editedRecord.customerSignature === "string"
                          ? editedRecord.customerSignature
                          : editedRecord?.customerSignature?.imgUrl,
                    } as UploadedFile)}
                    alt={t("PDFPrint.customerSignature")}
                  />
                  <p className="s-main-font s-main-text-color s-semibold tw-p-1 tw-text-sm tw-text-center tw-mt-2 tw-border-t">
                    {(editedRecord.customerSignature || {}).signer ||
                      t("PDFPrint.customerSignature")}
                  </p>
                </div>
                {(editedRecord.assignees || []).filter(
                  (item) => !!item.signatureImgUrl,
                ).length > 0 && (
                  <div className="tw-flex tw-flex-col tw-w-4/12">
                    {(editedRecord.assignees || [])
                      .filter((item) => !!item.signatureImgUrl)
                      .map((item) => (
                        <div
                          className="tw-w-full tw-border tw-mb-2"
                          key={item._id}
                        >
                          <img
                            style={{ width: "100%" }}
                            src={s3BucketURL({
                              url: item.signatureImgUrl,
                            } as UploadedFile)}
                            alt={t("PDFPrint.employeeSignature")}
                          />
                          <p className="s-main-font s-main-text-color s-semibold tw-p-1 tw-text-sm tw-text-center tw-border-t tw-mt-2">
                            {getUsername(item)}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
                {(editedRecord.assignees || []).filter(
                  (item) => !!item.signatureImgUrl,
                ).length === 0 &&
                  typeof editedRecord.employeeSignature === "string" &&
                  !!editedRecord.employeeSignature && (
                    <div className="tw-border tw-mb-2 tw-w-4/12">
                      <img
                        style={{ width: "100%" }}
                        src={s3BucketURL({
                          url: editedRecord.employeeSignature,
                        } as UploadedFile)}
                        alt={t("PDFPrint.employeeSignature")}
                      />
                      <p className="s-main-font s-main-text-color s-semibold tw-p-1 tw-text-sm tw-text-center tw-border-t tw-mt-2">
                        {t("PDFPrint.employeeSignature")}
                      </p>
                    </div>
                  )}
              </div>
            </div>
          </Collapse.Panel>
        </Collapse>
      )}
    </div>
  );
};

export default withTranslation()(TaskSignatures);
