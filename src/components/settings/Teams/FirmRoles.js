import "@ant-design/compatible/assets/index.css";

import { Form } from "@ant-design/compatible";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Button,
  Empty,
  Input,
  InputNumber,
  Popconfirm,
  Popover,
  Table,
} from "antd";
import Appshell from "Appshell";
import i18next from "i18next";
import React from "react";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { getUsername } from "utils/helpers";

import {
  doAddNewFirmRole,
  doCancelEditingFirmRole,
  doEndEditingFirmRole,
  doFirmRoleFetchRequest,
  doFirmRoleRemove,
  doStartEditingFirmRole,
} from "../../../store/firm/roles";

const EditableContext = React.createContext();
class EditableCell extends React.Component {
  getInput = () => {
    if (this.props.inputType === "number") {
      return <InputNumber />;
    }
    return <Input maxLength={40} />;
  };

  renderCell = ({ getFieldDecorator }) => {
    const {
      editing,
      dataIndex,
      title,
      inputType,
      record,
      index,
      children,
      ...restProps
    } = this.props;
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item style={{ margin: 0 }}>
            {getFieldDecorator(dataIndex, {
              rules: [
                {
                  required: true,
                  message: `${i18next.t("global.inputMessage")} ${title}!`,
                },
              ],
              initialValue: record[dataIndex],
            })(this.getInput())}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  render() {
    return (
      <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>
    );
  }
}

class EditableTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = { deleteDialogueId: "" };
  }
  isEditing = (record) => record._id === this.props.editingId;

  cancel = () => {
    this.props.doCancelEditingFirmRole();
  };

  remove = (_id) => {
    this.props.doFirmRoleRemove({ _id });
    this.setState({ deleteDialogueId: "" });
  };

  save(form, _id) {
    form.validateFields((error, row) => {
      if (error) {
        return;
      }
      this.props.doEndEditingFirmRole(Object.assign(row, { _id }));
    });
  }

  edit(_id) {
    this.props.doStartEditingFirmRole(_id);
  }

  handleAdd = () => {
    this.props.doAddNewFirmRole();
  };

  columns = [
    {
      title: this.props.t("roles.title"),
      className: "s-text-dark",
      dataIndex: "title",
      width: "80%",
      editable: true,
      colspan: 2,
    },
    {
      render: (text, record) => {
        const { editingId, t } = this.props;
        const editable = this.isEditing(record);
        const assignedUsers = this.props.users?.filter(
          (user) => user.roleId === record._id,
        );
        const isAssigned = assignedUsers.length > 0;

        return editable ? (
          <span>
            <EditableContext.Consumer>
              {(form) => (
                // eslint-disable-next-line
                <a
                  onClick={() => this.save(form, record._id)}
                  style={{ marginRight: 8 }}
                >
                  {t("settings.save")}
                </a>
              )}
            </EditableContext.Consumer>
            <Popconfirm
              title={t("settings.cancelMsg")}
              onConfirm={() => this.cancel(record._id)}
              okButtonProps={{ danger: true }}
              okText={t("global.ok")}
              cancelText={t("global.cancel")}
            >
              <Button type="link">{t("settings.cancel")}</Button>
            </Popconfirm>
          </span>
        ) : (
          <React.Fragment>
            <Button
              type="link"
              className="s-gray-action"
              disabled={editingId !== ""}
              onClick={() => this.edit(record._id)}
            >
              {t("settings.edit")}
            </Button>
            <Popover
              title={
                isAssigned ? (
                  <div>
                    <FontAwesomeIcon
                      icon={faExclamationTriangle}
                      className="tw-text-yellow-500 tw-mr-3"
                    />
                    {t("global.attention")}
                  </div>
                ) : null
              }
              placement="topLeft"
              content={
                <div className="s-std-text ">
                  {isAssigned ? (
                    <>
                      <p className="tw-mb-2">{t('"roles.assignedTo"')}</p>
                      <ul className="tw-list-disc tw-list-inside">
                        {assignedUsers?.map((user) => (
                          <li>{getUsername(user)}</li>
                        ))}
                      </ul>
                      <p className="s-semibold tw-mt-2">
                        {t('"roles.reassignUsers"')}
                      </p>
                    </>
                  ) : (
                    <div>
                      <p className="s-semibold tw-mb-4">
                        {t("settings.deleteMsg")}
                      </p>
                      <div className="tw-flex tw-justify-end">
                        <Button
                          size="small"
                          type="primary"
                          danger
                          onClick={() => this.remove(record._id)}
                        >
                          {t("settings.delete")}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              }
              onVisibleChange={(visible) =>
                this.setState({ deleteDialogueId: visible ? record._id : "" })
              }
              destroyTooltipOnHide
              visible={this.state.deleteDialogueId === record._id}
              trigger="click"
            >
              <Button
                type={"link"}
                className="s-gray-action"
                disabled={editingId !== ""}
                onClick={() => this.setState({ deleteDialogueId: record._id })}
              >
                {t("settings.delete")}
              </Button>
            </Popover>
          </React.Fragment>
        );
      },
    },
  ];

  componentDidMount() {
    this.props.doFirmRoleFetchRequest();
  }

  render() {
    const components = {
      body: {
        cell: EditableCell,
      },
    };

    const columns = this.columns.map((col) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: (record) => ({
          record,
          inputType: col.dataIndex === "age" ? "number" : "text",
          dataIndex: col.dataIndex,
          title: col.title,
          editing: this.isEditing(record),
        }),
      };
    });

    const { roles } = this.props;

    const dataSource = roles.filter(
      (role) => !(role.title === "Owner" && role.type === "system"),
    );

    return (
      <Appshell activeLink={["settings", "roles"]}>
        <div className="md:tw-mx-20 xl:tw-mx-32">
          <h1 className="s-page-title tw-mb-5">
            {this.props.t("roles.title")}
          </h1>
          <EditableContext.Provider value={this.props.form}>
            <Table
              rowKey={"_id"}
              components={components}
              bordered
              dataSource={dataSource}
              columns={columns}
              rowClassName="editable-row"
              pagination={{
                onChange: this.cancel,
                hideOnSinglePage: true,
              }}
              locale={{
                emptyText: (
                  <Empty description={this.props.t("tables.noData")} />
                ),
              }}
            />
            <Button
              type="primary"
              className="w-56 tw-mt-5 light-add-btn"
              onClick={this.handleAdd}
            >
              + {this.props.t("settings.addNewField")}
            </Button>
          </EditableContext.Provider>
        </div>
      </Appshell>
    );
  }
}

const FirmRoles = Form.create()(EditableTable);

const mapStateToProps = (state) => {
  return {
    roles: Object.values(state.firmRoles.byIds),
    editingId: state.firmRoles.editingId,
    users: Object.values(state.users.byIds),
  };
};

const mapDispatchToProps = {
  doFirmRoleFetchRequest,
  doStartEditingFirmRole,
  doCancelEditingFirmRole,
  doEndEditingFirmRole,
  doAddNewFirmRole,
  doFirmRoleRemove,
};

const RoleSettings = connect(mapStateToProps, mapDispatchToProps)(FirmRoles);
export default withTranslation()(RoleSettings);
