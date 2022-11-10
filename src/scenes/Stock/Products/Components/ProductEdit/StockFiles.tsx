import { PlusOutlined } from "@ant-design/icons";
import { Upload, message } from "antd";
import { UploadChangeParam } from "antd/lib/upload";
import Axios from "axios";
import logger from "logger";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StockFilesService } from "services";
import { PaginatedFeathersResponse, UploadedFile } from "types";
import { apiBaseURL, s3BucketURL } from "utils/helpers";

import restClient from "../../../../../services/rest.client";

interface TaskFileState {
  uploadedFiles: UploadedFile[];
}

interface StockFilesProps {
  stockItemId: string;
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

const StockFiles = ({
  stockItemId,
  saveFileOffline,
  removeOffline,
}: StockFilesProps) => {
  const [t] = useTranslation();
  const [stockFilesState, setStockFilesState] = useState({
    uploadedFiles: [],
    uploadProgress: 0,
  } as TaskFileState);

  const handleChange = ({ event, file, fileList }: UploadChangeParam) => {
    setStockFilesState((old) => ({
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
          if (stockItemId) {
            StockFilesService.create({
              ...rest,
              url,
              stockItemId,
            }).then(
              () => {
                message.success(t("files.uploadSuccess"));
              },
              (error: Error) => {
                logger.error("Error in uploading file: ", error);
                message.error(t("files.uploadError"));
              },
            );
          } else {
            saveFileOffline({ ...rest, url });
          }
        }
        break;
      default:
        return;
    }
  };

  const handleRemove = (file: UploadedFile) => {
    if (file._id) {
      StockFilesService.remove(file._id).then(
        () => {
          message.success(t("files.removeSuccess"));
        },
        (error: Error) => message.error(t("files.removeError")),
      );
    }
    removeOffline(file.uid);
    setStockFilesState((old) => ({
      ...old,
      uploadedFiles: old.uploadedFiles.filter((item) => item.uid !== file.uid),
    }));
  };

  useEffect(() => {
    if (stockItemId) {
      StockFilesService.find({
        query: { stockItemId, $limit: 500 },
      }).then(
        (res: PaginatedFeathersResponse<UploadedFile>) => {
          setStockFilesState((old) => ({
            ...old,
            uploadedFiles: res.data.map(addFileProps),
          }));
        },
        (error: Error) => message.error("files.fetchError"),
      );
    } else {
      setStockFilesState({
        uploadedFiles: [],
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stockItemId]);

  const { uploadedFiles } = stockFilesState;

  return (
    <div>
      <Upload
        action={apiBaseURL("uploads")}
        listType="picture-card"
        fileList={uploadedFiles}
        onChange={handleChange}
        multiple={true}
        showUploadList={{
          showPreviewIcon: true,
        }}
        onRemove={handleRemove}
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
    </div>
  );
};

export default StockFiles;
