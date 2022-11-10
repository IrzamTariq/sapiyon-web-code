import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Input, Modal, Popconfirm, Table, message } from "antd";
import { ColumnProps } from "antd/lib/table";
import logger from "logger";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getPaginationButtons } from "scenes/Tasks/helpers";
import { FirmService } from "services";
import { Firm, StockTag, UserContextType } from "types";
import UserContext from "UserContext";
import { getRandomAlphaNumericString } from "utils/helpers";

interface StockTagsProps {
  visible: boolean;
  handleClose: () => void;
}
const pageSize = 10;

const StockTags = ({ visible, handleClose }: StockTagsProps) => {
  const [t] = useTranslation();
  const { firm = {} as Firm } = useContext(UserContext) as UserContextType;
  const [stockTags, setStockTags] = useState([] as StockTag[]);
  const [state, setState] = useState({
    editingId: "",
    title: "",
    isLoading: false,
    total: 0,
    activePage: 1,
  });

  const saveTag = () => {
    const { editingId = "", title } = state;
    setState((old) => ({ ...old, isLoading: true }));
    if (editingId.startsWith("NEW")) {
      FirmService.patch(firm._id, { $push: { stockTags: { title } } }).then(
        () => {
          setState((old) => ({ ...old, isLoading: false, editingId: "" }));
          message.success(t("stockTags.saveSuccess"));
        },
        (e: Error) => {
          message.error(t("stockTags.saveError"));
          setState((old) => ({ ...old, isLoading: false }));
          logger.error("Error in creating tag: ", e);
        },
      );
    } else {
      FirmService.patch(
        firm._id,
        { $set: { "stockTags.$.title": title } },
        { query: { "stockTags._id": state.editingId } },
      ).then(
        () => {
          setState((old) => ({ ...old, isLoading: false, editingId: "" }));
          message.success(t("stockTags.saveSuccess"));
        },
        (e: Error) => {
          logger.error("Error in updating tag: ", e);
          message.error(t("stockTags.saveError"));
          setState((old) => ({ ...old, isLoading: false }));
        },
      );
    }
  };
  const addNewTag = () => {
    const editingId = `NEW-${getRandomAlphaNumericString()}`;
    setStockTags((old) => [
      ...old,
      { title: t("stockTags.editTitle"), _id: editingId },
    ]);
    setState((old) => ({ ...old, title: "", editingId }));
  };
  const deleteTag = (_id: string) => {
    setState((old) => ({ ...old, isLoading: true }));
    FirmService.patch(firm._id, {
      $pull: { stockTags: { _id } },
    })
      .then(
        () => {
          message.success(t("stockTags.deleteSuccess"));
        },
        (e: Error) => {
          message.error(t("stockTags.deleteError"));
          logger.error("Error in deleting tag: ", e);
        },
      )
      .finally(() => setState((old) => ({ ...old, isLoading: false })));
  };
  const cancelEditing = () => {
    if ((state.editingId || "").startsWith("NEW")) {
      setStockTags((old) => old.filter((item) => item._id !== state.editingId));
    }
    setState((old) => ({ ...old, title: "", editingId: "" }));
  };

  const columns: ColumnProps<StockTag>[] = [
    {
      title: t("stockTags.title"),
      dataIndex: "title",
      width: "70%",
      render: (text, record) =>
        state.editingId === record._id ? (
          <Input
            placeholder={t("stockTags.enterTitle")}
            value={state.title}
            onChange={(e) => {
              const title = e.target.value || "";
              setState((old) => ({ ...old, title }));
            }}
            onPressEnter={saveTag}
            autoFocus
          />
        ) : (
          <div
            className="s-pointer"
            onClick={() =>
              setState((old) => ({
                ...old,
                title: record.title,
                editingId: record._id,
              }))
            }
          >
            {text}
          </div>
        ),
    },
    {
      title: t("global.actions"),
      align: "right",
      render: (text, record) => (
        <div>
          {state.editingId === record._id ? (
            <>
              <Button
                type="primary"
                size="small"
                className="tw-mr-2"
                onClick={saveTag}
              >
                {t("global.save")}
              </Button>
              <Button size="small" onClick={cancelEditing}>
                {t("global.cancel")}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="text"
                size="small"
                className="tw-text-blue-500"
                onClick={() =>
                  setState((old) => ({
                    ...old,
                    title: record.title,
                    editingId: record._id,
                  }))
                }
              >
                <EditOutlined />
              </Button>
              <Popconfirm
                title={t("global.deleteSurety")}
                onConfirm={() => deleteTag(record._id)}
                okText={t("global.delete")}
                cancelText={t("global.cancel")}
                okButtonProps={{ danger: true }}
              >
                <Button type="text" size="small" danger>
                  <DeleteOutlined />
                </Button>
              </Popconfirm>
            </>
          )}
        </div>
      ),
    },
  ];

  const closeModal = () => {
    setState({
      activePage: 1,
      editingId: "",
      isLoading: false,
      title: "",
      total: 0,
    });
    handleClose();
  };

  useEffect(() => {
    if (visible) {
      const stockTags = firm.stockTags || [];
      setStockTags(stockTags);
      setState((old) => ({ ...old, total: stockTags.length }));
    }
  }, [visible, firm.stockTags]);

  return (
    <Modal
      title={t("stockTags.pageTitle")}
      visible={visible}
      onCancel={closeModal}
      onOk={closeModal}
      footer={null}
      bodyStyle={{ padding: "12px 24px" }}
      width={600}
    >
      <Table
        columns={columns}
        dataSource={stockTags}
        rowKey="_id"
        loading={state.isLoading}
        pagination={{
          size: "small",
          pageSize: pageSize,
          style: { display: "block", textAlign: "center", float: "unset" },
          itemRender: (page, type) =>
            getPaginationButtons(
              page,
              type,
              state.activePage,
              state.activePage * pageSize >= state.total,
              false,
            ),
          onChange: (page) => setState((old) => ({ ...old, activePage: page })),
        }}
      />
      <div className="tw-flex tw-justify-end">
        <Button
          type="primary"
          className="tw-mt-5 s-btn-spinner-align tw-uppercase s-main-font s-semibold"
          onClick={addNewTag}
          loading={state.isLoading}
          disabled={state.isLoading}
        >
          {t("stockTags.add")}
        </Button>
      </div>
    </Modal>
  );
};

export default StockTags;
