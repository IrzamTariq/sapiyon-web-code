import { Button, Checkbox, Drawer, Form, message } from "antd";
import logger from "logger";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import StockUtilizationTable from "scenes/EditStockUtilization/StockUtilizationTable";
import TaskFiles from "scenes/TaskFiles/TaskFiles";
import TaskEdit from "scenes/Tasks/TaskEdit";
import TaskNotesList from "scenes/Tasks/TaskNotes/TaskNotesList";
import { QuoteService, TaskFileService, TaskNoteService } from "services";
import {
  Invoice,
  PaginatedFeathersResponse,
  Quote,
  Task,
  TaskNote,
  TaskStockLine,
  UploadedFile,
  UserContextType,
} from "types";
import UserContext from "UserContext";
import {
  getCustomerSelectInfo,
  getUsableScreenHeight,
  mapCustomFieldValuesToFormFields,
} from "utils/helpers";

import EditInvoice from "../../../Invoices/InvoiceList/InvoiceEdit";
import QuoteDetailsForm from "./QuoteDetailsForm";
import QuoteDrawerHeader from "./QuoteDrawerHeader";

interface QuoteEditProps {
  visible: boolean;
  editedRecord: Quote;
  onClose: () => void;
}
export interface QuoteEditState {
  customerDetailsVisible: boolean;
  customerFieldVisible: boolean;
  isSaving: boolean;
  isEditingStock: boolean;
  rteState: { value: string; touched: boolean };
  files: UploadedFile[];
  convertingFromRFQ: boolean;
  notes: TaskNote[];
  convertingToTask: boolean;
  editedTask: Task;
  convertingToInvoice: boolean;
  editedInvoice: Invoice;
  isEditingAddress: boolean;
}

const QuoteEdit = ({ visible, onClose, editedRecord }: QuoteEditProps) => {
  const [t] = useTranslation();
  const [form] = Form.useForm<Quote>();
  const { firm } = useContext(UserContext) as UserContextType;
  const { quotes: firmCustomFields } = firm.forms || {};
  const [state, setState] = useState<QuoteEditState>({
    customerDetailsVisible: false,
    customerFieldVisible: false,
    isSaving: false,
    isEditingStock: false,
    rteState: { value: "", touched: false },
    files: [] as UploadedFile[],
    convertingFromRFQ: false,
    notes: [] as TaskNote[],
    convertingToTask: false,
    editedTask: {} as Task,
    convertingToInvoice: false,
    editedInvoice: {} as Invoice,
    isEditingAddress: false,
  });
  const [editedQuote, setEditedQuote] = useState({} as Quote);
  const [quoteChanges, setQuoteChanges] = useState({} as Partial<Quote>);

  const updateState = (changes: Partial<QuoteEditState>) =>
    setState((old) => ({ ...old, ...changes }));
  const updateQuoteValues = (changes: Partial<Quote>) => {
    setEditedQuote((old) => ({ ...old, ...changes }));
    setQuoteChanges((old) => ({ ...old, ...changes }));
  };

  const handleClose = () => {
    setEditedQuote({} as Quote);
    setQuoteChanges({});
    setState({
      customerDetailsVisible: false,
      customerFieldVisible: false,
      isSaving: false,
      isEditingStock: false,
      rteState: { touched: false, value: "" },
      files: [],
      convertingFromRFQ: false,
      notes: [],
      convertingToTask: false,
      editedTask: {} as Task,
      convertingToInvoice: false,
      editedInvoice: {} as Invoice,
      isEditingAddress: false,
    });
    onClose();
  };
  const updateStock = (
    stock = [] as TaskStockLine[],
    closeStockModal: boolean,
  ) => {
    setEditedQuote((old) => ({ ...old, stock }));
    const newStock = stock
      .filter((item) => item?._id?.startsWith("NEW"))
      .map(({ _id, ...rest }) => rest as TaskStockLine);

    if (newStock.length > 0) {
      setQuoteChanges((old) => ({ ...old, stock: [...newStock] }));
    }
    if (closeStockModal) {
      updateState({ isEditingStock: false });
    }
  };
  const handleSubmit = () => {
    form.validateFields().then((values) => {
      message.loading({
        content: t("global.saving"),
        duration: 0,
        key: "quote-saving",
      });

      const { _id } = values;
      if (_id) {
        QuoteService.patch(_id, quoteChanges).then(
          () => {
            message.success({
              content: t("quotes.updateSuccess"),
              key: "quote-saving",
            });
            handleClose();
          },
          (e: Error) => {
            message.error({
              content: t("quotes.updateError"),
              key: "quote-saving",
            });
            logger.error("Error in updating Quote: ", e);
          },
        );
      } else {
        QuoteService.create(quoteChanges).then(
          (res: Quote) => {
            state.files.forEach((item) => {
              const data = { ...item, taskId: res._id };
              TaskFileService.create(data).catch(() =>
                message.error(t("files.uploadError")),
              );
            });
            if (state.convertingFromRFQ && state.notes.length > 0) {
              const promises = [] as Promise<TaskNote>[];
              state.notes.forEach(({ body }) => {
                promises.push(
                  TaskNoteService.create({ taskId: res._id, body }),
                );
              });
              Promise.allSettled(promises)
                .then((res) => {
                  if (res.some((item) => item.status === "rejected")) {
                    message.error(t("notes.createError"));
                  }
                })
                .finally(handleClose);
            } else {
              handleClose();
            }
            message.success({
              content: t("quotes.createSuccess"),
              key: "quote-saving",
            });
          },
          (e: Error) => {
            logger.error("Error in creating Quote: ", e);
            message.error({
              content: t("quotes.createError"),
              key: "quote-saving",
            });
          },
        );
      }
    });
  };
  const convertToTask = () => {
    const temp = Object.assign({}, editedQuote);
    const openTaskModal = (task: Task) => {
      updateState({ convertingToTask: true, editedTask: task });
      message.success({
        content: t("tasks.readyToEdit"),
        key: "prepingTask",
      });
    };
    handleClose();
    message.loading({
      content: t("tasks.preparing"),
      duration: 0,
      key: "prepingTask",
    });
    const {
      _id: quoteId,
      title,
      customer,
      customerId,
      addressId = null,
      stock = [],
      copyNotesToTask,
      discount,
      discountType,
    } = temp;
    let newTask = {
      doConvert: true,
      quoteId,
      action: "createTaskFromQuote",
      title,
      customer,
      customerId,
      addressId: addressId && addressId !== "home" ? addressId : null,

      discount,
      discountType,
      stock: (stock || []).map((item) => ({
        ...item,
        _id: `NEW-${item._id}`,
      })),
    };
    if (copyNotesToTask) {
      TaskNoteService.find({
        paginate: false,
        query: { taskId: quoteId },
      })
        .then(
          (res: PaginatedFeathersResponse<TaskNote>) => {
            newTask = Object.assign({}, newTask, {
              notes: res.data || [],
            });
          },
          (error: Error) => {
            logger.error("Error in fetching notes: ", error);
            message.error(t("notes.createError"));
          },
        )
        .finally(() => openTaskModal((newTask as unknown) as Task));
    } else {
      openTaskModal((newTask as unknown) as Task);
    }
  };
  const convertToInvoice = () => {
    const temp = Object.assign({}, editedQuote);
    const openInvoiceModal = (invoice: Invoice) => {
      updateState({ convertingToInvoice: true, editedInvoice: invoice });
      message.success({
        content: t("invoices.invoiceReady"),
        key: "prepingInvoice",
      });
    };

    message.loading({
      content: t("invoices.preparingInvoice"),
      duration: 0,
      key: "prepingInvoice",
    });
    handleClose();
    const {
      _id: quoteId,
      title,
      customer,
      customerId,
      addressId = null,
      stock = [],
      customerMsg,
      discount,
      discountType,
      copyNotesToInvoice,
    } = temp;

    let newInvoice = {
      quoteId,
      action: "createInvoiceFromQuote",
      title,
      customerId,
      customer,
      addressId: addressId && addressId !== "home" ? addressId : null,
      customerMsg,
      discount,
      discountType,
      stock: (stock || []).map((item) => ({
        ...item,
        _id: `NEW-${item._id}`,
      })),
      doConvert: true,
    };
    if (copyNotesToInvoice) {
      TaskNoteService.find({
        paginate: false,
        query: { taskId: quoteId },
      })
        .then(
          (res: PaginatedFeathersResponse<TaskNote>) => {
            newInvoice = Object.assign({}, newInvoice, {
              notes: res.data || [],
            });
          },
          (error: Error) => {
            logger.error("Error in fetching notes: ", error);
            message.error(t("notes.createError"));
          },
        )
        .finally(() => openInvoiceModal((newInvoice as unknown) as Invoice));
    } else {
      openInvoiceModal((newInvoice as unknown) as Invoice);
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
        customerMsg,
        fields,
        copyNotesToTask,
        copyNotesToInvoice,
        //@ts-ignore
        convertToQuote = false,
      } = editedRecord;
      setEditedQuote(editedRecord);
      if (convertToQuote) {
        //@ts-ignore
        const { convertToQuote, ...rest } = editedRecord;
        convertFromRFQ(rest);
      }
      if (_id) {
        setState((old) => ({
          ...old,
          rteState: { value: title, touched: true },
        }));
      }
      const customFields = mapCustomFieldValuesToFormFields(
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
        title,
        customerMsg,
        copyNotesToTask,
        copyNotesToInvoice,
        ...customFields,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const convertFromRFQ = (quote: Quote) => {
    //@ts-ignore
    const { notes = [], ...rest } = quote;
    const { title, customer, customerId, addressId } = rest;
    setState((old) => ({ ...old, convertingFromRFQ: true, notes }));
    setQuoteChanges((old) => ({ ...old, ...rest }));
    setEditedQuote((old) => ({ ...old, ...rest }));
    form.setFieldsValue({
      //@ts-ignore
      customerId: customerId
        ? {
            key: customer?._id,
            value: customer?._id,
            label: getCustomerSelectInfo(customer),
          }
        : undefined,
      addressId: addressId ? addressId : "home",
      title,
    });
  };

  return (
    <>
      <Drawer
        visible={visible}
        onClose={handleClose}
        title={
          <QuoteDrawerHeader
            state={state}
            updateState={updateState}
            editedQuote={editedQuote}
            updateQuote={(changes) =>
              setEditedQuote((old) => ({ ...old, ...changes }))
            }
            updateStock={updateStock}
            onConvertToInvoice={convertToInvoice}
            onConvertToTask={convertToTask}
            closeModal={handleClose}
          />
        }
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
          aria-label="Quote drawer"
          className="tw-p-6"
          style={{ ...getUsableScreenHeight(55 + 53), overflowY: "scroll" }}
        >
          <QuoteDetailsForm
            editedRecord={editedQuote}
            updateChanges={(changes) =>
              setQuoteChanges((old) => ({ ...old, ...changes }))
            }
            updateEditedQuote={(changes) =>
              setEditedQuote((old) => ({ ...old, ...changes }))
            }
            form={form}
            state={state}
            updateState={updateState}
            initialTitle={editedRecord.title}
          />

          {editedQuote?.stock?.length > 0 ? (
            <section className="tw-mt-5">
              <StockUtilizationTable
                task={editedQuote}
                updateTask={(changes) =>
                  updateQuoteValues(changes as Partial<Quote>)
                }
                onEdit={() => updateState({ isEditingStock: true })}
                type="quote"
                disableStockEditing={false}
                showSettings
                discounts
              />
            </section>
          ) : null}
          <section aria-label="RFQ files" className="tw-mt-5">
            <TaskFiles
              category="quote"
              taskId={editedQuote._id || ""}
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
          {!!editedQuote._id && (
            <section aria-label="RFQ notes" className="tw-mt-5">
              <TaskNotesList taskId={editedQuote._id || ""} />
            </section>
          )}

          <section
            className="tw-my-5"
            style={{ display: editedRecord._id ? "block" : "none" }}
          >
            <p className="s-main-font s-main-text-color tw-mb-2">
              {t("linkNotes")}
            </p>

            <Checkbox
              checked={editedQuote.copyNotesToTask}
              onChange={(e) =>
                updateQuoteValues({ copyNotesToTask: e.target.checked })
              }
            >
              <span className="s-main-font s-main-text-color tw-text-sm tw-mr-4">
                {t("linkNotesToJobs")}
              </span>
            </Checkbox>
            <Checkbox
              checked={editedQuote.copyNotesToInvoice}
              onChange={(e) =>
                updateQuoteValues({ copyNotesToInvoice: e.target.checked })
              }
            >
              <span className="s-main-font s-main-text-color tw-text-sm">
                {t("linkNotesToInvoices")}
              </span>
            </Checkbox>
          </section>
        </main>
        <footer>
          <div
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              width: "100%",
              borderTop: "1px solid #e9e9e9",
              padding: "10px 40px 10px",
              background: "#fff",
              textAlign: "right",
              zIndex: 1,
            }}
          >
            <Button onClick={handleClose} className="tw-mr-2">
              {t("global.close")}
            </Button>
            <Button
              onClick={handleSubmit}
              type="primary"
              disabled={!Object.keys(quoteChanges).length}
            >
              {t("global.save")}
            </Button>
          </div>
        </footer>
      </Drawer>

      <TaskEdit
        visible={state.convertingToTask}
        task={state.editedTask}
        duplicateTask={() => null}
        onClose={() =>
          updateState({ convertingToTask: false, editedTask: {} as Task })
        }
        onSave={() =>
          updateState({ convertingToTask: false, editedTask: {} as Task })
        }
      />
      <EditInvoice
        editedRecord={state.editedInvoice}
        visible={state.convertingToInvoice}
        onClose={() =>
          updateState({
            convertingToInvoice: false,
            editedInvoice: {} as Invoice,
          })
        }
      />
    </>
  );
};

export default QuoteEdit;
