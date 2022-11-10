import { PlusOutlined } from "@ant-design/icons";
import { Upload, message } from "antd";
import Axios from "axios";
import React, { Component } from "react";
import { WithTranslation, withTranslation } from "react-i18next";

import FilePreview from "../../../../../scenes/TaskFiles/FilePreview";
import { CustomerFilesService } from "../../../../../services";
import restClient from "../../../../../services/rest.client";
import { PaginatedFeathersResponse, UploadedFile } from "../../../../../types";
import {
  apiBaseURL,
  getBase64,
  s3BucketURL,
} from "../../../../../utils/helpers";
import CustomerNotes from "./NotesContainer";

interface FilesState {
  previewVisible: boolean;
  fileList: UploadedFile[];
  defaultFile: UploadedFile | undefined;
}

interface FilesCustomerDetailsProps extends WithTranslation {
  customerId: string;
}

const addFileProps = ({
  _id,
  originalName,
  mimeType,
  url,
  ...restData
}: UploadedFile) => ({
  ...restData,
  uid: _id || "",
  _id: _id,
  name: originalName || "",
  originalName,
  mimeType,
  type: mimeType || "",
  status: "done",
  url: s3BucketURL({ url: url || "generic-file-icon.png" } as UploadedFile),
});
class FilesCustomerDetails extends Component<
  FilesCustomerDetailsProps,
  FilesState
> {
  constructor(props: FilesCustomerDetailsProps) {
    super(props);
    this.state = {
      previewVisible: false,
      fileList: [],
      defaultFile: undefined,
    };
  }

  componentDidMount() {
    if (!!this.props.customerId) {
      CustomerFilesService.find({
        query: {
          customerId: this.props.customerId,
          $limit: 500,
        },
      }).then((res: PaginatedFeathersResponse<UploadedFile>) => {
        let defaultFiles: UploadedFile[] = [];
        defaultFiles = res.data.map(addFileProps);
        this.setState({ fileList: defaultFiles });
      });
    }
  }

  addFile = (file: UploadedFile) => {
    if (this.props.customerId) {
      const data = { ...file, url: file.id, customerId: this.props.customerId };
      CustomerFilesService.create(data).then(
        (res: UploadedFile) => {
          message.success(this.props.t("files.uploadSuccess"));
        },
        (error: Object) => {
          // console.log("File upload error", error);
          message.error(this.props.t("files.uploadError"));
        },
      );
    }
  };

  removeFile = (_id: string) => {
    if (_id) {
      CustomerFilesService.remove(_id).then(
        (res: UploadedFile) => {
          this.setState((old) => ({
            fileList: old.fileList.filter((files) => files._id !== res._id),
          }));
          message.success(this.props.t("files.removeSuccess"));
        },
        (error: Object) => {
          message.error(this.props.t("files.removeError"));
          // console.log("File upload error", error);
        },
      );
    }
  };

  handlePreview = async (file: UploadedFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as Blob | File);
    }

    this.setState({
      defaultFile: file,
      previewVisible: true,
    });
  };

  handleCancel = () => this.setState({ previewVisible: false });

  handleChange = ({
    file,
    fileList,
  }: {
    file: UploadedFile;
    fileList: UploadedFile[];
  }) => {
    this.setState({
      fileList: [
        ...fileList.map((item) => {
          if (item.type.startsWith("image")) {
            return item;
          }
          item.thumbUrl = apiBaseURL("generic-file-icon.png");
          return item;
        }),
      ],
    });
    switch (file.status) {
      case "done":
        file.response && this.addFile(file.response.data);
        break;
      default:
        return;
    }
  };

  handleRemove = (file: UploadedFile) => {
    this.removeFile(file._id || "");
    this.setState((old) => ({
      fileList: old.fileList.filter((item) => item.uid !== file.uid),
    }));
  };

  render() {
    const { previewVisible, fileList } = this.state;
    const { t, customerId } = this.props;

    const uploadButton = (
      <div>
        <PlusOutlined />
        <div className="ant-upload-text">{t("taskFileUpload.upload")}</div>
      </div>
    );

    return (
      <div className="tw-px-6">
        <div className="tw-mb-20">
          <div>
            <Upload
              action={apiBaseURL("uploads")}
              listType="picture-card"
              fileList={fileList}
              onPreview={this.handlePreview}
              onChange={this.handleChange}
              multiple={true}
              showUploadList={{
                showPreviewIcon: true,
                showDownloadIcon: true,
                showRemoveIcon: false,
              }}
              customRequest={function ({
                action,
                file,
                onSuccess = () => null,
                onProgress = () => null,
                onError,
              }) {
                restClient.reAuthenticate().then((auth: any) => {
                  let formData = new FormData();
                  formData.append("uri", file);
                  Axios.post(action, formData, {
                    headers: {
                      Authorization: auth.accessToken,
                    },
                    onUploadProgress: onProgress,
                    // onProgress(
                    // {
                    //   percent: Number.parseFloat(
                    //     Math.round((loaded / total) * 100).toFixed(2),
                    //   ),
                    // },
                    // ),
                  })
                    //ANTDV4TODO: onSuccess method parameters donn't match with docs
                    //@ts-ignore
                    .then((res) => onSuccess(res, file))
                    .catch(onError);
                });
              }}
            >
              {uploadButton}
            </Upload>
            <FilePreview
              visible={previewVisible}
              onCancel={this.handleCancel}
              defaultFile={this.state.defaultFile}
              files={fileList}
              onRemove={this.handleRemove}
            />
          </div>
          <div className="tw-mt-10">
            <CustomerNotes customerId={customerId} />
          </div>
        </div>
      </div>
    );
  }
}

export default withTranslation()(FilesCustomerDetails);
