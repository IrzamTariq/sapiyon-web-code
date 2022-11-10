import "./FilePreview.scss";

import {
  DeleteOutlined,
  DownloadOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Button, Modal, Popconfirm } from "antd";
import React, { useEffect, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { Document, Page, pdfjs } from "react-pdf";

import { UploadedFile } from "../../types";
import { fileMimeType } from "../../utils/file-mimetype";
import { getBase64 } from "../../utils/helpers";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface FilePreviewProps extends WithTranslation {
  onCancel: () => void;
  onRemove: (file: UploadedFile) => void;
  visible: boolean;
  files: UploadedFile[];
  currentIndex?: number;
  defaultFile: UploadedFile | undefined;
}

function FilePreview(props: FilePreviewProps) {
  const { visible, onCancel, defaultFile, files, onRemove, t } = props;

  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState<number | undefined>(undefined);
  const [pageNumber, setPageNumber] = useState<number>(1);

  const [previewFile, setPreviewFile] = useState<UploadedFile | undefined>(
    undefined,
  );

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  useEffect(() => {
    if (defaultFile !== undefined) {
      const uid = files.findIndex((item) => item.uid === defaultFile.uid);
      if (!defaultFile.type) {
        defaultFile.type = fileMimeType(defaultFile.url);
      }
      setPreviewFile(defaultFile);
      setCurrentFileIndex(uid);
    }
  }, [defaultFile, files]);

  const setPreview = async (index: number) => {
    const file: UploadedFile = files[index];

    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as Blob | File);
    }

    if (!file.type) {
      file.type = fileMimeType(file.url);
    }
    setCurrentFileIndex(index);
    setPreviewFile(file);
  };

  const getPreview: (
    file: UploadedFile | undefined,
  ) => React.ReactNode = function (file: UploadedFile | undefined) {
    if (!file) {
      return;
    }
    if (file.type.startsWith("image")) {
      return (
        <img
          alt="example"
          style={{ width: "100%" }}
          src={file.url || file.preview}
        />
      );
    } else if (file.type.startsWith("video")) {
      return (
        <video
          controls
          style={{ width: "100%" }}
          src={file.url || file.preview}
        />
      );
    } else if (file.type.startsWith("audio")) {
      return (
        <audio
          autoPlay={false}
          controls
          style={{ width: "100%" }}
          src={file.url || file.preview}
        />
      );
    } else if (file.type.endsWith("pdf")) {
      return (
        <>
          <Document
            loading={t("general.loading")}
            file={file.url || file.preview}
            onLoadSuccess={onDocumentLoadSuccess}
          >
            {loading === false && (
              <Page pageNumber={pageNumber} renderAnnotationLayer={false} />
            )}
          </Document>
          {loading === false && (
            <div className="tw-flex tw-mt-4 tw-justify-center tw-items-center">
              <div>
                <Button
                  icon={<LeftOutlined />}
                  onClick={() => setPageNumber(pageNumber - 1)}
                ></Button>
              </div>
              <div className="tw-mx-2">
                <p>
                  {t("general.pageNofN")} {pageNumber}/{numPages}
                </p>
              </div>
              <div>
                <Button
                  icon={<RightOutlined />}
                  onClick={() => setPageNumber(pageNumber + 1)}
                ></Button>
              </div>
            </div>
          )}
        </>
      );
    } else {
      return <div>{t("No Preview")}</div>;
    }
  };

  const footer = (
    <div className="tw-flex tw-justify-end">
      <Button.Group>
        <Button
          disabled={currentFileIndex === 0}
          onClick={() => setPreview(currentFileIndex - 1)}
          type="primary"
        >
          <LeftOutlined />
        </Button>
        <Button
          disabled={currentFileIndex + 1 === files.length}
          onClick={() => setPreview(currentFileIndex + 1)}
          type="primary"
        >
          <RightOutlined />
        </Button>
      </Button.Group>
      <div className="tw-mx-2"></div>
      <Button.Group>
        <a
          href={files[currentFileIndex]?.url}
          target="_blank"
          rel="noopener noreferrer"
          download
        >
          <Button type="default">
            <DownloadOutlined />
          </Button>
        </a>
        <Popconfirm
          title={t("global.deleteSurety")}
          onConfirm={() => onRemove(files[currentFileIndex])}
          okButtonProps={{ danger: true }}
          okText={t("global.delete")}
          cancelText={t("global.cancel")}
        >
          <Button danger>
            <DeleteOutlined />
          </Button>
        </Popconfirm>
      </Button.Group>
    </div>
  );

  return (
    <div>
      <Modal
        destroyOnClose={true}
        visible={visible}
        width={"70%"}
        closable={false}
        onCancel={onCancel}
        style={{ top: 10, padding: "5px" }}
        footer={footer}
      >
        {getPreview(previewFile)}
      </Modal>
    </div>
  );
}

export default withTranslation()(FilePreview);
