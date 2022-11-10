import { DownOutlined } from "@ant-design/icons";
import { Button, Dropdown, Menu, Popconfirm, message } from "antd";
import ExportList from "components/ExportList";
import logger from "logger";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { QuoteState } from "scenes/Quotations";
import exportRecords from "scenes/utils/exportRecords";
import { QuoteService } from "services";
import { Quote } from "types";
import TableSettings from "utils/components/TableSettings";

import UserContext from "../../../../UserContext";
import FieldsList from "../../../CustomFields/CustomFieldsList";
import QuotesFiltersForm from "./QuotesFiltersForm";

interface QuotesHeaderProps {
  parentState: QuoteState;
  updateParentState: (changes: Partial<QuoteState>) => void;
}

const QuotesHeader = ({
  parentState,
  updateParentState,
}: QuotesHeaderProps) => {
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

  const bulkDeleteQuotes = () => {
    updateParentState({ isLoading: true });
    message.loading({
      content: `${t("bulkActions.deleting")} ${selectedRowKeys.length} ${t(
        "bulkActions.records",
      )}`,
      key: "deletingQuotes",
      duration: 0,
    });
    QuoteService.remove(null, {
      query: { _id: { $in: selectedRowKeys } },
    }).then(
      (res: Quote[]) => {
        const deleted = res.length;
        message.success({
          content: `${t("bulkActions.deleted")} ${deleted} ${t(
            "bulkActions.selectedRecords",
          )}`,
          key: "deletingQuotes",
        });
        updateParentState({ selectedRowKeys: [], isLoading: false });
        window.location.reload();
      },
      (e: Error) => {
        message.error({
          content: t("tasks.bulkDeleteError"),
          key: "deletingQuotes",
        });
        logger.error("Error in bulk deleting Quotes: ", e);
        updateParentState({ isLoading: false });
      },
    );
  };

  return (
    <div>
      <div className="tw-flex tw-items-center">
        <div className="s-page-title tw-mr-auto">{t("quotes.pageTitle")}</div>
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
              onConfirm={bulkDeleteQuotes}
              okButtonProps={{ danger: true }}
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
                    serviceName: "quotes",
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
            updateParentState({ isEditing: true, editedRecord: {} as Quote })
          }
          ghost
        >
          {t("quotes.createNew")}
        </Button>
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
                    serviceName: "quotes",
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
      <div className="tw-mt-5 tw-mb-6">
        <QuotesFiltersForm
          applyFilters={(filters) => updateParentState({ filters })}
          filters={filters}
        />
      </div>

      <FieldsList
        form="quotes"
        visible={state.customFieldModalVisibile}
        handleClose={() => updateState({ customFieldModalVisibile: false })}
      />
      <TableSettings
        visible={state.tableSettingsVisible}
        table="quotes"
        handleClose={() => updateState({ tableSettingsVisible: false })}
      />
      <ExportList
        serviceName="quotes"
        visible={state.exportListVisible}
        toggleVisible={() => updateState({ exportListVisible: false })}
      />
    </div>
  );
};

export default QuotesHeader;
