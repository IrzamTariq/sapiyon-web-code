import { Form, Input, InputNumber } from "antd";
import { FormInstance } from "antd/lib/form";
import i18next from "i18next";
import React, { createContext, useEffect } from "react";

import { StockItem, TaskStockLine } from "../../types";
import UserContext from "../../UserContext";
import {
  getTotalWithTax,
  getUnitPriceFromGrossTotal,
} from "../../utils/helpers";

interface formContextWrapperProps {
  form: FormInstance;
  record: TaskStockLine;
  isEditing: boolean;
  saveStock: () => void;
  handleChange: (fieldName: string, value: string | number) => void;
  canEdit: boolean;
}

interface EditableRowProps {
  form: FormInstance;
  record: TaskStockLine;
  isEditing: boolean;
  submitStockForm: (stock: TaskStockLine) => void;
}
export const EditableRowContext = createContext({} as formContextWrapperProps);

const EditableRow: React.FC<EditableRowProps> = ({
  record,
  isEditing,
  submitStockForm,
  ...props
}) => {
  const [form] = Form.useForm();
  useEffect(() => {
    if (isEditing) {
      const {
        _id,
        itemId,
        item,
        unitPrice = 0.0,
        qty = 1,
        taxPercentage = 18,
        purchasePrice = 0,
      } = record || {};

      form.setFieldsValue({
        _id,
        itemId,
        item,
        unitPrice,
        qty,
        taxPercentage,
        purchasePrice,
        cost: getTotalWithTax(record).toFixed(2),
        activeField: "unitPrice",
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);
  const { getFieldsValue, setFieldsValue, validateFields } = form;

  const handleChange = (fieldName: string, value: string | number) => {
    const allFields = getFieldsValue();
    const editedRecord = { ...allFields, [fieldName]: value };
    const activeField =
      fieldName === "cost" || fieldName === "unitPrice"
        ? fieldName
        : editedRecord.activeField;
    if (fieldName === "qty") {
      setFieldsValue({
        ...editedRecord,
        activeField,
        cost: getTotalWithTax(editedRecord as TaskStockLine).toFixed(2),
      });
    } else if (activeField === "cost") {
      setFieldsValue({
        ...editedRecord,
        activeField,
        unitPrice: getUnitPriceFromGrossTotal(
          editedRecord as TaskStockLine,
        ).toFixed(2),
      });
    } else {
      setFieldsValue({
        ...editedRecord,
        activeField,
        cost: getTotalWithTax(editedRecord as TaskStockLine).toFixed(2),
      });
    }
  };

  const saveStock = () => {
    validateFields().then(
      (values) => {
        const {
          unitPrice,
          qty,
          taxPercentage,
          purchasePrice = 0,
          cost,
          item,
          _id,
          itemId,
        } = values;
        const {
          unitPrice: defaultUnitPrice,
          taxRate = 18,
          purchasePrice: defaultPurchasePrice = 0,
        } = (item || {}) as StockItem;
        const newItem = {
          item,
          _id,
          itemId,
          qty: qty ?? 1,
          cost,
          unitPrice: unitPrice ?? defaultUnitPrice,
          taxPercentage: taxPercentage ?? taxRate,
          purchasePrice: purchasePrice ?? defaultPurchasePrice,
        };
        submitStockForm(newItem);
      },
      () => null,
    );
  };

  return (
    <UserContext.Consumer>
      {({ hasPermission }: any) => (
        <EditableRowContext.Provider
          value={{
            form,
            record,
            isEditing,
            handleChange,
            saveStock,
            canEdit: hasPermission("canEditStockPrice"),
          }}
        >
          <Form name="stock-selling-form" form={form} component={false}>
            <tr {...props} className={isEditing ? "tw-h-20" : ""} />
            {isEditing ? (
              <tr style={{ display: "none" }}>
                <td>
                  <Form.Item
                    name="_id"
                    rules={[
                      {
                        required: true,
                        message: i18next.t("No record ID!"),
                      },
                    ]}
                    noStyle
                    hidden
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item name="purchasePrice" noStyle hidden>
                    <InputNumber />
                  </Form.Item>
                  <Form.Item
                    name="item"
                    rules={[{ required: true }]}
                    noStyle
                    hidden
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item name="activeField" noStyle hidden>
                    <Input />
                  </Form.Item>
                </td>
              </tr>
            ) : null}
          </Form>
        </EditableRowContext.Provider>
      )}
    </UserContext.Consumer>
  );
};
export default EditableRow;
