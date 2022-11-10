import { MinusCircleOutlined } from "@ant-design/icons";
import { Button, Empty, Form, Input, Popconfirm, Table } from "antd";
import { FormInstance } from "antd/lib/form";
import { ColumnProps } from "antd/lib/table";
import i18next from "i18next";
import React, { HTMLAttributes, ReactChildren, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";

import { ChecklistItem, SubtaskItem } from "../../../../../../types";

interface EditableContextProps {
  form: FormInstance;
}
const EditableContext = React.createContext({} as EditableContextProps);

interface EditableRowProps {}
const EditableFormRow = (props: EditableRowProps) => {
  const [form] = Form.useForm();
  return (
    <EditableContext.Provider value={{ form }}>
      <tr {...props} />
    </EditableContext.Provider>
  );
};
interface EditableCellProps extends WithTranslation {
  record: ChecklistItem | SubtaskItem;
  dataIndex: string;
  children: ReactChildren;
  editable: boolean;
  handleSave: (item: ChecklistItem | SubtaskItem) => void;
}

const EditableCell = ({
  record,
  dataIndex,
  children,
  handleSave,
  editable,
}: EditableCellProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const save = (form: FormInstance) => {
    form.validateFields().then(
      (values) => {
        setIsEditing((old) => !old);
        handleSave({ ...record, ...values });
      },
      () => null,
    );
  };

  const renderCell = (form: FormInstance) => {
    return isEditing ? (
      <Form form={form} name="checklist-item-edit-form">
        <Form.Item
          name={dataIndex}
          initialValue={record.title}
          rules={[
            {
              required: true,
              message: i18next.t("checklists.titleRequired"),
            },
          ]}
          style={{ margin: 0 }}
        >
          <Input
            onPressEnter={() => save(form)}
            onBlur={() => save(form)}
            autoFocus
          />
        </Form.Item>
      </Form>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingRight: 24 }}
        onClick={() => setIsEditing((old) => !old)}
      >
        {children}
      </div>
    );
  };

  return (
    <td>
      {editable ? (
        <EditableContext.Consumer>
          {({ form }) => renderCell(form)}
        </EditableContext.Consumer>
      ) : (
        children
      )}
    </td>
  );
};

interface ItemsTableProps extends WithTranslation {
  items: ChecklistItem[] | SubtaskItem[];
  selectAble: boolean;
  addItem: (item: ChecklistItem | SubtaskItem) => void;
  updateItem: (item: ChecklistItem | SubtaskItem) => void;
  deleteItem: (_id: string) => void;
}

const ItemsTable = ({
  items,
  selectAble = false,
  addItem,
  updateItem,
  deleteItem,
  t,
}: ItemsTableProps) => {
  const columnsSchema = [
    {
      dataIndex: "title",
      editable: true,
    },
    {
      width: "10%",
      className: "text-right",
      render: (text: string, record: ChecklistItem) =>
        items.length >= 1 ? (
          <Popconfirm
            title={t("global.deleteSurety")}
            onConfirm={() => deleteItem(record._id || "")}
            okText={t("global.delete")}
            okButtonProps={{ danger: true }}
            cancelText={t("global.cancel")}
          >
            <MinusCircleOutlined className="checklist-delete" />
          </Popconfirm>
        ) : null,
    },
  ];

  const components = {
    body: {
      row: EditableFormRow,
      cell: EditableCell,
    },
  };
  interface ChecklistColProps
    extends ColumnProps<ChecklistItem | SubtaskItem> {}

  const columns: ChecklistColProps[] = columnsSchema.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: ChecklistItem | SubtaskItem) =>
        ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          handleSave: (row: ChecklistItem | SubtaskItem) => updateItem(row),
        } as HTMLAttributes<HTMLElement>),
    };
  });
  const rowSelection = {
    selectedRowKeys: (items as ChecklistItem[]).reduce(
      (a, c) => (c.isDone ? [...a, c._id || ""] : a),
      [] as string[],
    ),
    onSelect: (record: ChecklistItem, selected: boolean) => {
      updateItem({ ...record, isDone: selected });
    },
  };
  return (
    <div>
      <Table
        components={components}
        rowClassName={() => "editable-row checklist-rows"}
        dataSource={items ? items : []}
        columns={columns}
        showHeader={false}
        bordered={false}
        rowKey={(record) => record._id || ""}
        rowSelection={selectAble ? rowSelection : undefined}
        pagination={false}
        className="checklist checklist-px-0"
        locale={{
          emptyText: <Empty description={t("tables.noData")} />,
        }}
      />
      <Button
        type="link"
        onClick={() =>
          addItem({ title: t("checklists.editItem") } as ChecklistItem)
        }
        className="tw-text-sm tw-px-0"
      >
        {t("templates.addItem")}
      </Button>
    </div>
  );
};

export default withTranslation()(ItemsTable);
