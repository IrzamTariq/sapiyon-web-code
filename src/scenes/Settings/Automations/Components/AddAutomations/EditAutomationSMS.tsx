import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { Checkbox, Modal, Select, message } from "antd";
import TextArea from "antd/lib/input/TextArea";
import { LabeledValue } from "antd/lib/select";
import i18next from "i18next";
import logger from "logger";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AutomationsService, TaskStatusService, UserService } from "services";
import {
  Automation,
  Firm,
  PaginatedFeathersResponse,
  TaskStatus,
  User,
  UserContextType,
} from "types";
import UserContext from "UserContext";
import ElasticSearchField from "utils/components/ElasticSearchField";
import { getUsername } from "utils/helpers";
import { getTaskStatusLabel } from "utils/helpers/utils";

interface EditAutomationSMSProps {
  visible: boolean;
  editedRecord: Automation;
  handleClose: () => void;
}

const INITIAL_RECIPIENTS_STATE = {
  sendToCustomer: false,
  sendToAssignees: false,
  sendToCreator: false,
  otherRecipientIds: [] as LabeledValue[],
};

const hasRecipients = (recips = {} as any) => {
  if (
    recips.sendToAssignees ||
    recips.sendToCustomer ||
    recips.sendToCreator ||
    recips.otherRecipientIds.length > 0
  ) {
    return true;
  }

  message.error(i18next.t("automations.edit.selectRecipients"));
  return false;
};

const getAutomationTranslationKey = (
  { actionToPerform, trigger }: Automation,
  translationType: "statusLabel" | "recipientsLabel" | "title",
) => {
  let titleKey = "automations.addCard.";
  let statusLabelKey = "automations.edit.statusLabel.";
  let recipientsLabelKey = "automations.edit.recipientsLabel.";
  if (actionToPerform === "sendNPSMsg") {
    titleKey = titleKey.concat("NPSMsg");
    statusLabelKey = "";
    recipientsLabelKey = "";
  } else if (actionToPerform === "sendTaskAssigneesTrackingURL") {
    titleKey = titleKey.concat("locationTracking");
    statusLabelKey = statusLabelKey.concat("locationTracking");
    recipientsLabelKey = recipientsLabelKey.concat("locationTracking");
  } else if (trigger === "taskCreated") {
    titleKey = titleKey.concat("jobCreate");
    statusLabelKey = "";
    recipientsLabelKey = recipientsLabelKey.concat("jobCreate");
  } else if (trigger === "taskStatusUpdated") {
    titleKey = titleKey.concat("statusUpdate");
    statusLabelKey = statusLabelKey.concat("statusUpdate");
    recipientsLabelKey = recipientsLabelKey.concat("statusUpdate");
  } else {
    titleKey = "";
    statusLabelKey = "";
    recipientsLabelKey = "";
  }

  if (translationType === "recipientsLabel") {
    return recipientsLabelKey;
  } else if (translationType === "statusLabel") {
    return statusLabelKey;
  } else if (translationType === "title") {
    return titleKey;
  } else {
    return "";
  }
};

const EditAutomationSMS = ({
  visible,
  handleClose,
  editedRecord,
}: EditAutomationSMSProps) => {
  const [t] = useTranslation();
  const { firm = {} as Firm } = useContext(UserContext) as UserContextType;
  const [text, setText] = useState("");
  const [statuses, setStatuses] = useState([] as TaskStatus[]);
  const [cursorPos, setCursorPos] = useState(0);
  const [recipients, setRecipients] = useState(INITIAL_RECIPIENTS_STATE);
  const [status, setStatus] = useState<LabeledValue | undefined>(undefined);
  const { actionToPerform = "", trigger = "", msgTemplate = "" } = editedRecord;
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [smsLength, setSmsLength] = useState(0);

  const dataInsertTags = [
    { title: t("automations.tags.customerName"), markUp: "{customer.name}" },
    {
      title: t("automations.tags.username"),
      markUp: "{employee.fullName}",
    },
    { title: t("automations.tags.dueDate"), markUp: "{job.dueDate}" },
    { title: t("automations.tags.dueTime"), markUp: "{job.dueTime}" },
    { title: t("automations.tags.businessName"), markUp: "{our.businessName}" },
  ];
  const insertMarkUp = (markUp = "") => {
    const newText = text
      .slice(0, cursorPos)
      .concat(" ", markUp, " ", text.slice(cursorPos))
      .trim();
    setText(newText);
    setSmsLength(newText.length);
  };
  const handleUpdate = (e: any, updateCursorOnly = false) => {
    if (updateCursorOnly) {
      setCursorPos(e?.target?.selectionStart || text.length);
    } else {
      const text = e?.target?.value || "";
      setSmsLength(text.length || 0);
      setText(text);
    }
  };

  const handleSubmit = () => {
    if ((text || "")?.trim().length > 0 && hasRecipients(recipients)) {
      if (trigger !== "taskCreated" && !status?.value) {
        message.error(t("automations.edit.selectStatus"));
      } else {
        const { _id } = editedRecord;
        const data = {
          ...recipients,
          otherRecipientIds: recipients.otherRecipientIds.map(
            (user) => user?.value,
          ),
          actionToPerform,
          msgTemplate: text,
          trigger,
          ...(trigger !== "taskCreated" ? { statusId: status?.value } : {}),
        };
        setLoading(true);
        if (_id) {
          AutomationsService.patch(_id, { ...editedRecord, ...data }).then(
            (res: Automation) => {
              message.success(i18next.t("automations.saveSuccess"));
              setLoading(false);
              handleClose();
            },
            (error: Error) => {
              logger.error("Error in updating automation: ", error);
              setLoading(false);
              message.error(i18next.t("automations.saveError"));
            },
          );
        } else {
          AutomationsService.create(data).then(
            (res: any) => {
              message.success(t("automations.saveSuccess"));
              setLoading(false);
              handleClose();
            },
            (error: Error) => {
              logger.error("Error in creating automation: ", error);
              message.error(t("automations.saveError"));
              setLoading(false);
            },
          );
        }
      }
    } else {
      if ((text || "").trim().length === 0) {
        message.error(t("automations.edit.enterMsg"));
      }
    }
  };

  useEffect(() => {
    if (visible) {
      setRecipients(INITIAL_RECIPIENTS_STATE);
      TaskStatusService.find({ query: { category: "task" } }).then(
        (res: PaginatedFeathersResponse<TaskStatus>) => {
          setStatuses(res.data);
        },
        (error: Error) => {
          logger.error("Error in fetching statuses: ", error);
          message.error(t("status.fetchError"));
        },
      );

      if (!!editedRecord._id) {
        const {
          msgTemplate = "",
          otherRecipientIds = [],
          sendToAssignees,
          sendToCustomer,
          sendToCreator,
          statusId,
          status = {},
        } = editedRecord;

        setText(msgTemplate);
        setCursorPos((msgTemplate || "").length);

        setStatus({
          label: getTaskStatusLabel(status),
          key: statusId,
          value: statusId,
        });
        const recips = {
          sendToAssignees,
          sendToCreator,
          sendToCustomer,
          otherRecipientIds: otherRecipientIds.map((item) => ({
            label: (item || "").substr(-5),
            key: item,
            value: item,
          })),
        };
        if (otherRecipientIds.length > 0) {
          setUsersLoading(true);
          UserService.find({ query: { _id: { $in: otherRecipientIds } } }).then(
            (res: PaginatedFeathersResponse<User>) => {
              const otherRecips = res.data.map((user) => ({
                label: getUsername(user),
                value: user._id,
                key: user._id,
              }));
              setRecipients({
                ...recips,
                otherRecipientIds: otherRecips,
              });
              setUsersLoading(false);
            },
            (error: Error) => {
              logger.error("Could not fetch usernames: ", error);
              message.error("users.fetchError");
              setUsersLoading(false);
            },
          );
        } else {
          setRecipients(recips);
        }
      } else {
        setText("");
        setCursorPos(msgTemplate.length);
        setSmsLength(msgTemplate.length);
        setText(msgTemplate);
        if (
          actionToPerform === "sendTaskAssigneesTrackingURL" ||
          actionToPerform === "sendNPSMsg"
        ) {
          setRecipients({ ...INITIAL_RECIPIENTS_STATE, sendToCustomer: true });
          if (actionToPerform === "sendNPSMsg") {
            setStatus({
              label: t("statusFilter.completed"),
              key: "completed",
              value: firm.completedTaskStatusId,
            });
          } else {
            setStatus(undefined);
          }
        } else {
          setStatus(undefined);
          setRecipients(INITIAL_RECIPIENTS_STATE);
        }
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Modal
      title={
        <div
          className="s-modal-title"
          style={{ paddingLeft: "calc(15% - 16px)" }}
        >
          {t(getAutomationTranslationKey(editedRecord, "title"))}
        </div>
      }
      visible={visible}
      onOk={handleSubmit}
      onCancel={handleClose}
      width={"90%"}
      bodyStyle={{ padding: "50px 15% 100px" }}
      cancelText={t("global.cancel")}
      okText={t("global.save")}
      okButtonProps={{
        disabled: loading,
        loading,
        className: "s-btn-spinner-align",
      }}
      centered
    >
      {actionToPerform !== "sendNPSMsg" ? (
        <>
          <div
            className="tw-flex tw-justify-between tw-items-center tw-mb-5"
            hidden={trigger === "taskCreated"}
          >
            <span className="tw-text-base">
              {t(getAutomationTranslationKey(editedRecord, "statusLabel"))}
            </span>
            <div
              style={{
                width: "350px",
              }}
            >
              <Select
                value={status}
                onChange={setStatus}
                className="tw-w-full tw-text-left st-field-color st-placeholder-color"
                placeholder={t("status.selectStatus")}
                disabled={trigger === "taskCreated"}
                labelInValue
              >
                {statuses.map((status) => (
                  <Select.Option key={status._id} value={status._id}>
                    {getTaskStatusLabel(status)}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>
          <div className="tw-flex tw-justify-between tw-items-center">
            <span className="tw-text-base">
              {t(getAutomationTranslationKey(editedRecord, "recipientsLabel"))}
            </span>
            <div
              style={{ width: "350px" }}
              className="tw-flex tw-flex-wrap tw-justify-between tw-text-left"
            >
              <Checkbox
                checked={recipients.sendToCustomer}
                onChange={(e) =>
                  setRecipients((old) => ({
                    ...old,
                    sendToCustomer: e.target.checked,
                  }))
                }
                className="s-cust-pr-0"
              >
                {t("automations.recipientsType.customer")}
              </Checkbox>
              <Checkbox
                checked={recipients.sendToAssignees}
                onChange={(e) =>
                  setRecipients((old) => ({
                    ...old,
                    sendToAssignees: e.target.checked,
                  }))
                }
                className="s-cust-pr-0"
              >
                {t("automations.recipientsType.assignee")}
              </Checkbox>
              <Checkbox
                checked={recipients.sendToCreator}
                onChange={(e) =>
                  setRecipients((old) => ({
                    ...old,
                    sendToCreator: e.target.checked,
                  }))
                }
                className="s-cust-pr-0"
              >
                {t("automations.recipientsType.creator")}
              </Checkbox>
              <div className="tw-w-full tw-pt-3">
                {usersLoading ? (
                  <>
                    <LoadingOutlined className="tw-mr-2 tw-text-green-500 s-anticon-v-align" />
                    {t("automations.edit.loadingRecips")}
                  </>
                ) : (
                  <ElasticSearchField
                    entity="users"
                    className="tw-w-full s-tags-color st-field-color st-placeholder-color"
                    placeholder={t("automations.edit.selectOtherRecips")}
                    //@ts-ignore
                    value={recipients.otherRecipientIds}
                    maxTagTextLength={10}
                    mode="multiple"
                    labelInValue
                    onChange={(users) =>
                      setRecipients((old) => ({
                        ...old,
                        otherRecipientIds: (users as unknown) as LabeledValue[],
                      }))
                    }
                    renderOptions={(users = []) =>
                      users.map((user) => (
                        <Select.Option key={user._id} value={user._id}>
                          {getUsername(user)}
                        </Select.Option>
                      ))
                    }
                  />
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <span className="tw-text-xl">{t("automations.edit.sendNPSMsg")}</span>
      )}
      <TextArea
        className="tw-mt-10 st-field-color st-placeholder-color"
        placeholder={t("automations.edit.enterMsgText")}
        value={text}
        onClick={(e) => handleUpdate(e, true)}
        onKeyDown={(e) => handleUpdate(e, true)}
        onChange={(e) => handleUpdate(e, false)}
        rows={6}
        autoFocus
      />
      <div
        style={{ position: "relative", top: "-20px" }}
        className="tw-text-right tw-text-xs tw-font-bold tw-text-gray-500 tw-pr-2 s-main-fonot"
      >
        {smsLength === 0
          ? "0/150 - 0 SMS"
          : `${Math.floor(smsLength % 150)}/150 - ${Math.ceil(
              smsLength / 150,
            )} SMS`}
      </div>
      <div className="tw-mt-2 tw-text-left">
        {dataInsertTags.map((tag) => (
          <div
            className="tw-inline-block tw-mr-2 tw-mb-2 tw-rounded tw-py-1 tw-px-3 s-std-text s-pointer"
            style={{ backgroundColor: "#EDEDED", border: "1px solid #D8D8D8" }}
            onClick={() => insertMarkUp(tag.markUp)}
            key={tag.markUp}
          >
            {tag.title}
            <PlusOutlined className="s-anticon-v-align tw-text-sm tw-ml-2" />
          </div>
        ))}
        {actionToPerform === "sendTaskAssigneesTrackingURL" ? (
          <div
            className="tw-inline-block tw-mr-2 tw-mb-2 tw-rounded tw-py-1 tw-px-3 s-std-text s-pointer"
            style={{ backgroundColor: "#EDEDED", border: "1px solid #D8D8D8" }}
            onClick={() => insertMarkUp("{taskAssigneesTrackingURL}")}
          >
            {t("automations.tags.locationURL")}
            <PlusOutlined className="s-anticon-v-align tw-text-sm tw-ml-2" />
          </div>
        ) : null}
        {actionToPerform === "sendNPSMsg" ? (
          <div
            className="tw-inline-block tw-mr-2 tw-mb-2 tw-rounded tw-py-1 tw-px-3 s-std-text s-pointer"
            style={{ backgroundColor: "#EDEDED", border: "1px solid #D8D8D8" }}
            onClick={() => insertMarkUp("{jobFeedbackLink}")}
          >
            {t("automations.tags.npsURL")}
            <PlusOutlined className="s-anticon-v-align tw-text-sm tw-ml-2" />
          </div>
        ) : null}
      </div>
    </Modal>
  );
};

export default EditAutomationSMS;
