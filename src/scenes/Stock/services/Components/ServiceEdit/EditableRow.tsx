import { Form, FormInstance, Input } from "antd";
import React, { createContext, useEffect } from "react";

import { StockItem } from "../../../../../types/index";

interface EditableContextProps {
  record: StockItem;
  isEditing: boolean;
  onSubmit: () => void;
  form: FormInstance;
}
export const EditableContext = createContext<EditableContextProps>(
  {} as EditableContextProps,
);

interface EditableRowProps {
  record: StockItem;
  isEditing: boolean;
  handleSubmit: (record: StockItem) => void;
}

const EditableRow = ({
  record,
  isEditing,
  handleSubmit,
  ...restProps
}: EditableRowProps) => {
  const [form] = Form.useForm<StockItem>();

  const onSubmit = () => {
    form.validateFields().then(
      (values) => handleSubmit(values),
      () => null,
    );
  };

  useEffect(() => {
    if (isEditing) {
      const { _id, title, description, unitPrice } = record;
      form.setFieldsValue({
        _id,
        title,
        description,
        unitPrice,
        type: "service",
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  return (
    <EditableContext.Provider value={{ record, isEditing, onSubmit, form }}>
      <Form name="service-edit-form" form={form} component={false}>
        <tr {...restProps} />
        {isEditing ? (
          <tr hidden>
            <td>
              <Form.Item name="_id" rules={[{ required: true }]} hidden>
                <Input />
              </Form.Item>
              <Form.Item name="type" rules={[{ required: true }]} hidden>
                <Input />
              </Form.Item>
            </td>
          </tr>
        ) : null}
      </Form>
    </EditableContext.Provider>
  );
};

export default EditableRow;
