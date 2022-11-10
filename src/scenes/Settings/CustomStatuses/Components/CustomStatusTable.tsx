import mixpanel from "analytics/mixpanel";
import { Button, Empty, Popconfirm, Table, message } from "antd";
import logger from "logger";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TaskStatusService } from "services";
import { PaginatedFeathersResponse, TaskStatus } from "types";
import ColorSelect, { colors } from "utils/components/ColorSelect";
import { getRandomAlphaNumericString } from "utils/helpers";
import { getTaskStatusLabel } from "utils/helpers/utils";

import EditableCell from "./EditableCell";
import EditableRow, { EditableRowContext } from "./EditableRowContext";

interface CustomStatusTableProps {
  category: "task" | "rfq" | "quote" | "invoice";
}

const CustomStatusTable = ({ category }: CustomStatusTableProps) => {
  const [t] = useTranslation();
  const [statuses, setStatuses] = useState<
    PaginatedFeathersResponse<TaskStatus>
  >({ data: [], total: 0, limit: 50, skip: 0 });

  const [isLoading, setIsLoading] = useState(false);
  const [editedId, setEditedId] = useState("");
  const [editedColor, setEditedColor] = useState("#ffffff");
  const components = { body: { cell: EditableCell, row: EditableRow } };

  const removeStatus = (statusId: string) => {
    TaskStatusService.remove(statusId).then(
      (res: TaskStatus) => {
        setStatuses((old) => ({
          ...old,
          data: old.data.filter((item) => item._id !== res._id),
        }));
        mixpanel.track("Status removed", { _id: res._id });
        message.success(t("status.removeSuccess"));
      },
      (error: Error) => {
        message.error(t("status.removeError"));
        logger.error(`Error in removing custom ${category} status: `, error);
      },
    );
  };
  const saveStatus = (status: TaskStatus) => {
    const { _id = "", ...rest } = status;
    if (_id && !_id.startsWith("NEW")) {
      TaskStatusService.patch(_id, {
        ...rest,
        color: editedColor,
      }).then(
        (newStatus: TaskStatus) => {
          setStatuses((old) => ({
            ...old,
            data: old.data.map((item) =>
              item._id === newStatus._id ? newStatus : item,
            ),
          }));
          mixpanel.track("Status updated", { _id: newStatus._id });
          setEditedColor("#ffffff");
          setEditedId("");
        },
        (error: Error) => {
          logger.error(`Error in updating ${category} status: `, error);
          message.error(t("status.saveError"));
        },
      );
    } else {
      TaskStatusService.create({
        ...rest,
        category,
        color: editedColor,
      }).then(
        (newStatus: TaskStatus) => {
          setStatuses((old) => ({
            ...old,
            data: old.data.map((item) => (item._id === _id ? newStatus : item)),
          }));
          mixpanel.track("Status created", { _id: newStatus._id });
          setEditedColor("#ffffff");
          setEditedId("");
        },
        (error: Error) => {
          logger.error(`Error in creating ${category} status: `, error);
          message.error(t("status.saveError"));
        },
      );
    }
  };
  const cancelEditing = () => {
    setStatuses((old) => ({
      ...old,
      data: old.data.filter(({ _id = "" }) => !_id.startsWith("NEW")),
    }));
    setEditedColor("#ffffff");
    setEditedId("");
  };
  const addNewStatus = () => {
    const _id = `NEW-${getRandomAlphaNumericString()}`;
    const newStatus = {
      _id,
      title: "New status",
      color: "#ffffff",
    } as TaskStatus;
    setEditedId(_id);
    setEditedColor("#ffffff");
    setStatuses((old) => ({ ...old, data: [...old.data, newStatus] }));
  };

  const cols = [
    {
      title: t("taskStatus.title"),
      dataIndex: "title",
      width: "70%",
      editable: true,
      render: (_: string, record: TaskStatus) => getTaskStatusLabel(record),
    },
    {
      title: t("taskStatus.color"),
      render: (record: TaskStatus) => (
        <ColorSelect
          disable={record._id !== editedId}
          value={record._id === editedId ? editedColor : record.color}
          onSelect={setEditedColor}
          trigger={["click"]}
          colors={colors}
        />
      ),
    },
    {
      render: (_: string, record: TaskStatus) => {
        if (record.type === "system") {
          return;
        }
        return record._id === editedId ? (
          <div className="tw-text-right">
            <EditableRowContext.Consumer>
              {({ submitForm }) => (
                <Button type="link" className="tw-px-0" onClick={submitForm}>
                  {t("global.save")}
                </Button>
              )}
            </EditableRowContext.Consumer>
            <Popconfirm
              title={t("settings.cancelMsg")}
              onConfirm={cancelEditing}
              okText={t("global.ok")}
              cancelText={t("global.cancel")}
            >
              <Button type="link" className="tw-px-0 tw-mx-3">
                {t("global.cancel")}
              </Button>
            </Popconfirm>
          </div>
        ) : (
          <div className="tw-text-right">
            <Button
              type="link"
              className="s-gray-action tw-px-0"
              disabled={!!editedId}
              onClick={() => {
                setEditedColor(record.color);
                setEditedId(record._id || "");
              }}
            >
              {t("global.edit")}
            </Button>
            <Popconfirm
              title={t("settings.deleteMsg")}
              onConfirm={() => removeStatus(record._id || "")}
              okText={t("global.delete")}
              cancelText={t("global.cancel")}
              okButtonProps={{ danger: true }}
            >
              <Button
                type="link"
                className="s-gray-action tw-mx-1"
                disabled={!!editedId}
              >
                {t("global.delete")}
              </Button>
            </Popconfirm>
          </div>
        );
      },
    },
  ];
  const columns = cols.map((col) => {
    return {
      ...col,
      title: <span className="s-col-title">{col.title}</span>,
      onCell: () => ({
        editable: col.editable,
        dataIndex: col.dataIndex,
        className: "s-table-text",
      }),
    };
  });

  const { data = [] } = statuses;

  useEffect(() => {
    setIsLoading(true);
    TaskStatusService.find({
      query: {
        category: category === "task" ? { $in: [null, category] } : category,
      },
    }).then(
      (res: PaginatedFeathersResponse<TaskStatus>) => {
        setStatuses(res);
        setIsLoading(false);
      },
      (error: Error) => {
        setIsLoading(false);
        logger.error(`Error in fetching ${category} statuses: `, error);
        message.error(t("status.fetchError"));
      },
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Table
        components={components}
        rowKey="_id"
        columns={columns}
        dataSource={data}
        onRow={(record) =>
          ({
            record,
            isEditing: record._id === editedId,
            saveStatus,
          } as React.HTMLAttributes<HTMLElement>)
        }
        pagination={false}
        rowClassName="editable-row"
        className="s-style-validation-msg"
        loading={isLoading}
        locale={{
          emptyText: <Empty description={t("tables.noData")} />,
        }}
      />
      <Button
        type="primary"
        className="tw-w-56 tw-mt-5 light-add-btn"
        onClick={addNewStatus}
        disabled={!!editedId}
      >
        + {t("settings.addNewField")}
      </Button>
    </>
  );
};

export default CustomStatusTable;
