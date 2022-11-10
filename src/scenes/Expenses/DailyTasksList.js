import { MoreOutlined } from "@ant-design/icons";
import {
  Button,
  Dropdown,
  Empty,
  Menu,
  Popover,
  Select,
  Table,
  message,
} from "antd";
import React, { useContext, useState } from "react";
import { withTranslation } from "react-i18next";
import { getRTEText } from "utils/components/RTE/RTE";
import { currencyFormatter } from "utils/helpers/currencyFormatter";

import { TaskService } from "../../services";
import UserContext from "../../UserContext";
import ElasticSearchField from "../../utils/components/ElasticSearchField";
import {
  getCustomerName,
  getGrandTaxAmount,
  getGrandTotalWithoutTax,
  getUsername,
} from "../../utils/helpers";

function DailyAccountTaskList({ t, tasks = [], onTaskEdit }) {
  const { firm } = useContext(UserContext);
  const [transferPopover, setTransferPopover] = useState({
    visible: false,
    data: {},
    recordId: undefined,
    newCompletedById: undefined,
  });

  const handleJobTransfer = () => {
    if (transferPopover.newCompletedById && transferPopover.recordId) {
      TaskService.patch(transferPopover.recordId, {
        completedById: transferPopover.newCompletedById,
      }).then(
        (res) => {
          message.success(t("accounting.jobTransferSuccess"));
          setTransferPopover({
            visible: false,
            data: {},
            newCompletedById: "",
            recordId: undefined,
          });
        },
        (error) => message.error(t("accounting.jobTransferError")),
      );
    }
  };

  const jobCols = [
    {
      title: (
        <span className="s-col-title-simple">{t("taskList.customer")}</span>
      ),
      className: "s-pointer",
      dataIndex: "customer",
      width: "25%",
      render: (text, record) => (
        <div
          className="tw-truncate tw-w-40"
          title={getCustomerName(record.customer)}
        >
          {getCustomerName(record.customer)}
        </div>
      ),
      onCell: (record) => {
        return {
          onClick: () => onTaskEdit(record),
        };
      },
    },
    {
      title: (
        <span className="s-col-title ">{t("accounting.jobs.description")}</span>
      ),
      className: "s-pointer",
      dataIndex: "title",
      render: (text) => (
        <div
          className="tw-truncate"
          title={getRTEText(text)}
          style={{ width: "370px" }}
        >
          {getRTEText(text)}
        </div>
      ),
      onCell: (record) => {
        return {
          onClick: () => onTaskEdit(record),
        };
      },
    },
    {
      title: <span className="s-col-title">{t("stockList.KDV")}</span>,
      className: "s-pointer",
      width: "15%",
      align: "right",
      render: (text, record) =>
        currencyFormatter(
          getGrandTaxAmount(record.stock),
          false,
          firm.currencyFormat,
        ),
    },
    {
      title: <span className="s-col-title">{t("accounting.amount")}</span>,
      className: "s-pointer",
      dataIndex: "cost",
      align: "right",
      width: "20%",
      render: (text, record) =>
        currencyFormatter(
          getGrandTotalWithoutTax(record.stock),
          false,
          firm.currencyFormat,
        ),
      onCell: (record) => {
        return {
          onClick: () => onTaskEdit(record),
        };
      },
    },
    {
      dataIndex: "actions",
      width: "6%",
      render: (text, record) => (
        <UserContext.Consumer>
          {({ hasPermission }) => (
            <>
              <Dropdown
                overlay={
                  <Menu>
                    {hasPermission("canManageDailyCollection") && (
                      <Menu.Item
                        className="s-main-text-color s-main-font"
                        onClick={() =>
                          setTransferPopover({
                            visible: true,
                            data: record.completedBy,
                            recordId: record._id,
                            newCompletedById: record.completedById,
                          })
                        }
                      >
                        {t("accounting.transferJob")}
                      </Menu.Item>
                    )}
                    <Menu.Item
                      className="s-main-text-color s-main-font"
                      onClick={() => onTaskEdit(record)}
                    >
                      {t("global.edit")}
                    </Menu.Item>
                  </Menu>
                }
              >
                <MoreOutlined />
              </Dropdown>
              {transferPopover.recordId === record._id && (
                <Popover
                  visible={transferPopover.visible}
                  title={t("accounting.transferJob")}
                  placement="left"
                  trigger={"click"}
                  content={
                    <div className="tw-w-64">
                      <div>
                        <ElasticSearchField
                          entity="users"
                          value={transferPopover.newCompletedById}
                          currentValue={transferPopover.data}
                          renderOptions={(options) =>
                            options.map((option) => (
                              <Select.Option key={option._id}>
                                {getUsername(option)}
                              </Select.Option>
                            ))
                          }
                          className="st-field-color st-placeholder-color tw-w-full s-tags-color"
                          placeholder={t("taskEdit.selectCompletedBy")}
                          onChange={(value) => {
                            setTransferPopover({
                              ...transferPopover,
                              newCompletedById: value,
                            });
                          }}
                        />
                      </div>
                      <div className="tw-text-right tw-mt-3">
                        <Button
                          size="small"
                          className="tw-mr-2"
                          onClick={() =>
                            setTransferPopover({
                              visible: false,
                              data: {},
                              recordId: undefined,
                            })
                          }
                        >
                          {t("global.cancel")}
                        </Button>
                        <Button
                          type="primary"
                          size="small"
                          onClick={() => handleJobTransfer()}
                        >
                          {t("global.save")}
                        </Button>
                      </div>
                    </div>
                  }
                />
              )}
            </>
          )}
        </UserContext.Consumer>
      ),
    },
  ];

  return (
    <div>
      <p className="s-semibold tw-text-sm tw-underline s-main-font s-main-text-color">
        {t("accounting.jobs.pageTitle")}
      </p>
      <Table
        dataSource={tasks}
        columns={jobCols}
        rowKey={(record) => record._id}
        pagination={{ hideOnSinglePage: true }}
        locale={{
          emptyText: <Empty description={t("tables.noData")} />,
        }}
      />
      <div className="tw-flex tw-justify-end tw-mt-4 s-main-font s-main-text-color s-semibold">
        <span className="tw-mr-10">{t("accounting.total")}</span>
        <div className="tw-text-right tw-pr-6">
          {currencyFormatter(
            getGrandTaxAmount(
              tasks.reduce((all, curr) => [...all, ...(curr.stock || [])], []),
            ),
            false,
            firm.currencyFormat,
          )}
        </div>
        <div
          style={{ width: "14%", marginRight: "6%" }}
          className="tw-text-right tw-pr-4"
        >
          {currencyFormatter(
            getGrandTotalWithoutTax(
              tasks.reduce((all, curr) => [...all, ...(curr.stock || [])], []),
            ),
            false,
            firm.currencyFormat,
          )}
        </div>
      </div>
    </div>
  );
}

export default withTranslation()(DailyAccountTaskList);
