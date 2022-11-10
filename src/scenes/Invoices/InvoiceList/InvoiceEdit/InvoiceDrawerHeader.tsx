import { DownOutlined } from "@ant-design/icons";
import { Button, Dropdown, Menu, Popconfirm, message } from "antd";
import logger from "logger";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { InvoiceService } from "services";
import { Invoice, TaskStockLine, UserContextType } from "types";
import UserContext from "UserContext";
import { webBaseURL } from "utils/helpers";

import AddTaskStock from "../../../EditStockUtilization";
import InvoiceStatusContorl from "./InvoiceStatusControl";
import { InvoiceEditState } from ".";

interface InvoiceDrawerHeaderProps {
  editedInvoice: Invoice;
  state: InvoiceEditState;
  updateState: (changes: Partial<InvoiceEditState>) => void;
  updateInvoice: (invoice: Partial<Invoice>) => void;
  updateStock: (stock: TaskStockLine[], closeModal: boolean) => void;
  closeModal: () => void;
}
const InvoiceDrawerHeader = ({
  editedInvoice,
  state,
  updateInvoice,
  updateState,
  updateStock,
  closeModal,
}: InvoiceDrawerHeaderProps) => {
  const [t] = useTranslation();
  const { hasPermission } = useContext(UserContext) as UserContextType;

  const printPDF = () => {
    if (editedInvoice.uid) {
      window.open(
        `${webBaseURL()}/pdf-preview/invoice/${editedInvoice.uid}`,
        "_blank",
      );
    } else {
      message.error(t("PDFPrint.cantCreatePDF"));
    }
  };
  const removeInvoice = () => {
    InvoiceService.remove(editedInvoice._id).then(
      () => {
        message.success(t("invoices.removeSuccess"));
        closeModal();
      },
      (e: Error) => {
        logger.error("Error in removing invoice: ", e);
        message.error(t("invoices.removeError"));
      },
    );
  };

  return (
    <div className="tw-flex tw-items-center">
      {!!editedInvoice._id ? (
        <InvoiceStatusContorl
          onStatusChange={updateInvoice}
          invoice={editedInvoice}
        />
      ) : (
        <div className="tw-text-lg tw-font-medium">
          {t("invoices.edit.pageTitle")}
        </div>
      )}
      <div className="tw-ml-auto tw-flex">
        <div className="tw-ml-3">
          <Dropdown
            placement="bottomRight"
            overlay={
              <Menu>
                <Menu.Item
                  onClick={() => updateState({ isEditingStock: true })}
                >
                  {t("taskEdit.showStock")}
                </Menu.Item>
                {!!editedInvoice._id ? (
                  <>
                    <Menu.Divider />
                    <Menu.Item onClick={printPDF}>
                      {t("invoices.edit.downloadPDF")}
                    </Menu.Item>
                  </>
                ) : null}
                {!!editedInvoice._id && hasPermission("canManageInvoices") && (
                  <Menu.Item>
                    <Popconfirm
                      title={t("global.deleteSurety")}
                      onConfirm={removeInvoice}
                      okButtonProps={{ danger: true }}
                      okText={t("global.delete")}
                      cancelText={t("global.cancel")}
                    >
                      <div className="tw-text-red-500">
                        {t("global.delete")}
                      </div>
                    </Popconfirm>
                  </Menu.Item>
                )}
              </Menu>
            }
          >
            <Button className="tw-inline-flex tw-items-center">
              {t("global.actions")}
              <DownOutlined />
            </Button>
          </Dropdown>
        </div>
      </div>

      <AddTaskStock
        visible={state.isEditingStock}
        stock={editedInvoice.stock}
        service="task/invoices"
        taskId={editedInvoice._id}
        onSave={updateStock}
        onCancel={() => updateState({ isEditingStock: false })}
      />
    </div>
  );
};

export default InvoiceDrawerHeader;
