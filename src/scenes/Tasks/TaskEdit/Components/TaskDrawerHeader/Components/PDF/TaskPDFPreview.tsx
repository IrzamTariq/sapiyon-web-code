import "./task-print-styles.css";

import { Descriptions, message } from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RouteComponentProps, withRouter } from "react-router-dom";
import StockUtilizationTable from "scenes/EditStockUtilization/StockUtilizationTable";
import { PDFService } from "services";
import {
  Checklist,
  CustomForm,
  Firm,
  FirmPrintSettings,
  PrintData,
  PrintFieldId,
  Task,
  UploadedFile,
} from "types";
import { getRTEText } from "utils/components/RTE/RTE";
import { getCustomFieldValue, getUsername, s3BucketURL } from "utils/helpers";
import { getTaskStatusLabel } from "utils/helpers/utils";

import ChecklistsPrint from "./ChecklistsPrint";
import FormsPrint from "./FormsPrint";

interface PDFPreviewProps extends RouteComponentProps {}

const PDFPreview = ({ location }: PDFPreviewProps) => {
  const [t] = useTranslation();
  const [jobTitle, setJobTitle] = useState("");
  const [jobDetails, setJobDetails] = useState("");
  const [excludedImgIds, setExcludedImgIds] = useState([] as string[]);
  const [excludedFieldIds, setExcludedFieldIds] = useState(
    [] as PrintFieldId[],
  );
  const [PDFDetails, setPDFDetails] = useState({} as PrintData);
  const [loadingState, setLoadingState] = useState({
    isLoading: false,
    failedToLoad: false,
    totalToLoad: 0,
    loaded: 0,
  });
  const { isLoading, failedToLoad, totalToLoad, loaded } = loadingState;

  useEffect(() => {
    setLoadingState((old) => ({ ...old, isLoading: true }));
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    const title = params.get("title") || "";
    const jobDetails = params.get("jobDetails") || "";
    const imgIds = (params.get("exImgIds") || "")?.split(",") || [];

    setJobDetails(jobDetails === "undefined" ? "" : decodeURI(jobDetails));
    setJobTitle(title);
    setExcludedImgIds(imgIds);
    message.loading({
      content: t("global.loading"),
      key: "pdf-generating",
      duration: 0,
    });
    PDFService.find({ query: { type: "task", id } }).then(
      (res: PrintData) => fetchSuccess(res, imgIds),
      cantPrintPDF,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const {
    firm = {} as Firm,
    checklists: checklistBuckets = [],
    forms: formBuckets = [],
    subtasks = [],
    _id: taskId,
    files = [],
    ...task
  } = PDFDetails;

  const cantPrintPDF = () => {
    setLoadingState((old) => ({
      ...old,
      isLoading: false,
      failedToLoad: true,
    }));
    message.error({
      content: t("PDFPrint.errorInPreview"),
      key: "pdf-generating",
    });
  };
  const fetchSuccess = (response: PrintData, imgIds: string[]) => {
    if (Object.keys(response || {}).length > 0) {
      setPDFDetails(response);

      const { firm = {} as Firm } = response;
      const { task: printSettings = [] } =
        firm?.printSettings || ({} as FirmPrintSettings);
      setExcludedFieldIds(printSettings);

      document.title = `${response?._id?.substr(-5, 5)} -
        ${getRTEText(response?.title).substr(0, 100)} -
        ${moment().format("YYYY-MM-DD HH:mm:ss")}`;

      const { subtasks = [], files = [] } = response;
      const totalToLoad =
        0 +
        (files
          ?.filter((file) => (file.mimeType || "").substr(0, 5) === "image")
          .filter((item) => !imgIds.includes(item._id || "")).length || 0) +
        (printSettings.includes("subtasks")
          ? 0
          : subtasks.reduce(
              (total, item) =>
                total +
                (item?.files?.filter(
                  (file) => (file.mimeType || "").substr(0, 5) === "image",
                ).length || 0),
              0,
            ));

      if (totalToLoad === 0) {
        message.success({
          content: t("PDFPrint.previewReady"),
          key: "pdf-generating",
          duration: 0.5,
        });
      } else {
        message.loading({
          content: `${t("global.preparing")} 0%`,
          key: "pdf-generating",
          duration: 0,
        });
      }
      setLoadingState((old) => ({ ...old, isLoading: false, totalToLoad }));
    } else {
      cantPrintPDF();
    }
  };

  const checklists = checklistBuckets.reduce(
    (acc, curr) => [...acc, ...(curr.checklists || [])],
    [] as Checklist[],
  );
  const forms = formBuckets.reduce(
    (acc, curr) => [...acc, ...(curr.bucketItems || [])],
    [] as CustomForm[],
  );

  const countImageLoaded = () => {
    if (loaded + 1 === totalToLoad) {
      message.success({
        content: t("PDFPrint.previewReady"),
        key: "pdf-generating",
        duration: 0.5,
      });
    } else {
      message.loading({
        content: `${t("global.preparing")} ${Math.ceil(
          (loaded / totalToLoad) * 100,
        )}%`,
        key: "pdf-generating",
        duration: 0,
      });
    }
    setLoadingState((old) => ({
      ...old,
      loaded: old.loaded + 1,
    }));
  };

  return (
    <>
      {!(isLoading || failedToLoad) ? (
        <div className="paper">
          <div className="main">
            <div className="header">
              <div className="tw-flex tw-justify-between tw-items-center">
                <div className="tw-mr-auto">
                  {firm.logoImgUrl ? (
                    <div className="logo tw-h-16 tw-inline-block">
                      <img
                        src={s3BucketURL({
                          url: firm.logoImgUrl,
                        } as UploadedFile)}
                        alt={firm?.businessName}
                        title={firm?.businessName}
                        style={{ height: "100%" }}
                      />
                    </div>
                  ) : null}
                </div>
                <div className="tw-ml-auto s-std-text tw-text-base">
                  {!excludedFieldIds.includes("dueDate") ? (
                    <div className="tw-flex tw-w-full tw-text-sm">
                      <span className="tw-text-right tw-w-16 tw-mr-8">
                        {t("PDFPrint.jobDate")}:
                      </span>
                      <span>{moment(task.endAt).format("DD/MM/YYYY")}</span>
                    </div>
                  ) : null}
                  {!excludedFieldIds.includes("taskId") ? (
                    <div className="tw-flex tw-w-full tw-text-sm">
                      <span className="tw-text-right tw-w-16 tw-mr-8">
                        {t("PDFPrint.jobId")}:
                      </span>
                      <span>{(taskId || "").substr(-5, 5)}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="tw-flex tw-justify-around tw-bg-gray-400 tw-uppercase tw-text-xs s-std-text s-semibold tw-py-1 tw-mt-2">
              <span>{t("PDF.customerInfo")}</span>
              <span>{t("PDF.companyInfo")}</span>
            </div>
            <Descriptions
              column={2}
              size="small"
              labelStyle={{
                width: excludedFieldIds.includes("customer") ? "50%" : "130px",
                fontSize: "12px",
                padding: 5,
              }}
              contentStyle={{
                width: "235px",
                fontSize: "12px",
                padding: 5,
              }}
              bordered
            >
              <Descriptions.Item
                label={t("customerList.customerName")}
                style={{
                  display: excludedFieldIds.includes("customer")
                    ? "none"
                    : "auto",
                }}
              >
                {task?.customer?.contactPerson}
              </Descriptions.Item>
              <Descriptions.Item label={t("PDF.businessName")}>
                {firm?.businessName}
              </Descriptions.Item>
              <Descriptions.Item
                label={t("customerList.businessName")}
                style={{
                  display: excludedFieldIds.includes("customer")
                    ? "none"
                    : "auto",
                }}
              >
                {task?.customer?.businessName}
                {""}
              </Descriptions.Item>
              <Descriptions.Item label={t("PDF.email")}>
                {firm?.email}
              </Descriptions.Item>
              <Descriptions.Item
                label={t("PDF.phone")}
                style={{
                  display: excludedFieldIds.includes("customer")
                    ? "none"
                    : "auto",
                }}
              >
                {task?.customer?.phone}
              </Descriptions.Item>
              <Descriptions.Item label={t("PDF.phone")}>
                {firm?.phone}
              </Descriptions.Item>
              <Descriptions.Item
                label={t("taskCustomer.address")}
                style={{
                  display: excludedFieldIds.includes("customer")
                    ? "none"
                    : "auto",
                }}
              >
                {task?.customer?.address?.formatted}
              </Descriptions.Item>
              <Descriptions.Item label={t("taskCustomer.address")}>
                {firm?.address?.formatted}
              </Descriptions.Item>
            </Descriptions>

            <div className="tw-flex tw-justify-around tw-bg-gray-400 tw-uppercase tw-text-xs s-std-text s-semibold tw-py-1 tw-mt-4">
              <span>{t("PDF.jobDetails")}</span>
            </div>
            <Descriptions
              column={2}
              size="small"
              labelStyle={{
                width: "130px",
                fontSize: "12px",
                padding: 5,
              }}
              contentStyle={{
                width: "235px",
                fontSize: "12px",
                padding: 5,
              }}
              bordered
            >
              <Descriptions.Item
                label={t("PDFPrint.jobTitle")}
                span={2}
                style={{
                  display: excludedFieldIds.includes("title") ? "none" : "auto",
                }}
              >
                {getRTEText(jobTitle)}
              </Descriptions.Item>
              <Descriptions.Item
                label={t("PDFPrint.remarks")}
                span={2}
                style={{
                  display: excludedFieldIds.includes("remarks")
                    ? "none"
                    : "auto",
                }}
              >
                {jobDetails}
              </Descriptions.Item>
              <Descriptions.Item
                label={t("PDFPrint.employee")}
                style={{
                  display: excludedFieldIds.includes("assignees")
                    ? "none"
                    : "auto",
                }}
              >
                {task?.assignees?.map((emp) => getUsername(emp)).join(", ")}
              </Descriptions.Item>
              {task?.fields
                ?.filter(
                  (field) =>
                    !excludedFieldIds.includes(field._id as PrintFieldId) &&
                    !!field.label,
                )
                .map((field) => (
                  <Descriptions.Item key={field._id} label={field.label}>
                    {getCustomFieldValue(field, true, firm)}
                  </Descriptions.Item>
                ))}
            </Descriptions>
            {!excludedFieldIds.includes("stock") &&
              (task.stock || []).length > 0 && (
                <>
                  <div className="tw-flex tw-justify-around tw-bg-gray-400 tw-uppercase tw-text-xs s-std-text s-semibold tw-py-1 tw-mt-4">
                    <span>{t("PDF.stock")}</span>
                  </div>
                  <div>
                    <StockUtilizationTable
                      task={({ ...task, _id: taskId } as unknown) as Task}
                      disableStockEditing={true}
                      onEdit={() => null}
                      sagregateTaxes={false}
                      type="task"
                      disableDiscountEditing
                      discounts
                      compact
                    />
                  </div>
                </>
              )}
            {!excludedFieldIds.includes("images") && (files || []).length > 0 && (
              <div className="s-img-grid">
                {files
                  .filter(
                    (item) => (item.mimeType || "").substr(0, 5) === "image",
                  )
                  .filter((item) => !excludedImgIds.includes(item._id || ""))
                  .map((file, index) => (
                    <>
                      <div key={file._id} className="s-img-grid-item">
                        <img
                          style={{
                            display: "block",
                            width: "100%",
                            border: "1px solid #f0f0f0",
                          }}
                          src={s3BucketURL(file)}
                          alt="Attachement"
                          loading="eager"
                          onLoad={countImageLoaded}
                        />
                      </div>
                      {(index + 1) % 3 === 0 ? (
                        <div style={{ clear: "both" }} />
                      ) : null}
                    </>
                  ))}
                <div style={{ clear: "both" }}></div>
              </div>
            )}
            {!excludedFieldIds.includes("notes") &&
              (task.notes || []).length > 0 && (
                <div className="tw-mt-10">
                  <p className="s-std-text tw-text-sm my-2 tw-font-medium">
                    {t("taskEdit.tabComments")}:
                  </p>
                  {task.notes.map((note) => (
                    <div key={note._id} className="tw-mb-5">
                      <div className="tw-flex tw-justify-between tw-items-center">
                        <span className="s-std-text">
                          {getUsername(note?.user)}
                        </span>
                        <span className="tw-text-xs s-main-font s-light-text-color">
                          {moment(note.updatedAt).format("DD/MM/YYYY HH:mm")}
                        </span>
                      </div>
                      <p className="tw-mt-1 s-main-font">{note.body}</p>
                    </div>
                  ))}
                </div>
              )}
            {!excludedFieldIds.includes("checklists") && checklists.length > 0 && (
              <div className="tw-my-5">
                <ChecklistsPrint checklists={checklists} />
              </div>
            )}
            {!excludedFieldIds.includes("subtasks") && subtasks.length > 0 && (
              <div className="Subtasks s-break-before">
                {subtasks.map((subtask, i) => (
                  <div className="card tw-mb-2 s-break-after" key={subtask._id}>
                    <div className="card-head tw-text-lg tw-font-medium s-std-text">
                      {subtask.title}
                    </div>
                    <div className="card-body">
                      <p className="s-std-text tw-text-sm tw-mb-2">
                        {t("PDFPrint.status")}:{" "}
                        {getTaskStatusLabel(subtask.status)}
                      </p>
                      {(subtask.files || []).length > 0 && (
                        <div className="tw-my-5">
                          <div className="s-img-grid-sub">
                            {(subtask.files || [])
                              .filter(
                                (item) =>
                                  item.id ||
                                  (item.mimeType || "").substr(0, 5) ===
                                    "image",
                              )
                              .map((file, index) => (
                                <div
                                  key={file._id}
                                  className="s-img-grid-item-sub"
                                >
                                  <img
                                    src={s3BucketURL(file)}
                                    alt="Attachement"
                                    style={{
                                      display: "block",
                                      width: "100%",
                                      border: "1px solid #f0f0f0",
                                    }}
                                    loading="eager"
                                    onLoad={countImageLoaded}
                                  />
                                </div>
                              ))}
                          </div>
                          <div style={{ clear: "both" }}></div>
                        </div>
                      )}

                      {(subtask.notes || []).length > 0 && (
                        <>
                          {subtask.notes.map((note) => (
                            <div key={note._id} className="tw-mb-5">
                              <div className="tw-flex tw-justify-between tw-items-center">
                                <span className="s-std-text">
                                  {getUsername(note?.user)}
                                </span>
                                <span className="tw-text-xs s-main-font s-light-text-color">
                                  {moment(note.updatedAt).format(
                                    "DD/MM/YYYY HH:mm",
                                  )}
                                </span>
                              </div>
                              <p className="tw-mt-1 s-main-font">{note.body}</p>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!excludedFieldIds.includes("forms") && forms.length > 0 && (
              <FormsPrint forms={forms} />
            )}
            {!excludedFieldIds.includes("signatures") &&
              ((task.customerSignature || {}).imgUrl ||
                (typeof task.customerSignature === "string" &&
                  !!task.customerSignature)) && (
                <div className="signatures tw-mt-10">
                  <div>
                    <div className="tw-flex tw-justify-between tw-px-6 s-std-text tw-text-lg tw-bg-gray-100 tw-mb-2">
                      <span>{t("PDFPrint.customerSignature")}</span>
                      <span>{t("PDFPrint.employeeSignature")}</span>
                    </div>
                    <div className="tw-flex tw-justify-between tw-items-start">
                      <div className="tw-w-5/12 tw-flex tw-flex-col tw-items-start">
                        <div className="tw-border tw-mb-2">
                          <img
                            style={{ height: "160px" }}
                            src={s3BucketURL({
                              url:
                                typeof task.customerSignature === "string"
                                  ? task.customerSignature
                                  : task?.customerSignature?.imgUrl,
                            } as UploadedFile)}
                            alt={t("PDFPrint.customerSignature")}
                          />
                          <p className="s-mafin-font s-main-text-color s-semibold tw-p-1 tw-text-sm tw-text-center tw-mt-2 tw-border-t">
                            {(task.customerSignature || {}).signer ||
                              t("PDFPrint.customerSignature")}
                          </p>
                        </div>
                      </div>
                      {(task.assignees || []).filter(
                        (item) => !!item.signatureImgUrl,
                      ).length > 0 && (
                        <div className="tw-flex tw-flex-col tw-w-5/12 tw-items-end">
                          {(task.assignees || [])
                            .filter((item) => !!item.signatureImgUrl)
                            .map((item) => (
                              <div
                                className="tw-border tw-mb-2"
                                key={item._id}
                                style={{ pageBreakInside: "avoid" }}
                              >
                                <img
                                  style={{ height: "160px" }}
                                  src={s3BucketURL({
                                    url: item.signatureImgUrl,
                                  } as UploadedFile)}
                                  alt={t("PDFPrint.employeeSignature")}
                                />
                                <p className="s-std-text s-semibold tw-p-1 tw-text-sm tw-text-center tw-border-t tw-mt-2">
                                  {getUsername(item)}
                                </p>
                              </div>
                            ))}
                        </div>
                      )}
                      {(task.assignees || []).filter(
                        (item) => !!item.signatureImgUrl,
                      ).length === 0 &&
                        typeof task.employeeSignature === "string" &&
                        !!task.employeeSignature && (
                          <div className="tw-flex tw-flex-col tw-items-end">
                            <div
                              className="tw-border tw-mb-2"
                              style={{ pageBreakInside: "avoid" }}
                            >
                              <img
                                style={{ height: "160px" }}
                                src={s3BucketURL({
                                  url: task.employeeSignature,
                                } as UploadedFile)}
                                alt={t("PDFPrint.employeeSignature")}
                              />
                              <p className="s-std-text s-semibold tw-p-1 tw-text-sm tw-text-center tw-border-t tw-mt-2">
                                {t("PDFPrint.employeeSignature")}
                              </p>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
      ) : null}
      {failedToLoad && !isLoading ? (
        <div className="tw-text-center s-std-text tw-text-3xl tw-flex tw-h-screen tw-w-full tw-items-center tw-justify-center">
          {t("PDF.failure")}
        </div>
      ) : null}
    </>
  );
};

export default withRouter(PDFPreview);
