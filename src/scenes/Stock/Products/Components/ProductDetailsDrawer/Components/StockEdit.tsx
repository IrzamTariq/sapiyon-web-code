import { Form, Input, InputNumber, Modal, message } from "antd";
import logger from "logger";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StockTransactionService } from "services";

export interface StockEditType {
  _id: string;
  productId: string;
  toId: string;
  oldValue: number;
}
interface StockEditProps {
  editedRecord: StockEditType;
  visible: boolean;
  handleClose: () => void;
}

const StockEdit = ({ editedRecord, handleClose, visible }: StockEditProps) => {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    form.validateFields().then(
      (values) => {
        if (values.qty !== 0) {
          setLoading(true);
          const { newValue, oldValue, ...rest } = values;
          StockTransactionService.create({
            type: "adjust",
            ...rest,
          })
            .then(
              () => {
                message.success("Stock level created");
                handleClose();
              },
              (error: Error) => {
                message.error("Could not create stock level");
                logger.error("Could not create stock level: ", error);
              },
            )
            .finally(() => setLoading(false));
        }
      },
      () => null,
    );
  };

  useEffect(() => {
    if (visible) {
      const { productId, toId, oldValue } = editedRecord;
      const formValues = {
        productId,
        toId,
        oldValue,
        newValue: oldValue,
        qty: 0,
        description: "",
      };
      form.setFieldsValue(formValues);
    }
  }, [visible, editedRecord, form]);

  return (
    <Modal
      title={t("stockEdit.pageTitle")}
      visible={visible}
      onCancel={handleClose}
      onOk={handleSubmit}
      okText={t("global.save")}
      cancelText={t("global.cancel")}
      width={350}
      okButtonProps={{
        className: "tw-mr-2 s-btn-spinner-align",
        loading,
        disabled: loading,
      }}
      bodyStyle={{ padding: "12px 24px" }}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item name="productId" rules={[{ required: true }]} noStyle hidden>
          <Input />
        </Form.Item>
        <Form.Item name="toId" rules={[{ required: true }]} noStyle hidden>
          <Input />
        </Form.Item>
        <Form.Item
          name="newValue"
          label={t("stockEdit.newQty")}
          rules={[{ required: true, message: t("stockEdit.newQtyReq") }]}
        >
          <InputNumber
            placeholder={t("stockEdit.enterQty")}
            className="st-field-color st-placeholder-color tw-w-full"
            onChange={(qty = 0) => {
              if (qty === null || !+qty) {
                qty = 0;
              }
              qty = +qty;
              form.setFieldsValue({
                qty: qty - form.getFieldValue("oldValue"),
              });
            }}
          />
        </Form.Item>
        <Form.Item
          name="description"
          label={t("stockEdit.description")}
          rules={[
            {
              required: true,
              message: t("stockEdit.descriptionReq"),
            },
          ]}
        >
          <Input.TextArea
            placeholder={t("stockEdit.enterDescription")}
            className="st-field-color st-placeholder-color"
          />
        </Form.Item>
        <Form.Item name="oldValue" label={t("stockEdit.stockAtHand")}>
          <Input
            className="st-field-color st-placeholder-color tw-w-full"
            readOnly
          />
        </Form.Item>
        <Form.Item name="qty" label={t("stockEdit.adjustment")}>
          <Input
            className="st-field-color st-placeholder-color tw-w-full"
            readOnly
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StockEdit;
