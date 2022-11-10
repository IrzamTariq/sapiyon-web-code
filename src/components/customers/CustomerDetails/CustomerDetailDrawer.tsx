import { MoreOutlined } from "@ant-design/icons";
import { Drawer, Dropdown, Menu, Tabs } from "antd";
import React, { useContext, useEffect, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import TaskDetail from "scenes/Tasks/TaskDetail";
import TaskEdit from "scenes/Tasks/TaskEdit";

import { Customer, Invoice, Quote, RFQ, Task } from "../../../types";
import UserContext from "../../../UserContext";
import CustomerEdit from "../CustomerEdit/CustomerEdit";
import FilesAndNotes from "./Tabs/FilesAndNotes/FilesAndNotes";
import General from "./Tabs/General";
import Invoices from "./Tabs/Invoices";
import Jobs from "./Tabs/Jobs";
import Quotes from "./Tabs/Quotes";
import RFQs from "./Tabs/RFQs";
import StockTab from "./Tabs/StockTab/";

interface CustomerDetailsProps extends WithTranslation {
  visible: boolean;
  customer: Customer;
  handleCancel: () => void;
  editAddress: (customerId: string) => void;
}
const tabStyle = {
  height: "30px",
};

const CustomerDetailsDrawer = ({
  visible,
  customer: customerData = {} as Customer,
  handleCancel,
  editAddress,
  t,
}: CustomerDetailsProps) => {
  const { hasFeature }: any = useContext(UserContext);
  const [detailView, setDetailView] = useState({
    task: {} as Task | RFQ | Invoice | Quote,
    visible: false,
    type: "task" as "task" | "invoice" | "rfq" | "quote",
  });
  const [customerState, setCustomerState] = useState({
    customer: {} as Customer,
    isEditing: false,
  });
  const [creatingTask, setCreatingTask] = useState(false);
  const { customer } = customerState;

  useEffect(() => {
    if (visible) {
      setCustomerState((old) => ({ ...old, customer: customerData }));
    }
  }, [visible, customerData]);

  return (
    <Drawer
      visible={visible}
      closable={false}
      onClose={handleCancel}
      width={1000}
      bodyStyle={{ padding: "0px" }}
      destroyOnClose={true}
    >
      {visible && (
        <Tabs
          tabBarExtraContent={
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item
                    onClick={() =>
                      setCustomerState((old) => ({
                        ...old,
                        isEditing: true,
                      }))
                    }
                  >
                    {t("global.edit")}
                  </Menu.Item>
                  <Menu.Item
                    onClick={() =>
                      editAddress(customer._id ? customer._id : "")
                    }
                  >
                    {t("customerDetails.addAddress")}
                  </Menu.Item>
                  <Menu.Item onClick={() => setCreatingTask(true)}>
                    {t("tasks.addNew")}
                  </Menu.Item>
                </Menu>
              }
            >
              <MoreOutlined className="s-main-text-color s-semibold tw-text-2xl" />
            </Dropdown>
          }
          className="s-tab-icons"
          tabBarStyle={{
            padding: "5px 24px 0px",
            backgroundColor: "#F0F0F0",
          }}
        >
          <Tabs.TabPane
            tab={<div style={tabStyle}>{t("customerDetails.general")}</div>}
            key="1"
          >
            <General
              customer={customer}
              viewDetails={(task) =>
                setDetailView({ type: "task", task, visible: true })
              }
            />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <div style={tabStyle}>{t("customerDetails.completedTasks")}</div>
            }
            key="4"
          >
            <Jobs
              customerId={customer._id || ""}
              viewDetails={(task) =>
                setDetailView({ type: "task", task, visible: true })
              }
            />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <div style={tabStyle}>{t("customerDetails.filesAndNotes")}</div>
            }
            key="6"
          >
            <FilesAndNotes customerId={customer._id ? customer._id : ""} />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <div style={tabStyle}>
                {t("customerDetails.productsAndServices")}
              </div>
            }
            key="7"
          >
            {customer._id && <StockTab customerId={customer._id} />}
          </Tabs.TabPane>
          {hasFeature("extendedTasks") && (
            <Tabs.TabPane
              tab={<div style={tabStyle}>{t("customerDetails.rfqs")}</div>}
              key="2"
            >
              <RFQs
                customerId={customer._id || ""}
                viewDetails={(task) =>
                  setDetailView({ type: "rfq", task, visible: true })
                }
              />
            </Tabs.TabPane>
          )}
          {hasFeature("extendedTasks") && (
            <Tabs.TabPane
              tab={<div style={tabStyle}>{t("customerDetails.quotes")}</div>}
              key="3"
            >
              <Quotes
                customerId={customer._id || ""}
                viewDetails={(task) =>
                  setDetailView({ type: "quote", task, visible: true })
                }
              />
            </Tabs.TabPane>
          )}
          {hasFeature("extendedTasks") && (
            <Tabs.TabPane
              tab={<div style={tabStyle}>{t("customerDetails.invoices")}</div>}
              key="5"
            >
              <Invoices
                customerId={customer._id || ""}
                viewDetails={(task) =>
                  setDetailView({ type: "invoice", task, visible: true })
                }
              />
            </Tabs.TabPane>
          )}
        </Tabs>
      )}

      <TaskDetail
        {...detailView}
        onClose={() =>
          setDetailView({ task: {} as Task, visible: false, type: "task" })
        }
      />

      <CustomerEdit
        // @ts-ignore
        visible={customerState.isEditing}
        editedRecord={customerState.customer}
        updateCustomerLocally={() => null}
        customerModified={(customer: Customer) =>
          setCustomerState({ isEditing: false, customer })
        }
        handleCancel={() =>
          setCustomerState((old) => ({
            ...old,
            isEditing: false,
          }))
        }
      />

      <TaskEdit
        visible={creatingTask}
        // @ts-ignore
        task={{ customer, preFill: true } as Task}
        onClose={() => setCreatingTask(false)}
        onSave={() => setCreatingTask(false)}
        duplicateTask={() => null}
      />
    </Drawer>
  );
};

export default withTranslation()(CustomerDetailsDrawer);
