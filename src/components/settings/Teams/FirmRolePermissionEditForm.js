import "@ant-design/compatible/assets/index.css";

import { Form } from "@ant-design/compatible";
import mixpanel from "analytics/mixpanel";
import { Input, List, Radio, Select, Switch, TimePicker } from "antd";
import moment from "moment";
import { path } from "rambdax";
import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import WeekDayPicker from "utils/components/WeekDayPicker";
import { getLocalHours, getUTCHours } from "utils/helpers";

import { doEndEditingFirmRole } from "./../../../store/firm/roles";

const allowableNotificationTypes = [
  "TaskCreated",
  "TaskUpdated",
  "TaskAssigneesUpdated",
  "TaskStatusUpdated",
  "TaskRemoved",
  "StockAdd",
  "StockRemove",
  "StockAdjust",
  "StockTransfer",
  "StockSale",
  "SummaryNotification",
  "RFQCreated",
  "RFQUpdated",
  "RFQRemoved",
  "QuoteCreated",
  "QuoteUpdated",
  "QuoteRemoved",
  "InvoiceCreated",
  "InvoiceUpdated",
  "InvoiceRemoved",
];

class FirmRolePermissionEditForm extends Component {
  handleWeekDaysChange = (change) => {
    let days =
      this.props.form.getFieldValue(
        "permissions.summaryNotificationSchedule.weekDays",
      ) || [];
    let newDays = [];
    if (days.includes(change)) {
      newDays = days.filter((day) => day !== change);
    } else {
      newDays = days.concat([change]);
    }
    if (newDays.length === 0) {
      newDays = [0];
    }
    this.props.form.setFieldsValue({
      "permissions.summaryNotificationSchedule.weekDays": newDays,
    });
  };

  render() {
    const { role = {}, form, featureFlags, t } = this.props;
    const { getFieldDecorator, setFieldsValue, getFieldValue } = form;
    const { taskCompletionFeedback: npsOn, extendedTasks } = featureFlags || {};

    const data = [
      {
        title: t("permissions.canViewCustomersLabel"),
        description: t("permissions.canViewCustomersDescription"),
        key: "permissions.canViewCustomers",
      },
      {
        title: t("permissions.canCreateCustomersLabel"),
        description: t("permissions.canCreateCustomersDescription"),
        key: "permissions.canCreateCustomers",
      },
      {
        title: t("permissions.canCreateTasksLabel"),
        description: t("permissions.canCreateTasksDescription"),
        key: "permissions.canCreateTasks",
      },
      {
        title: t("permissions.canRemoveTasksLabel"),
        description: t("permissions.canRemoveTasksDescription"),
        key: "permissions.canRemoveTasks",
      },
      {
        title: t("permissions.canViewAllTasksLabel"),
        description: t("permissions.canViewAllTasksDescription"),
        key: "permissions.canViewAllTasks",
      },
      {
        title: t("permissions.canChangeDueDateLabel"),
        description: t("permissions.canChangeDueDateDescription"),
        key: "permissions.canChangeDueDate",
      },
      {
        title: t("permissions.hideCompletedTasksLabel"),
        description: t("permissions.hideCompletedTasksDescription"),
        key: "permissions.hideCompletedTasks",
      },
      {
        title: t("permissions.canCreateStockLabel"),
        description: t("permissions.canCreateStockDescription"),
        key: "permissions.canCreateStock",
      },
      {
        title: t("permissions.canManageServicesLabel"),
        description: t("permissions.canManageServicesDescription"),
        key: "permissions.canManageServices",
      },
      {
        title: t("permissions.canManageCompletedTasksLabel"),
        description: t("permissions.canManageCompletedTasksDescription"),
        key: "permissions.canManageCompletedTasks",
      },
      {
        title: t("permissions.canEditUsersLabel"),
        description: t("permissions.canEditUsersDescription"),
        key: "permissions.canEditUsers",
      },
      {
        title: t("permissions.canManageSettingsLabel"),
        description: t("permissions.canManageSettingsDescription"),
        key: "permissions.canManageSettings",
      },
      {
        title: t("permissions.canViewReportsLabel"),
        description: t("permissions.canViewReportsDescription"),
        key: "permissions.canViewReports",
      },
      {
        title: t("permissions.canManageCustomFieldsLabel"),
        description: t("permissions.canManageCustomFieldsDescription"),
        key: "permissions.canManageCustomFields",
      },
      {
        title: t("permissions.canEditStockPriceLabel"),
        description: t("permissions.canEditStockPriceDescription"),
        key: "permissions.canEditStockPrice",
      },
      {
        title: t("permissions.deviceLocationRequiredLabel"),
        description: t("permissions.deviceLocationRequiredDescription"),
        key: "permissions.deviceLocationRequired",
      },
      {
        title: t("Manage RFQs"),
        description: t("Allow this role to manage RFQs"),
        key: "permissions.canManageRFQs",
      },
      {
        title: t("Manage Quotes"),
        description: t("Allow this role to manage Quotes"),
        key: "permissions.canManageQuotes",
      },
      {
        title: t("Manage Invoices"),
        description: t("Allow this role to manage Invoices"),
        key: "permissions.canManageInvoices",
      },
      {
        title: t("permissions.manageCollectionsLabel"),
        description: t("permissions.manageCollectionsDescription"),
        key: "permissions.canManageDailyCollection",
      },
      {
        title: t("permissions.allowedNotificationsLabel"),
        description: t("permissions.allowedNotificationsDescription"),
        key: "permissions.allowedNotifications",
      },
    ];
    if (
      (data || []).findIndex(
        (item) => item.key === "permissions.canManageFeedback",
      ) === -1 &&
      npsOn
    ) {
      data.push({
        title: t("permissions.canManageFeedbackLabel"),
        description: t("permissions.canManageFeedbackDescription"),
        key: "permissions.canManageFeedback",
      });
    }

    if (
      (getFieldValue("permissions.allowedNotifications") || []).includes(
        "SummaryNotification",
      )
    ) {
      data.push({
        title: t(
          "summaryNotificationSchedule.summaryNotificationScheduleLabel",
        ),
        description: "",
        key: "permissions.summaryNotificationSchedule",
      });
    }

    let filteredData = data;
    if (!extendedTasks) {
      filteredData = data.filter(
        (item) =>
          item.title !== t("Manage RFQs") &&
          item.title !== t("Manage Quotes") &&
          item.title !== t("Manage Invoices"),
      );
    }
    return (
      <div>
        <Form>
          <Form.Item style={{ display: "none" }}>
            {getFieldDecorator("_id")(<Select></Select>)}
          </Form.Item>
          <Form.Item style={{ display: "none" }}>
            {getFieldDecorator("permissions.canViewCustomers", {
              valuePropName: "checked",
            })(<Switch />)}
          </Form.Item>
          <Form.Item style={{ display: "none" }}>
            {getFieldDecorator("permissions.canCreateCustomers", {
              valuePropName: "checked",
            })(<Switch />)}
          </Form.Item>
          <Form.Item style={{ display: "none" }}>
            {getFieldDecorator("permissions.canCreateTasks", {
              valuePropName: "checked",
            })(<Switch />)}
          </Form.Item>
          <Form.Item style={{ display: "none" }}>
            {getFieldDecorator("permissions.canRemoveTasks", {
              valuePropName: "checked",
            })(<Switch />)}
          </Form.Item>
          <Form.Item style={{ display: "none" }}>
            {getFieldDecorator("permissions.canViewAllTasks", {
              valuePropName: "checked",
            })(<Switch />)}
          </Form.Item>
          <Form.Item style={{ display: "none" }}>
            {getFieldDecorator("permissions.canEditUsers", {
              valuePropName: "checked",
            })(<Switch />)}
          </Form.Item>
          <Form.Item style={{ display: "none" }}>
            {getFieldDecorator("permissions.canManageSettings", {
              valuePropName: "checked",
            })(<Switch />)}
          </Form.Item>
          <Form.Item style={{ display: "none" }}>
            {getFieldDecorator("permissions.canViewReports", {
              valuePropName: "checked",
            })(<Switch />)}
          </Form.Item>
          <Form.Item style={{ display: "none" }}>
            {getFieldDecorator("permissions.canManageServices", {
              valuePropName: "checked",
            })(<Switch />)}
          </Form.Item>
          <Form.Item style={{ display: "none" }}>
            {getFieldDecorator("permissions.canManageCompletedTasks", {
              valuePropName: "checked",
            })(<Switch />)}
          </Form.Item>
          <Form.Item style={{ display: "none" }}>
            {getFieldDecorator("permissions.hideCompletedTasks")(
              <Radio.Group>
                <Radio value="never">
                  {t("permissions.hideCompletedTasksNever")}
                </Radio>
                <Radio value="instantly">
                  {t("permissions.hideCompletedTasksInstantly")}
                </Radio>
                <Radio value="after24Hours">
                  {t("permissions.hideCompletedTasksAfter24Hours")}
                </Radio>
              </Radio.Group>,
            )}
          </Form.Item>
          <Form.Item style={{ display: "none" }}>
            {getFieldDecorator("permissions.canCreateStock", {
              valuePropName: "checked",
            })(<Switch />)}
          </Form.Item>
          <Form.Item style={{ display: "none" }}>
            {getFieldDecorator("permissions.canManageCustomFields", {
              valuePropName: "checked",
            })(<Switch />)}
          </Form.Item>
          <Form.Item style={{ display: "none" }}>
            {getFieldDecorator("permissions.canEditStockPrice", {
              valuePropName: "checked",
            })(<Switch />)}
          </Form.Item>
          <Form.Item style={{ display: "none" }}>
            {getFieldDecorator("permissions.deviceLocationRequired", {
              valuePropName: "checked",
            })(<Switch />)}
          </Form.Item>

          {npsOn && (
            <Form.Item style={{ display: "none" }}>
              {getFieldDecorator("permissions.canManageFeedback", {
                valuePropName: "checked",
              })(<Switch />)}
            </Form.Item>
          )}
          {extendedTasks && (
            <>
              <Form.Item style={{ display: "none" }}>
                {getFieldDecorator("permissions.canManageRFQs", {
                  valuePropName: "checked",
                })(<Switch />)}
              </Form.Item>
              <Form.Item style={{ display: "none" }}>
                {getFieldDecorator("permissions.canManageAllRFQs", {
                  valuePropName: "checked",
                })(<Switch />)}
              </Form.Item>
              <Form.Item style={{ display: "none" }}>
                {getFieldDecorator("permissions.canManageQuotes", {
                  valuePropName: "checked",
                })(<Switch />)}
              </Form.Item>
              <Form.Item style={{ display: "none" }}>
                {getFieldDecorator("permissions.canManageAllQuotes", {
                  valuePropName: "checked",
                })(<Switch />)}
              </Form.Item>
              <Form.Item style={{ display: "none" }}>
                {getFieldDecorator("permissions.canManageInvoices", {
                  valuePropName: "checked",
                })(<Switch />)}
              </Form.Item>
            </>
          )}
          <Form.Item style={{ display: "none" }}>
            {getFieldDecorator("permissions.canManageDailyCollection", {
              valuePropName: "checked",
            })(<Switch />)}
          </Form.Item>
          <Form.Item style={{ display: "none" }}>
            {getFieldDecorator("permissions.canChangeDueDate", {
              valuePropName: "checked",
            })(<Switch />)}
          </Form.Item>
          <Form.Item style={{ display: "none" }}>
            {getFieldDecorator("permissions.allowedNotifications")(
              <Select mode="multiple" />,
            )}
          </Form.Item>
          <Form.Item style={{ display: "none" }}>
            {getFieldDecorator("permissions.summaryNotificationSchedule.time")(
              <Input />,
            )}
          </Form.Item>
          <Form.Item style={{ display: "none" }}>
            {getFieldDecorator(
              "permissions.summaryNotificationSchedule.weekDays",
            )(<Select />)}
          </Form.Item>
        </Form>

        <List
          size="large"
          header={
            <span className="tw-font-medium tw-text-lg s-main-text-color s-main-font s-semibold">
              {role.title}
            </span>
          }
          bordered
          dataSource={filteredData}
          renderItem={(item) => {
            if (item.key === "permissions.hideCompletedTasks") {
              return (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <span className="s-main-text-color s-main-font s-semibold tw-text-base">
                        {item.title}
                      </span>
                    }
                    description={
                      <div>
                        <div className="s-light-text-color">
                          {item.description}
                        </div>
                        <div>
                          <Radio.Group
                            onChange={(e) =>
                              setFieldsValue({ [item.key]: e.target.value })
                            }
                            value={getFieldValue(item.key)}
                          >
                            <Radio value="never">
                              <span className="s-light-text-color s-main-font s-semibold">
                                {t("permissions.hideCompletedTasksNever")}
                              </span>
                            </Radio>
                            <Radio value="instantly">
                              <span className="s-light-text-color s-main-font s-semibold">
                                {t("permissions.hideCompletedTasksInstantly")}
                              </span>
                            </Radio>
                            <Radio value="after24Hours">
                              <span className="s-light-text-color s-main-font s-semibold">
                                {t(
                                  "permissions.hideCompletedTasksAfter24Hours",
                                )}
                              </span>
                            </Radio>
                          </Radio.Group>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              );
            }
            if (item.key === "permissions.summaryNotificationSchedule") {
              return (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <span className="s-main-text-color s-main-font s-semibold tw-text-base">
                        {t(
                          "summaryNotificationSchedule.summaryNotificationScheduleLabel",
                        )}
                      </span>
                    }
                    description={
                      <div className="tw-flex tw-items-center s-main-text-color">
                        <TimePicker
                          className="tw-w-56 tw-mr-64"
                          format="HH:mm"
                          // minuteStep={15}
                          onChange={(value) => {
                            setFieldsValue({
                              "permissions.summaryNotificationSchedule.time": value,
                            });
                          }}
                          value={moment(
                            getFieldValue(
                              "permissions.summaryNotificationSchedule.time",
                            ),
                          )}
                          allowClear={false}
                        />
                        <div className="tw-flex-1">
                          <WeekDayPicker
                            value={getFieldValue(
                              "permissions.summaryNotificationSchedule.weekDays",
                            )}
                            onChange={(day) => this.handleWeekDaysChange(day)}
                          />
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              );
            }
            if (item.key === "permissions.canManageQuotes") {
              return (
                <List.Item
                  actions={[
                    <Switch
                      checked={getFieldValue(item.key)}
                      onChange={(value) =>
                        setFieldsValue({ [item.key]: value })
                      }
                    />,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <span className="s-main-text-color s-main-font s-semibold tw-text-base">
                        {item.title}
                      </span>
                    }
                    description={
                      <div>
                        <div className="s-light-text-color">
                          {item.description}
                        </div>
                        <div>
                          <Radio.Group
                            disabled={!getFieldValue(item.key)}
                            onChange={(e) => {
                              const value = e.target.value === "all";
                              setFieldsValue({
                                "permissions.canManageAllQuotes": value,
                              });
                            }}
                            value={
                              getFieldValue("permissions.canManageAllQuotes")
                                ? "all"
                                : "own"
                            }
                          >
                            <Radio value="own">
                              <span className="s-light-text-color s-main-font s-semibold">
                                {t("permissions.manageOwnQuotes")}
                              </span>
                            </Radio>
                            <Radio value="all">
                              <span className="s-light-text-color s-main-font s-semibold">
                                {t("permissions.manageAllQuotes")}
                              </span>
                            </Radio>
                          </Radio.Group>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              );
            }
            if (item.key === "permissions.canManageRFQs") {
              return (
                <List.Item
                  actions={[
                    <Switch
                      checked={getFieldValue(item.key)}
                      onChange={(value) =>
                        setFieldsValue({ [item.key]: value })
                      }
                    />,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <span className="s-main-text-color s-main-font s-semibold tw-text-base">
                        {item.title}
                      </span>
                    }
                    description={
                      <div>
                        <div className="s-light-text-color">
                          {item.description}
                        </div>
                        <div>
                          <Radio.Group
                            disabled={!getFieldValue(item.key)}
                            onChange={(e) => {
                              const value = e.target.value === "all";
                              setFieldsValue({
                                "permissions.canManageAllRFQs": value,
                              });
                            }}
                            value={
                              getFieldValue("permissions.canManageAllRFQs")
                                ? "all"
                                : "assigned"
                            }
                          >
                            <Radio value="assigned">
                              <span className="s-light-text-color s-main-font s-semibold">
                                {t("permissions.manageAssignedRFQs")}
                              </span>
                            </Radio>
                            <Radio value="all">
                              <span className="s-light-text-color s-main-font s-semibold">
                                {t("permissions.manageAllRFQs")}
                              </span>
                            </Radio>
                          </Radio.Group>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              );
            }
            return (
              <List.Item
                actions={
                  item.key === "permissions.allowedNotifications"
                    ? [
                        <Select
                          mode="multiple"
                          maxTagCount={3}
                          maxTagTextLength={5}
                          placeholder={t(
                            "permissions.allowedNotificationsPlaceholder",
                          )}
                          value={getFieldValue(
                            "permissions.allowedNotifications",
                          )}
                          onChange={(value) =>
                            setFieldsValue({ [item.key]: value })
                          }
                          className="tw-text-left"
                          style={{ width: "350px" }}
                        >
                          {allowableNotificationTypes.map((type) => (
                            <Select.Option value={type} key={type}>
                              {t(`permissions.allowedNotifications.${type}`)}
                            </Select.Option>
                          ))}
                        </Select>,
                      ]
                    : [
                        <Switch
                          checked={getFieldValue(item.key)}
                          onChange={(value) =>
                            setFieldsValue({ [item.key]: value })
                          }
                        />,
                      ]
                }
              >
                <List.Item.Meta
                  title={
                    <span className="s-main-text-color s-main-font s-semibold tw-text-base">
                      {item.title}
                    </span>
                  }
                  description={
                    <span className="s-light-text-color">
                      {item.description}
                    </span>
                  }
                />
              </List.Item>
            );
          }}
        />
      </div>
    );
  }
}

const AntForm = Form.create({
  name: "firm-role-permissions",
  mapPropsToFields({ role }) {
    const {
      _id,
      permissions: {
        canCreateCustomers,
        canViewCustomers,
        canCreateTasks,
        canRemoveTasks,
        canViewAllTasks,
        hideCompletedTasks,
        canEditUsers,
        canManageSettings,
        canViewReports,
        canCreateStock,
        canManageServices,
        canManageCompletedTasks,
        canManageCustomFields,
        canEditStockPrice,
        deviceLocationRequired,
        canManageFeedback,
        canManageRFQs,
        canManageAllRFQs = false,
        canManageQuotes,
        canManageAllQuotes = false,
        canManageInvoices,
        canManageDailyCollection,
        canChangeDueDate = true,
        allowedNotifications,
        summaryNotificationSchedule,
      } = {},
    } = role || {};
    const { hour = 18, minute = 0, weekDays = [0] } =
      summaryNotificationSchedule || {};
    return {
      _id: Form.createFormField({
        value: _id,
      }),
      "permissions.canCreateCustomers": Form.createFormField({
        value: canCreateCustomers,
      }),
      "permissions.canViewCustomers": Form.createFormField({
        value: canViewCustomers,
      }),
      "permissions.canCreateTasks": Form.createFormField({
        value: canCreateTasks,
      }),
      "permissions.canCreateStock": Form.createFormField({
        value: canCreateStock,
      }),
      "permissions.canRemoveTasks": Form.createFormField({
        value: canRemoveTasks,
      }),
      "permissions.canViewAllTasks": Form.createFormField({
        value: canViewAllTasks,
      }),
      "permissions.hideCompletedTasks": Form.createFormField({
        value: hideCompletedTasks,
      }),
      "permissions.canEditUsers": Form.createFormField({
        value: canEditUsers,
      }),
      "permissions.canManageSettings": Form.createFormField({
        value: canManageSettings,
      }),
      "permissions.canManageServices": Form.createFormField({
        value: canManageServices,
      }),
      "permissions.canManageCompletedTasks": Form.createFormField({
        value: canManageCompletedTasks,
      }),
      "permissions.canViewReports": Form.createFormField({
        value: canViewReports,
      }),
      "permissions.canManageCustomFields": Form.createFormField({
        value: canManageCustomFields,
      }),
      "permissions.canEditStockPrice": Form.createFormField({
        value: canEditStockPrice,
      }),
      "permissions.deviceLocationRequired": Form.createFormField({
        value: deviceLocationRequired,
      }),
      "permissions.canManageFeedback": Form.createFormField({
        value: canManageFeedback,
      }),
      "permissions.canManageRFQs": Form.createFormField({
        value: canManageRFQs,
      }),
      "permissions.canManageAllRFQs": Form.createFormField({
        value: canManageAllRFQs,
      }),
      "permissions.canManageQuotes": Form.createFormField({
        value: canManageQuotes,
      }),
      "permissions.canManageAllQuotes": Form.createFormField({
        value: canManageAllQuotes,
      }),
      "permissions.canManageInvoices": Form.createFormField({
        value: canManageInvoices,
      }),
      "permissions.canManageDailyCollection": Form.createFormField({
        value: canManageDailyCollection,
      }),
      "permissions.canChangeDueDate": Form.createFormField({
        value: canChangeDueDate,
      }),
      "permissions.allowedNotifications": Form.createFormField({
        value: allowedNotifications,
      }),
      "permissions.summaryNotificationSchedule.time": Form.createFormField({
        value: moment().minute(minute).hour(getLocalHours(hour)),
      }),
      "permissions.summaryNotificationSchedule.weekDays": Form.createFormField({
        value: weekDays,
      }),
    };
  },
  onValuesChange({ doEndEditingFirmRole }, changedValues, allValues) {
    const { _id } = allValues;
    let update = { ...changedValues };
    if (
      changedValues.hasOwnProperty(
        "permissions.summaryNotificationSchedule.time",
      ) ||
      changedValues.hasOwnProperty(
        "permissions.summaryNotificationSchedule.weekDays",
      )
    ) {
      const time =
        allValues?.permissions?.summaryNotificationSchedule?.time ||
        moment().hour(18).minute(0);
      const days =
        allValues?.permissions?.summaryNotificationSchedule?.weekDays;

      update = {
        "permissions.summaryNotificationSchedule": {
          hour: +getUTCHours(moment(time).hour()),
          minute: moment(time).minute(),
          weekDays: days || [0],
        },
      };
    }
    const payload = Object.assign({ _id }, update);

    mixpanel.track("Permission updated");
    doEndEditingFirmRole(payload);
  },
})(FirmRolePermissionEditForm);

const TranslatedAntForm = withTranslation()(AntForm);

const mapStateToProps = (state) => {
  return {
    featureFlags: path("firm.data.featureFlags", state),
  };
};

const mapDispatchToProps = {
  doEndEditingFirmRole,
};

export default connect(mapStateToProps, mapDispatchToProps)(TranslatedAntForm);
