import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Descriptions, Empty, Popconfirm, Table, Tooltip, message } from "antd";
import { ColumnProps } from "antd/lib/table";
import logger from "logger";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getPaginationButtons } from "scenes/Tasks/helpers";
import { StockLevelService, StockTransactionService } from "services";
import {
  PaginatedFeathersResponse,
  StockItem,
  StockLevel,
  StockTransaction,
  UserContextType,
} from "types";
import UserContext from "UserContext";
import { getCustomFieldValue } from "utils/helpers";

import numberFormatter from "../../../../../../utils/helpers/numberFormatter";
import StockEdit, { StockEditType } from "./StockEdit";

interface ProductDetailsGeneralTabProps {
  product: StockItem;
}

const ProductDetailsGeneralTab = ({
  product,
}: ProductDetailsGeneralTabProps) => {
  const [t] = useTranslation();
  const { firm } = useContext(UserContext) as UserContextType;
  const [editingState, setEditingState] = useState({
    editedRecord: {} as StockEditType,
    visible: false,
  });
  const [loading, setLoading] = useState(false);
  const [stockDetails, setStockDetails] = useState([] as StockLevel[]);
  const [activePage, setActivePage] = useState(1);

  const removeTransaction = (query: any) => {
    StockTransactionService.create(query).then(
      (res: StockTransaction) =>
        setStockDetails((old) =>
          old.filter((item) => item.binId !== res.fromId),
        ),
      (error: Error) => {
        message.error("Could not remove stock");
        logger.error("Error in removing transaction: ", error);
      },
    );
  };

  const columns: ColumnProps<StockLevel>[] = [
    {
      title: <span className="s-col-title">{t("addProduct.warehouse")}</span>,
      dataIndex: ["bin", "title"],
      className: "s-table-text",
      width: "70%",
    },
    {
      title: <span className="s-col-title">{t("addProduct.quantity")}</span>,
      dataIndex: "qty",
      className: "s-table-text",
      render: (text, record) => {
        return (
          <div className="tw-flex tw-justify-between tw-items-center">
            <span className="s-table-text">{numberFormatter(text)}</span>
            <div className="s-hover-target">
              <EditOutlined
                className="tw-mr-4 s-default-icon-color tw-align-text-top s-pointer"
                onClick={() =>
                  setEditingState({
                    editedRecord: {
                      _id: record._id,
                      toId: record.binId,
                      productId: record.productId,
                      oldValue: record.qty,
                    },
                    visible: true,
                  })
                }
              />
              <Popconfirm
                title={t("stockEdit.deleteMsg")}
                onConfirm={() =>
                  removeTransaction({
                    productId: record.productId,
                    fromId: record.binId,
                    qty: record.qty,
                    type: "remove",
                  })
                }
                okText={t("global.delete")}
                cancelText={t("global.cancel")}
                okButtonProps={{ danger: true }}
              >
                <DeleteOutlined className="s-default-icon-color tw-align-text-top s-pointer" />
              </Popconfirm>
            </div>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    setLoading(true);
    StockLevelService.find({
      query: { productId: product._id, $limit: 500 },
    })
      .then(
        (res: PaginatedFeathersResponse<StockLevel>) =>
          setStockDetails(res?.data?.filter((item) => item.qty !== 0)),
        (error: Error) => {
          message.error("Could not fetch stock details");
          logger.error("Error in fetching stock details: ", error);
        },
      )
      .finally(() => setLoading(false));
  }, [product?._id]);

  useEffect(() => {
    const handleEvent = (level: StockLevel) => {
      if (level.productId === product._id) {
        setStockDetails((old) => {
          if (level.qty === 0) {
            return old.filter((item) => item._id !== level._id);
          } else if (old.findIndex((item) => item._id === level._id) === -1) {
            return [...old, level];
          } else {
            return old.map((item) => (item._id === level._id ? level : item));
          }
        });
      }
    };

    StockLevelService.on("created", handleEvent);
    StockLevelService.on("patched", handleEvent);
    return () => {
      StockLevelService.off("created", handleEvent);
      StockLevelService.off("patched", handleEvent);
    };
  }, [product._id]);

  return (
    <div>
      <div className="tw-flex tw-items-start tw-justify-between tw-mb-4 tw-border-b">
        <div className="s-main-text-color tw-text-2xl tw-font-medium">
          {product.title}
        </div>
        <div className="s-main-font s-info-bg tw-text-white s-semibold tw-px-3 tw-py-1 tw-ml-10 whitespace-no-wrap">
          {`${t("productDetails.stockInHand")}: ${numberFormatter(
            product.qty,
          )}`}
        </div>
      </div>

      <Descriptions column={2} layout="horizontal" bordered>
        <Descriptions.Item label={t("products.serialNumber")}>
          <div
            title={product.barcode}
            className="tw-truncate"
            style={{ maxWidth: "225px" }}
          >
            {product.barcode}
          </div>
        </Descriptions.Item>
        <Descriptions.Item label={t("addProduct.unit")}>
          <div
            className="tw-truncate"
            title={product.unitOfMeasurement}
            style={{ maxWidth: "225px" }}
          >
            {product.unitOfMeasurement}
          </div>
        </Descriptions.Item>
        <Descriptions.Item label={t("products.tags")}>
          <Tooltip title={(product.tags || []).join(" - ")}>
            <div className="tw-truncate" style={{ maxWidth: "225px" }}>
              {(product.tags || []).join(" - ")}
            </div>
          </Tooltip>
        </Descriptions.Item>
        {(product.fields || [])
          .filter((item) => !!item.label)
          .map((field) => (
            <Descriptions.Item key={field._id} label={field.label}>
              <div
                className="tw-truncate"
                title={getCustomFieldValue(field, false, firm) as string}
                style={{ maxWidth: "225px" }}
              >
                {getCustomFieldValue(field, true, firm)}
              </div>
            </Descriptions.Item>
          ))}
      </Descriptions>
      <Table
        rowKey={(record) => record._id}
        columns={columns}
        dataSource={stockDetails}
        pagination={{
          pageSize: 50,
          onChange: (pageNum) => setActivePage(pageNum),
          size: "small",
          itemRender: (page, type) =>
            getPaginationButtons(
              page,
              type,
              activePage,
              activePage * 50 >= stockDetails.length,
              false,
            ),
          hideOnSinglePage: true,
        }}
        loading={loading}
        rowClassName={() => "s-hover-parent"}
        className="tw-mt-5 tw-mb-16"
        locale={{
          emptyText: <Empty description={t("tables.noData")} />,
        }}
      />
      <StockEdit
        editedRecord={editingState.editedRecord}
        visible={editingState.visible}
        handleClose={() =>
          setEditingState({
            editedRecord: {} as StockEditType,
            visible: false,
          })
        }
      />
    </div>
  );
};

export default ProductDetailsGeneralTab;
