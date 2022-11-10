import { DownOutlined } from "@ant-design/icons";
import { Button, Dropdown, Menu, Popconfirm, message } from "antd";
import ExportList from "components/ExportList";
import logger from "logger";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import CustomFieldsList from "scenes/CustomFields/CustomFieldsList";
import { InvoiceState } from "scenes/Invoices";
import exportRecords from "scenes/utils/exportRecords";
import { InvoiceService } from "services";
import { Invoice } from "types";
import UserContext from "UserContext";
import TableSettings from "utils/components/TableSettings";

import InvoiceFiltersForm from "./InvoiceFiltersForm";

interface InvoiceHeaderProps {
  parentState: InvoiceState;
  updateParentState: (changes: Partial<InvoiceState>) => void;
}

const InvoiceHeader = ({
  parentState,
  updateParentState,
}: InvoiceHeaderProps) => {
  const [t] = useTranslation();
  const { hasPermission }: any = useContext(UserContext);
  const [state, setState] = useState({
    customFieldModalVisibile: false,
    exportListVisible: false,
    tableSettingsVisible: false,
  });
  const { filters, selectedRowKeys } = parentState;

  const updateState = (changes: Partial<typeof state>) =>
    setState((old) => ({ ...old, ...changes }));

  const bulkDeleteInvoices = () => {
    updateParentState({ isLoading: true });
    message.loading({
      content: `${t("bulkActions.deleting")} ${selectedRowKeys.length} ${t(
        "bulkActions.records",
      )}`,
      key: "deletingInvoices",
      duration: 0,
    });
    InvoiceService.remove(null, {
      query: { _id: { $in: selectedRowKeys } },
    }).then(
      (res: Invoice[]) => {
        const deleted = res.length;
        message.success({
          content: `${t("bulkActions.deleted")} ${deleted} ${t(
            "bulkActions.selectedRecords",
          )}`,
          key: "deletingInvoices",
        });
        updateParentState({ selectedRowKeys: [], isLoading: false });
        window.location.reload();
      },
      (e: Error) => {
        message.error({
          content: t("tasks.bulkDeleteError"),
          key: "deletingInvoices",
        });
        logger.error("Error in bulk deleting Invoices: ", e);
        updateParentState({ isLoading: false });
      },
    );
  };

  return (
    <div className="tw-mb-6">
      <div className="tw-flex tw-items-center">
        <div className="s-page-title tw-mr-auto">{t("invoices.pageTitle")}</div>
        {hasPermission("canManageInvoices") ? (
          <>
            {selectedRowKeys.length > 0 ? (
              <>
                <Button
                  onClick={() => updateParentState({ selectedRowKeys: [] })}
                  type="dashed"
                >
                  {t("global.clearSelection")}
                </Button>
                <Popconfirm
                  title={t("global.deleteMsg")}
                  okText={t("global.delete")}
                  cancelText={t("global.cancel")}
                  okButtonProps={{ danger: true }}
                  onConfirm={bulkDeleteInvoices}
                >
                  <Button danger className="tw-mx-2" ghost>
                    {t("bulkActions.delete")} {selectedRowKeys.length}{" "}
                    {t("bulkActions.selectedItems")}
                  </Button>
                </Popconfirm>
                <Button
                  onClick={() =>
                    exportRecords(
                      {
                        serviceName: "invoices",
                        exportType: "selectedRecords",
                        ids: selectedRowKeys,
                      },
                      () => updateParentState({ selectedRowKeys: [] }),
                    )
                  }
                  type="default"
                  className="tw-px-5"
                >
                  {t("exports.export")}{" "}
                  {selectedRowKeys.length > 0 ? selectedRowKeys.length : ""}{" "}
                  {t("exports.selectedItems")}
                </Button>
              </>
            ) : null}
            <Button
              className="tw-uppercase s-semibold tw-mx-2"
              type="primary"
              onClick={() =>
                updateParentState({
                  isEditing: true,
                  editedRecord: {} as Invoice,
                })
              }
              ghost
            >
              {t("invoices.createNew")}
            </Button>
          </>
        ) : null}
        <Dropdown
          overlay={
            <Menu>
              {hasPermission("canManageCustomFields") && (
                <Menu.Item
                  onClick={() =>
                    updateState({ customFieldModalVisibile: true })
                  }
                >
                  {t("fields.addCustomFields")}
                </Menu.Item>
              )}
              <Menu.Item
                onClick={() =>
                  exportRecords({
                    serviceName: "invoices",
                    exportType: "allRecords",
                  })
                }
              >
                {t("jobExports.exportAll")}
              </Menu.Item>
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
      <div className="tw-flex tw-items-center tw-w-full tw-mt-5">
        <div className="tw-flex-1">
          <InvoiceFiltersForm
            applyFilters={(filters) => updateParentState({ filters })}
            filters={filters}
          />
        </div>
      </div>

      <CustomFieldsList
        form="invoices"
        visible={state.customFieldModalVisibile}
        handleClose={() => updateState({ customFieldModalVisibile: false })}
      />
      <TableSettings
        visible={state.tableSettingsVisible}
        table="invoices"
        handleClose={() => updateState({ tableSettingsVisible: false })}
      />
      <ExportList
        serviceName="invoices"
        visible={state.exportListVisible}
        toggleVisible={() => updateState({ exportListVisible: false })}
      />
    </div>
  );
};

export default InvoiceHeader;
