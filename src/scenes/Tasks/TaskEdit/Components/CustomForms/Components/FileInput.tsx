import React, { useState } from "react";
import { withTranslation, WithTranslation } from "react-i18next";
import { PlusOutlined } from "@ant-design/icons";
import { Upload, Modal } from "antd";
import restClient from "../../../../../../services/client";
import Axios from "axios";
import { CustomFormField, UploadedFile } from "../../../../../../types";
import { apiBaseURL, s3BucketURL } from "../../../../../../utils/helpers";

interface FileInputProps extends WithTranslation {
  field: CustomFormField;
  onChange: (newValue: string[]) => void;
}

const FileInput: React.FC<FileInputProps> = ({ field, onChange, t }) => {
  const [filesState, setFilesState] = useState({
    previewVisible: false,
    previewImage: "",
  });

  const handlePreview = async (file: UploadedFile) =>
    setFilesState((old) => ({
      ...old,
      previewVisible: true,
      previewImage: s3BucketURL({
        url: file.uid || "generic-file-icon.png",
      } as UploadedFile),
    }));

  const handleChange = ({
    file,
    fileList,
  }: {
    file: UploadedFile;
    fileList: UploadedFile[];
  }) => {
    switch (file.status) {
      case "done":
        const fileToUpload = file?.response?.data;
        if (fileToUpload?.id) {
          onChange([
            ...(Array.isArray(field.value) ? field.value : []),
            fileToUpload.id,
          ]);
        }
        break;
      default:
        return;
    }
  };

  const handleRemove = (file: UploadedFile) => {
    if (file._id) {
      onChange(
        (Array.isArray(field.value) ? field.value : []).filter(
          (item) => item !== file.uid,
        ),
      );
    }
  };

  const uploadedFiles = (Array.isArray(field.value) ? field.value : []).map(
    (item) => ({
      uid: item,
      _id: item,
      url: s3BucketURL({ url: item } as UploadedFile),
      size: 1000,
      name: "File input value",
      type: "image/png",
    }),
  );

  return (
    <div>
      <Upload
        action={apiBaseURL("uploads")}
        listType="picture-card"
        defaultFileList={uploadedFiles}
        onPreview={handlePreview}
        onChange={handleChange}
        // multiple={true}
        onRemove={handleRemove}
        customRequest={({ action, file, onSuccess, onProgress, onError }) => {
          restClient.reAuthenticate().then((auth: any) => {
            let formData = new FormData();
            formData.append("uri", file);
            Axios.post(action, formData, {
              headers: {
                Authorization: auth.accessToken,
              },
              onUploadProgress: (uploadEvent) => onProgress,
              // onProgress(
              //   {
              //     percent: Number.parseFloat(
              //       Math.round((loaded / total) * 100).toFixed(2),
              //     ),
              //   },
              //   file,
              // ),
            })
              //ANTDV4TODO: arguement list of following function don't match with docs
              //@ts-ignore
              .then((res) => onSuccess(res, file))
              .catch(onError);
          });
        }}
      >
        <div>
          <PlusOutlined />
          <div className="ant-upload-text">{t("taskFileUpload.upload")}</div>
        </div>
      </Upload>
      <Modal
        visible={filesState.previewVisible}
        footer={null}
        onCancel={() =>
          setFilesState((old) => ({ ...old, previewVisible: false }))
        }
      >
        <img
          alt="example"
          style={{ width: "100%" }}
          src={filesState.previewImage}
        />
      </Modal>
    </div>
  );
};

export default withTranslation()(FileInput);
