import "@ant-design/compatible/assets/index.css";

import { Form } from "@ant-design/compatible";
import { Button, Empty, Input, InputNumber, Popconfirm, Table } from "antd";
import Appshell from "Appshell";
import i18next from "i18next";
import React from "react";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";

import {
  doAddNewFirmTeam,
  doCancelEditingFirmTeam,
  doEndEditingFirmTeam,
  doFirmTeamRemove,
  doStartEditingFirmTeam,
} from "../../../store/firm/teams";

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

    this.columns = [
      {
        title: props.t("teams.title"),
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
              <Popconfirm
                title={t("settings.deleteMsg")}
                onConfirm={() => this.remove(record._id)}
                okButtonProps={{ danger: true }}
                okText={t("global.delete")}
                cancelText={t("global.cancel")}
              >
                <Button
                  type="link"
                  className="s-gray-action"
                  disabled={editingId !== ""}
                >
                  {t("settings.delete")}
                </Button>
              </Popconfirm>
            </React.Fragment>
          );
        },
      },
    ];
  }

  isEditing = (record) => record._id === this.props.editingId;

  cancel = () => {
    this.props.doCancelEditingFirmTeam();
  };

  remove = (_id) => {
    this.props.doFirmTeamRemove({ _id });
  };

  save(form, _id) {
    form.validateFields((error, row) => {
      if (error) {
        return;
      }
      this.props.doEndEditingFirmTeam(Object.assign(row, { _id }));
    });
  }

  edit(_id) {
    this.props.doStartEditingFirmTeam(_id);
  }

  handleAdd = () => {
    this.props.doAddNewFirmTeam();
  };

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

    const { teams: dataSource, t } = this.props;

    function getStyles() {
      if (dataSource.length) {
        return { transform: "translateY(-48px)" };
      }
      return { marginTop: "1rem", marginBottom: "2rem" };
    }
    return (
      <Appshell activeLink={["settings", "teams"]}>
        <div className="md:tw-mx-20 xl:tw-mx-32">
          <h1 className="s-page-title tw-mb-5">{t("settings.teams")}</h1>
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
              }}
              locale={{
                emptyText: <Empty description={t("tables.noData")} />,
              }}
            />
            <Button
              type="primary"
              style={getStyles()}
              className="w-56 light-add-btn"
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

const FirmTeams = Form.create()(EditableTable);

const mapStateToProps = (state) => {
  return {
    teams: Object.values(state.teams.byIds),
    editingId: state.teams.editingId,
  };
};

const mapDispatchToProps = {
  doStartEditingFirmTeam,
  doCancelEditingFirmTeam,
  doEndEditingFirmTeam,
  doAddNewFirmTeam,
  doFirmTeamRemove,
};

const Teams = connect(mapStateToProps, mapDispatchToProps)(FirmTeams);

export default withTranslation()(Teams);
