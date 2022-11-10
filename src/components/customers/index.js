import { DownOutlined } from "@ant-design/icons";
import { Button, Dropdown, Menu, Popconfirm, message } from "antd";
import Appshell from "Appshell";
import ExportList from "components/ExportList";
import React, { useContext, useEffect, useState } from "react";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { Redirect, withRouter } from "react-router-dom";
import CustomFieldsList from "scenes/CustomFields/CustomFieldsList";
import SapiyonGuide from "scenes/Onboarding";
import Placeholder from "scenes/Tasks/TaskList/Components/Placeholder";
import exportRecords from "scenes/utils/exportRecords";
import TableSettings from "utils/components/TableSettings";

import {
  doCustomerDeleteManyRequest,
  doCustomersImportRequest,
  doHandlePageUpdate,
  doToggleCustomersImportModal,
  doUpdateFileListForCustomersImport,
  doUpdateSelectedRowKeys,
} from "../../store/customers";
// import TourContext from "../../TourContext";
import UserContext from "../../UserContext";
import CustomerEditForm from "./CustomerEdit/CustomerEdit";
import CustomerAddressEdit from "./CustomerList/CustomerAddressEdit";
import CustomerList from "./CustomerList/CustomerList";
import CustomerLocations from "./CustomerList/CustomerLocations";
import ImportCustomers from "./CustomerList/ImportCustomers/Container";

const Customers = ({
  t,
  selectedRowKeys = [],
  doCustomerDeleteManyRequest,
  doUpdateSelectedRowKeys,
  doToggleCustomersImportModal,
  doCustomersImportRequest,
  importFileList,
  customers,
  importFormVisible,
  skip,
  limit,
  isEmpty = false,

  location,
  history,
}) => {
  const { joyrideState, guideState, updateGuideAndJoyrideState } = useContext(
    SapiyonGuide,
  );
  const [
    customFieldsModalVisibility,
    setCustomFieldsModalVisibility,
  ] = useState(false);
  const [exportModalVisibility, setExportModalVisibility] = useState(false);
  const [addressEditState, setAddressEditState] = useState({
    visible: false,
    customerId: "",
    editedAddress: {},
  });

  const [customerEditingState, setCustomerEditingState] = useState({
    visible: false,
    editedRecord: {},
  });

  const [tableSettingsVisibility, setTableSettingsVisibility] = useState(false);

  let dataSource = Object.values(customers);

  const customerModified = (record, isCreated) => {
    if (isCreated) {
      dataSource = [record, ...dataSource];
    } else {
      dataSource = (dataSource || []).map((item) =>
        item._id !== record._id ? item : record,
      );
    }
    setCustomerEditingState({ editedRecord: {}, visible: false });
  };

  const handleCustomersImport = () => {
    if (importFileList.length > 0) {
      doCustomersImportRequest({ files: importFileList });
    } else {
      message.error("Upload a file first.");
    }
  };

  const handleAddCustomer = () => {
    if (
      joyrideState.tourInProgress &&
      guideState.currentStage === "intro-tour-2"
    ) {
      updateGuideAndJoyrideState({}, { isRunning: false });
    }
    setCustomerEditingState({
      visible: true,
      editedRecord: {},
    });
  };

  useEffect(() => {
    if (
      joyrideState.tourInProgress &&
      guideState.currentStage === "intro-tour-2"
    ) {
      updateGuideAndJoyrideState({}, { stepIndex: 1, isRunning: true });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const params = new URLSearchParams(location.search);
  const activeTab = params.get("tab");
  if (!activeTab || (activeTab !== "list" && activeTab !== "addresses")) {
    return <Redirect to="/customers?tab=list" />;
  }
  return (
    <Appshell
      activeLink={[
        "customers",
        activeTab === "addresses" ? "customers-locations" : "customers-list",
      ]}
    >
      <div className="tw-mb-5 tw-flex tw-justify-between tw-items-center tw-bg-white t-customers">
        <div>
          <span className="s-page-title">{t("customerList.pageTitle")}</span>
        </div>
        <div>
          {selectedRowKeys.length > 0 && (
            <Button
              onClick={() =>
                exportRecords(
                  {
                    serviceName: "customers",
                    exportType: "selectedRecords",
                    ids: selectedRowKeys,
                  },
                  doUpdateSelectedRowKeys,
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
          <UserContext.Consumer>
            {({ hasPermission }) =>
              hasPermission("canCreateCustomers") &&
              selectedRowKeys.length > 0 && (
                <Popconfirm
                  title={t("settings.deleteMsg")}
                  onConfirm={() =>
                    doCustomerDeleteManyRequest({
                      selectedRowKeys,
                      totalCustomers: dataSource.length,
                      pageNumber: (skip + limit) / limit,
                      pageSize: limit,
                    })
                  }
                  okButtonProps={{ danger: true }}
                  okText={t("global.ok")}
                  cancelText={t("global.cancel")}
                >
                  <Button danger className="tw-mx-3" ghost>
                    {t("customersList.bulkDeletePart1") +
                      " " +
                      selectedRowKeys.length +
                      " " +
                      t("customersList.bulkDeletePart2")}
                  </Button>
                </Popconfirm>
              )
            }
          </UserContext.Consumer>
          <UserContext.Consumer>
            {({ hasPermission }) => {
              return (
                <>
                  {hasPermission("canCreateCustomers") ? (
                    <Button
                      type="primary"
                      className="tw-mr-3 customers-add-btn"
                      onClick={handleAddCustomer}
                      ghost
                    >
                      <span className="tw-uppercase s-semibold s-font-roboto">
                        {t("customerList.addCustomerBtn")}
                      </span>
                    </Button>
                  ) : null}
                  <Dropdown
                    overlay={
                      <Menu>
                        {hasPermission("canCreateCustomers") ? (
                          <>
                            <Menu.Item
                              key="1"
                              onClick={doToggleCustomersImportModal}
                            >
                              {t("customersList.importCustomersBtnText")}
                            </Menu.Item>
                            {hasPermission("canManageCustomFields") && (
                              <Menu.Item
                                onClick={() =>
                                  setCustomFieldsModalVisibility(true)
                                }
                              >
                                {t("fields.addCustomFields")}
                              </Menu.Item>
                            )}
                            <Menu.Item
                              onClick={() =>
                                exportRecords({
                                  serviceName: "customers",
                                  exportType: "allRecords",
                                })
                              }
                            >
                              {t("customersExports.exportAll")}
                            </Menu.Item>
                            <Menu.Item
                              onClick={() => setExportModalVisibility(true)}
                            >
                              {t("exports.pageTitle")}
                            </Menu.Item>
                          </>
                        ) : null}
                        <Menu.Item
                          onClick={() => setTableSettingsVisibility(true)}
                        >
                          {t("tableSettings.changeLayout")}
                        </Menu.Item>
                      </Menu>
                    }
                  >
                    <Button
                      type="default"
                      className="tw-inline-flex tw-items-center"
                    >
                      {t("products.actions")}
                      <DownOutlined className="tw-text-xs" />
                    </Button>
                  </Dropdown>
                </>
              );
            }}
          </UserContext.Consumer>
        </div>
      </div>

      {isEmpty ? (
        <UserContext.Consumer>
          {({ hasPermission }) => (
            <Placeholder
              primaryAction={
                hasPermission("canCreateCustomers")
                  ? () =>
                      setCustomerEditingState({
                        visible: true,
                        editedRecord: {},
                      })
                  : undefined
              }
              topBorder={true}
              primaryBtnText={t("dataPlaceholder.customers.action")}
              primaryText={t("dataPlaceholder.customers.title")}
              secondaryText={t("dataPlaceholder.customers.description")}
              heightReduction={68}
            />
          )}
        </UserContext.Consumer>
      ) : (
        <>
          {activeTab === "list" ? (
            <CustomerList
              customFieldsModalVisible={customFieldsModalVisibility}
              closeCustomFieldsModal={() =>
                setCustomFieldsModalVisibility(false)
              }
              visibleExportModal={exportModalVisibility}
              closeVisibleExportModal={() => setExportModalVisibility(false)}
              addAddress={(customerId) =>
                setAddressEditState({
                  visible: true,
                  customerId,
                  editedAddress: { customerId },
                })
              }
              dataSource={dataSource}
              startEeditingCustomer={(record) =>
                setCustomerEditingState({ visible: true, editedRecord: record })
              }
            />
          ) : (
            <CustomerLocations
              editAddress={(record) =>
                setAddressEditState({
                  visible: true,
                  customerId: record.customerId,
                  editedAddress: record,
                })
              }
            />
          )}
        </>
      )}

      <CustomerEditForm
        visible={customerEditingState.visible}
        editedRecord={customerEditingState.editedRecord}
        updateCustomerLocally={(data) =>
          setCustomerEditingState((oldData) => ({
            ...oldData,
            editedRecord: Object.assign({}, oldData.editedRecord, data),
          }))
        }
        customerModified={customerModified}
        handleCancel={() =>
          setCustomerEditingState({
            editedRecord: {},
            visible: false,
          })
        }
      />

      <CustomerAddressEdit
        visible={addressEditState.visible}
        customerId={addressEditState.customerId}
        editedRecord={addressEditState.editedAddress}
        handleOk={() =>
          setAddressEditState({
            visible: false,
            customerId: "",
            editedAddress: {},
          })
        }
        handleCancel={() =>
          setAddressEditState({
            visible: false,
            customerId: "",
            editedAddress: {},
          })
        }
      />

      <ImportCustomers
        visible={importFormVisible}
        handleFileChange={doUpdateFileListForCustomersImport}
        handleOk={handleCustomersImport}
        handleCancel={doToggleCustomersImportModal}
      />
      <CustomFieldsList
        form="customers"
        visible={customFieldsModalVisibility}
        handleClose={() => setCustomFieldsModalVisibility(false)}
      />
      <ExportList
        serviceName="customers"
        visible={exportModalVisibility}
        toggleVisible={() => setExportModalVisibility(false)}
      />
      <TableSettings
        table="customers"
        visible={tableSettingsVisibility}
        handleClose={() => setTableSettingsVisibility(false)}
      />
    </Appshell>
  );
};

const mapStateToProps = (state) => {
  return {
    customers: state.customers.byIds,
    allIds: state.customers.allIds,
    total: state.customers.total,
    isEditing: state.customers.isEditing,
    editedRecord: state.customers.editedRecord,
    error: state.customers.error,
    selectedRowKeys: state.customers.selectedRowKeys,
    importFormVisible: state.customers.importFormVisible,
    importFileList: state.customers.importFileList,
    isLoading: state.customers.isLoading,
    isEmpty: state.customers.isEmpty,
    skip: state.customers.skip,
    limit: state.customers.limit,
  };
};

const mapDispatchToProps = {
  doCustomerDeleteManyRequest,
  doUpdateSelectedRowKeys,
  doToggleCustomersImportModal,
  doCustomersImportRequest,
  doHandlePageUpdate,
  doUpdateFileListForCustomersImport,
};

const Connected = connect(mapStateToProps, mapDispatchToProps)(Customers);
const Translated = withTranslation()(Connected);
export default withRouter(Translated);
