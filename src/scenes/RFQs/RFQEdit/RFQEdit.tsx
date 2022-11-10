import { Button, Checkbox, Drawer, Form, message } from "antd";
import logger from "logger";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import QuoteEdit from "scenes/Quotations/QuotesList/QuoteEdit/QuoteEdit";
import TaskFiles from "scenes/TaskFiles/TaskFiles";
import TaskEdit from "scenes/Tasks/TaskEdit";
import TaskNotesList from "scenes/Tasks/TaskNotes/TaskNotesList";
import { RFQService, TaskFileService, TaskNoteService } from "services";
import {
  PaginatedFeathersResponse,
  Quote,
  RFQ,
  Task,
  TaskNote,
  UploadedFile,
  UserContextType,
} from "types";
import UserContext from "UserContext";
import {
  getCustomerSelectInfo,
  getUsableScreenHeight,
  mapCustomFieldValuesToFormFields,
} from "utils/helpers";

import RFQDrawerHeader from "./RFQDrawerHeader";
import RFQDetailsForm from "./RFQForm";

interface RFQEditProps {
  visible: boolean;
  editedRecord: RFQ;
  onClose: () => void;
}
export interface RFQEditState {
  customerDetailsVisible: boolean;
  customerFieldVisible: boolean;
  isEditingAddress: boolean;
  isSaving: boolean;
  rteState: { value: string; touched: boolean };
  files: UploadedFile[];
  convertingToQuote: boolean;
  editedQuote: Quote;
  convertingToTask: boolean;
  editedTask: Task;
}

const RFQEdit = ({ visible, editedRecord, onClose }: RFQEditProps) => {
  const [form] = Form.useForm<RFQ>();
  const [t] = useTranslation();
  const { firm } = useContext(UserContext) as UserContextType;
  const { rfq: firmCustomFields } = firm.forms || {};
  const [editedRFQ, setEditedRFQ] = useState({} as RFQ);
  const [RFQChanges, setRFQChanges] = useState({} as Partial<RFQ>);

  const [state, setState] = useState<RFQEditState>({
    customerDetailsVisible: false,
    customerFieldVisible: false,
    isSaving: false,
    rteState: { value: "", touched: false },
    files: [] as UploadedFile[],
    convertingToQuote: false,
    editedQuote: {} as Quote,
    convertingToTask: false,
    editedTask: {} as Task,
    isEditingAddress: false,
  });

  const handleClose = () => {
    setEditedRFQ({} as RFQ);
    setRFQChanges({});
    setState({
      customerDetailsVisible: false,
      customerFieldVisible: false,
      isSaving: false,
      rteState: { touched: false, value: "" },
      files: [],
      convertingToQuote: false,
      editedQuote: {} as Quote,
      convertingToTask: false,
      editedTask: {} as Task,
      isEditingAddress: false,
    });
    onClose();
  };
  const handleSubmit = () => {
    form.validateFields().then((values) => {
      message.loading({
        content: t("global.saving"),
        duration: 0,
        key: "rfq-saving",
      });

      const { _id } = values;
      if (_id) {
        RFQService.patch(_id, RFQChanges).then(
          () => {
            message.success({
              content: t("requests.updateSuccess"),
              key: "rfq-saving",
            });
            handleClose();
          },
          (e: Error) => {
            message.error({
              content: t("requests.updateError"),
              key: "rfq-saving",
            });
            logger.error("Error in updating RFQ: ", e);
          },
        );
      } else {
        RFQService.create(RFQChanges).then(
          (res: RFQ) => {
            message.success({
              content: t("requests.createSuccess"),
              key: "rfq-saving",
            });
            handleClose();
            state.files.forEach((item) => {
              const data = { ...item, taskId: res._id };
              TaskFileService.create(data).catch(() =>
                message.error(t("files.uploadError")),
              );
            });
          },
          (e: Error) => {
            logger.error("Error in creating RFQ: ", e);
            message.error({
              content: t("requests.createError"),
              key: "rfq-saving",
            });
          },
        );
      }
    });
  };
  const updateRFQValues = (changes: Partial<RFQ>) => {
    setEditedRFQ((old) => ({ ...old, ...changes }));
    setRFQChanges((old) => ({ ...old, ...changes }));
  };
  const convertToQuote = () => {
    const temp = Object.assign({}, editedRFQ);
    const {
      _id: rfqId,
      title,
      customer,
      customerId,
      addressId = null,
      copyNotesToQuote,
    } = temp;
    const openQuotesModal = (quote: Quote) => {
      setState((old) => ({
        ...old,
        convertingToQuote: true,
        editedQuote: quote,
      }));

      message.success({
        content: t("quotes.quoteReady"),
        key: "prepingQuote",
      });
    };
    message.loading({
      content: t("quotes.preparingQuote"),
      duration: 0,
      key: "prepingQuote",
    });
    handleClose();

    let newQuote = {
      rfqId,
      action: "createQuoteFromRFQ",
      title,
      customerId,
      customer,
      addressId: addressId && addressId !== "home" ? addressId : null,
      convertToQuote: true,
    };
    if (copyNotesToQuote) {
      TaskNoteService.find({
        paginate: false,
        query: { taskId: rfqId },
      })
        .then(
          (rfqNotes: PaginatedFeathersResponse<TaskNote>) => {
            newQuote = Object.assign({}, newQuote, {
              notes: rfqNotes.data || [],
            });
          },
          (e: Error) => {
            message.error(t("notes.createError"));
            logger.error("Error in fetching notes: ", e);
          },
        )
        .finally(() => openQuotesModal((newQuote as unknown) as Quote));
    } else {
      openQuotesModal((newQuote as unknown) as Quote);
    }
  };
  const convertToTask = () => {
    const temp = Object.assign({}, editedRFQ);
    const {
      _id: rfqId,
      title,
      customer,
      customerId,
      addressId = null,
      copyNotesToTask,
    } = temp;
    handleClose();
    const openTaskModal = (task: Task) => {
      setState((old) => ({
        ...old,
        convertingToTask: true,
        editedTask: task,
      }));
      message.success({
        content: t("tasks.readyToEdit"),
        key: "prepingTask",
      });
    };

    message.loading({
      content: t("tasks.preparing"),
      duration: 0,
      key: "prepingTask",
    });
    let newTask = {
      doConvert: true,
      rfqId,
      action: "createTaskFromRFQ",
      title,
      customerId,
      customer,
      addressId: addressId && addressId !== "home" ? addressId : null,
    };
    if (copyNotesToTask) {
      TaskNoteService.find({
        paginate: false,
        query: { taskId: rfqId },
      })
        .then(
          (res: PaginatedFeathersResponse<TaskNote>) => {
            newTask = Object.assign({}, newTask, { notes: res.data || [] });
          },
          (error: Error) => {
            message.error(t("notes.createError"));
            logger.error("Error in fetching notes: ", error);
          },
        )
        .finally(() => openTaskModal((newTask as unknown) as Task));
    } else {
      openTaskModal((newTask as unknown) as Task);
    }
  };

  useEffect(() => {
    if (visible) {
      const {
        _id,
        customer,
        customerId,
        addressId = null,
        title,
        fields,
        preferredVisitDates = [],
        preferredVisitTime = "",
        copyNotesToTask,
        copyNotesToQuote,
        assigneeIds,
        dueAt,
        onSiteAssessmentInstructions,
      } = editedRecord;
      setEditedRFQ(editedRecord);
      if (_id) {
        setState((old) => ({
          ...old,
          rteState: { value: title, touched: true },
        }));
      }

      let customFields = mapCustomFieldValuesToFormFields(
        firmCustomFields,
        fields,
      );

      form.setFieldsValue({
        _id,
        //@ts-ignore
        customerId: customerId
          ? {
              key: customer?._id,
              value: customer?._id,
              label: getCustomerSelectInfo(customer),
            }
          : undefined,
        addressId: addressId ? addressId : "home",
        preferredVisitTime,
        visitDay1: preferredVisitDates[0] && moment(preferredVisitDates[0]),

        assigneeIds,
        dueAt: dueAt && moment(dueAt),

        onSiteAssessmentInstructions,

        copyNotesToTask,
        copyNotesToQuote,
        ...customFields,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <>
      <Drawer
        title={
          <RFQDrawerHeader
            editedRFQ={editedRFQ}
            updateRFQ={(changes) =>
              setEditedRFQ((old) => ({ ...old, ...changes }))
            }
            closeModal={handleClose}
            convertToQuote={convertToQuote}
            convertToTask={convertToTask}
          />
        }
        visible={visible}
        onClose={handleClose}
        width={890}
        headerStyle={{
          padding: !!editedRecord._id
            ? "6px 40px 6px 24px"
            : "17px 40px 17px 24px",
        }}
        bodyStyle={{ padding: "0px" }}
        closable={false}
        destroyOnClose
      >
        <main
          aria-label="RQF drawer"
          className="tw-p-6"
          style={{ ...getUsableScreenHeight(55 + 53), overflowY: "scroll" }}
        >
          <section aria-label="RFQ details" className="tw-mb-5">
            <RFQDetailsForm
              form={form}
              editedRecord={editedRFQ}
              state={state}
              updateChanges={(changes) =>
                setRFQChanges((old) => ({ ...old, ...changes }))
              }
              updateState={(changes: any) =>
                setState((old) => ({ ...old, ...changes }))
              }
              updateEditedRFQ={(changes: Partial<RFQ>) =>
                setEditedRFQ((old) => ({ ...old, ...changes }))
              }
              initialTitle={editedRecord.title}
            />
          </section>
          <section aria-label="RFQ files" className="tw-mb-5">
            <TaskFiles
              category="rfq"
              taskId={editedRFQ._id || ""}
              saveFileOffline={(file) =>
                setState((old) => ({ ...old, files: [...old.files, file] }))
              }
              removeOffline={(uid) =>
                setState((old) => ({
                  ...old,
                  files: (old.files || []).filter((item) => item.uid !== uid),
                }))
              }
            />
          </section>
          {!!editedRFQ._id && (
            <section aria-label="RFQ notes" className="tw-mb-5">
              <TaskNotesList taskId={editedRFQ._id || ""} />
            </section>
          )}
          <section>
            <div>
              <p className="s-main-font s-main-text-color tw-mb-2">
                {t("linkNotes")}
              </p>
              <Checkbox
                checked={editedRFQ.copyNotesToQuote}
                onChange={(e) =>
                  updateRFQValues({
                    copyNotesToQuote: e.target.checked,
                  })
                }
              >
                <span className="s-main-font s-main-text-color tw-text-sm tw-mr-4">
                  {t("linkNotesToQuotes")}
                </span>
              </Checkbox>
              <Checkbox
                checked={editedRFQ.copyNotesToTask}
                onChange={(e) =>
                  updateRFQValues({
                    copyNotesToTask: e.target.checked,
                  })
                }
              >
                <span className="s-main-font s-main-text-color tw-text-sm tw-mr-4">
                  {t("linkNotesToJobs")}
                </span>
              </Checkbox>
            </div>
          </section>
        </main>
        <footer
          className="tw-flex tw-justify-end tw-items-center"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            borderTop: "1px solid #e8e8e8",
            padding: "10px 16px",
            background: "#fff",
          }}
        >
          <Button onClick={handleClose} className="tw-mr-2">
            {t("global.close")}
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            disabled={!Object.keys(RFQChanges).length}
          >
            {t("global.save")}
          </Button>
        </footer>
      </Drawer>
      <QuoteEdit
        editedRecord={state.editedQuote}
        onClose={() =>
          setState((old) => ({
            ...old,
            convertingToQuote: false,
            editedQuote: {} as Quote,
          }))
        }
        visible={state.convertingToQuote}
      />
      <TaskEdit
        visible={state.convertingToTask}
        task={state.editedTask}
        duplicateTask={() => null}
        onClose={() =>
          setState((old) => ({
            ...old,
            editedTask: {} as Task,
            convertingToTask: false,
          }))
        }
        onSave={() =>
          setState((old) => ({
            ...old,
            editedTask: {} as Task,
            convertingToTask: false,
          }))
        }
      />
    </>
  );
};

export default RFQEdit;
