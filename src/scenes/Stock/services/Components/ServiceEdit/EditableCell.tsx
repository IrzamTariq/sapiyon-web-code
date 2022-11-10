import { Form, Input, InputNumber } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";

import { EditableContext } from "./EditableRow";

interface EditableCellProps {
  dataIndex: string;
  children: JSX.Element;
  title: string;
  editable?: boolean;
}

const EditableCell = ({
  dataIndex,
  children,
  editable,
  title,
  ...restProps
}: EditableCellProps) => {
  const [t] = useTranslation();

  const getInput = (dataIndex: string) => {
    if (dataIndex === "title") {
      return <Input placeholder={t("services.enterTitle")} />;
    } else if (dataIndex === "unitPrice") {
      return (
        <InputNumber
          placeholder={t("services.enterPrice")}
          className="tw-w-full"
        />
      );
    } else {
      return <Input placeholder={t("services.enterDescription")} />;
    }
  };

  return (
    <EditableContext.Consumer>
      {({ isEditing }) => (
        <td {...restProps}>
          {editable && isEditing ? (
            <Form.Item
              name={dataIndex}
              rules={[
                {
                  required: true,
                  message: `${t("global.inputMessage")} ${title}`,
                },
              ]}
              style={{ margin: 0 }}
            >
              {getInput(dataIndex as string)}
            </Form.Item>
          ) : (
            children
          )}
        </td>
      )}
    </EditableContext.Consumer>
  );
};

export default EditableCell;
