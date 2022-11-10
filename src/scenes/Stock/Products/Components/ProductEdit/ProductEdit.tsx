import { WarningOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Col,
  Form,
  FormItemProps,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  message,
} from "antd";
import logger from "logger";
import mixpanel from "mixpanel-browser";
import { debounce } from "rambdax";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FirmService,
  StockFilesService,
  StockItemService,
  StockTransactionService,
} from "services";
import {
  CustomField,
  PaginatedFeathersResponse,
  StockItem,
  UploadedFile,
  UserContextType,
} from "types";
import UserContext from "UserContext";
import ElasticSearchField from "utils/components/ElasticSearchField";
import {
  getCustomFieldRules,
  mapCustomFieldValuesToFormFields,
  mapFormFieldValuesToCustomFields,
} from "utils/helpers";
import getFieldInput from "utils/helpers/getFieldInput";

import StockFiles from "./StockFiles";
import StockTags from "./StockTags";

const uoms = {
  KG: "KG",
  PEICES: "Adet",
  DOZEN: "Düzine",
  BOX: "Kutu",
  BAG: "Torba",
  BARREL: "Varil",
  PACKAGE: "Paket",
  ROLL: "Rulo",
  ENVELOPE: "Zarf",
  METER: "Metre",
  LITRE: "Litre",
};

interface ProductEditProps {
  visible: boolean;
  handleClose: () => void;
  editedRecord: StockItem;
}

const ProductEdit = ({
  visible,
  handleClose,
  editedRecord,
}: ProductEditProps) => {
  const [t] = useTranslation();
  const [form] = Form.useForm<StockItem>();
  const { getFieldValue } = form;
  const { firm } = useContext(UserContext) as UserContextType;
  const { stockTags = [] } = firm;
  const firmCustomFields: CustomField[] = React.useMemo(
    () =>
      (firm?.forms?.stockItems || []).sort((a, b) =>
        a?.rank > b?.rank ? 1 : -1,
      ),
    [firm?.forms?.stockItems],
  );
  const [loading, setLoading] = useState(false);
  const [changes, setChanges] = useState({} as StockItem);
  const [stockFiles, setStockFiles] = useState([] as UploadedFile[]);
  const [serialNumberDuplicate, setSerialNumberDuplicate] = useState(0);
  const inputRef = useRef<any>();
  const [editingTags, setEditingTags] = useState(false);

  const postSuccessChecks = (
    res: StockItem,
    reqType: "update" | "create",
    toId?: string,
    qty?: number,
  ) => {
    if (reqType === "create") {
      if (res.type === "product" && !!toId && !!qty) {
        StockTransactionService.create({
          type: "add",
          toId,
          qty,
          productId: res._id,
        }).catch((error: Error) => {
          logger.error("Error in transaction: ", error);
          message.error({
            content: t("stockTransaction.failed"),
          });
        });
      }
    }

    stockFiles.forEach((item) => {
      const data = { ...item, stockItemId: res._id };
      StockFilesService.create(data).catch(() =>
        message.error("Could not upload file"),
      );
    });

    if (Array.isArray(res.tags) && res.tags.length) {
      const oldTags = stockTags.map((item) =>
        item?.title?.toLowerCase()?.trim(),
      );
      const newTags = res.tags
        .filter((tag = "") => !oldTags.includes(tag?.toLowerCase()?.trim()))
        .map((item) => ({ title: item }));
      if (newTags.length > 0) {
        FirmService.patch(firm._id, {
          $push: { stockTags: newTags },
        }).catch((error: Error) =>
          logger.error("Could not update stock tags: ", error),
        );
      }
    }
    mixpanel.track(`Product ${reqType}ed`, {
      _id: res._id,
    });
    closeModal();
    setLoading(false);
  };

  const handleSubmit = () => {
    form.validateFields().then(
      (values) => {
        // @ts-ignore
        const { _id, toId, qty, ...rest } = values;
        setLoading(true);
        if (_id) {
          StockItemService.patch(_id, changes).then(
            (res: StockItem) => {
              message.success(t("products.saveSuccess"));
              postSuccessChecks(res, "update");
            },
            (error: Error) => {
              logger.error("Error in updating product: ", error);
              message.error(t("products.saveError"));
              setLoading(false);
            },
          );
        } else {
          StockItemService.create(rest).then(
            (res: StockItem) => {
              message.success(t("products.saveSuccess"));
              postSuccessChecks(res, "create", toId, qty);
            },
            (error: Error) => {
              logger.error("Error in creating product: ", error);
              message.error(t("products.saveError"));
              setLoading(false);
            },
          );
        }
      },
      (error) => logger.error("Can't save product: ", error),
    );
  };

  const handleChange = (changes: StockItem, all: StockItem) => {
    let newChanges = {} as StockItem;
    const { fields: fieldsChanged, ...rest } = changes;
    if (fieldsChanged) {
      const { fields: cFields } = all;
      const fields = mapFormFieldValuesToCustomFields(
        firmCustomFields,
        cFields,
      );
      const fieldsData = { fields };
      newChanges = Object.assign({}, newChanges, fieldsData);
    }
    newChanges = Object.assign({}, newChanges, rest);
    setChanges((old) => ({ ...old, ...newChanges }));
  };

  const checkSerialNo = (barcode: string) => {
    StockItemService.find({
      query: { barcode, $limit: 0 },
    }).then(
      (res: PaginatedFeathersResponse<StockItem>) =>
        setSerialNumberDuplicate(res.total),
      () => null,
    );
  };

  const closeModal = () => {
    setChanges({} as StockItem);
    setStockFiles([]);
    setSerialNumberDuplicate(0);
    handleClose();
  };

  useEffect(() => {
    inputRef.current = debounce(checkSerialNo, 500);
  }, []);

  useEffect(() => {
    if (visible) {
      const {
        _id,
        title,
        purchasePrice,
        unitPrice,
        taxRate = 18,
        unitOfMeasurement,
        barcode,
        tags,
        fields = [],
      } = editedRecord || {};

      const customFields = mapCustomFieldValuesToFormFields(
        firmCustomFields,
        fields,
      );

      const formFields = ({
        _id,
        title,
        purchasePrice,
        unitPrice,
        taxRate: !editedRecord._id ? 18 : taxRate,
        unitOfMeasurement,
        barcode,
        tags,
        type: "product",
        toId: undefined,
        qty: undefined,
        ...customFields,
      } as unknown) as StockItem;

      form.setFieldsValue(formFields);
      setChanges({} as StockItem);
      setStockFiles([] as UploadedFile[]);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <>
      <Modal
        title={
          <span className="s-modal-title tw-mx-4">
            {t("addProduct.pageTitle")}
          </span>
        }
        visible={visible}
        onCancel={closeModal}
        cancelText={t("global.cancel")}
        okText={t("global.save")}
        onOk={handleSubmit}
        okButtonProps={{
          loading,
          disabled: loading,
          className: "s-btn-spinner-align tw-mr-2",
          icon: serialNumberDuplicate > 0 ? <WarningOutlined /> : undefined,
        }}
        width={600}
        bodyStyle={{ padding: "24px 40px" }}
        destroyOnClose
      >
        {serialNumberDuplicate > 0 ? (
          <Alert
            type="warning"
            icon={<WarningOutlined />}
            message={`${serialNumberDuplicate} ${t("stock.duplicateBarcode")}`}
            className="tw-mb-5"
            showIcon
          />
        ) : null}

        <Form onValuesChange={handleChange} layout="vertical" form={form}>
          <Form.Item name="type" noStyle hidden>
            <Input />
          </Form.Item>
          <Form.Item name="_id" noStyle hidden>
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="title"
                label={
                  <span className="s-main-font s-label-color">
                    {t("addProduct.productName")}
                  </span>
                }
                rules={[{ required: true, message: t("global.requiredField") }]}
              >
                <Input
                  className="st-field-color st-placeholder-color"
                  placeholder={t("addProduct.productNamePlaceholder")}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="barcode"
                label={
                  <span className="s-main-font s-label-color">
                    {t("addProduct.serialNumber")}
                  </span>
                }
              >
                <Input
                  className="st-field-color st-placeholder-color"
                  placeholder={t("addProduct.serialNumberPlaceholder")}
                  onChange={(e) => inputRef.current(e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="unitOfMeasurement"
                label={
                  <span className="s-main-font s-label-color">
                    {t("addProduct.unit")}
                  </span>
                }
                rules={[{ required: true, message: t("global.requiredField") }]}
              >
                <Select
                  className="st-field-color st-placeholder-color"
                  placeholder={t("addProduct.unitPlaceholder")}
                  showSearch
                  filterOption={(input, option) =>
                    option?.props?.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {Object.values(uoms).map((uom) => (
                    <Select.Option key={uom} value={uom}>
                      {uom}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="purchasePrice"
                label={
                  <span className="s-main-font s-label-color">
                    {t("products.purchasePrice")}
                  </span>
                }
                rules={[{ required: true, message: t("global.requiredField") }]}
              >
                <InputNumber
                  className="tw-w-full st-field-color st-placeholder-color"
                  placeholder={t("products.enterPurchasePrice")}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="unitPrice"
                label={
                  <span className="s-main-font s-label-color">
                    {t("products.salesPrice")}
                  </span>
                }
                rules={[{ required: true, message: t("global.requiredField") }]}
              >
                <InputNumber
                  className="tw-w-full st-field-color st-placeholder-color"
                  placeholder={t("addProduct.pricePlaceholder")}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="taxRate"
                label={
                  <span className="s-main-font s-label-color">
                    {t("products.taxRate")}
                  </span>
                }
                rules={[{ required: true, message: t("global.requiredField") }]}
              >
                <Select
                  placeholder={t("products.enterTaxRate")}
                  className="st-field-color st-placeholder-color tw-w-full"
                >
                  <Select.Option value={18}>18%</Select.Option>
                  <Select.Option value={8}>8%</Select.Option>
                  <Select.Option value={1}>1%</Select.Option>
                  <Select.Option value={0}>0%</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="tags"
                label={
                  <span className="s-main-font s-label-color">
                    {t("addProduct.tags")}
                  </span>
                }
              >
                <Select
                  className="st-field-color st-placeholder-color s-tags-color"
                  mode="tags"
                  placeholder={t("addProduct.tagsPlaceholder")}
                >
                  {stockTags.map((stockTag) => (
                    <Select.Option key={stockTag._id} value={stockTag.title}>
                      {stockTag.title}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label=" ">
                <Button
                  type="dashed"
                  onClick={() => setEditingTags(true)}
                  block
                >
                  {t("stockTags.manage")}
                </Button>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            {Array.isArray(firmCustomFields)
              ? firmCustomFields.map((field) => {
                  const rules = getCustomFieldRules(field);
                  let additionalProps = { rules } as FormItemProps;
                  if (field.type === "toggleSwitch") {
                    additionalProps = {
                      ...additionalProps,
                      valuePropName: "checked",
                    };
                  }

                  return (
                    <Col span={12} key={field._id}>
                      <Form.Item
                        name={["fields", field._id || ""]}
                        {...additionalProps}
                        key={field._id}
                        label={
                          <span className="s-main-font s-label-color">
                            {field.label}
                          </span>
                        }
                      >
                        {getFieldInput(field)}
                      </Form.Item>
                    </Col>
                  );
                })
              : null}
          </Row>
          {!editedRecord?._id ? (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="toId"
                  label={
                    <span className="s-main-font s-label-color">
                      {t(t("addStock.warehouse"))}
                    </span>
                  }
                  rules={[
                    {
                      required: !!getFieldValue("qty"),
                      message: t("addProduct.qtyRequired"),
                    },
                  ]}
                >
                  <ElasticSearchField
                    entity="stock/bins"
                    className="st-field-color st-placeholder-color"
                    placeholder={t("addStock.warehousePlaceholder")}
                    currentValue={[]}
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
              <Col span={12}>
                <Form.Item
                  name="qty"
                  label={
                    <span className="s-main-font s-label-color">
                      {t("addStock.quantity")}
                    </span>
                  }
                  rules={[
                    {
                      required: !!getFieldValue("toId"),
                      message: t("addProducts.warehouseRequired"),
                    },
                  ]}
                >
                  <InputNumber
                    className="st-field-color st-placeholder-color tw-w-full"
                    placeholder={t("addStock.quantityPlaceholder")}
                  />
                </Form.Item>
              </Col>
            </Row>
          ) : null}
        </Form>
        <StockFiles
          stockItemId={editedRecord._id}
          saveFileOffline={(file) => setStockFiles((old) => [...old, file])}
          removeOffline={(uid) =>
            setStockFiles((old) => old.filter((item) => item.uid !== uid))
          }
        />
      </Modal>
      <StockTags
        visible={editingTags}
        handleClose={() => setEditingTags(false)}
      />
    </>
  );
};

export default ProductEdit;
