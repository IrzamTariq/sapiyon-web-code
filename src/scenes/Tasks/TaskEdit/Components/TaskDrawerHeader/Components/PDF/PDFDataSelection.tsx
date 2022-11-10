import { DownOutlined } from "@ant-design/icons";
import { Checkbox, Dropdown, Image, Menu, Spin, Transfer } from "antd";
import { TransferDirection } from "antd/es/transfer";
import React from "react";
import { useTranslation } from "react-i18next";
import { PrintField, UploadedFile } from "types";
import { s3BucketURL } from "utils/helpers";

interface PDFDataSelectionProps {
  images: UploadedFile[];
  excludedImgIds: string[];
  setExcludedImgIds: (imgIds: string[]) => void;
  pdfFields: PrintField[];
  setPdfFields: (pdfFields: PrintField[]) => void;
  loading: boolean;
}

const PDFDataSelection = ({
  excludedImgIds,
  setExcludedImgIds,
  images,
  loading,
  pdfFields,
  setPdfFields,
}: PDFDataSelectionProps) => {
  const [t] = useTranslation();

  const handleChange = (
    keys: string[],
    direction: TransferDirection,
    moveKeys: string[],
  ) => {
    setPdfFields(
      pdfFields.map((field) =>
        moveKeys.includes(field._id)
          ? { ...field, shouldPrint: direction === "right" }
          : field,
      ),
    );
  };

  return (
    <>
      <Transfer
        dataSource={pdfFields}
        titles={[
          <span className="s-col-title">{t("pdf.excluded")}</span>,
          <span className="s-col-title">{t("pdf.included")}</span>,
        ]}
        targetKeys={pdfFields
          .filter((field) => field.shouldPrint)
          .map((field) => field._id)}
        onChange={handleChange}
        render={(item) => item.label}
        rowKey={(item) => item._id || ""}
        listStyle={{ width: "100%" }}
        locale={{ itemUnit: "", itemsUnit: "" }}
      />

      <section className="tw-mt-5" hidden={images.length === 0}>
        <div className="tw-flex tw-justify-between s-std-text s-semibold tw-mb-2">
          <span className="tw-text-lg">{t("pdf.attachedImages")}</span>
          <div className="tw-border tw-rounded tw-flex tw-items-center tw-bg-gray-100 tw-px-1">
            <Checkbox
              indeterminate={
                images.length !== excludedImgIds.length &&
                excludedImgIds.length > 0
              }
              checked={excludedImgIds.length === 0}
              onChange={(e) =>
                e.target.checked
                  ? setExcludedImgIds([])
                  : setExcludedImgIds(images.map((img) => img._id || ""))
              }
            />
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item
                    onClick={() =>
                      setExcludedImgIds(
                        images
                          .filter(
                            (img) => !excludedImgIds.includes(img._id || ""),
                          )
                          .map((img) => img._id || ""),
                      )
                    }
                  >
                    {t("global.invertSelection")}
                  </Menu.Item>
                </Menu>
              }
              placement="bottomCenter"
              className="s-semibold tw-ml-2"
            >
              <DownOutlined className="tw-text-xs s-anticon-v-align s-pointer tw-px-2" />
            </Dropdown>
          </div>
        </div>
        {loading ? (
          <div className="tw-text-center tw-text-lg s-std-text">
            <Spin /> {t("global.loading")}
          </div>
        ) : (
          <div className="tw-flex tw-flex-wrap tw-justify-between">
            {images.map((img) => (
              <div
                key={img._id}
                className="tw-border tw-p-1"
                style={{ width: "32%", marginBottom: "2%" }}
              >
                <div className="tw-flex tw-p-1 tw-border-b tw-mb-2">
                  <div className="tw-truncate" style={{ maxWidth: "80%" }}>
                    {img.originalName}
                  </div>
                  <Checkbox
                    className="tw-ml-auto"
                    checked={!excludedImgIds.includes(img._id || "")}
                    onChange={(e) =>
                      e.target.checked
                        ? setExcludedImgIds(
                            excludedImgIds.filter((item) => item !== img._id),
                          )
                        : setExcludedImgIds([...excludedImgIds, img._id || ""])
                    }
                  />
                </div>
                <Image
                  width="100%"
                  src={s3BucketURL(img)}
                  title={img.originalName}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default PDFDataSelection;
