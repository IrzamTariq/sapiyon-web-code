import { faBraille } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Modal, Switch } from "antd";
import React, { useContext, useEffect, useState } from "react";
import { DragDropContext, DropResult, Droppable } from "react-beautiful-dnd";
import { Trans, useTranslation } from "react-i18next";
import { ColumnLayout, FirmForms, TableName, UserContextType } from "types";
import UserContext from "UserContext";

import ColumnModal from "./Components/ColumnModal";
import AllTableColumns from "./Components/StandardTableColumns";

interface TableSettingsProps {
  visible: boolean;
  handleClose: () => void;
  table: TableName;
}
const modalWidth = (window?.innerWidth || 1100) - 150;

const TableSettings = ({ visible, table, handleClose }: TableSettingsProps) => {
  const [t] = useTranslation();
  const { tableSettings, updateUserPreferences, firm } = useContext(
    UserContext,
  ) as UserContextType;
  const [columns, setColumns] = useState([] as ColumnLayout[]);

  const updateColumn = (dataIndex: string, changes: Partial<ColumnLayout>) => {
    const newColumns = columns.map((column) =>
      column.dataIndex === dataIndex ? { ...column, ...changes } : column,
    );
    setColumns(newColumns);
  };

  const handleDrag = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination || destination?.index === source?.index) {
      return;
    }

    let newColumns = Array.from(columns);
    const dragged = newColumns.splice(source.index, 1);
    newColumns.splice(destination.index, 0, ...dragged);
    newColumns = newColumns.map((column, index) => ({
      ...column,
      order: index,
    }));
    setColumns(newColumns);
  };

  const saveSettings = () => {
    updateUserPreferences({ [table]: columns });
    handleClose();
  };

  useEffect(() => {
    if (visible) {
      const customFields = firm.forms?.[table as keyof FirmForms] || [];
      const systemFields = AllTableColumns[table] || [];
      const allFields: ColumnLayout[] = [
        ...systemFields,
        ...customFields.map(
          (item) =>
            ({
              title: item.label,
              dataIndex: item._id,
              size: 300,
              minSize: 100,
            } as ColumnLayout),
        ),
      ];
      const actions = allFields.filter(
        (item) =>
          item.dataIndex === "actions" || item.dataIndex === "parasutId",
      );
      const noActions = allFields.filter(
        (item) =>
          item.dataIndex !== "actions" && item.dataIndex !== "parasutId",
      );
      const actionsAtLast = [...noActions, ...actions];
      const savedFields = tableSettings[table] || [];
      const tableFieldsByDataIndex: {
        [dataIndex: string]: ColumnLayout;
      } = savedFields.reduce(
        (acc, curr) => ({ ...acc, [curr.dataIndex]: curr }),
        {},
      );
      const columns: ColumnLayout[] = actionsAtLast.reduce(
        (acc: any[], curr: any) => {
          const { minSize = 100, fixedWidth = false, title = "" } = curr;
          let column = Object.assign({}, curr);
          if (tableFieldsByDataIndex.hasOwnProperty(curr.dataIndex)) {
            column = {
              ...column,
              ...tableFieldsByDataIndex[curr.dataIndex],
              title,
              minSize,
              fixedWidth,
            };
          }
          return [...acc, column];
        },
        [],
      );

      setColumns(
        columns.sort((a, b) => {
          if (a.order === undefined) {
            return 1;
          }
          return a.order > b.order ? 1 : -1;
        }),
      );
    }
  }, [visible, table, firm.forms, tableSettings]);

  return (
    <Modal
      title={
        <div>
          <div className="s-modal-title">{t("tableSettings.pageTitle")}</div>
          <Trans
            i18nKey="tableSettings.instructions"
            components={{
              wrapper: (
                <div
                  style={{
                    color: "#8a8a8a",
                    margin: "10px 0 -10px",
                    fontSize: "0.8rem",
                  }}
                />
              ),
              dragV: (
                <FontAwesomeIcon
                  className="tw-mx-2"
                  icon={faBraille}
                  rotation={90}
                  size="sm"
                />
              ),
              dragH: (
                <div
                  className="tw-mx-2"
                  style={{
                    height: "20px",
                    width: "5px",
                    backgroundColor: "#d0d0d0",
                    borderRadius: "2px",
                    cursor: "ew-resize",
                    display: "inline-block",
                    verticalAlign: "middle",
                  }}
                />
              ),
              switch: (
                <Switch
                  checkedChildren={t("tableSettings.visible")}
                  size="small"
                  className="tw-mx-2"
                  checked
                  disabled
                />
              ),
            }}
          />
        </div>
      }
      visible={visible}
      onOk={saveSettings}
      onCancel={handleClose}
      width={modalWidth}
      bodyStyle={{ padding: "12px 24px" }}
      okButtonProps={{
        loading: false,
        className: "s-btn-spinner-align tw-mr-2",
      }}
      okText={t("global.save")}
      cancelText={t("global.cancel")}
    >
      <DragDropContext onDragEnd={handleDrag}>
        <Droppable droppableId="columns-list">
          {(provided) => (
            <div
              className="tw-flex tw-flex-col"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {columns.map((col, index) => (
                <ColumnModal
                  {...col}
                  updateColumn={updateColumn}
                  index={index}
                  key={col.dataIndex}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </Modal>
  );
};

export default TableSettings;
