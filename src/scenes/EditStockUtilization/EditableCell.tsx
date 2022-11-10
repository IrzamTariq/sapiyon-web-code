import { Form, Input, Select } from "antd";
import { FormInstance } from "antd/lib/form";
import { ColumnProps } from "antd/lib/table";
import i18next from "i18next";
import React from "react";

import { StockItem, TaskStockLine } from "../../types";
import ElasticSearchField from "../../utils/components/ElasticSearchField";
import { getTotalWithTax } from "../../utils/helpers";
import { EditableRowContext } from "./EditableRowContext";

interface EditableCellProps extends ColumnProps<any> {
  dataIndex: "itemId" | "qty" | "unitPrice" | "taxPercentage" | "cost";
  editable: boolean;
}

const getMoreRules = (dataIndex: string) => {
  if (dataIndex === "qty") {
    return [
      {
        validator: (rule: any, value: number) =>
          Number.isFinite(+value) && value >= 1
            ? Promise.resolve()
            : Promise.reject(value ? "Qty should be 1 or more" : ""),
      },
    ];
  } else if (dataIndex === "unitPrice") {
    return [
      {
        validator: (rule: any, value: number) =>
          Number.isFinite(+value) && value >= 0
            ? Promise.resolve()
            : Promise.reject("Unit Price should be 0 or more"),
      },
    ];
  } else if (dataIndex === "cost") {
    return [
      {
        validator: (rule: any, value: number) =>
          Number.isFinite(+value) && value >= 0
            ? Promise.resolve()
            : Promise.reject("Cost should be 0 or more"),
      },
    ];
  } else {
    return [];
  }
};

const getInputField = (
  dataIndex: string,
  currentItem: StockItem,
  form: FormInstance,
  handleChange: (fieldName: string, value: string | number) => void,
  canEdit: boolean,
) => {
  const { setFieldsValue } = form;

  if (dataIndex === "itemId") {
    return (
      <ElasticSearchField
        entity="stock/items"
        className="st-placeholder-color st-field-color tw-w-full"
        placeholder={i18next.t("taskStock.selectStock")}
        currentValue={currentItem}
        extraQuery={{ withStockLevel: true }}
        renderOptions={(items = [] as StockItem[]) =>
          items.map((item: StockItem) => (
            <Select.Option key={item._id} value={item._id} item={item}>
              {item.title} {item.barcode ? `- ${item.barcode}` : ""}
            </Select.Option>
          ))
        }
        onChange={(itemId, option: any) => {
          if (option) {
            let item = option.props.item as StockItem;
            const rec = {
              item,
              unitPrice: item.unitPrice,
              taxPercentage: item.taxRate ?? 18,
              purchasePrice: item.purchasePrice || 0,
              qty: 1,
            } as TaskStockLine;
            setFieldsValue({
              ...rec,
              cost: getTotalWithTax(rec).toFixed(2),
            });
          }
        }}
      />
    );
  } else if (dataIndex === "qty") {
    return (
      <Input
        type="number"
        className="st-field-color st-placeholder-color tw-w-full"
        min={1}
        placeholder={i18next.t("stockList.qty")}
        onChange={(number) => {
          const value = number.target.value;
          handleChange("qty", value);
        }}
      />
    );
  } else if (dataIndex === "unitPrice") {
    return (
      <Input
        type="number"
        min={0}
        className="st-field-color st-placeholder-color tw-w-full"
        placeholder={i18next.t("stockList.unitPrice")}
        readOnly={!canEdit}
        onChange={(number) => {
          const value = number.target.value;
          handleChange("unitPrice", value);
        }}
      />
    );
  } else if (dataIndex === "cost") {
    return (
      <Input
        type="number"
        min={0}
        className="st-field-color st-placeholder-color tw-w-full"
        placeholder={i18next.t("stockList.taxInPrice")}
        readOnly={!canEdit}
        onChange={(number) => {
          const value = number.target.value;
          handleChange("cost", value);
        }}
      />
    );
  } else if (dataIndex === "taxPercentage") {
    return (
      <Select
        placeholder={i18next.t("stockList.taxPercentage")}
        className="st-field-color st-placeholder-color tw-w-full"
        onSelect={(number = 18) => {
          const value = number;
          handleChange("taxPercentage", value as number);
        }}
      >
        <Select.Option value={18}>18%</Select.Option>
        <Select.Option value={8}>8%</Select.Option>
        <Select.Option value={1}>1%</Select.Option>
        <Select.Option value={0}>0%</Select.Option>
      </Select>
    );
  }
};

class EditableCell extends React.Component<EditableCellProps> {
  renderCell = (
    form: FormInstance,
    record: TaskStockLine,
    isEditing: boolean,
    handleChange: (fieldName: string, value: string | number) => void,
    canEdit: boolean,
  ) => {
    const { dataIndex, children } = this.props;

    return isEditing ? (
      <Form.Item
        name={dataIndex}
        rules={[
          {
            required: true,
            message: (
              <div className="s-style-validation-msg">
                {i18next.t(`stockList.${dataIndex}Req`)}
              </div>
            ),
          },
          ...getMoreRules(dataIndex),
        ]}
        style={{ margin: 0 }}
      >
        {getInputField(dataIndex, record.item, form, handleChange, canEdit)}
      </Form.Item>
    ) : (
      <>{children}</>
    );
  };

  render() {
    const { editable, dataIndex, title, children, ...restProps } = this.props;

    return (
      <td {...restProps}>
        {editable ? (
          <EditableRowContext.Consumer>
            {({ form, record, isEditing, handleChange, canEdit }) =>
              this.renderCell(form, record, isEditing, handleChange, canEdit)
            }
          </EditableRowContext.Consumer>
        ) : (
          children
        )}
      </td>
    );
  }
}

export default EditableCell;
