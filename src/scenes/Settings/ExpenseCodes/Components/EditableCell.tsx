import { Form, Input } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";

import { EditableRowContext } from "./EditableRowContext";

interface EditableCellProps {
  editable: boolean;
  dataIndex: string;
  children: JSX.Element;
}

const EditableCell = ({
  editable,
  dataIndex,
  children,
  ...restProps
}: EditableCellProps) => {
  const [t] = useTranslation();

  return (
    <EditableRowContext.Consumer>
      {({ isEditing }) => (
        <td {...restProps}>
          {editable && isEditing ? (
            <Form.Item
              name={dataIndex}
              rules={[{ required: true, message: t("Title is required") }]}
              className="tw-mb-0"
            >
              <Input />
            </Form.Item>
          ) : (
            children
          )}
        </td>
      )}
    </EditableRowContext.Consumer>
  );
};

export default EditableCell;
