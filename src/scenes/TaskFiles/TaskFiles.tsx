import { PlusOutlined } from "@ant-design/icons";
import { Upload, message } from "antd";
import { UploadChangeParam } from "antd/lib/upload";
import Axios from "axios";
import React, { useEffect, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";

import { TaskFileService } from "../../services";
import restClient from "../../services/rest.client";
import { PaginatedFeathersResponse, UploadedFile } from "../../types";
import { apiBaseURL, getBase64, s3BucketURL } from "../../utils/helpers";
import FilePreview from "./FilePreview";

interface TaskFileState {
  previewVisible: boolean;
  uploadedFiles: UploadedFile[];
  defaultFile: UploadedFile | undefined;
}

interface TaskFileProps extends WithTranslation {
  taskId: string;
  category: "rfq" | "quote" | "task" | "invoice";
  disabled?: boolean;
  haveFilesOrNot?: (yesNo: boolean) => void;
  saveFileOffline: (file: UploadedFile) => void;
  removeOffline: (uid: string) => void;
}

const addFileProps = ({ _id, originalName, mimeType, ...rest }: UploadedFile) =>
  ({
    ...rest,
    uid: _id,
    _id,
    url: s3BucketURL(rest),
    name: originalName,
    type: mimeType,
    status: "done",
  } as UploadedFile);

const TaskFiles: React.FC<TaskFileProps> = ({
  taskId,
  category,
  disabled,
  haveFilesOrNot,
  saveFileOffline,
  removeOffline,
  t,
}) => {
  const [taskFileState, setTaskFileState] = useState({
    previewVisible: false,
    uploadedFiles: [],
    defaultFile: undefined,
    uploadProgress: 0,
  } as TaskFileState);

  const handlePreview = async (file: UploadedFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as Blob | File);
    }

    setTaskFileState((old) => ({
      ...old,
      defaultFile: file,
      previewVisible: true,
    }));
  };

  const handleCancel = () =>
    setTaskFileState((old) => ({ ...old, previewVisible: false }));

  const handleChange = ({ event, file, fileList }: UploadChangeParam) => {
    setTaskFileState((old) => ({
      ...old,
      uploadedFiles: [
        ...fileList.map((item) => {
          if (item.type.startsWith("image")) {
            return item;
          }
          item.thumbUrl = apiBaseURL("generic-file-icon.png");
          return item;
        }),
      ],
    }));
    switch (file.status) {
      case "done":
        const fileToUpload = file?.response?.data;
        if (fileToUpload?.id) {
          const { id: url, ...rest } = fileToUpload;
          if (taskId) {
            TaskFileService.create({
              ...rest,
              url,
              taskId,
              category,
            }).then(
              () => {
                if (haveFilesOrNot) {
                  haveFilesOrNot(true);
                }
                message.success(t("files.uploadSuccess"));
              },
              (error: Error) => message.error(t("files.uploadError")),
            );
          } else {
            saveFileOffline({ ...rest, url, category });
          }
        }
        break;
      default:
        return;
    }
  };

  const handleRemove = (file: UploadedFile) => {
    if (file._id) {
      TaskFileService.remove(file._id).then(
        () => {
          message.success(t("files.removeSuccess"));
          if (haveFilesOrNot) {
            haveFilesOrNot(uploadedFiles?.length > 0);
          }
        },
        (error: Error) => message.error(t("files.removeError")),
      );
    }
    removeOffline(file.uid);
    setTaskFileState((old) => ({
      ...old,
      uploadedFiles: old.uploadedFiles.filter((item) => item.uid !== file.uid),
    }));
  };

  useEffect(() => {
    if (taskId) {
      TaskFileService.find({
        query: { taskId, $limit: 500 },
      }).then(
        (res: PaginatedFeathersResponse<UploadedFile>) => {
          if (haveFilesOrNot) {
            haveFilesOrNot(res?.data?.length > 0);
          }
          setTaskFileState((old) => ({
            ...old,
            uploadedFiles: res.data.map(addFileProps),
          }));
        },
        (error: Error) => message.error("files.fetchError"),
      );
    } else {
      setTaskFileState({
        previewVisible: false,
        uploadedFiles: [],
        defaultFile: undefined,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const { previewVisible, uploadedFiles, defaultFile } = taskFileState;

  return (
    <div>
      <Upload
        action={apiBaseURL("uploads")}
        listType="picture-card"
        fileList={uploadedFiles}
        onPreview={handlePreview}
        onChange={handleChange}
        multiple={true}
        showUploadList={{
          showPreviewIcon: true,
          showDownloadIcon: true,
          showRemoveIcon: false,
        }}
        disabled={disabled}
        customRequest={({
          action,
          file,
          onSuccess,
          onProgress = () => null,
          onError,
        }) => {
          restClient.reAuthenticate().then((auth: any) => {
            let formData = new FormData();
            formData.append("uri", file);
            Axios.post(action, formData, {
              headers: {
                Authorization: auth.accessToken,
              },
              onUploadProgress: ({ loaded, total }) =>
                onProgress
                  ? // @ts-ignore
                    onProgress({
                      percent: Math.round((loaded / total) * 100),
                    })
                  : null,
            })
              //@ts-ignore
              .then((res) => (onSuccess ? onSuccess(res, file) : null))
              .catch(onError);
          });
        }}
      >
        <div>
          <PlusOutlined />
          <div className="ant-upload-text">{t("taskFileUpload.upload")}</div>
        </div>
      </Upload>

      <FilePreview
        visible={previewVisible}
        onCancel={handleCancel}
        defaultFile={defaultFile}
        files={uploadedFiles}
        onRemove={handleRemove}
      />
    </div>
  );
};

export default withTranslation()(TaskFiles);
