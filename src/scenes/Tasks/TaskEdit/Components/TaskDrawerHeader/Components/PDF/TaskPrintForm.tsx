import { Form, Input, Modal, message } from "antd";
import logger from "logger";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FirmService, TaskFileService } from "services";
import {
  FirmForms,
  FirmPrintSettings,
  PaginatedFeathersResponse,
  PrintField,
  PrintFieldId,
  Task,
  UploadedFile,
  UserContextType,
} from "types";
import UserContext from "UserContext";
import RTE, { isRTEValueValid } from "utils/components/RTE/RTE";

import {
  SystemTaskFields,
  TaskAttacheMents,
  webBaseURL,
} from "../../../../../../../utils/helpers";
import PDFDataSelection from "./PDFDataSelection";

interface TaskPrintFormProps {
  isOpen: boolean | undefined;
  hasFiles: boolean;
  handleCancel: () => void;
  taskUid: string | undefined;
  task: Task;
}

const TaskPrintForm = ({
  isOpen,
  hasFiles,
  taskUid,
  handleCancel,
  task,
}: TaskPrintFormProps) => {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const { firm } = useContext(UserContext) as UserContextType;
  const { task: printSettings = [] } =
    firm.printSettings || ({} as FirmPrintSettings);
  const [excludedImgIds, setExcludedImgIds] = useState([] as string[]);
  const [pdfFields, setPdfFields] = useState([] as PrintField[]);
  const [images, setImages] = useState([] as UploadedFile[]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rteState, setRteState] = useState({ value: "", touched: false });

  useEffect(() => {
    if (isOpen) {
      const { tasks: taskFields = [] } = firm.forms || ({} as FirmForms);
      const { task: printSettings = [] } =
        firm.printSettings || ({} as FirmPrintSettings);

      const allFields: PrintField[] = SystemTaskFields.concat(
        taskFields.map(
          ({ _id, label, ...rest }) =>
            ({
              _id,
              label,
              shouldPrint: true,
            } as PrintField),
        ),
        TaskAttacheMents,
      );

      setPdfFields(
        allFields.map((field) => ({
          ...field,
          shouldPrint: !printSettings.includes(field._id),
        })),
      );
      setRteState({ value: task.title, touched: false });
      form.setFieldsValue({ taskUid });
    }
  }, [isOpen, form, task.title, taskUid, firm.forms, firm.printSettings]);

  useEffect(() => {
    if (isOpen && !!task._id && hasFiles) {
      setLoading(true);
      TaskFileService.find({
        query: { taskId: task._id, $limit: 500 },
      }).then(
        (res: PaginatedFeathersResponse<UploadedFile>) => {
          setImages(
            res.data.filter((item) => item?.mimeType?.startsWith("image")),
          );
          setLoading(false);
        },
        (error: Error) => {
          message.error("files.fetchError");
          logger.error("Could not fetch images: ", error);
          setLoading(false);
        },
      );
    }
  }, [isOpen, task._id, hasFiles]);

  const handleSubmit = () => {
    const currentSettings = pdfFields.reduce(
      (acc, curr) => ({ ...acc, [curr._id]: curr }),
      {} as {
        [F in PrintFieldId]: PrintField;
      },
    );

    form.validateFields().then(
      (values) => {
        if (isRTEValueValid(rteState.value)) {
          let path = "task-pdf-preview";
          path += "?id=" + values.taskUid;
          if (currentSettings["title"].shouldPrint) {
            path += "&title=" + encodeURI(rteState.value);
          }
          if (currentSettings["remarks"].shouldPrint) {
            path += "&jobDetails=" + values.jobDetails;
          }
          if (excludedImgIds.length && currentSettings["images"].shouldPrint) {
            path += "&exImgIds=" + excludedImgIds.join(",");
          }
          if (
            pdfFields.some(
              (field) =>
                (printSettings.includes(field._id) && field.shouldPrint) ||
                (!printSettings.includes(field._id) && !field.shouldPrint),
            )
          ) {
            message.loading({
              content: t("pdf.prefsSaving"),
              duration: 0,
              key: "saving",
            });
            FirmService.patch(firm._id, {
              "printSettings.task": pdfFields
                .filter((field) => !field.shouldPrint)
                .map((field) => field._id),
            })
              .then(
                () => {
                  message.success({
                    content: t("pdf.prefsSaveSuccess"),
                    key: "saving",
                  });
                  handleCancel();
                },
                (error: Error) => {
                  logger.error("Error in saving print preferences: ", error);
                  message.error({
                    content: t("pdf.prefsSaveError"),
                    key: "saving",
                  });
                },
              )
              .finally(() => {
                setSaving(false);
                const promise = new Promise<NodeJS.Timeout>((resolve) => {
                  const timer = setTimeout(() => {
                    window.open(webBaseURL(path), "_blank");
                    resolve(timer);
                  }, 1000);
                });
                promise.then((timer) => clearTimeout(timer));
              });
          } else {
            window.open(webBaseURL(path), "_blank");
            // handleCancel();
          }
        } else {
          setRteState((old) => ({ ...old, touched: true }));
        }
      },
      ({ errorFields = [] }) => {
        form.scrollToField(errorFields?.[0]?.name, { behavior: "smooth" });
        message.error(t("PDFPrint.cantCreatePDF"));
      },
    );
  };

  return (
    <>
      <Modal
        title={
          <span className="s-modal-title tw-mx-1">
            {t("PDFPrint.createPDFPageTitle")}
          </span>
        }
        visible={isOpen}
        onCancel={handleCancel}
        onOk={handleSubmit}
        okText={t("pdf.print")}
        okButtonProps={{
          className: "tw-mr-2 s-btn-spinner-align",
          loading: saving,
          disabled: saving,
        }}
        bodyStyle={{ padding: "12px 24px" }}
        width={800}
        destroyOnClose
      >
        <Form form={form} labelCol={{ span: 24 }}>
          <Form.Item name="taskUid" rules={[{ required: true }]} hidden noStyle>
            <Input />
          </Form.Item>
          <RTE
            value={task.title}
            onChange={(value) => setRteState({ value, touched: true })}
            touched={rteState.touched}
            placeholder={t("PDFPrint.enterJobTitle")}
            requiredMsg={t("PDFPrint.jobTitleReq")}
            lable={t("PDFPrint.jobTitleLabel")}
            required
          />
          <Form.Item
            name="jobDetails"
            label={t("PDFPrint.jobRemarks")}
            className="s-label-margin"
          >
            <Input.TextArea
              className="st-field-color st-placeholder-color"
              placeholder={t("PDFPrint.enterJobRemarks")}
            />
          </Form.Item>
        </Form>

        <PDFDataSelection
          excludedImgIds={excludedImgIds}
          setExcludedImgIds={setExcludedImgIds}
          pdfFields={pdfFields}
          setPdfFields={setPdfFields}
          images={images}
          loading={loading}
        />
      </Modal>
    </>
  );
};

export default TaskPrintForm;
