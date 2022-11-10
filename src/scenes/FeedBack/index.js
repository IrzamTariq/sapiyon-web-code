import { DownOutlined } from "@ant-design/icons";
import { Button, Dropdown, Menu } from "antd";
import Appshell from "Appshell";
import ExportList from "components/ExportList";
import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import CustomFieldsList from "scenes/CustomFields/CustomFieldsList";
import Placeholder from "scenes/Tasks/TaskList/Components/Placeholder";
import exportRecords from "scenes/utils/exportRecords";
import TableSettings from "utils/components/TableSettings";

import { doFetchFeedbackTasks, doUpdateFeedback } from "../../store/feedback";
import FeedbackEdit from "./components/FeedbackEdit";
import FeedbackFilters from "./components/FeedbackFilters";
import TaskFeedbackList from "./components/TaskFeedbackList";

class FeedBack extends Component {
  constructor() {
    super();
    this.state = {
      showCustomFieldsModal: false,
      editedRecord: {},
      feedbackDrawerOpen: false,
      customerDetailsVisible: false,
      customerDetails: {},
      isEditingAddress: false,
      showExportList: false,
      changingLayout: false,
    };
  }

  componentDidMount() {
    this.props.doFetchFeedbackTasks();
  }

  render() {
    let {
      t,
      tasks,
      doUpdateFeedback,
      isEmpty = false,
      isLoading,
      firm = {},
    } = this.props;

    tasks = Object.values(tasks);
    let fields = firm?.forms?.taskCustomerFeedback || [];

    return (
      <div>
        <Appshell activeLink={["", "feedback"]}>
          <div className="tw-flex tw-justify-between tw-items-center">
            <span className="s-page-title">{t("feedback.pageTitle")}</span>
            <div>
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item
                      onClick={() =>
                        this.setState({ showCustomFieldsModal: true })
                      }
                    >
                      {t("fields.addCustomFields")}
                    </Menu.Item>
                    <Menu.Item
                      onClick={() =>
                        exportRecords({
                          serviceName: "tasks",
                          exportType: "allRecords",
                          feedbackTasks: true,
                        })
                      }
                    >
                      {t("jobExports.exportAll")}
                    </Menu.Item>
                    <Menu.Item
                      onClick={() => this.setState({ showExportList: true })}
                    >
                      {t("exports.pageTitle")}
                    </Menu.Item>
                    <Menu.Item
                      onClick={() => this.setState({ changingLayout: true })}
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
                  {t("global.actions")}
                  <DownOutlined className="tw-text-xs" />
                </Button>
              </Dropdown>
            </div>
          </div>
          <FeedbackFilters />
          {isEmpty ? (
            <Placeholder
              primaryAction={null}
              primaryText={t("dataPlaceholder.feedback.title")}
              secondaryText={t("dataPlaceholder.feedback.description")}
            />
          ) : (
            <TaskFeedbackList
              isLoading={isLoading}
              dataSource={tasks}
              editFeedback={(record) =>
                this.setState({
                  editedRecord: record,
                  feedbackDrawerOpen: true,
                })
              }
              fields={fields}
            />
          )}
          <CustomFieldsList
            form="taskCustomerFeedback"
            visible={this.state.showCustomFieldsModal}
            handleClose={() => this.setState({ showCustomFieldsModal: false })}
          />

          <FeedbackEdit
            visible={this.state.feedbackDrawerOpen}
            handleClose={() =>
              this.setState({ feedbackDrawerOpen: false, editedRecord: {} })
            }
            editedRecord={this.state.editedRecord}
            onSubmit={(completionFeedbackByCustomer) => {
              doUpdateFeedback({
                _id: this.state.editedRecord._id,
                completionFeedbackByCustomer,
              });
              this.setState({ editedRecord: {}, feedbackDrawerOpen: false });
            }}
            firmCustomFields={fields}
          />
          {this.state.showExportList && (
            <ExportList
              serviceName="tasks"
              visible={this.state.showExportList}
              toggleVisible={() => this.setState({ showExportList: false })}
            />
          )}
          <TableSettings
            table="feedback"
            visible={this.state.changingLayout}
            handleClose={() => this.setState({ changingLayout: false })}
          />
        </Appshell>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    tasks: state.feedback.byIds,
    isEmpty: state.feedback.isEmpty,
    firm: state.firm.data,
  };
};
const mapDispatchToProps = {
  doFetchFeedbackTasks,
  doUpdateFeedback,
};
const Translated = withTranslation()(FeedBack);
export default connect(mapStateToProps, mapDispatchToProps)(Translated);
