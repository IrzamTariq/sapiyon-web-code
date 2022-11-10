import { Form, Input, Modal, Select, message } from "antd";
import logger from "logger";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StockBinService } from "services";
import { Bin } from "types";
import { getUsername } from "utils/helpers";

import ElasticSearchField from "../../../../utils/components/ElasticSearchField";

interface BinEditProps {
  handleClose: () => void;
  visible: boolean;
  editedBin: Bin;
}

const BinEdit = ({
  handleClose,
  visible,
  editedBin = {} as Bin,
}: BinEditProps) => {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const { assignees = [] } = editedBin;
  const [loading, setLoading] = useState(false);

  //submit form values
  const onSubmit = () => {
    form.validateFields().then((values) => {
      const { _id, ...rest } = values;
      setLoading(true);
      if (_id) {
        StockBinService.patch(_id, rest, { query: { withAssignees: true } })
          .then(
            () => {
              message.success("warehouse.updateSuccess");
              handleClose();
            },
            (error: Error) => {
              message.error("warehouse.updateError");
              logger.error("Could not create warehouse: ", error);
            },
          )
          .finally(() => setLoading(false));
      } else {
        StockBinService.create(rest, { query: { withAssignees: true } })
          .then(
            () => {
              handleClose();
              message.success("warehouse.createSuccess");
            },
            (error: Error) => {
              message.error("warehouse.createError");
              logger.error("Could not create warehouse: ", error);
            },
          )
          .finally(() => setLoading(false));
      }
    });
  };

  useEffect(() => {
    if (visible) {
      const { _id, title, assignees = [] } = editedBin;
      form.setFieldsValue({
        _id,
        title,
        assigneeIds: assignees.map((item) => item._id),
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Modal
      visible={visible}
      title={
        <span className="s-modal-title tw-mx-4">
          {editedBin._id
            ? t("warehouseModal.editTitle")
            : t("warehouseModal.newTitle")}
        </span>
      }
      onCancel={handleClose}
      cancelText={t("global.cancel")}
      okText={t("global.save")}
      onOk={onSubmit}
      bodyStyle={{ padding: "24px 40px" }}
      okButtonProps={{
        className: "tw-mr-6 s-btn-spinner-align",
        loading,
        disabled: loading,
      }}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="_id" noStyle hidden>
          <Input />
        </Form.Item>
        <Form.Item
          name="title"
          rules={[{ required: true, message: t("warehouseModal.titleReq") }]}
          label={
            <span className="s-main-font s-label-color">
              {t("warehouseModal.warehouseName")}
            </span>
          }
        >
          <Input
            className="st-field-color st-placeholder-color"
            placeholder={t("warehouseModal.enterTitle")}
          />
        </Form.Item>
        <Form.Item
          name="assigneeIds"
          label={
            <span className="s-main-font s-label-color">
              {t("warehouseModal.assignees")}
            </span>
          }
        >
          <ElasticSearchField
            entity="users"
            currentValue={assignees}
            mode="multiple"
            renderOptions={(options) =>
              options.map((option) => (
                <Select.Option key={option._id} value={option._id}>
                  {getUsername(option)}
                </Select.Option>
              ))
            }
            maxTagCount={3}
            maxTagTextLength={5}
            className="st-field-color st-placeholder-color tw-w-full s-tags-color"
            placeholder={t("warehouseModal.enterAssignees")}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BinEdit;
