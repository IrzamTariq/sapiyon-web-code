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

interface AddStockProps extends WithTranslation {
  visible: boolean;
  handleClose: () => void;
}

const AddStock = ({ visible, handleClose, t }: AddStockProps) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    form.resetFields();
    if (visible) {
      form.setFieldsValue({
        stocks: [{}],
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleAddStock = () => {
    form.validateFields().then(
      (values) => {
        setIsLoading(true);
        message.loading({
          content: t("stockTransaction.inProgress"),
          duration: 0,
          key: "stockTrsansaction",
        });
        const { stocks = [] } = values;
        const data = stocks.reduce((acc: StockTransaction[], curr: any) => {
          const {
            qty,
            productId: { value: productId },
            toId: { value: toId },
          } = curr;
          return [...acc, { type: "add", qty, productId, toId }];
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
      title={<span className="s-text-dark">{t("addStock.pageTitle")}</span>}
      visible={visible}
      onOk={handleAddStock}
      onCancel={handleClose}
      okText={t("global.ok")}
      cancelText={t("global.cancel")}
      width={1000}
      bodyStyle={{ padding: "12px 24px" }}
      okButtonProps={{
        className: "tw-mr-2",
        disabled: isLoading,
        loading: isLoading,
      }}
    >
      <Form form={form} labelCol={{ span: 24 }} scrollToFirstError>
        <Row gutter={[12, 12]} className="tw-mb-4">
          <Col span={9}>{t("addStock.productName")}</Col>
          <Col span={4}>{t("addStock.quantity")}</Col>
          <Col span={9}>{t("addStock.warehouse")}</Col>
        </Row>
        <Form.List name="stocks">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => (
                <Row gutter={[12, 12]} key={getRandomAlphaNumericString()}>
                  <Col span={9}>
                    <Form.Item
                      name={[field.name, "productId"]}
                      className="s-label-margin"
                      rules={[
                        { required: true, message: t("global.requiredField") },
                      ]}
                    >
                      <ElasticSearchField
                        entity="stock/items"
                        className="st-field-color st-placeholder-color"
                        placeholder={t("addStock.productNamePlaceholder")}
                        currentValue={[]}
                        labelInValue
                        extraQuery={{ type: "product" }}
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
                  <Col span={4}>
                    <Form.Item
                      name={[field.name, "qty"]}
                      className="s-label-margin"
                      rules={[
                        { required: true, message: t("global.requiredField") },
                      ]}
                    >
                      <InputNumber
                        className="st-field-color st-placeholder-color tw-w-full"
                        placeholder={t("addStock.quantityPlaceholder")}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={9}>
                    <Form.Item
                      name={[field.name, "toId"]}
                      className="s-label-margin"
                      rules={[
                        { required: true, message: t("global.requiredField") },
                      ]}
                    >
                      <ElasticSearchField
                        entity="stock/bins"
                        className="st-field-color st-placeholder-color"
                        placeholder={t("addStock.warehousePlaceholder")}
                        currentValue={[]}
                        labelInValue
                        renderOptions={(items = []) =>
                          items.map((item) => (
                            <Select.Option key={item._id} value={item._id}>
                              {item.title}
                            </Select.Option>
                          ))
                        }
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
                {t("stockTransactions.addMore")}
              </Button>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default withTranslation()(AddStock);
