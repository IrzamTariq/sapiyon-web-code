import React from "react";
import { withTranslation } from "react-i18next";
import { InboxOutlined } from '@ant-design/icons';
import { Upload, message } from "antd";
import XLSX from "xlsx";

function UploadFile({ t, onRecordsLoad }) {
  const props = {
    showUploadList: false,
    name: "file",
    accept:
      ".xls, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel",
    // multiple: true,
    beforeUpload(file) {
      const isValidSize = file.size / 1024 / 1024 < 5;
      if (!isValidSize) {
        message.error(t("productsImport.sizeError"));
      }
      return isValidSize;
    },
    onChange(info) {
      const { status } = info.file;
      if (status !== "uploading") {
      }
      if (status === "done") {
        message.success(
          `${info.file.name} ${t("productsImport.uploadSuccess")}`,
        );
      } else if (status === "error") {
        message.error(`${info.file.name} ${t("productsImport.uploadError")}`);
      }
    },
    customRequest({ file, onSuccess, onProgress, onError }) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const bstr = e.target.result;
        const wb = XLSX.read(bstr, { type: "array" });

        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        /* Convert array of arrays */
        const data = XLSX.utils.sheet_to_json(ws);
        onSuccess(data, file);
        onRecordsLoad(data);
      };

      fileReader.onerror = () => {
        onError();
      };

      fileReader.readAsArrayBuffer(file);
    },
  };

  return (
    <div>
      <Upload.Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">{t("importCustomers.text")}</p>
        <p className="ant-upload-hint">{t("importCustomers.hint")}</p>
      </Upload.Dragger>
    </div>
  );
}

export default withTranslation()(UploadFile);
