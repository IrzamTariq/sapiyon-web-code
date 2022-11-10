import { DownOutlined } from "@ant-design/icons";
import { Button, Drawer, Dropdown, Menu, Popconfirm } from "antd";
import ExportList from "components/ExportList";
import React, { Key, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import exportRecords from "scenes/utils/exportRecords";
import TableSettings from "utils/components/TableSettings";

import UserContext from "../../../UserContext";
import FieldsList from "../../CustomFields/CustomFieldsList";
import TaskImport from "../TaskImport";
import TaskFiltersForm from "./TaskFiltersForm";
import { TaskFilters } from "./TaskFiltersFormProps";

interface TaskHeaderProps {
  applyFilters: (filters: TaskFilters) => void;
  clearFilters: () => void;
  appliedFilters: TaskFilters;
  filters: TaskFilters;

  showRangePicker?: boolean;
  selectedRowKeys?: Key[];
  setSelectedRowKeys?: (ids: Key[]) => void;
  bulkDeleteTasks?: () => void;
  page: string;
}

const TaskHeader = ({
  selectedRowKeys,
  setSelectedRowKeys,
  bulkDeleteTasks,
  page,
  ...restProps
}: TaskHeaderProps) => {
  const [t] = useTranslation();
  const { hasPermission }: any = useContext(UserContext);
  const [state, setState] = useState({
    customFieldModalVisibile: false,
    exportListVisible: false,
    taskImportVisibile: false,
    tableSettingsVisible: false,
  });

  const updateState = (changes: Partial<typeof state>) =>
    setState((old) => ({ ...old, ...changes }));

  return (
    <div
      className="tw-bg-white tw-relative tw-overflow-hidden tw-mb-2"
      style={{ height: "116px", position: "relative", overflow: "hidden" }}
    >
      <div className="tw-flex tw-items-center tw-justify-between">
        <div>
          <div className="std-text s-semibold">{t("newHeader.jobs")}</div>
          <div className="std-text s-semibold tw-text-2xl tw-mb-2">{page}</div>
        </div>
        <div>
          {hasPermission("canManageCustomFields") && (
            <Button
              type="primary"
              className="tw-mr-2"
              ghost
              onClick={() => updateState({ customFieldModalVisibile: true })}
            >
              {t("taskEdit.addCustomField")}
            </Button>
          )}
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item
                  onClick={() =>
                    exportRecords({
                      serviceName: "tasks",
                      exportType: "allRecords",
                    })
                  }
                >
                  {t("jobExports.exportAll")}
                </Menu.Item>
                {hasPermission("canCreateTasks") ? (
                  <Menu.Item
                    onClick={() => updateState({ taskImportVisibile: true })}
                  >
                    {t("taskHeader.importTasks")}
                  </Menu.Item>
                ) : null}
                <Menu.Item
                  onClick={() => updateState({ exportListVisible: true })}
                >
                  {t("exports.downloadExports")}
                </Menu.Item>
                <Menu.Item
                  onClick={() => updateState({ tableSettingsVisible: true })}
                >
                  {t("tableSettings.changeLayout")}
                </Menu.Item>
              </Menu>
            }
            placement="bottomLeft"
          >
            <Button className="tw-inline-flex tw-items-center">
              {t("global.actions")}
              <DownOutlined />
            </Button>
          </Dropdown>
        </div>
      </div>
      <div className="tw-flex tw-items-center tw-w-full">
        <div className="tw-flex-1">
          <TaskFiltersForm {...restProps} />
        </div>
      </div>

      <FieldsList
        form="tasks"
        visible={state.customFieldModalVisibile}
        handleClose={() => updateState({ customFieldModalVisibile: false })}
      />
      <Drawer
        visible={selectedRowKeys && selectedRowKeys?.length > 0}
        height={116}
        placement="top"
        getContainer={false}
        onClose={() => setSelectedRowKeys?.([])}
        style={{ position: "absolute" }}
        bodyStyle={{ padding: "0px", boxShadow: "none" }}
        destroyOnClose={true}
        closable={false}
      >
        <div className="tw-ml-auto" aria-label="Task actions">
          <div>
            {selectedRowKeys && selectedRowKeys?.length > 0 && (
              <Button
                onClick={() =>
                  exportRecords(
                    {
                      serviceName: "tasks",
                      exportType: "selectedRecords",
                      ids: selectedRowKeys,
                    },
                    setSelectedRowKeys,
                  )
                }
                type="default"
                className="tw-px-5"
              >
                {t("exports.export")}{" "}
                {selectedRowKeys.length > 0 ? selectedRowKeys.length : ""}{" "}
                {t("exports.selectedItems")}
              </Button>
            )}
            {hasPermission("canRemoveTasks") &&
              selectedRowKeys &&
              selectedRowKeys.length > 0 && (
                <Popconfirm
                  title={t("global.deleteMsg")}
                  okText={t("global.delete")}
                  cancelText={t("global.cancel")}
                  onConfirm={bulkDeleteTasks}
                  okButtonProps={{ danger: true }}
                >
                  <Button danger className="tw-mx-3" ghost>
                    {t("bulkActions.delete")} {selectedRowKeys.length}{" "}
                    {t("bulkActions.selectedItems")}
                  </Button>
                </Popconfirm>
              )}
            <Button
              type="dashed"
              className="tw-ml-3"
              onClick={() => setSelectedRowKeys?.([])}
            >
              {t("global.cancel")}
            </Button>
          </div>
        </div>
      </Drawer>
      <TaskImport
        visible={state.taskImportVisibile}
        handleClose={() => updateState({ taskImportVisibile: false })}
      />
      <TableSettings
        visible={state.tableSettingsVisible}
        table="tasks"
        handleClose={() => updateState({ tableSettingsVisible: false })}
      />

      <ExportList
        serviceName="tasks"
        visible={state.exportListVisible}
        toggleVisible={() => updateState({ exportListVisible: false })}
      />
    </div>
  );
};

export default TaskHeader;
