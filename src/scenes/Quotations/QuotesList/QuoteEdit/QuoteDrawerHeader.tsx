import { DownOutlined } from "@ant-design/icons";
import { Button, Dropdown, Menu, Popconfirm, message } from "antd";
import logger from "logger";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { QuoteService } from "services";
import { Quote, TaskStockLine, UserContextType } from "types";
import UserContext from "UserContext";
import { webBaseURL } from "utils/helpers";

import AddTaskStock from "../../../EditStockUtilization";
import { QuoteEditState } from "./QuoteEdit";
import QuoteStatusContorl from "./QuoteStatusControl";

interface QuoteDrawerHeaderProps {
  editedQuote: Quote;
  state: QuoteEditState;
  updateState: (changes: Partial<QuoteEditState>) => void;
  updateQuote: (quote: Partial<Quote>) => void;
  updateStock: (stock: TaskStockLine[], closeModal: boolean) => void;
  onConvertToTask: () => void;
  onConvertToInvoice: () => void;
  closeModal: () => void;
}

const QuoteDrawerHeader = ({
  editedQuote,
  state,
  updateQuote,
  updateState,
  updateStock,
  onConvertToInvoice,
  onConvertToTask,
  closeModal,
}: QuoteDrawerHeaderProps) => {
  const [t] = useTranslation();

  const { hasPermission } = useContext(UserContext) as UserContextType;

  const printPDF = () => {
    if (editedQuote.uid) {
      window.open(
        `${webBaseURL()}/pdf-preview/quote/${editedQuote.uid}`,
        "_blank",
      );
    } else {
      message.error(t("PDFPrint.cantCreatePDF"));
    }
  };
  const removeQuote = () => {
    QuoteService.remove(editedQuote._id).then(
      () => {
        message.success(t("quotes.removeSuccess"));
        closeModal();
      },
      (e: Error) => {
        logger.error("Error in removing Quote: ", e);
        message.error(t("quotes.removeError"));
      },
    );
  };

  return (
    <div className="tw-flex tw-items-center">
      {!editedQuote._id ? (
        <div className="tw-text-lg tw-font-medium">
          {t("quotes.edit.pageTitle")}
        </div>
      ) : (
        <QuoteStatusContorl
          quote={editedQuote}
          onStatusChange={updateQuote}
          onConvertToInvoice={onConvertToInvoice}
          onConvertToTask={onConvertToTask}
        />
      )}
      <div className="tw-ml-auto">
        <Dropdown
          placement="bottomRight"
          overlay={
            <Menu>
              <Menu.Item onClick={() => updateState({ isEditingStock: true })}>
                {t("taskEdit.showStock")}
              </Menu.Item>
              {!!editedQuote._id ? (
                <>
                  <Menu.Divider />
                  <Menu.Item onClick={printPDF}>
                    {t("quotes.edit.downloadPDF")}
                  </Menu.Item>
                  {hasPermission("canManageQuotes") && (
                    <Menu.Item>
                      <Popconfirm
                        title={t("global.deleteSurety")}
                        okText={t("global.delete")}
                        cancelText={t("global.cancel")}
                        onConfirm={removeQuote}
                        okButtonProps={{ danger: true }}
                        placement="bottomLeft"
                      >
                        <div className="tw-text-red-500">
                          {t("global.delete")}
                        </div>
                      </Popconfirm>
                    </Menu.Item>
                  )}
                </>
              ) : null}
            </Menu>
          }
        >
          <Button className="tw-inline-flex tw-items-center">
            {t("global.actions")}
            <DownOutlined />
          </Button>
        </Dropdown>
      </div>

      <AddTaskStock
        visible={state.isEditingStock}
        stock={editedQuote.stock}
        service="task/quotes"
        taskId={editedQuote._id}
        onSave={updateStock}
        onCancel={() => updateState({ isEditingStock: false })}
      />
    </div>
  );
};

export default QuoteDrawerHeader;
