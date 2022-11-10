import { SettingOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Collapse,
  DatePicker,
  Dropdown,
  Form,
  Input,
  Menu,
  Popconfirm,
  Popover,
  Row,
  Select,
} from "antd";
import moment from "moment";
import React, { useContext } from "react";
import { WithTranslation, withTranslation } from "react-i18next";

import { Subtask, UploadedFile, User } from "../../../../../../types";
import UserContext from "../../../../../../UserContext";
import { getUsername, isTaskCompleted } from "../../../../../../utils/helpers";
import TaskFiles from "../../../../../TaskFiles/TaskFiles";
import TaskNotesList from "../../../../TaskNotes/TaskNotesList";
import TaskStatusControl from "../../TaskDrawerHeader/Components/TaskStatusControl";

interface SubtasksViewProps extends WithTranslation {
  subtasks: Subtask[];
  editingId: string;
  newTitle: string;
  creatingTask: boolean;
  updateState: (changes: {
    editingId?: string;
    newTitle?: string;
    creatingTask?: boolean;
  }) => void;
  canFetchMore: boolean;
  assignees: User[];
  fetchMore: () => void;
  createNewTask: () => void;
  updateSubtask: (_id: string, changes: Subtask) => void;
  deleteSubtask: (_id: string) => void;
  saveFileOffline: (file: UploadedFile) => void;
  removeFileOfline: (uid: string) => void;
  onStatusChange: (changes: Subtask) => void;
}

const SubtasksView = ({
  t,
  subtasks,
  editingId,
  newTitle,
  creatingTask,
  canFetchMore,
  fetchMore,
  assignees,
  updateState,
  createNewTask,
  updateSubtask,
  deleteSubtask,
  saveFileOffline,
  removeFileOfline,
  onStatusChange,
}: SubtasksViewProps) => {
  const { hasPermission }: any = useContext(UserContext);
  return (
    <div className="tw-my-10">
      <div className="tw-flex tw-items-center tw-mb-4">
        <h1 className="tw-text-dark tw-text-xl">{t("subtasks.pageTitle")}</h1>
      </div>
      <Collapse defaultActiveKey={["1"]} accordion>
        {subtasks
          .sort((a, b) => (b.rank < a.rank ? 1 : -1))
          .map((subtask) => {
            const employees = (subtask?.assignees || [])?.concat(
              (assignees || []).filter(
                (item) => !subtask?.assigneeIds?.includes(item._id || ""),
              ),
            );
            return (
              <Collapse.Panel
                key={subtask._id}
                className="s-hover-parent"
                header={
                  editingId !== subtask._id ? (
                    subtask.title
                  ) : (
                    <Input
                      placeholder={t("subtasks.enterSubtaskTitle")}
                      value={newTitle}
                      className="tw-ml-1 tw-w-11/12"
                      onBlur={() =>
                        updateSubtask(subtask._id || "", {
                          title: newTitle,
                        } as Subtask)
                      }
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        updateState({ newTitle });
                      }}
                      onPressEnter={() => {
                        updateSubtask(subtask._id || "", {
                          title: newTitle,
                        } as Subtask);
                      }}
                      autoFocus
                    />
                  )
                }
                extra={
                  <Dropdown
                    trigger={["click"]}
                    overlay={
                      <Menu className="s-hover-parent">
                        <Menu.Item
                          key="0"
                          onClick={({ domEvent }) => {
                            domEvent.stopPropagation();
                            updateState({
                              editingId: subtask._id,
                              newTitle: subtask.title,
                            });
                          }}
                        >
                          <span className="s-text-dark">
                            {t("subtasks.subtaskEdit")}
                          </span>
                        </Menu.Item>
                        <Menu.Item
                          key="1"
                          onClick={({ domEvent }) => domEvent.stopPropagation()}
                        >
                          <Popconfirm
                            title={t("subtasks.confirmDeleteSubtask")}
                            onConfirm={() => deleteSubtask(subtask._id || "")}
                            okButtonProps={{ danger: true }}
                            okText={t("global.delete")}
                            cancelText={t("global.cancel")}
                          >
                            <div className="tw-text-red-500">
                              {t("subtasks.deleteSubtask")}
                            </div>
                          </Popconfirm>
                        </Menu.Item>
                      </Menu>
                    }
                    placement="bottomCenter"
                  >
                    <SettingOutlined
                      className="s-text-gray s-hover-target tw-align-text-baseline"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Dropdown>
                }
              >
                <TaskStatusControl
                  task={subtask}
                  onStatusChange={(changes) =>
                    onStatusChange({ _id: subtask._id, ...changes } as Subtask)
                  }
                  onConvertToInvoice={() => null}
                />
                <Row gutter={26} className="tw-mt-5">
                  <Col span={12}>
                    <Form.Item
                      labelCol={{ span: 24 }}
                      label={
                        <span className="s-main-font s-main-text-color">
                          {t("taskedit.dueDate")}
                        </span>
                      }
                    >
                      <div>
                        <DatePicker
                          defaultValue={
                            subtask.endAt ? moment(subtask.endAt) : undefined
                          }
                          className="st-field-color st-placeholder-color tw-w-full"
                          format={"YYYY-MM-DD HH:mm"}
                          showTime={{ minuteStep: 15, format: "HH:mm" }}
                          allowClear
                          onChange={(endAt) =>
                            updateSubtask(subtask._id || "", {
                              endAt,
                            } as Subtask)
                          }
                        />
                      </div>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      labelCol={{ span: 24 }}
                      label={
                        <span className="s-std-text">
                          {t("taskEdit.employee")}
                        </span>
                      }
                    >
                      <Select
                        defaultValue={subtask.assigneeIds}
                        onChange={(assigneeIds: string[]) =>
                          updateSubtask(subtask._id || "", {
                            assigneeIds,
                          } as Subtask)
                        }
                        mode="multiple"
                        maxTagCount={3}
                        maxTagTextLength={5}
                        className="st-field-color st-placeholder-color tw-w-full s-tags-color"
                        placeholder={t("taskEdit.selectEmployee")}
                      >
                        {(employees || []).map((employee) => (
                          <Select.Option
                            key={employee._id}
                            value={employee._id || ""}
                          >
                            {getUsername(employee)}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <div className="tw-mt-5">
                  <TaskFiles
                    category="task"
                    taskId={subtask._id || ""}
                    disabled={
                      isTaskCompleted(subtask.status) &&
                      !hasPermission("canManageCompletedTasks")
                    }
                    saveFileOffline={saveFileOffline}
                    removeOffline={removeFileOfline}
                  />
                </div>
                <TaskNotesList taskId={subtask._id || ""} />
              </Collapse.Panel>
            );
          })}
      </Collapse>
      <div className="tw-flex tw-items-center tw-mt-1">
        <Popover
          content={
            <Input
              placeholder={t("subtasks.enterSubtaskTitle")}
              onPressEnter={createNewTask}
              onBlur={() =>
                updateState({
                  editingId: "",
                  newTitle: "",
                  creatingTask: false,
                })
              }
              onChange={(e) => {
                const newTitle = e.target.value;
                updateState({ newTitle });
              }}
              value={newTitle}
              autoFocus
            />
          }
          title={t("subtasks.newSubtask")}
          visible={creatingTask}
          placement="topLeft"
        >
          <Button
            type="link"
            className="tw-text-sm tw-pl-0 tw-mr-auto"
            onClick={() =>
              updateState({ creatingTask: true, editingId: "", newTitle: "" })
            }
          >
            + {t("subtasks.addSubtask")}
          </Button>
        </Popover>
        {canFetchMore && (
          <Button
            type="link"
            className="tw-px-0 tw-ml-auto"
            onClick={() => fetchMore()}
          >
            {t("subtasks.showMore")}
          </Button>
        )}
      </div>
    </div>
  );
};

export default withTranslation()(SubtasksView);
