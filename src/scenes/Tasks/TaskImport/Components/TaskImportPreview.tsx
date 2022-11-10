import { Button, Modal, Table, Tooltip } from "antd";
import { ColumnProps } from "antd/lib/table";
import moment from "moment";
import React, { useContext } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { CustomField, Task, User } from "types";
import UserContext from "UserContext";
import {
  getCustomerName,
  getRandomAlphaNumericString,
  getUsername,
} from "utils/helpers";

interface TaskImportPreviewProps extends WithTranslation {
  visible: boolean;
  tasks: Task[];
  handleClose: () => void;
  doImportTasks: () => void;
}
interface TaskColumnProps extends ColumnProps<Task> {
  title: JSX.Element;
}

const TaskImportPreview = ({
  t,
  visible,
  tasks,
  handleClose,
  doImportTasks,
}: TaskImportPreviewProps) => {
  const { firm = {} }: any = useContext(UserContext);
  const { forms = {} } = firm;
  const { tasks: customFields } = forms;
  let cols = [
    {
      title: t("taskList.dueDate"),
      dataIndex: "endAt",
      render: (text: string) =>
        text && (
          <div className="tw-w-32">
            {text ? moment(text).format("D/MM/YYYY HH:mm") : ""}
          </div>
        ),
    },
    {
      title: t("taskList.customer"),
      dataIndex: "customerId",
      render: (text: any, record: Task) => {
        return (
          <span
            className="tw-truncate tw-p-1"
            title={getCustomerName(record.customer)}
            style={{
              maxWidth: "256px",
              backgroundColor: !!text ? "yellow" : "white",
            }}
          >
            {getCustomerName(record.customer)}
          </span>
        );
      },
    },
    {
      title: t("taskList.title"),
      dataIndex: "title",
      render: (text: string) => (
        <div className="tw-truncate" style={{ width: "400px" }} title={text}>
          {text}
        </div>
      ),
    },
    {
      title: t("taskList.assignee"),
      dataIndex: "assigneeIds",
      render: (_: any, { assignees = [] as User[] }) => {
        const names = assignees.map((user) => getUsername(user));
        return (
          <div className="tw-truncate" style={{ width: "400px" }}>
            <Tooltip
              title={
                <ul>
                  {names.map((name, index) => (
                    <li key={name}>{`${index + 1}. ${name}`}</li>
                  ))}
                </ul>
              }
            >
              {names.join(" | ")}
            </Tooltip>
          </div>
        );
      },
    },
    ...(customFields || []).map((field: CustomField) => ({
      title: field.label,
      dataIndex: field._id,
      render: (_: any, record: Task) => {
        let colField = record?.fields?.find(
          (item: CustomField) => item._id === field._id,
        );
        let returnValue = "";
        let width = "tw-w-64";
        if (!colField) {
          returnValue = "";
        } else if (colField.type === "date") {
          width = "tw-w-32";
          returnValue = colField.value
            ? moment(colField.value).format("DD/MM/YYYY HH:mm")
            : "";
        } else if (colField.type === "dropdown") {
          width = "tw-w-56";
          let val = colField.value || [];
          if (Array.isArray(val)) {
            val = val.join(", ");
          }
          returnValue = val;
        } else if (colField.type === "toggleSwitch") {
          width = "tw-w-16";
          returnValue =
            colField.value === true ? t("global.yes") : t("global.no");
        } else {
          returnValue = colField.value;
        }

        return (
          <div className={"tw-truncate " + width} title={returnValue}>
            {returnValue}
          </div>
        );
      },
    })),
  ];

  const columns: TaskColumnProps[] = cols.map((col) => ({
    ...col,
    title: <span className="s-col-title">{col.title}</span>,
    onCell: () => ({ className: "s-table-text" }),
  }));

  return (
    <Modal
      title={t("taskImport.previewTitle")}
      visible={visible}
      onCancel={handleClose}
      bodyStyle={{ padding: "12px 24px" }}
      footer={
        <div className="tw-flex tw-items-center tw-px-2">
          <p className="s-semibold tw-mr-auto">
            {t("taskImport.existingNote")}
          </p>
          <Button onClick={handleClose}>{t("global.cancel")}</Button>
          <Button type="primary" onClick={doImportTasks}>
            {t("taskImport.importTasks")}
          </Button>
        </div>
      }
      width={800}
    >
      <Table
        rowKey={() => getRandomAlphaNumericString(16)}
        columns={columns}
        dataSource={tasks}
        scroll={{ x: true }}
        pagination={{ pageSize: 50, hideOnSinglePage: true }}
      />
    </Modal>
  );
};

export default withTranslation()(TaskImportPreview);
