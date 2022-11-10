import { Form, Input } from "antd";
import React, { useEffect } from "react";
import { ExpenseCode } from "types";

interface EditableRowContextProps {
  isEditing: boolean;
  saveRecord: () => void;
}

export const EditableRowContext = React.createContext(
  {} as EditableRowContextProps,
);

interface EditableRowProps {
  isEditing: boolean;
  expenseCode: ExpenseCode;
  saveExpenseCode: (record: ExpenseCode) => void;
}

const EditableRow = ({
  expenseCode,
  isEditing,
  saveExpenseCode,
  ...props
}: EditableRowProps) => {
  const [form] = Form.useForm();

  const submitForm = () => {
    form.validateFields().then(saveExpenseCode);
  };

  useEffect(() => {
    if (isEditing) {
      form.setFieldsValue(expenseCode);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  return (
    <Form form={form} component={false}>
      <EditableRowContext.Provider
        value={{ saveRecord: submitForm, isEditing }}
      >
        <tr {...props} />
        {isEditing ? (
          <tr>
            <td className="tw-hidden">
              <Form.Item name="_id" noStyle hidden>
                <Input />
              </Form.Item>
            </td>
          </tr>
        ) : null}
      </EditableRowContext.Provider>
    </Form>
  );
};

export default EditableRow;
