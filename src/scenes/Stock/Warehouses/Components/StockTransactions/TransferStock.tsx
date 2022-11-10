import { DeleteRowOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Form,
  InputNumber,
  Modal,
  Row,
  Select,
  message,
} from "antd";
import React, { useEffect, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { StockTransactionService } from "services";
import { StockTransaction } from "types";
import { getRandomAlphaNumericString } from "utils/helpers";

import ElasticSearchField from "../../../../../utils/components/ElasticSearchField";

interface TransferStockProps extends WithTranslation {
  visible: boolean;
  handleClose: () => void;
}

const TransferStock = ({ visible, handleClose, t }: TransferStockProps) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    form.resetFields();
    if (visible) {
      form.setFieldsValue({ stocks: [{}] });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleStockTransfer = () => {
    form.validateFields().then(
      (values) => {
        setIsLoading(true);
        message.loading({
          content: t("stockTransaction.inProgress"),
          duration: 0,
          key: "stockTrsansaction",
        });
        const {
          stocks = [],
          fromId: { value: fromId },
          toId: { value: toId },
        } = values;
        const data = stocks.reduce((acc: StockTransaction[], curr: any) => {
          const {
            qty,
            productId: { value: productId },
          } = curr;
          return [...acc, { type: "transfer", qty, productId, toId, fromId }];
        }, []);
        StockTransactionService.create(data).then(
          (res: any) => {
            handleClose();
            setIsLoading(false);
            message.success({
              content: t("stockTransaction.complete"),
              key: "stockTrsansaction",
            });
          },
          (error: Error) => {
            // eslint-disable-next-line no-console
            console.log("Error in transaction: ", error);
            setIsLoading(false);
            message.error({
              content: t("stockTransaction.failed"),
              key: "stockTrsansaction",
            });
          },
        );
      },
      (errors) => null,
    );
  };

  return (
    <Modal
      title={
        <span className="s-text-dark">{t("transferProduct.pageTitle")}</span>
      }
      visible={visible}
      onCancel={handleClose}
      onOk={handleStockTransfer}
      okText={t("global.ok")}
      cancelText={t("global.cancel")}
      width={1000}
      okButtonProps={{
        className: "tw-mr-2",
        disabled: isLoading,
        loading: isLoading,
      }}
      bodyStyle={{ padding: "12px 24px" }}
    >
      <Form form={form} labelCol={{ span: 24 }} requiredMark={false}>
        <Row gutter={[12, 12]}>
          <Col span={12}>
            <Form.Item
              name="fromId"
              label={t("transferProduct.fromWarehouse")}
              className="s-label-margin"
              rules={[{ required: true, message: t("global.requiredField") }]}
            >
              <ElasticSearchField
                entity="stock/bins"
                className="st-field-color st-placeholder-color"
                placeholder={t("addStock.warehousePlaceholder")}
                currentValue={[]}
                labelInValue
                renderOptions={(items = []) =>
                  items
                    .filter(
                      (bin) => bin._id !== form.getFieldValue("toId")?.value,
                    )
                    .map((item) => (
                      <Select.Option key={item._id} value={item._id}>
                        {item.title}
                      </Select.Option>
                    ))
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="toId"
              label={t("transferProduct.toWarehouse")}
              className="s-label-margin"
              rules={[{ required: true, message: t("global.requiredField") }]}
            >
              <ElasticSearchField
                entity="stock/bins"
                className="st-field-color st-placeholder-color"
                placeholder={t("addStock.warehousePlaceholder")}
                currentValue={[]}
                labelInValue
                renderOptions={(items = []) =>
                  items
                    .filter(
                      (bin) => bin._id !== form.getFieldValue("fromId")?.value,
                    )
                    .map((item) => (
                      <Select.Option key={item._id} value={item._id}>
                        {item.title}
                      </Select.Option>
                    ))
                }
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[12, 12]} className="tw-mb-4">
          <Col span={12}>{t("transferProduct.productName")}</Col>
          <Col span={10}>{t("transferProduct.quantity")}</Col>
        </Row>
        <Form.List name="stocks">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => (
                <Row gutter={[12, 12]} key={getRandomAlphaNumericString()}>
                  <Col span={12}>
                    <Form.Item
                      name={[field.name, "productId"]}
                      rules={[
                        { required: true, message: t("global.requiredField") },
                      ]}
                    >
                      <ElasticSearchField
                        entity="stock/items"
                        className="st-field-color st-placeholder-color"
                        placeholder={t("addStock.productNamePlaceholder")}
                        currentValue={[]}
                        extraQuery={{ type: "product" }}
                        labelInValue
                        renderOptions={(items = []) =>
                          items.map((item) => (
                            <Select.Option key={item._id} value={item._id}>
                              {item.title}{" "}
                              {item.barcode ? `- ${item.barcode}` : ""}
                            </Select.Option>
                          ))
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col span={10}>
                    <Form.Item
                      name={[field.name, "qty"]}
                      rules={[
                        { required: true, message: t("global.requiredField") },
                      ]}
                    >
                      <InputNumber
                        className="st-field-color st-placeholder-color tw-w-full"
                        min={1}
                        placeholder={t("addStock.quantityPlaceholder")}
                      />
                    </Form.Item>
                  </Col>
                  <Col
                    span={2}
                    className="tw-justify-end"
                    style={{ display: fields.length === 1 ? "none" : "flex" }}
                  >
                    <Button
                      onClick={() => remove(index)}
                      icon={<DeleteRowOutlined />}
                    />
                  </Col>
                </Row>
              ))}
              <Button onClick={() => add()} type="dashed" block>
                {t("stockTransactions.transferMore")}
              </Button>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default withTranslation()(TransferStock);
