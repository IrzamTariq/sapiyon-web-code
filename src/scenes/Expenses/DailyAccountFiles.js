import { PlusOutlined } from "@ant-design/icons";
import { Modal, Upload, message } from "antd";
import Axios from "axios";
import logger from "logger";
import React, { useEffect, useState } from "react";
import { withTranslation } from "react-i18next";

import { AccountingFilesService } from "./../../services/";
import restClient from "../../services/rest.client";
import { apiBaseURL, getBase64, s3BucketURL } from "../../utils/helpers";

function DailyAccountFiles({ t, date, userId, isOwner }) {
  const [files, setFiles] = useState([]);

  const [previewImage, setPreviewImage] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  //cdm
  useEffect(() => {
    let isUnmounted = false;
    const query = { dailyAccountDate: date, createdForId: userId };

    AccountingFilesService.find({
      query,
    })
      .then((res) => {
        if (isUnmounted) {
          return;
        }
        setFiles(() => {
          return res.data.map((file) => ({
            ...file,
            uid: file._id,
            url: s3BucketURL(file),
          }));
        });
      })
      .catch((err) => {
        logger.error("Error in initial fetching of files", err);
      });

    return () => {
      isUnmounted = true;
    };
  }, [date, userId]);

  useEffect(() => {
    let isUnmounted = false;
    const handleCreated = (res) => {
      if (isUnmounted && res.createdForId !== userId) {
        return;
      }
      setFiles((files) => {
        let index = files.findIndex(
          (file) =>
            (file.url || "").includes(res.url) ||
            (file.response &&
              file.response.data &&
              res.url.includes(file.response.data.id)),
        );

        if (index === -1) {
          return [{ ...res, uid: res._id, url: s3BucketURL(res) }, ...files];
        } else {
          return files
            .filter((item, i) => i !== index)
            .concat({ ...res, uid: res._id, url: s3BucketURL(res) });
        }
      });
    };
    const handlePatched = (res) => {
      if (isUnmounted) {
        return;
      }

      setFiles((data = []) => {
        let index = data.findIndex((item) => item._id === res._id);
        if (index === -1) {
          return [{ ...res, uid: res._id, url: s3BucketURL(res) }, ...data];
        } else {
          return data.map((item) => (item._id === res._id ? res : item));
        }
      });
    };
    const handleRemoved = (res) => {
      if (isUnmounted) {
        return;
      }
      setFiles((data) => {
        return data.filter((item) => item._id !== res._id);
      });
    };

    AccountingFilesService.on("created", handleCreated);
    AccountingFilesService.on("patched", handlePatched);
    AccountingFilesService.on("removed", handleRemoved);

    return () => {
      isUnmounted = true;
      AccountingFilesService.off("created", handleCreated);
      AccountingFilesService.off("patched", handlePatched);
      AccountingFilesService.off("removed", handleRemoved);
    };
  }, [date, userId]);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
  };

  const handleCancel = () => setPreviewVisible(false);

  const handleChange = ({ file, fileList }) => {
    setFiles(() => fileList);
    switch (file.status) {
      case "done": {
        if (file.response) {
          const { data } = file.response;
          const { id: url, uid, ...restData } = data;

          AccountingFilesService.create({
            url,
            ...restData,
            dailyAccountDate: date,
            createdForId: userId,
          })
            .then((res) => {
              message.success(t("files.uploadSuccess"));
              setFiles((files) => {
                let index = files.findIndex(
                  (file) =>
                    (file.url || "").includes(res.url) ||
                    (file.response &&
                      file.response.data &&
                      res.url.includes(file.response.data.id)),
                );

                if (index === -1) {
                  return [
                    { ...res, uid: res._id, url: s3BucketURL(res) },
                    ...files,
                  ];
                } else {
                  return files
                    .filter((item, i) => i !== index)
                    .concat({ ...res, uid: res._id, url: s3BucketURL(res) });
                }
              });
            })
            .catch((err) => {
              message.error(t("files.uploadError"));
              logger.error("File save error", err);
            });
        }
        break;
      }
      default:
        return;
    }
  };

  const handleRemove = (file) => {
    AccountingFilesService.remove(file._id)
      .then((res) => {
        setFiles((files) => {
          return files.filter((item) => item._id !== res._id);
        });
        message.success(t("files.removeSuccess"));
      })
      .catch((err) => {
        message.error(t("files.removeError"));
        logger.error("Error in removing file", err);
      });
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div className="ant-upload-text">{t("taskFileUpload.upload")}</div>
    </div>
  );

  return (
    <div>
      <Upload
        action={apiBaseURL("uploads")}
        listType="picture-card"
        defaultFileList={files}
        fileList={files}
        onPreview={handlePreview}
        onChange={handleChange}
        onRemove={handleRemove}
        customRequest={function ({
          action,
          file,
          onSuccess,
          onProgress,
          onError,
        }) {
          restClient.reAuthenticate().then((auth) => {
            let formData = new FormData();
            formData.append("uri", file);
            Axios.post(action, formData, {
              headers: {
                Authorization: auth.accessToken,
              },
              onUploadProgress: ({ total, loaded }) =>
                onProgress(
                  {
                    percent: Number.parseFloat(
                      Math.round((loaded / total) * 100).toFixed(2),
                    ),
                  },
                  file,
                ),
            })
              .then((res) => onSuccess(res, file))
              .catch(onError);
          });
        }}
      >
        {uploadButton}
      </Upload>
      <Modal visible={previewVisible} footer={null} onCancel={handleCancel}>
        <img alt="example" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </div>
  );
}

export default withTranslation()(DailyAccountFiles);
