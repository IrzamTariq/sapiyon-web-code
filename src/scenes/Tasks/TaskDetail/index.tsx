import { FileOutlined } from "@ant-design/icons";
import {
  Button,
  Collapse,
  Descriptions,
  Image,
  Modal,
  Spin,
  message,
} from "antd";
import i18next from "i18next";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import StockUtilizationTable from "scenes/EditStockUtilization/StockUtilizationTable";
import { PDFService } from "services";
import {
  Checklist,
  ChecklistBucket,
  CustomField,
  CustomForm,
  CustomFormBucket,
  CustomFormField,
  Customer,
  Invoice,
  Quote,
  RFQ,
  Subtask,
  Task,
  TaskNote,
  UploadedFile,
  User,
  UserContextType,
} from "types";
import UserContext from "UserContext";
import { getRTEMarkup } from "utils/components/RTE/RTE";
import {
  getCustomFieldValue,
  getCustomerName,
  getUsername,
  s3BucketURL,
} from "utils/helpers";
import { getTaskStatusLabel } from "utils/helpers/utils";

interface TaskDetailViewProps extends WithTranslation {
  task: Task | Invoice | RFQ | Quote;
  type: "task" | "rfq" | "quote" | "invoice";
  visible: boolean;
  onClose: () => void;
}

const getFieldValue = (field: CustomFormField | CustomField) => {
  if (field.type === "date") {
    return field.value ? moment(field.value).format("DD/MM/YYYY HH:mm") : "";
  }
  if (field.type === "toggleSwitch") {
    return field.value === true
      ? i18next.t("global.yes")
      : i18next.t("global.no");
  }
  if (field.type === "dropdown") {
    return Array.isArray(field.value) ? field.value.join(", ") : field.value;
  }
  if (field.type === "file") {
    return (
      <div className="tw-flex tw-flex-wrap">
        {(field.value || []).map((file: string) => (
          <img
            src={s3BucketURL({ url: file } as UploadedFile)}
            className="tw-mb-5 tw-mr-5"
            alt="Attachement"
            style={{
              height: "100px",
              padding: "3px",
              border: "1px solid lightgray",
            }}
          />
        ))}
      </div>
    );
  }
  return field.value;
};

const getDueDate = (type: string, task: any) => {
  if ((type === "invoice" || type === "quote") && task.dueAt) {
    return moment(task.dueAt).format("DD MMMM YYYY");
  } else if (type === "task" && task.endAt) {
    return moment(task.endAt).format("DD MMMM YYYY");
  } else {
    return "";
  }
};
const getCreatedDate = (type: string, task: any) => {
  if (type === "invoice" && task.issuedAt) {
    return moment(task.issuedAt).format("DD MMMM YYYY");
  } else {
    return moment(task.createdAt).format("DD MMMM YYYY");
  }
};

const TaskDetailView = ({
  t,
  task = {} as Task | Invoice | RFQ | Quote,
  type,
  visible,
  onClose,
}: TaskDetailViewProps) => {
  const { firm } = useContext(UserContext) as UserContextType;
  useEffect(() => {
    setDetails({ data: { ...task }, isLoading: false });
    if (task.uid && type === "task") {
      setDetails((old) => ({ ...old, isLoading: true }));
      PDFService.find({ query: { type, id: task.uid } }).then(
        (res: any) => setDetails({ data: res, isLoading: false }),
        (error: Error) => {
          message.error(t("taskDetails.fetchError"));
          setDetails({ data: { ...task }, isLoading: false });
        },
      );
    }
    return () => setDetails({ data: {}, isLoading: false });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, task]);

  const [details, setDetails] = useState({ data: {} as any, isLoading: false });
  const {
    checklists: checklistBuckets = [] as ChecklistBucket[],
    subtasks = [],
    forms: formBuckets = [] as CustomFormBucket[],
    notes = [],
    files = [],
    fields = [],
    assignees = [],
    ...taskData
  } = details.data;
  const taskFiles: UploadedFile[] = files.filter(
    (item: UploadedFile) =>
      item.id || (item.mimeType || "").substr(0, 5) !== "image",
  );
  const taskImages: UploadedFile[] = files.filter(
    (item: UploadedFile) =>
      item.id || (item.mimeType || "").substr(0, 5) === "image",
  );

  const checklists = checklistBuckets.reduce(
    (acc: Checklist[], curr: ChecklistBucket) => [
      ...acc,
      ...(curr.checklists || []),
    ],
    [],
  );
  const forms = formBuckets.reduce(
    (acc: CustomForm[], curr: CustomFormBucket) => [
      ...acc,
      ...(curr.bucketItems || []),
    ],
    [],
  );
  const { customer = {} as Customer, addressId } = taskData as Task;
  const { phone, email, address, addresses } = customer;

  return (
    <Modal
      visible={visible}
      onCancel={onClose}
      footer={
        <div className="tw-text-right">
          <Button onClick={onClose}>{t("global.close")}</Button>
        </div>
      }
      title={
        <div className="tw-flex tw-w-full tw-justify-between s-modal-title">
          <span>{t("details.pageTitle")}</span>
          <span>#{taskData?._id?.substr(-5)}</span>
        </div>
      }
      width={800}
      bodyStyle={{
        padding: "16px 24px",
        fontFamily: "Roboto",
        color: "rgba(0, 0, 0, 0.9)",
      }}
      closable={false}
      destroyOnClose
    >
      <section className="s-main-text-color s-main-font tw-mb-8">
        <h2 className="tw-font-medium tw-text-2xl">
          {getCustomerName(customer)}
        </h2>
        {phone && (
          <div>
            {t("customerDetails.telephone")}: {phone}
          </div>
        )}
        {email && (
          <div>
            {t("customerDetails.email")}: {email}
          </div>
        )}
        {type === "task" && !!addressId && addressId !== "home" ? (
          <div>
            {addresses?.find((item) => item._id === addressId)?.formatted}
          </div>
        ) : (
          <div>{address?.formatted}</div>
        )}
      </section>

      <section className="tw-mb-8">
        <div className="tw-mb-5">
          <div>
            <div className="s-semibold">{t("taskList.title")}: </div>
            {getRTEMarkup(taskData.title)}
          </div>
          {(type === "invoice" || type === "quote") &&
          (taskData as Quote)?.customerMsg ? (
            <div>
              <span className="s-semibold">{t("PDF.customerMsg")}: </span>
              {(taskData as Quote).customerMsg}
            </div>
          ) : null}
          <div>
            <span className="s-semibold">{t("taskEdit.employee")}: </span>
            {assignees
              .map((assignee: User) => getUsername(assignee))
              .join(" | ")}
          </div>
        </div>

        <section className="tw-mb-8">
          <Descriptions bordered column={2} layout="vertical" size="small">
            {getCreatedDate(type, taskData) && (
              <Descriptions.Item
                label={
                  type === "invoice"
                    ? t("invoices.edit.issuedAt")
                    : t("taskEdit.createdAt")
                }
              >
                {getCreatedDate(type, taskData)}
              </Descriptions.Item>
            )}
            {type !== "quote" && getDueDate(type, taskData) && (
              <Descriptions.Item label={t("taskDetail.endAt")}>
                {getDueDate(type, taskData)}
              </Descriptions.Item>
            )}
            {fields.map((field: CustomField) => (
              <Descriptions.Item label={field.label} key={field._id}>
                {getCustomFieldValue(field, true, firm)}
              </Descriptions.Item>
            ))}
          </Descriptions>
        </section>

        {type !== "rfq" && (taskData as Task)?.stock?.length > 0 ? (
          <div className="tw-mb-8">
            <StockUtilizationTable
              onEdit={() => null}
              task={taskData}
              type={type}
              disableDiscountEditing
              disableStockEditing
              showSettings
              discounts
            />
          </div>
        ) : null}
      </section>

      <Spin spinning={details.isLoading}>
        <section className="tw-mb-8">
          <Collapse accordion>
            {(files?.length || 0) > 0 ? (
              <Collapse.Panel header={t("taskDetails.files")} key="images">
                <div>
                  <div className="tw-flex tw-flex-wrap tw-justify-between">
                    {taskImages.map((file) => (
                      <div className="tw-m-1" key={file._id}>
                        <Image
                          height="102px"
                          width="102px"
                          src={s3BucketURL(file)}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="tw-flex tw-flex-wrap tw-justify-between">
                    {taskFiles.map((file) => (
                      <a
                        key={file._id}
                        href={s3BucketURL(file)}
                        target="_blank"
                        rel="noreferrer"
                        title={file.originalName}
                      >
                        <div
                          className="tw-m-1 tw-p-1 tw-border s-pointer tw-flex tw-flex-col tw-items-center tw-justify-around"
                          style={{ width: "102px", height: "102px" }}
                        >
                          <FileOutlined className="tw-text-5xl tw-w-full mx-auto" />
                          <div className="tw-w-full tw-truncate">
                            {file.originalName}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </Collapse.Panel>
            ) : null}
            {notes.length && (
              <Collapse.Panel header={t("taskEdit.tabComments")} key="notes">
                {notes.map((note: TaskNote) => (
                  <div
                    key={note._id}
                    style={{
                      borderBottom: "1px solid #e8e8e8",
                    }}
                    className="tw-mb-5"
                  >
                    <p className="s-main-font s-semibold s-main-text-color">
                      {getUsername(note?.user)}
                    </p>
                    <p className="tw-text-xs s-main-font s-light-text-color">
                      {moment(note.createdAt).format("DD/MM/YYYY HH:mm")}
                    </p>
                    <p className="tw-mt-2 s-main-font s-main-text-color tw-text-base">
                      {note.body}
                    </p>
                  </div>
                ))}
              </Collapse.Panel>
            )}
            {checklists.length && (
              <Collapse.Panel
                header={t("checklists.pageTitle")}
                key="checklists"
              >
                {checklists.map((checklist: Checklist) => (
                  <div className="tw-mb-2" key={checklist._id}>
                    <div className="tw-font-medium s-main-font s-main-text-color">
                      {checklist.title}
                    </div>
                    <div>
                      {(checklist.items || []).map((item) => (
                        <div
                          className="record tw-flex tw-items-center tw-justify-start tw-mb-2"
                          key={item._id}
                        >
                          <input
                            type="checkbox"
                            checked={item.isDone}
                            className="tw-mr-3"
                            disabled
                            readOnly
                          />
                          <p className="s-main-font tw-text-sm">{item.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </Collapse.Panel>
            )}
            {subtasks.length && (
              <Collapse.Panel header={t("subtasks.pageTitle")} key="subtasks">
                {subtasks.map((subtask: Subtask) => {
                  const subtaskFiles = (subtask.files || []).filter(
                    (item) =>
                      item.id || (item.mimeType || "").substr(0, 5) !== "image",
                  );
                  const subtaskImages = (subtask.files || []).filter(
                    (item) =>
                      item.id || (item.mimeType || "").substr(0, 5) === "image",
                  );

                  return (
                    <div
                      className="tw-mb-2 tw-pb-3 tw-border-b"
                      key={subtask._id}
                    >
                      <div className="tw-text-lg tw-font-medium s-main-font s-main-text-color">
                        {subtask.title}
                      </div>
                      <div>
                        <p className="s-main-font s-main-text-color tw-text-sm tw-mb-2">
                          {t("PDFPrint.status")}:{" "}
                          {getTaskStatusLabel(subtask.status)}
                        </p>
                        {(subtask.files || []).length > 0 && (
                          <div className="tw-mt-5">
                            <p className="s-main-font s-main-text-color tw-mb-2">
                              {t("pdf.attachedImages")}
                            </p>
                            {/* <div className="tw-flex tw-flex-wrap">
                              {(subtask.files || []).map((file) => (
                                <img
                                  src={s3BucketURL(file)}
                                  alt="Attachement"
                                  className="tw-mb-5 tw-mr-5"
                                  style={{
                                    height: "100px",
                                    padding: "3px",
                                    border: "1px solid lightgray",
                                  }}
                                />
                              ))}
                            </div> */}
                            <div>
                              <div className="tw-flex tw-flex-wrap tw-justify-between">
                                {subtaskImages.map((file) => (
                                  <div className="tw-m-1" key={file._id}>
                                    <Image
                                      height="102px"
                                      width="102px"
                                      src={s3BucketURL(file)}
                                    />
                                  </div>
                                ))}
                              </div>
                              <div className="tw-flex tw-flex-wrap tw-justify-between">
                                {subtaskFiles.map((file) => (
                                  <a
                                    key={file._id}
                                    href={s3BucketURL(file)}
                                    target="_blank"
                                    rel="noreferrer"
                                    title={file.originalName}
                                  >
                                    <div
                                      className="tw-m-1 tw-p-1 tw-border s-pointer tw-flex tw-flex-col tw-items-center tw-justify-around"
                                      style={{
                                        width: "102px",
                                        height: "102px",
                                      }}
                                    >
                                      <FileOutlined className="tw-text-5xl tw-w-full mx-auto" />
                                      <div className="tw-w-full tw-truncate">
                                        {file.originalName}
                                      </div>
                                    </div>
                                  </a>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {(subtask.notes || []).length > 0 && (
                          <>
                            <p className="s-main-font s-main-text-color tw-font-medium tw-my-2">
                              {t("taskEdit.tabComments")}:
                            </p>
                            {subtask.notes.map((note) => (
                              <div key={note._id} className="tw-mb-5">
                                <p className="s-main-font s-semibold s-main-text-color">
                                  {getUsername(note?.user)}
                                </p>
                                <p className="tw-text-xs s-main-font s-light-text-color">
                                  {moment(note.createdAt).format(
                                    "DD/MM/YYYY HH:mm",
                                  )}
                                </p>
                                <p className="tw-mt-2 s-main-font s-main-text-color tw-text-base">
                                  {note.body}
                                </p>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </Collapse.Panel>
            )}
            {forms.length && (
              <Collapse.Panel header={t("customForms.forms")} key="forms">
                {forms.map((form: CustomForm) => (
                  <div key={form._id} className="tw-pb-3 tw-border-b">
                    <div className="tw-font-medium s-main-font s-main-text-color">
                      {form.title}
                    </div>
                    <div>
                      {(form.fields || []).map((field) => (
                        <div
                          className="record tw-mb-3"
                          key={`${field._id} ${Math.random()}`}
                        >
                          <p className="s-main-font s-main-text-color tw-font-medium tw-text-sm">
                            {field.label}
                          </p>
                          <p className="s-main-font tw-text-sm">
                            {getFieldValue(field)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </Collapse.Panel>
            )}
            {(((taskData as Task).customerSignature || {}).imgUrl ||
              (typeof (taskData as Task).customerSignature === "string" &&
                !!(taskData as Task).customerSignature)) && (
              <Collapse.Panel
                header={t("taskEdit.signatures")}
                key="signatures"
              >
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
                            typeof (taskData as Task).customerSignature ===
                            "string"
                              ? (taskData as Task).customerSignature
                              : (taskData as Task)?.customerSignature?.imgUrl,
                        } as UploadedFile)}
                        alt={t("PDFPrint.customerSignature")}
                      />
                      <p className="s-main-font s-main-text-color s-semibold tw-p-1 tw-text-sm tw-text-center tw-mt-2 tw-border-t">
                        {((taskData as Task).customerSignature || {}).signer ||
                          t("PDFPrint.customerSignature")}
                      </p>
                    </div>
                    {((taskData as Task).assignees || []).filter(
                      (item) => !!item.signatureImgUrl,
                    ).length > 0 && (
                      <div className="tw-flex tw-flex-col tw-w-4/12">
                        {((taskData as Task).assignees || [])
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
                    {((taskData as Task).assignees || []).filter(
                      (item) => !!item.signatureImgUrl,
                    ).length === 0 &&
                      typeof (taskData as Task).employeeSignature ===
                        "string" &&
                      !!(taskData as Task).employeeSignature && (
                        <div className="tw-border tw-mb-2 tw-w-4/12">
                          <img
                            style={{ width: "100%" }}
                            src={s3BucketURL({
                              url: (taskData as Task).employeeSignature,
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
            )}
          </Collapse>
        </section>
      </Spin>
    </Modal>
  );
};

export default withTranslation()(TaskDetailView);
