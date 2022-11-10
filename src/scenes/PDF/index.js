import "./print-styles.css";

import { Descriptions, message } from "antd";
import moment from "moment";
import { path } from "rambdax";
import React, { useEffect, useState } from "react";
import { withTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { getRTEMarkup, getRTEText } from "utils/components/RTE/RTE";

import { PDFService } from "../../services";
import {
  getCustomFieldValue,
  getGrandTotalWithTax,
  s3BucketURL,
} from "../../utils/helpers";
import StockTable from "../EditStockUtilization/StockUtilizationTable";

const PDFPreview = ({ t }) => {
  const id = useParams().id;
  const type = useParams().type;

  const [PDFDetails, setPDFDetails] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [failedToLoad, setFailedToLoad] = useState(false);
  const cantPrintPDF = () => {
    setFailedToLoad(true);
    setIsLoading(false);
    message.error({
      content: t("PDFPrint.errorInPreview"),
      key: "pdf-generating",
    });
  };
  const fetchSuccess = (response) => {
    setPDFDetails(response);
    setIsLoading(false);
    document.title = `${response?._id?.substr(-5, 5)} -
        ${getRTEText(response?.title).substr(0, 100)} -
        ${moment().format("YYYY-MM-DD HH:mm:ss")}`;
    message.success({
      content: t("PDFPrint.previewReady"),
      key: "pdf-generating",
      duration: 0.5,
    });
  };

  useEffect(() => {
    setIsLoading(true);
    message.loading({
      content: t("PDFPrint.creatingPDFPreview"),
      key: "pdf-generating",
      duration: 0,
    });

    PDFService.find({
      query: { type, id },
    }).then((res) => fetchSuccess(res), cantPrintPDF);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const { firm = {}, ...task } = PDFDetails;
  const { _id: taskId } = task || {};

  return (
    <>
      {!(isLoading || failedToLoad) ? (
        <div className="paper">
          <div className="tw-bg-white main">
            <div className="tw-flex tw-justify-between">
              <div className="company tw-w-5/12">
                {firm.logoImgUrl ? (
                  <div className="logo tw-h-20 tw-inline-block">
                    <img
                      src={s3BucketURL({ url: firm.logoImgUrl })}
                      alt={firm?.businessName}
                      title={firm?.businessName}
                      style={{ height: "100%" }}
                    />
                  </div>
                ) : null}
                <h2 className="s-main-font s-main-text-color tw-text-base tw-font-medium tw-my-2">
                  {firm.businessName || firm.contactPerson}
                </h2>
                {firm.phone && (
                  <p className="s-main-font s-main-text-color tw-text-sm">
                    {`${t("PDF.phone")}: ${firm.phone}`}
                  </p>
                )}
                {firm.email && (
                  <p className="s-main-font s-main-text-color tw-text-sm">
                    {`${t("PDF.email")}: ${firm.email}`}
                  </p>
                )}
                {path("address.formatted", firm) && (
                  <p className="s-main-font s-main-text-color tw-text-sm">
                    {path("address.formatted", firm)}
                  </p>
                )}
              </div>
              <div className="tw-w-5/12">
                {type === "invoice" && (
                  <>
                    <h2 className="s-main-font s-main-text-color tw-text-base tw-font-medium uppercase">
                      {t("PDF.invoice")}
                    </h2>
                  </>
                )}
                {path("customer.businessName", task) && (
                  <h2 className="s-main-font s-main-text-color tw-text-base tw-font-medium mt-2">
                    {path("customer.businessName", task)}
                  </h2>
                )}

                {path("customer.contactPerson", task) && (
                  <p
                    className={
                      path("customer.businessName", task)
                        ? "s-main-font s-main-text-color tw-mb-2"
                        : "s-main-font s-main-text-color tw-text-base tw-font-medium tw-mb-2"
                    }
                  >
                    {path("customer.contactPerson", task)}
                  </p>
                )}

                {path("customer.phone", task) && (
                  <p className="s-main-font s-main-text-color tw-text-sm">
                    {`${t("PDF.phone")}: ${path("customer.phone", task)}`}
                  </p>
                )}

                {path("customer.email", task) && (
                  <p className="s-main-font s-main-text-color tw-text-sm">
                    {`${t("PDF.email")}: ${path("customer.email", task)}`}
                  </p>
                )}

                {path("customer.address.formatted", task) && (
                  <p className="s-main-font s-main-text-color tw-text-sm">
                    {path("customer.address.formatted", task)}
                  </p>
                )}

                {task?.customer?.accountType === "business" &&
                  task?.customer?.taxIdNumber && (
                    <p className="s-main-font s-main-text-color tw-text-sm">
                      {t("customerEdit.taxIdNumber")}:{" "}
                      {task?.customer?.taxIdNumber}
                    </p>
                  )}
                {task?.customer?.accountType === "business" &&
                  task?.customer?.taxOffice && (
                    <p className="s-main-font s-main-text-color tw-text-sm">
                      {t("customerEdit.taxOffice")}: {task?.customer?.taxOffice}
                    </p>
                  )}

                <div className="s-main-font s-main-text-color tw-mt-5">
                  {type === "invoice" ? (
                    <div>
                      <div
                        className="tw-p-2 tw-my-2 tw-flex tw-justify-between"
                        style={{ backgroundColor: "#fafafa" }}
                      >
                        <span>{t("PDF.invoiceNo")}</span>
                        <span>#{(taskId || "").substr(-5, 5)}</span>
                      </div>
                      {task.issuedAt && (
                        <div
                          className="tw-p-2 tw-my-2 tw-flex tw-justify-between"
                          style={{ backgroundColor: "#fafafa" }}
                        >
                          <span>{t("PDF.issueDate")}</span>
                          <span>
                            {moment(task.issuedAt).format("DD/MM/YYYY")}
                          </span>
                        </div>
                      )}
                      {task.dueAt && (
                        <div
                          className="tw-p-2 tw-my-2 tw-flex tw-justify-between"
                          style={{ backgroundColor: "#fafafa" }}
                        >
                          <span>{t("PDF.dueDate")}</span>
                          <span>{moment(task.dueAt).format("DD/MM/YYYY")}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div
                        className="tw-p-2 tw-my-2 tw-flex tw-justify-between"
                        style={{ backgroundColor: "#fafafa" }}
                      >
                        <span>{t("PDF.date")}</span>
                        <span>
                          {moment(task.createdAt).format("DD/MM/YYYY")}
                        </span>
                      </div>
                      <div
                        className="tw-p-2 tw-my-2 tw-flex tw-justify-between"
                        style={{ backgroundColor: "#fafafa" }}
                      >
                        <span>{t("PDF.quoteNo")}</span>
                        <span>#{(taskId || "").substr(-5, 5)}</span>
                      </div>
                    </div>
                  )}
                  {(task.stock || []).length > 0 && (
                    <div
                      className="tw-p-2 tw-my-2 tw-flex tw-justify-between"
                      style={{ backgroundColor: "#fafafa" }}
                    >
                      <span>{t("PDF.totalAmount")}</span>
                      <span>{getGrandTotalWithTax(task.stock)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <p className="tw-mb-3 tw-mt-5 s-main-text-color s-main-font s-semibold">
              {getRTEMarkup(task.title)}
            </p>
            {(task.fields || []).length > 0 && (
              <Descriptions
                bordered
                column={2}
                className="tw-mt-5"
                size="small"
                layout="vertical"
              >
                {(task.fields || [])
                  .filter((item) => !!item.label && item.value)
                  .map((field) => (
                    <Descriptions.Item label={field.label} key={field._id}>
                      {getCustomFieldValue(field, true, firm)}
                    </Descriptions.Item>
                  ))}
              </Descriptions>
            )}

            {(task.files || []).length > 0 && (
              <div className="tw-flex tw-flex-wrap tw-mt-5">
                {task.files
                  .filter(
                    (item) => (item.mimeType || "").substr(0, 5) === "image",
                  )
                  .map((file) => (
                    <div
                      key={file._id}
                      style={{
                        border: "1px solid #e8e8e8",
                        marginRight: "10px",
                        marginBottom: "10px",
                        pageBreakInside: "avoid",
                      }}
                    >
                      <img
                        src={s3BucketURL({ url: file.url })}
                        alt="Attachement"
                        style={{
                          height: "96px",
                          margin: "4px",
                          display: "inline-block",
                        }}
                      />
                    </div>
                  ))}
              </div>
            )}

            {(task.stock || []).length > 0 && (
              <div className="tw-mt-5">
                <StockTable
                  task={task}
                  disableStockEditing={true}
                  onEdit={() => null}
                  sagregateTaxes={false}
                  disableDiscountEditing
                  discounts
                />
              </div>
            )}

            {task.customerMsg && (
              <div className="tw-mt-5 tw-w-6/12 s-main-font s-main-text-color">
                <div>{task.customerMsg}</div>
              </div>
            )}
          </div>
        </div>
      ) : null}
      {failedToLoad && !isLoading ? (
        <div className="tw-text-center s-main-font s-main-text-color tw-text-3xl tw-flex tw-h-screen tw-w-full tw-items-center tw-justify-center">
          {t("PDF.failure")}
        </div>
      ) : null}
    </>
  );
};

export default withTranslation()(PDFPreview);
