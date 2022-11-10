import { DownOutlined, MoreOutlined } from "@ant-design/icons";
import {
  Button,
  Dropdown,
  Empty,
  Menu,
  Popconfirm,
  Table,
  Tag,
  Tooltip,
} from "antd";
import Appshell from "Appshell";
import { path } from "rambdax";
import React from "react";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import CustomFieldsList from "scenes/CustomFields/CustomFieldsList";
import { getPaginationButtons } from "scenes/Tasks/helpers";
import TableSettings from "utils/components/TableSettings";
import { userColumns } from "utils/components/TableSettings/Components/StandardTableColumns";
import { handleSorting, setUpSorting } from "utils/helpers/tableEnhancements";

import { doFirmRoleFetchRequest } from "../../../store/firm/roles";
import {
  doBulkInviteUsersRequest,
  doCancelEditing,
  doDeleteUsersMany,
  doEndEditing,
  doFetchUsers,
  doHandlePageChange,
  doSaveChangesLocally,
  doStartEditing,
  doToggleInviteUsersForm,
  doUpdateSelectedRowKeys,
  doUpdateUsersSorts,
  doUserDeleteRequest,
} from "../../../store/users";
import UserContext from "../../../UserContext";
import {
  getOrderedColumns,
  isOwner,
  mapCustomFieldValuesToColumns,
} from "../../../utils/helpers";
import FilterBar from "../../FilterBar/FilterBar";
import ChangePassword from "../ChangePassword/ChangePassword";
import EmployeeDetails from "../UserDetails/UserDetails";
import EmployeeEdit from "../UserEdit/UserEdit";
import EmployeeInvite from "../UserInvite/UserInvite";
import UserCreateBtn from "./UserCreateBtn";

class EmployeeList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      search: {},
      userId: "",
      changePasswordModalVisible: false,
      customFieldsModalVisible: false,
      changingLayout: false,
    };
  }

  static contextType = UserContext;

  showDetails = (data) => {
    this.setState({ employee: data });
    this.toggleDetails(true);
  };
  toggleDetails = () => {
    this.setState({ visible: !this.state.visible });
  };

  remove = (_id) => {
    this.props.doUserDeleteRequest({ _id });
  };

  componentDidMount() {
    this.props.doFetchUsers({});
  }

  toggleChangePasswordModal = (id) => {
    this.setState((prev) => ({
      changePasswordModalVisible: true,
      userId: id,
    }));
  };

  applyPageChange = (pagination) =>
    this.props.doHandlePageChange({
      ...pagination,
      query: Object.entries(this.state.search).reduce(
        (p, [k, v]) => ({ ...p, [k]: { $search: v } }),
        {},
      ),
    });

  render() {
    const { visible, employee } = this.state;
    const { tableSettings = {}, firm } = this.context;
    const {
      users,
      doStartEditing,
      t,
      roles,
      total,
      skip,
      limit,
      isInviteFormVisible,
      doToggleInviteUsersForm,
      doBulkInviteUsersRequest,
      doUpdateUsersSorts,
      fields = [],
      sorts,
      isLoading,
      selectedRowKeys = [],
      doDeleteUsersMany,
      doUpdateSelectedRowKeys,

      doFetchUsers,
      doFirmRoleFetchRequest,
    } = this.props;

    const rowSelection = {
      selectedRowKeys,
      onChange: (rowIds, rows) =>
        doUpdateSelectedRowKeys(
          (rows || []).reduce(
            (acc, curr) =>
              curr.isOwner ||
              path("role.title", curr) === "Owner" ||
              path("role.type") === "system"
                ? acc
                : [curr._id, ...acc],
            [],
          ),
        ),
    };

    let columns = [
      {
        title: t("employeeList.fullName"),
        dataIndex: "fullName",
        ...setUpSorting(sorts, "fullName", 1),
        render: (text) => (
          <div
            className="tw-truncate"
            title={text}
            style={{ width: "inherit" }}
          >
            {text}
          </div>
        ),
      },
      {
        title: t("employeeList.email"),
        dataIndex: "email",
        ...setUpSorting(sorts, "email", 2),
        render: (text) => (
          <div
            className="tw-truncate"
            title={text}
            style={{ width: "inherit" }}
          >
            {text}
          </div>
        ),
      },
      {
        title: t("employeeList.telephone"),
        dataIndex: "phone",
        render: (text) => (
          <div
            className="tw-truncate"
            title={text}
            style={{ width: "inherit" }}
          >
            {text}
          </div>
        ),
      },
      {
        title: t("employeeList.team"),
        dataIndex: "teams",
        render: (text, record) => {
          return (
            <div style={{ width: "inherit" }}>
              {record.teams &&
                record.teams.map((team) => (
                  <Tag key={team._id}>{team.title}</Tag>
                ))}
            </div>
          );
        },
      },
      {
        title: t("employeeList.role"),
        dataIndex: ["role", "title"],
        // ...setUpSorting(sorts, "role.title", 3),
        render: (text, record) => {
          const content =
            record.role.type === "system" && record.role.title === "Owner"
              ? t("roles.owner")
              : text;
          return (
            <div title={content} style={{ width: "inherit" }}>
              {content}
            </div>
          );
        },
      },
      ...mapCustomFieldValuesToColumns(fields, firm),
      {
        title: t("employeeList.action"),
        dataIndex: "actions",
        render: (text, record) => (
          <UserContext.Consumer>
            {({ user }) =>
              !isOwner(record.role) || isOwner(user.role) ? (
                <span>
                  <Dropdown
                    trigger={["click"]}
                    overlay={
                      <Menu>
                        <Menu.Item
                          key="0"
                          onClick={() => doStartEditing(record)}
                        >
                          <span className="s-main-text-color">
                            {t("employeeList.edit")}
                          </span>
                        </Menu.Item>
                        {!isOwner(record.role) && (
                          <Menu.Item key="1">
                            <Popconfirm
                              title={t("settings.deleteMsg")}
                              onConfirm={() => this.remove(record._id)}
                              okButtonProps={{ danger: true }}
                              okText={t("global.delete")}
                              cancelText={t("global.cancel")}
                              placement="topLeft"
                            >
                              <div className="tw-text-red-500">
                                {t("employeeList.delete")}
                              </div>
                            </Popconfirm>
                          </Menu.Item>
                        )}
                        <Menu.Item
                          key="2"
                          onClick={() =>
                            this.toggleChangePasswordModal(record._id)
                          }
                        >
                          <span className="s-main-text-color">
                            {t("employeeList.changePassword")}
                          </span>
                        </Menu.Item>
                      </Menu>
                    }
                    placement="bottomCenter"
                  >
                    <MoreOutlined />
                  </Dropdown>
                </span>
              ) : null
            }
          </UserContext.Consumer>
        ),
      },
    ];

    columns = getOrderedColumns(columns, tableSettings["users"] || userColumns);

    columns = columns.reduce((all, curr) => {
      const { cellWidth = 200 } = curr;
      const current = {
        ...curr,
        title: (
          <Tooltip title={curr.title} placement="topLeft">
            <div className="s-col-title" style={{ minWidth: `${cellWidth}px` }}>
              {curr.title}
            </div>
          </Tooltip>
        ),
      };
      return current.dataIndex === "actions"
        ? [...all, current]
        : [
            ...all,
            {
              ...current,
              onCell: (record) => ({
                onClick: () => this.showDetails(record),
                className: "s-table-text s-pointer",
                style: { width: cellWidth },
              }),
            },
          ];
    }, []);

    const saveInviteFormRef = (ref) => (this.inviteForm = ref);

    const handleInviteFormOk = (e) => {
      const { form } = this.inviteForm.props;
      form.validateFields((err, values) => {
        if (err) {
          return;
        }
        const { confirmPassword, ...rest } = values;
        doBulkInviteUsersRequest(rest);
        form.resetFields();
      });
    };

    const handleInviteFormCancel = (e) => {
      doToggleInviteUsersForm();
    };

    return (
      <Appshell activeLink={["", "employees"]}>
        <div className="tw-flex tw-mb-5 tw-justify-between tw-items-center t-users">
          <span className="s-page-title">
            {t("employeeList.pageTitle")}
            {selectedRowKeys.length > 0 && (
              <Popconfirm
                title={t("global.deleteMsg")}
                okText={t("global.delete")}
                cancelText={t("global.cancel")}
                okButtonProps={{ danger: true }}
                onConfirm={() => doDeleteUsersMany({ selectedRowKeys })}
              >
                <Button danger className="tw-ml-5">
                  {t("bulkActions.delete")} {selectedRowKeys.length}{" "}
                  {t("bulkActions.selectedItems")}
                </Button>
              </Popconfirm>
            )}
          </span>
          <div>
            <UserContext.Consumer>
              {({ hasPermission }) => {
                return (
                  <>
                    <UserCreateBtn onClick={() => doStartEditing({})} />
                    <Dropdown
                      overlay={
                        <Menu>
                          <Menu.Item
                            key="1"
                            onClick={() => this.props.doToggleInviteUsersForm()}
                          >
                            {t("employeeList.bulkInvite")}
                          </Menu.Item>
                          {hasPermission("canManageCustomFields") && (
                            <Menu.Item
                              onClick={() =>
                                this.setState({
                                  customFieldsModalVisible: true,
                                })
                              }
                            >
                              {t("fields.addCustomFields")}
                            </Menu.Item>
                          )}
                          <Menu.Item
                            key="1"
                            onClick={() =>
                              this.setState({ changingLayout: true })
                            }
                          >
                            {t("tableSettings.changeLayout")}
                          </Menu.Item>
                        </Menu>
                      }
                    >
                      <Button
                        type="default"
                        className="tw-ml-3 tw-inline-flex tw-items-center"
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
        <FilterBar
          resetFilters={() => doFetchUsers({})}
          styleClasses="lg:tw-flex tw-mb-6 tw-w-full"
          fields={[
            {
              label: t("employeeList.fullName"),
              className: "tw-w-3/12 tw-mr-2",
              placeholder: t("users.searchByName"),
              type: "shortText",
              key: "fullName",
            },
            {
              label: t("employeeList.email"),
              className: "tw-w-3/12 tw-mr-2",
              placeholder: t("users.searchByEmail"),
              type: "shortText",
              key: "email",
            },
            {
              label: t("employeeList.telephone"),
              className: "tw-w-3/12 tw-mr-2",
              placeholder: t("users.searchByPhone"),
              type: "shortText",
              key: "phone",
            },
          ]}
          handleChange={(key, val) => {
            this.setState(
              { search: { ...this.state.search, [key]: val } },
              () => this.applyPageChange({}),
            );
          }}
        />
        <div>
          <EmployeeEdit />
          <EmployeeDetails
            visible={visible}
            employee={employee}
            handleCancel={() => this.toggleDetails()}
          />
          <EmployeeInvite
            wrappedComponentRef={saveInviteFormRef}
            visible={isInviteFormVisible}
            handleOk={handleInviteFormOk}
            handleCancel={handleInviteFormCancel}
            roles={roles.filter((item) => !isOwner(item))}
            doFirmRoleFetchRequest={doFirmRoleFetchRequest}
          />
          <ChangePassword
            visible={this.state.changePasswordModalVisible}
            userId={this.state.userId}
            handleClose={() =>
              this.setState({ changePasswordModalVisible: false })
            }
          />
          <CustomFieldsList
            form="users"
            visible={this.state.customFieldsModalVisible}
            handleClose={() =>
              this.setState({ customFieldsModalVisible: false, userId: "" })
            }
          />
          <TableSettings
            table="users"
            visible={this.state.changingLayout}
            handleClose={() => this.setState({ changingLayout: false })}
          />
          <UserContext.Consumer>
            {({ subscription, firm = {} }) => {
              const { plan = {} } = subscription;

              //TODO: check for tenure
              let showAddEmployeeButtons =
                subscription.subscriptionStatus === "TRIAL" ||
                (firm.userIds || []).length < plan.usersCount;

              return showAddEmployeeButtons && <></>;
            }}
          </UserContext.Consumer>
          <div>
            <Table
              rowKey="_id"
              rowSelection={rowSelection}
              columns={columns}
              dataSource={users}
              onChange={(a, b, sortData) =>
                handleSorting(sortData, sorts, (sortQuery) => {
                  doUpdateUsersSorts(sortQuery);
                  this.applyPageChange({});
                })
              }
              pagination={{
                total,
                onChange: (pageNumber, pageSize) =>
                  this.applyPageChange({ pageNumber, pageSize }),
                showTotal: (total, range) =>
                  `${range[0]} - ${range[1]} / ${total}`,
                style: { marginBottom: 0 },
                itemRender: (page, type) =>
                  getPaginationButtons(
                    page,
                    type,
                    skip / limit + 1,
                    skip + limit >= total,
                  ),
                position: ["bottomCenter"],
              }}
              loading={isLoading}
              scroll={{ x: true }}
              locale={{
                emptyText: <Empty description={t("tables.noData")} />,
              }}
              className="s-exTasks-scrolling"
            />
          </div>
        </div>
      </Appshell>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    total: state.users.total,
    limit: state.users.limit,
    skip: state.users.skip,
    users: Object.values(state.users.byIds),
    teams: Object.values(state.teams.byIds),
    fields: path("firm.data.forms.users", state) || [],
    roles: Object.values(state.firmRoles.byIds),
    isEditing: state.users.isEditing,
    error: state.users.error,
    editedRecord: state.users.editedRecord,
    isInviteFormVisible: state.users.isInviteFormVisible,
    selectedRowKeys: state.users.selectedRowKeys,
    sorts: state.users.sorts,
    isLoading: state.users.isLoading,
  };
};

const mapDispatchToProps = {
  doStartEditing,
  doCancelEditing,
  doSaveChangesLocally,
  doEndEditing,
  doUserDeleteRequest,
  doHandlePageChange,
  doFetchUsers,
  doToggleInviteUsersForm,
  doBulkInviteUsersRequest,
  doDeleteUsersMany,
  doUpdateSelectedRowKeys,
  doFirmRoleFetchRequest,
  doUpdateUsersSorts,
};
const Employees = connect(mapStateToProps, mapDispatchToProps)(EmployeeList);

export default withTranslation()(Employees);
