import { DownOutlined } from "@ant-design/icons";
import { Button, Dropdown, Menu, Popconfirm, message } from "antd";
import ExportList from "components/ExportList";
import logger from "logger";
import mixpanel from "mixpanel-browser";
import React, { Key, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import CustomFieldsList from "scenes/CustomFields/CustomFieldsList";
import exportRecords from "scenes/utils/exportRecords";
import { StockBinService, StockItemService } from "services";
import { Bin, StockItem, UserContextType } from "types";
import UserContext from "UserContext";
import TableSettings from "utils/components/TableSettings";

import ProductEdit from "../Products/Components/ProductEdit/ProductEdit";
import StockTags from "../Products/Components/ProductEdit/StockTags";
import ProductsImportContainer from "../ProductsImport/ProductsImportContainer";
import BinEdit from "../Warehouses/Components/BinEdit";
import AddStock from "../Warehouses/Components/StockTransactions/AddStock";
import TransferStock from "../Warehouses/Components/StockTransactions/TransferStock";

interface StockHeaderProps {
  activeTab: "warehouses" | "products";
  selectedProductKeys: Key[];
  selectedWarehouseKeys: Key[];
  updateParentState: (changes: any) => void;
  onRipple: () => void;
}

const StockHeader = ({
  activeTab,
  selectedProductKeys,
  selectedWarehouseKeys,
  updateParentState,
  onRipple,
}: StockHeaderProps) => {
  const [t] = useTranslation();
  const { hasPermission } = useContext(UserContext) as UserContextType;
  const [state, setState] = useState({
    isEditingCustomFields: false,
    isEditingBin: false,
    visibleExportModal: false,
    isImportModalVisible: false,
    isAddingStock: false,
    isTransferringStock: false,
    isEditingProduct: false,
    isChangingLayout: false,
    isEditingTags: false,
  });

  const updateState = (changes: Partial<typeof state>) =>
    setState((old) => ({ ...old, ...changes }));

  const productsActions = (
    <Menu>
      <Menu.Item onClick={() => updateState({ isEditingCustomFields: true })}>
        {t("fields.addCustomFields")}
      </Menu.Item>
      <Menu.Item onClick={() => updateState({ isEditingTags: true })}>
        {t("stockTags.manage")}
      </Menu.Item>
      <Menu.Item
        onClick={() =>
          exportRecords({
            serviceName: "stockProducts",
            exportType: "allRecords",
          })
        }
      >
        {t("stockExports.exportAll")}
      </Menu.Item>
      <Menu.Item onClick={() => updateState({ visibleExportModal: true })}>
        {t("exports.pageTitle")}
      </Menu.Item>
      <Menu.Item onClick={() => updateState({ isImportModalVisible: true })}>
        {t("productsImport.pageTitle")}
      </Menu.Item>
      <Menu.Item onClick={() => updateState({ isChangingLayout: true })}>
        {t("tableSettings.changeLayout")}
      </Menu.Item>
    </Menu>
  );

  const warehousesActions = (
    <Menu>
      <Menu.Item
        key="1"
        onClick={() => updateState({ isTransferringStock: true })}
      >
        {t("products.transferProduct")}
      </Menu.Item>
      <Menu.Item key="2" onClick={() => updateState({ isAddingStock: true })}>
        {t("stock.add")}
      </Menu.Item>
      <Menu.Item onClick={() => updateState({ isChangingLayout: true })}>
        {t("tableSettings.changeLayout")}
      </Menu.Item>
    </Menu>
  );

  const bulkDeleteProducts = () => {
    message.loading({
      content: `${t("bulkActions.deleting")} ${selectedProductKeys.length} ${t(
        "bulkActions.records",
      )}`,
      key: "deletingStock",
      duration: 0,
    });

    StockItemService.remove(null, {
      query: { _id: { $in: selectedProductKeys } },
    }).then(
      (res: StockItem[]) => {
        message.success({
          content: `${t("bulkActions.deleted")} ${res?.length || 0} ${t(
            "bulkActions.selectedRecords",
          )}`,
          key: "deletingStock",
        });
        onRipple();
        mixpanel.track("Product removed many", {
          productIds: res.map((item) => item?._id),
        });
      },
      (error: Error) => {
        logger.error("Could not bulk delete products: ", error);
        message.error({
          content: t("bulkActions.deleteError"),
          key: "deletingStock",
        });
      },
    );
  };

  const bulkDeleteWarehouses = () => {
    message.loading({
      content: `${t("bulkActions.deleting")} ${
        selectedWarehouseKeys.length
      } ${t("bulkActions.records")}`,
      key: "deletingStock",
      duration: 0,
    });

    StockBinService.remove(null, {
      query: { _id: { $in: selectedWarehouseKeys } },
    }).then(
      (res: Bin[]) => {
        message.success({
          content: `${t("bulkActions.deleted")} ${res?.length || 0} ${t(
            "bulkActions.selectedRecords",
          )}`,
          key: "deletingStock",
        });
      },
      (error: Error) => {
        message.error({
          content: t("bulkActions.deleteError"),
          key: "deletingStock",
        });
        logger.error("Error in bulk deleting warehouses: ", error);
      },
    );
  };

  return (
    <>
      <div className="tw-flex tw-justify-between tw-items-center tw-mb-5">
        <div className="s-page-title">{t(`${activeTab}.pageTitle`)}</div>
        <div>
          {activeTab === "products" && selectedProductKeys.length > 0 && (
            <Button
              onClick={() =>
                activeTab === "products"
                  ? updateParentState({ selectedProductKeys: [] })
                  : updateParentState({ selectedDepoKeys: [] })
              }
              type="dashed"
              className="tw-mx-3"
            >
              {t("global.clearSelection")}
            </Button>
          )}
          {activeTab === "products" && selectedProductKeys.length > 0 && (
            <Button
              onClick={() =>
                exportRecords(
                  {
                    serviceName: "stockProducts",
                    exportType: "selectedRecords",
                    ids: selectedProductKeys as string[],
                  },
                  (keys) => updateParentState({ selectedProductKeys: keys }),
                )
              }
              type="default"
              className="tw-px-5"
            >
              {t("exports.export")}{" "}
              {selectedProductKeys.length > 0 ? selectedProductKeys.length : ""}{" "}
              {t("exports.selectedItems")}
            </Button>
          )}
          {(activeTab === "products" && selectedProductKeys.length > 0) ||
          (activeTab === "warehouses" && selectedWarehouseKeys.length > 0) ? (
            <Popconfirm
              title={t("global.deleteMsg")}
              okText={t("global.delete")}
              cancelText={t("global.cancel")}
              onConfirm={() =>
                activeTab === "products"
                  ? bulkDeleteProducts()
                  : bulkDeleteWarehouses()
              }
              okButtonProps={{ danger: true }}
            >
              <Button danger className="tw-mx-3" ghost>
                {t("bulkActions.delete")}{" "}
                {activeTab === "products"
                  ? selectedProductKeys.length
                  : selectedWarehouseKeys.length}{" "}
                {t("bulkActions.selectedItems")}
              </Button>
            </Popconfirm>
          ) : null}
          {hasPermission("canCreateStock") ? (
            <Button
              type="primary"
              onClick={() =>
                activeTab === "products"
                  ? updateState({
                      isEditingProduct: true,
                    })
                  : updateState({ isEditingBin: true })
              }
              className="tw-uppercase s-semibold s-font-roboto"
              ghost
            >
              {t(`${activeTab}.add`)}
            </Button>
          ) : null}
          {(activeTab === "products" &&
            hasPermission("canManageCustomFields")) ||
          (activeTab === "warehouses" && hasPermission("canCreateStock")) ? (
            <Dropdown
              overlay={
                activeTab === "products" ? productsActions : warehousesActions
              }
            >
              <Button
                type="default"
                className="tw-ml-3 tw-inline-flex tw-items-center"
              >
                {t("products.actions")}
                <DownOutlined />
              </Button>
            </Dropdown>
          ) : null}
        </div>
      </div>
      <div>
        <ExportList
          serviceName="stockProducts"
          visible={state.visibleExportModal}
          toggleVisible={() => updateState({ visibleExportModal: false })}
        />
        <StockTags
          visible={state.isEditingTags}
          handleClose={() => updateState({ isEditingTags: false })}
        />
        <ProductsImportContainer
          handleCancel={() => updateState({ isImportModalVisible: false })}
          handleOk={() => updateState({ isImportModalVisible: false })}
          visible={state.isImportModalVisible}
          onSave={onRipple}
        />
        <ProductEdit
          visible={state.isEditingProduct}
          editedRecord={{} as StockItem}
          handleClose={() => updateState({ isEditingProduct: false })}
        />
        <BinEdit
          editedBin={{} as Bin}
          visible={state.isEditingBin}
          handleClose={() =>
            setState((old) => ({ ...old, isEditingBin: false }))
          }
        />
        <AddStock
          visible={state.isAddingStock}
          handleClose={() => updateState({ isAddingStock: false })}
        />
        <TransferStock
          visible={state.isTransferringStock}
          handleClose={() => updateState({ isTransferringStock: false })}
        />
        <CustomFieldsList
          form="stockItems"
          visible={state.isEditingCustomFields}
          handleClose={() => updateState({ isEditingCustomFields: false })}
        />
        <TableSettings
          table={activeTab === "products" ? "stockItems" : "warehouses"}
          visible={state.isChangingLayout}
          handleClose={() => updateState({ isChangingLayout: false })}
        />
      </div>
    </>
  );
};

export default StockHeader;
