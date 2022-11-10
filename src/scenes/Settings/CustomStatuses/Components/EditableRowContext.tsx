import { Form, Input } from "antd";
import logger from "logger";
import React, { useEffect } from "react";
import { TaskStatus } from "types";

interface EditableRowProps {
  isEditing: boolean;
  record: TaskStatus;
  saveStatus: (status: TaskStatus) => void;
}
interface EditableRowContextProps {
  isEditing: boolean;
  submitForm: () => void;
}

export const EditableRowContext = React.createContext(
  {} as EditableRowContextProps,
);

const EditableRow = ({
  isEditing,
  saveStatus,
  record,
  ...props
}: EditableRowProps) => {
  const [form] = Form.useForm();
  const submitForm = () => {
    form.validateFields().then(
      (values) => saveStatus(values),
      (error: Error) =>
        logger.error("Error in validating status form: ", error),
    );
  };

  useEffect(() => {
    if (isEditing) {
      const { _id, title } = record;
      form.setFieldsValue({ _id, title });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  return (
    <Form form={form} component={false}>
      <EditableRowContext.Provider value={{ isEditing, submitForm }}>
        <tr {...props} />
        {isEditing ? (
          <tr className="tw-hidden">
            <td>
              <Form.Item
                name="_id"
                rules={[{ required: true, message: "Status id is required" }]}
              >
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
