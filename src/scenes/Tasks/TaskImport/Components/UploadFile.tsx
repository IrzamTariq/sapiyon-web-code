import { InboxOutlined } from "@ant-design/icons";
import { Button, Upload, message } from "antd";
import { UploadProps } from "antd/lib/upload";
import React, { useContext } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { UploadedFile } from "types";
import UserContext from "UserContext";
import XLSX from "xlsx";

interface UploadTaskImportFileProps extends WithTranslation {
  onRecordsLoad: (records: any[]) => void;
}

const UploadTaskImportFile = ({
  t,
  onRecordsLoad,
}: UploadTaskImportFileProps) => {
  const { firm = {} }: any = useContext(UserContext);
  const { forms = {} } = firm;
  const { tasks: taskCustomFields } = forms;
  const customFields =
    (taskCustomFields || [])?.map(({ label = "" }) => label) || [];

  const uploadProps: UploadProps = {
    showUploadList: false,
    name: "file",
    accept:
      ".xls, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel",
    beforeUpload(file: UploadedFile) {
      const isValidSize = file.size / 1024 / 1024 < 5;
      if (!isValidSize) {
        message.error(t("productsImport.sizeError"));
      }
      return isValidSize;
    },
    onChange(info) {
      const { file = {} as UploadedFile } = info;
      const { status } = file;
      if (status === "done") {
        message.loading({
          content: t("taskImport.readingFile"),
          duration: 0,
          key: "taskImport",
        });
      } else if (status === "error") {
        message.error({
          content: t("taskImport.errorInReadingFile"),
          key: "taskImport",
        });
      }
    },
    customRequest({ file, onSuccess, onError }) {
      const fileReader = new FileReader();
      fileReader.onload = (e: ProgressEvent<FileReader>) => {
        const bstr = e?.target?.result;
        const wb = XLSX.read(bstr, { type: "array" });

        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        /* Convert array of arrays */
        const data = XLSX.utils.sheet_to_json(ws);
        //@ts-ignore
        onSuccess?.(data, file);
        onRecordsLoad(data);
      };

      fileReader.onerror = function (
        this: FileReader,
        ev: ProgressEvent<FileReader>,
      ) {
        message.error({
          content: t("taskImport.errorInReadingFile"),
          key: "taskImport",
        });
        onError?.(ev);
      };

      fileReader.readAsArrayBuffer(file);
    },
  };
  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [
      [
        "Tarihi",
        "İş detayı",
        "Çalışan",
        ...customFields,
        "Adı soyadı",
        "Şirket ünvanı",
        "E-posta",
        "Telefon",
        "Adres",
      ],
      [
        "2021-02-22 05:54",
        "Montaj yapılacak",
        "Ahmet Mehmet",
        ...customFields.map(() => ""),
        "Eylül Deniz",
        "",
        "demo@gmail.com",
        "5323334455",
        "Osmaniye, İsmail Erez Blv, 34146 Bakırköy/İstanbul, Turkey",
      ],
      [],
      [],
      [t("taskImport.hint.note1")],
      [t("taskImport.hint.note2")],
      [],
      [t("taskImport.hint.date")],
      [t("taskImport.hint.title")],
      [t("taskImport.hint.users")],
      [t("taskImport.hint.contactPerson")],
      [t("taskImport.hint.businessName")],
      [t("taskImport.hint.email")],
      [t("taskImport.hint.phone")],
      [t("taskImport.hint.address")],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Tasks");
    XLSX.writeFile(wb, `${t("taskImport.fileName")}.xlsx`);
  };

  return (
    <>
      <Upload.Dragger {...uploadProps}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">{t("importCustomers.text")}</p>
        <p className="ant-upload-hint">{t("importCustomers.hint")}</p>
      </Upload.Dragger>
      <Button className="tw-px-0" type="link" onClick={downloadTemplate}>
        {t("taskImport.downloadTemplateFile")}
      </Button>
    </>
  );
};

export default withTranslation()(UploadTaskImportFile);
