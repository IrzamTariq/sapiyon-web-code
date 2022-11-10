import { Button, Empty, Popconfirm, Table, message } from "antd";
import logger from "logger";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FirmService } from "services";
import { ExpenseCode, Firm, UserContextType } from "types";
import UserContext from "UserContext";
import { getRandomAlphaNumericString } from "utils/helpers";

import EditableCell from "./EditableCell";
import EditableRow, { EditableRowContext } from "./EditableRowContext";

const ExpenseCodes = () => {
  const [t] = useTranslation();
  const [data, setData] = useState([] as ExpenseCode[]);
  const [editedId, setEditedId] = useState("");
  const { firm = {} as Firm } = useContext(UserContext) as UserContextType;

  const saveExpenseCode = (code: ExpenseCode) => {
    const { _id, label } = code;
    let data = { label } as any;
    if (_id?.startsWith("NEW")) {
      data = { ...data, action: "createExpenseCode" };
    } else {
      data = { ...data, action: "updateExpenseCode", expenseCodeId: _id };
    }

    FirmService.patch(firm._id, data).then(
      (res: Firm) => {
        setData(res?.expenseCodes || []);
        setEditedId("");
      },
      (error: Error) => {
        message.error("Error in saving expense code");
        logger.error("Could not save expense code: ", error);
      },
    );
  };
  const addExpenseCode = () => {
    const _id = `NEW-${getRandomAlphaNumericString()}`;
    setData((old) => [
      ...old,
      {
        _id,
        label: "Edit expense code label",
      },
    ]);
    setEditedId(_id);
  };
  const cancelEditing = () => {
    if (editedId?.startsWith("NEW")) {
      setData((old) => old.filter((item) => !item?._id?.startsWith("NEW")));
    }
    setEditedId("");
  };
  const removeExpenseCode = (_id: string) => {
    let data = { expenseCodeId: _id, action: "removeExpenseCode" };

    FirmService.patch(firm._id, data).then(
      (res: Firm) => setData(res?.expenseCodes || []),
      (error: Error) => {
        message.error("Error in removing expense code");
        logger.error("Error in removing expense code: ", error);
      },
    );
  };

  const cols = [
    {
      title: t("taskStatus.title"),
      dataIndex: "label",
      width: "70%",
      editable: true,
    },
    {
      render: (_: any, record: ExpenseCode) => {
        return editedId === record._id ? (
          <span>
            <EditableRowContext.Consumer>
              {({ saveRecord }) => (
                <Button type="link" onClick={saveRecord}>
                  {t("global.save")}
                </Button>
              )}
            </EditableRowContext.Consumer>
            <Popconfirm
              title={t("settings.cancelMsg")}
              onConfirm={cancelEditing}
              okText={t("global.ok")}
              cancelText={t("global.cancel")}
              okButtonProps={{ danger: true }}
            >
              <Button type="link">{t("global.cancel")}</Button>
            </Popconfirm>
          </span>
        ) : (
          <>
            <Button
              type="link"
              className="s-gray-action"
              disabled={!!editedId}
              onClick={() => setEditedId(record._id)}
            >
              {t("global.edit")}
            </Button>
            <Popconfirm
              title={t("settings.deleteMsg")}
              onConfirm={() => removeExpenseCode(record._id)}
              okText={t("global.delete")}
              okButtonProps={{ danger: true }}
              cancelText={t("global.cancel")}
            >
              <Button
                type="link"
                className="s-gray-action"
                disabled={!!editedId}
              >
                {t("global.delete")}
              </Button>
            </Popconfirm>
          </>
        );
      },
    },
  ];

  const columns = cols.map((col) => ({
    ...col,
    title: <span className="s-col-title">{col.title}</span>,
    onCell: () => ({
      className: "s-table-text",
      editable: col.editable,
      dataIndex: col.dataIndex,
    }),
  }));

  const component = { body: { row: EditableRow, cell: EditableCell } };

  useEffect(() => {
    setData(firm?.expenseCodes || []);
  }, [firm]);

  return (
    <>
      <Table
        columns={columns}
        dataSource={data}
        components={component}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
        rowKey="_id"
        onRow={(expenseCode) =>
          ({
            expenseCode,
            saveExpenseCode,
            isEditing: expenseCode._id === editedId,
          } as React.HTMLAttributes<HTMLElement>)
        }
        rowClassName="editable-row"
        className="s-style-validation-msg"
        locale={{
          emptyText: <Empty description={t("tables.noData")} />,
        }}
      />
      <Button
        type="primary"
        className="tw-w-56 tw-mt-5 light-add-btn"
        onClick={addExpenseCode}
        disabled={!!editedId}
      >
        + {t("settings.addNewField")}
      </Button>
    </>
  );
};

export default ExpenseCodes;
