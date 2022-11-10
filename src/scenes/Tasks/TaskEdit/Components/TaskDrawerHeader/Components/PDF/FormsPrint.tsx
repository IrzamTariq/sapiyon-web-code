import { Table } from "antd";
import i18next from "i18next";
import moment from "moment";
import React from "react";
import { CustomForm, CustomFormField, UploadedFile } from "types";
import { s3BucketURL } from "utils/helpers";

interface FormsPrintProps {
  forms: CustomForm[];
}
const getFieldValue = (field: CustomFormField) => {
  if (field.type === "date") {
    return field.value ? moment(field.value).format("DD/MM/YYYY HH:mm") : "";
  }
  if (field.type === "toggleSwitch") {
    return field.value === true
      ? i18next.t("global.yes")
      : i18next.t("global.no");
  }
  if (field.type === "file") {
    return (
      <div className="s-img-grid-sub">
        {(field.value || []).map((file: string, index: number) => (
          <>
            {index % 4 === 0 ? <div style={{ clear: "both" }}></div> : null}
            <div className="s-img-grid-item-sub" key={file}>
              <img
                src={s3BucketURL({ url: file } as UploadedFile)}
                alt="Attachement"
                style={{
                  display: "block",
                  width: "100%",
                  border: "1px solid #e8e8e8",
                }}
              />
            </div>
          </>
        ))}
        <div style={{ clear: "both" }}></div>
      </div>
    );
  }
  return field.value;
};
const columns = [
  { dataIndex: "label", width: "30%" },
  {
    dataIndex: "value",
    render: (_: any, field: CustomFormField) => getFieldValue(field),
  },
];

const FormsPrint = ({ forms }: FormsPrintProps) => {
  return (
    <div>
      {forms.map((form) => (
        <>
          <div className="tw-flex tw-justify-around tw-bg-gray-400 tw-uppercase tw-text-xs s-std-text s-semibold tw-py-1 tw-mt-4">
            <span>{form.title}</span>
          </div>
          <Table
            showHeader={false}
            columns={columns}
            dataSource={form.fields}
            size="small"
            pagination={false}
            bordered
          />
        </>
      ))}
    </div>
  );
};

export default FormsPrint;
