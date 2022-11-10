import { Button, Modal, message } from "antd";
import React, { useEffect, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import client from "services/client";

import { Task, TaskServiceType, TaskStockLine } from "../../types";
import { getRandomAlphaNumericString } from "../../utils/helpers";
import EditableStockTable from "./EditableStockTable";

interface EditStockUtilizationProps extends WithTranslation {
  visible: boolean;
  stock: TaskStockLine[];
  taskId: string;
  service: TaskServiceType;
  onSave: (stock: TaskStockLine[], shouldClose: boolean) => void;
  onCancel: () => void;
}

const EditStockUtilization = ({
  t,
  visible,
  taskId,
  stock,
  service,
  onSave,
  onCancel,
}: EditStockUtilizationProps) => {
  const [stockList, setStockList] = useState([] as TaskStockLine[]);
  const [editingId, setEditingId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      // console.log("Stock list initialized to: ");
      setStockList(stock || []);
    }

    // if (!!taskId && stock?.length > 0) {
    // setStockList(stock || []);
    // } else {
    //   const newId = `NEW-${getRandomAlphaNumericString(10)}`;
    //   setStockList([
    //     {
    //       _id: newId,
    //     } as TaskStockLine,
    //   ]);
    //   setEditingId(newId);
    // }
  }, [stock, taskId, visible]);

  const addNewStock = () => {
    const newId = `NEW-${getRandomAlphaNumericString(10)}`;
    setStockList((old) => [
      ...old,
      {
        _id: newId,
      } as TaskStockLine,
    ]);
    setEditingId(newId);
  };

  const ParentService = client.service(service);

  const handleSave = (record: TaskStockLine) => {
    if (!!taskId) {
      const { _id, ...restItemData } = record;
      setIsLoading(true);
      if ((_id || "").startsWith("NEW")) {
        ParentService.patch(taskId, {
          $push: { stock: restItemData },
        })
          .then(
            (res: Task) => {
              message.success(t("stockList.saveSuccess"));
              setEditingId("");
              setStockList(res.stock || []);
              onSave(res.stock || [], false);
            },
            (error: Error) => {
              message.error(t("stockList.saveError"));
            },
          )
          .finally(() => setIsLoading(false));
      } else {
        ParentService.patch(
          taskId,
          {
            $set: {
              "stock.$.itemId": record.itemId,
              "stock.$.qty": record.qty,
              "stock.$.unitPrice": record.unitPrice,
              "stock.$.taxPercentage": record.taxPercentage,
              "stock.$.purchasePrice": record.purchasePrice,
            },
          },
          { query: { "stock._id": _id } },
        )
          .then(
            (res: Task) => {
              message.success(t("stockList.saveSuccess"));
              setEditingId("");
              setStockList(res.stock || []);
              onSave(res.stock || [], false);
            },
            (error: Error) => {
              message.error(t("stockList.saveError"));
            },
          )
          .finally(() => setIsLoading(false));
      }
    } else {
      setStockList((old) =>
        old.map((item) => (item._id === record._id ? record : item)),
      );
      setEditingId("");
    }
  };

  const handleRemove = (_id: string) => {
    if (!!taskId) {
      setIsLoading(true);
      ParentService.patch(taskId, {
        $pull: {
          stock: { _id },
        },
      })
        .then(
          (res: Task) => {
            setStockList(res.stock || []);
            onSave(res.stock || [], false);
            message.success(t("stockList.stockRemoveSuccess"));
          },
          (error: Error) => {
            message.error(t("stockList.stockRemoveError"));
          },
        )
        .finally(() => setIsLoading(false));
    } else {
      setStockList((old) => old.filter((item) => item._id !== _id));
    }
  };

  const handleCancel = (_id = "") => {
    if (!_id.startsWith("NEW")) {
      setEditingId("");
    } else {
      setStockList((old) => old.filter((item) => item._id !== _id));
      setEditingId("");
    }
  };

  const closeModal = () => {
    setStockList([]);
    setEditingId("");
    onCancel();
  };

  return (
    <Modal
      title={<span className="s-modal-title">{t("taskEdit.showStock")}</span>}
      visible={visible}
      width={1200}
      onCancel={closeModal}
      footer={
        <div className="tw-flex tw-justify-end tw-px-2">
          <Button
            type="dashed"
            onClick={() => addNewStock()}
            disabled={!!editingId}
          >
            {t("stockList.addNew")}
          </Button>
          <Button type="default" className="tw-px-3" onClick={onCancel}>
            {t("global.cancel")}
          </Button>
          <Button
            type="primary"
            onClick={() => onSave(stockList, true)}
            className="tw-inline-flex tw-items-center"
            disabled={!!editingId || isLoading}
            loading={isLoading}
          >
            {t("global.save")}
          </Button>
        </div>
      }
      bodyStyle={{ padding: "12px 24px" }}
    >
      <EditableStockTable
        stockList={stockList}
        editingId={editingId}
        handleSave={(record) => handleSave(record)}
        handleRemove={handleRemove}
        onEdit={setEditingId}
        cancelEditing={(id) => handleCancel(id)}
      />
    </Modal>
  );
};

export default withTranslation()(EditStockUtilization);
