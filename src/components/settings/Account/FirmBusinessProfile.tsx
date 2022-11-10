import { CameraOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, Progress, Row, Upload, message } from "antd";
import { UploadChangeParam, UploadProps } from "antd/lib/upload";
import Appshell from "Appshell";
import Axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { FirmService } from "services";
import { Firm, UploadedFile } from "types";
import UserContext from "UserContext";

import restClient from "../../../services/rest.client";
import { apiBaseURL, s3BucketURL } from "../../../utils/helpers";

interface BusinessProfileProps extends WithTranslation {}

const BusinessProfile = ({ t }: BusinessProfileProps) => {
  const [form] = Form.useForm();
  const { firm = {} }: any = useContext(UserContext);
  const [logoUrl, setLogoUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const {
      _id,
      businessName,
      contactPerson,
      email,
      taxIdNumber,
      taxOffice,
      phone,
      address = {},
      logoImgUrl,
    } = firm;
    const { formatted } = address;
    setLogoUrl(logoImgUrl);
    form.setFieldsValue({
      _id,
      businessName,
      contactPerson,
      email,
      taxIdNumber,
      taxOffice,
      phone,
      address: { formatted },
    });
  }, [firm, form]);

  const handleSubmit = (values: Firm) => {
    const { _id, ...rest } = values;
    if (!!_id) {
      FirmService.patch(_id, rest).then(
        () => message.success(t("firm.profileUpdateSuccess")),
        (error: Error) => message.error(t("firm.profileUpdateError")),
      );
    }
  };

  const handleChange = ({ file, event }: UploadChangeParam) => {
    setUploadProgress(event?.percent || 0);
    switch (file.status) {
      case "done":
        if (file.response) {
          const url = file.response.data.id;
          updateLogo(url);
          setLogoUrl(url);
          setUploadProgress(0);
        }
        break;
      default:
        return;
    }
  };

  const updateLogo = (imgUrl: string | null) => {
    handleSubmit(({ _id: firm?._id, logoImgUrl: imgUrl } as unknown) as Firm);
  };

  const uploadProps: UploadProps = {
    action: apiBaseURL("uploads"),
    onChange: handleChange,
    showUploadList: false,
    customRequest: ({ action, file, onSuccess, onProgress, onError }) => {
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
    },
  };

  return (
    <Appshell activeLink={["settings", "businessProfile"]}>
      <div className="md:tw-mx-20 xl:tw-mx-32">
        <h2 className="s-page-title tw-mb-5">{t("businessProfile.title")}</h2>
        <Row>
          <Col span={10}>
            <Form form={form} onFinish={handleSubmit} labelCol={{ span: 24 }}>
              <Form.Item name="_id" noStyle hidden>
                <Input readOnly />
              </Form.Item>
              <Form.Item
                name="businessName"
                label={
                  <span className="s-text-15 s-text-dark">
                    {t("businessProfile.businessName")}
                  </span>
                }
                rules={[
                  {
                    required: true,
                    message: t("businessProfile.businessNameReq"),
                  },
                ]}
                className="s-label-margin"
              >
                <Input
                  className="st-field-color st-placeholder-color"
                  placeholder={t("businessProfile.businessNamePlaceholder")}
                />
              </Form.Item>
              <Form.Item
                name="phone"
                label={
                  <span className="s-text-15 s-text-dark">
                    {t("businessProfile.telephone")}
                  </span>
                }
                rules={[
                  {
                    pattern: new RegExp("^[0-9]{10}$"),
                    message: t("global.phoneFormat"),
                  },
                ]}
                className="s-label-margin"
              >
                <Input
                  className="st-field-color st-placeholder-color"
                  placeholder={t("businessProfile.telephonePlaceholder")}
                />
              </Form.Item>
              <Form.Item
                name="email"
                label={
                  <span className="s-text-15 s-text-dark">
                    {t("businessProfile.email")}
                  </span>
                }
                className="s-label-margin"
              >
                <Input
                  className="st-field-color st-placeholder-color"
                  placeholder={t("businessProfile.emailPlaceholder")}
                />
              </Form.Item>
              <Form.Item
                name="taxIdNumber"
                label={t("subscription.taxNumber")}
                className="s-label-margin s-text-dark s-text-15"
              >
                <Input
                  className="st-field-color st-placeholder-color"
                  placeholder={t("subscription.enterTaxNum")}
                />
              </Form.Item>
              <Form.Item
                name="taxOffice"
                label={t("subscription.taxOffice")}
                className="s-label-margin s-text-dark s-text-15"
              >
                <Input
                  className="st-field-color st-placeholder-color"
                  placeholder={t("subscription.enterTaxOffice")}
                />
              </Form.Item>
              <Form.Item
                name={["address", "formatted"]}
                label={
                  <span className="s-text-15 s-text-dark">
                    {t("businessProfile.address")}
                  </span>
                }
                className="s-label-margin"
              >
                <Input
                  className="st-field-color st-placeholder-color"
                  placeholder={t("businessProfile.addressPlaceholder")}
                />
              </Form.Item>
              <Button
                htmlType={"submit"}
                className="tw-float-right tw-ml-4 tw-px-10 tw-font-medium s-save-btn s-dark-primary"
                type="primary"
              >
                {t("settings.save")}
              </Button>
              <Button className="tw-float-right tw-font-medium s-cancel-btn s-text-muted">
                {t("settings.cancel")}
              </Button>
            </Form>
          </Col>
          <Col span={14} className="tw-flex tw-justify-end tw-items-start">
            <div className="tw-flex tw-items-center tw-justify-center">
              {uploadProgress > 0 ? (
                <Progress type="dashboard" percent={uploadProgress} />
              ) : null}
              {!!logoUrl && uploadProgress === 0 ? (
                <div className="s-img-container s-hover-parent">
                  <img
                    alt={firm?.businessName}
                    title={firm?.businessName}
                    src={s3BucketURL({ url: logoUrl } as UploadedFile)}
                    style={{ maxWidth: "350px" }}
                  />
                  <div className="s-img-controls-overlay s-hover-target tw-flex tw-items-center tw-justify-around">
                    <Upload {...uploadProps}>
                      <Button
                        icon={<CameraOutlined />}
                        className="tw-inline-flex tw-items-center"
                        ghost
                      >
                        {t("global.edit")}
                      </Button>
                    </Upload>
                    <Button
                      icon={<DeleteOutlined />}
                      className="tw-inline-flex tw-items-center"
                      ghost
                      onClick={() => updateLogo(null)}
                    >
                      {t("global.delete")}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
            {!logoUrl && uploadProgress === 0 ? (
              <Upload.Dragger {...uploadProps} className="tw-mt-8">
                <div className="tw-p-5">
                  <p className="ant-upload-drag-icon">
                    <CameraOutlined />
                  </p>
                  <p className="ant-upload-text s-text-gray tw-text-sm">
                    {t("profile.logoUpload")}
                  </p>
                </div>
              </Upload.Dragger>
            ) : null}
          </Col>
        </Row>
      </div>
    </Appshell>
  );
};

export default withTranslation()(BusinessProfile);
