import { Button, Drawer, Form, message } from "antd";
import logger from "logger";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import StockUtilizationTable from "scenes/EditStockUtilization/StockUtilizationTable";
import TaskFiles from "scenes/TaskFiles/TaskFiles";
import TaskNotesList from "scenes/Tasks/TaskNotes/TaskNotesList";
import { InvoiceService, TaskFileService, TaskNoteService } from "services";
import {
  Invoice,
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

import InvoiceDetailsForm from "./InvoiceDetailsForm";
import InvoiceDrawerHeader from "./InvoiceDrawerHeader";

interface InvoiceEditProps {
  visible: boolean;
  editedRecord: Invoice;
  onClose: () => void;
}
export interface InvoiceEditState {
  customerDetailsVisible: boolean;
  customerFieldVisible: boolean;
  isSaving: boolean;
  isEditingStock: boolean;
  rteState: { value: string; touched: boolean };
  files: UploadedFile[];
  converting: boolean;
  notes: TaskNote[];
  isEditingAddress: boolean;
}
const InvoiceEdit = ({ visible, editedRecord, onClose }: InvoiceEditProps) => {
  const [t] = useTranslation();
  const [form] = Form.useForm<Invoice>();
  const { firm } = useContext(UserContext) as UserContextType;
  const { invoices: firmCustomFields } = firm.forms || {};
  const [state, setState] = useState<InvoiceEditState>({
    customerDetailsVisible: false,
    customerFieldVisible: false,
    isSaving: false,
    isEditingStock: false,
    rteState: { value: "", touched: false },
    files: [] as UploadedFile[],
    converting: false,
    notes: [] as TaskNote[],
    isEditingAddress: false,
  });
  const [editedInvoice, setEditedInvoice] = useState({} as Invoice);
  const [invoiceChanges, setInvoiceChanges] = useState({} as Partial<Invoice>);

  const updateState = (changes: Partial<InvoiceEditState>) =>
    setState((old) => ({ ...old, ...changes }));

  const handleClose = () => {
    setEditedInvoice({} as Invoice);
    setInvoiceChanges({});
    setState({
      customerDetailsVisible: false,
      customerFieldVisible: false,
      isSaving: false,
      isEditingStock: false,
      rteState: { touched: false, value: "" },
      files: [],
      converting: false,
      notes: [],
      isEditingAddress: false,
    });
    onClose();
  };
  const updateStock = (
    stock = [] as TaskStockLine[],
    closeStockModal: boolean,
  ) => {
    setEditedInvoice((old) => ({ ...old, stock }));
    const newStock = stock
      .filter((item) => item?._id?.startsWith("NEW"))
      .map(({ _id, ...rest }) => rest as TaskStockLine);

    if (newStock.length > 0) {
      setInvoiceChanges((old) => ({ ...old, stock: [...newStock] }));
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
        key: "invoice-saving",
      });

      const { _id } = values;
      if (_id) {
        InvoiceService.patch(_id, invoiceChanges).then(
          (res: Invoice) => {
            message.success({
              content: t("invoices.updateSuccess"),
              key: "invoice-saving",
            });
            handleClose();
          },
          (e: Error) => {
            message.error({
              content: t("invoices.updateError"),
              key: "invoice-saving",
            });
            logger.error("Error in updating Invoice: ", e);
          },
        );
      } else {
        InvoiceService.create(invoiceChanges).then(
          (res: Invoice) => {
            message.success({
              content: t("invoices.createSuccess"),
              key: "invoice-saving",
            });
            handleClose();
            if (state.converting && state?.notes?.length > 0) {
              state.notes.forEach(({ body }) => {
                TaskNoteService.create({ body, taskId: res._id }).catch(
                  (e: Error) => {
                    logger.error("Error in attaching notes: ", e);
                  },
                );
              });
            }
            state.files.forEach((item) => {
              const data = { ...item, taskId: res._id };
              TaskFileService.create(data).catch(() =>
                message.error(t("files.uploadError")),
              );
            });
          },
          (e: Error) => {
            logger.error("Error in creating Invoice: ", e);
            message.error({
              content: t("invoices.createError"),
              key: "invoice-saving",
            });
          },
        );
      }
    });
  };

  useEffect(() => {
    if (visible) {
      const {
        _id,
        customerId,
        addressId = null,
        customer,
        title,
        customerMsg,
        fields,
        issuedAt,
        dueAt,
        //@ts-ignore
        doConvert = false,
      } = editedRecord;
      if (doConvert) {
        //@ts-ignore
        const { doConvert, ...rest } = editedRecord;
        convertFromQuoteAndTask(rest);
      } else {
        setEditedInvoice(editedRecord);
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
          issuedAt: issuedAt ? moment(issuedAt) : null,
          dueAt: dueAt ? moment(dueAt) : null,
          ...customFields,
        });
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, editedRecord]);

  const convertFromQuoteAndTask = (invoice: Invoice) => {
    //@ts-ignore
    const { notes = [], stock = [], ...rest } = invoice;
    updateState({ notes, converting: true });
    updateStock(stock, false);
    setEditedInvoice((old) => ({ ...old, ...rest }));
    setInvoiceChanges((old) => ({ ...old, ...rest }));
    const { customer, customerId, addressId, title, customerMsg } = invoice;
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
      customerMsg,
    });
  };
  const updateInvoiceValues = (changes: Partial<Invoice>) => {
    setEditedInvoice((old) => ({ ...old, ...changes }));
    setInvoiceChanges((old) => ({ ...old, ...changes }));
  };

  return (
    <Drawer
      visible={visible}
      onClose={handleClose}
      title={
        <InvoiceDrawerHeader
          state={state}
          updateState={updateState}
          editedInvoice={editedInvoice}
          updateInvoice={(changes) =>
            setEditedInvoice((old) => ({ ...old, ...changes }))
          }
          updateStock={updateStock}
          closeModal={handleClose}
        />
      }
      width={800}
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
        aria-label="Invoice drawer"
        className="tw-p-6"
        style={{ ...getUsableScreenHeight(55 + 53), overflowY: "scroll" }}
      >
        <InvoiceDetailsForm
          editedRecord={editedInvoice}
          form={form}
          initialTitle={editedRecord.title}
          state={state}
          updateChanges={(changes) =>
            setInvoiceChanges((old) => ({ ...old, ...changes }))
          }
          updateEditedInvoice={(changes) =>
            setEditedInvoice((old) => ({ ...old, ...changes }))
          }
          updateState={updateState}
        />
        {editedInvoice?.stock?.length > 0 ? (
          <section className="tw-mt-5">
            <StockUtilizationTable
              task={editedInvoice}
              updateTask={updateInvoiceValues}
              onEdit={() => updateState({ isEditingStock: true })}
              type="invoice"
              disableStockEditing={false}
              showSettings
              discounts
            />
          </section>
        ) : null}
        <section aria-label="Invoice files" className="tw-mt-5">
          <TaskFiles
            category="invoice"
            taskId={editedInvoice._id || ""}
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
        {!!editedInvoice._id && (
          <section aria-label="Invoice notes" className="tw-mt-5">
            <TaskNotesList taskId={editedInvoice._id || ""} />
          </section>
        )}
      </main>

      <footer
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          width: "100%",
          borderTop: "1px solid #e9e9e9",
          padding: "10px 32px",
          background: "#fff",
          textAlign: "right",
          zIndex: 1,
        }}
      >
        <Button onClick={handleClose} className="tw-mr-2">
          {t("global.cancel")}
        </Button>

        <Button
          onClick={handleSubmit}
          type="primary"
          disabled={!Object.keys(invoiceChanges).length}
        >
          {t("global.save")}
        </Button>
      </footer>
    </Drawer>
  );
};

export default InvoiceEdit;
