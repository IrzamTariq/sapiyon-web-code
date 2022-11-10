import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import {
  Button,
  Descriptions,
  Drawer,
  Empty,
  Popconfirm,
  Table,
  Tabs,
  Tooltip,
  message,
} from "antd";
import { ColumnProps } from "antd/lib/table";
import FilterBar from "components/FilterBar/FilterBar";
import logger from "logger";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getPaginationButtons } from "scenes/Tasks/helpers";
import {
  Bin,
  PaginatedFeathersResponse,
  StockLevel,
  StockTransaction,
  User,
  UserContextType,
} from "types";
import { getRandomAlphaNumericString, getUsername } from "utils/helpers";
import { currencyFormatter } from "utils/helpers/currencyFormatter";

import {
  StockBinService,
  StockLevelService,
  StockTransactionService,
} from "../../../../../services";
import UserContext from "../../../../../UserContext";
import numberFormatter from "../../../../../utils/helpers/numberFormatter";
import StockEdit, {
  StockEditType,
} from "../../../Products/Components/ProductDetailsDrawer/Components/StockEdit";
import BinActivities from "./Components/BinActivities";
import Incoming from "./Components/Incoming";
import Outgoing from "./Components/Outgoing";

interface WarehouseDetailsProps {
  onClose: () => void;
  visible: boolean;
  bin: Bin;
}

const WarehouseDetails = ({ onClose, visible, bin }: WarehouseDetailsProps) => {
  const [t] = useTranslation();
  const { assignees = [], user: updatedBy = {} as User, watcherIds = [] } =
    bin || ({} as Bin);
  const { user, firm } = useContext(UserContext) as UserContextType;
  const isWatching = watcherIds.includes(user._id);

  const [binStock, setBinStock] = useState({
    data: [] as StockLevel[],
    total: 0,
    limit: 50,
    skip: 0,
  });
  const [editingState, setEditingState] = useState({
    editedRecord: {} as StockEditType,
    isEditing: false,
  });

  const { total, limit, skip } = binStock || {};
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(false);
  const [loadingWatch, setloadingWatch] = useState(false);

  const removeTransaction = (query: any) => {
    StockTransactionService.create(query).then(
      (res: StockTransaction) => {
        setBinStock((old) => ({
          ...old,
          data: old?.data?.filter((item) => item.productId !== res.productId),
        }));
      },
      (error: Error) => {
        message.error("Could not remove stock");
        logger.error("Error in removing transaction: ", error);
      },
    );
  };

  const toggleWatching = () => {
    setloadingWatch(true);
    const { _id: binId } = bin;
    StockBinService.patch(
      binId,
      { watching: !isWatching },
      { query: { withAssignees: true } },
    )
      .then(
        (res: Bin) => {},
        (error: Error) => {
          logger.error("Could not toggle watch on warehouse: ", error);
          message.error("Could not toggle watching warehouse");
        },
      )
      .finally(() => setloadingWatch(false));
  };

  const handlePageChange = (page: number, size: number) =>
    setBinStock((old) => ({
      ...old,
      skip: (page - 1) * size,
    }));

  let columns: ColumnProps<StockLevel>[] = [
    {
      title: t("products.productName"),
      dataIndex: ["product", "title"],
      render: (text) => (
        <div className="tw-truncate" style={{ maxWidth: "500px" }} title={text}>
          {text}
        </div>
      ),
    },
    {
      title: t("addProduct.quantity"),
      dataIndex: "qty",
      render: (text) => numberFormatter(text),
    },
    {
      title: t("products.serialNumber"),
      dataIndex: ["product", "barcode"],
      render: (text) => <div style={{ width: "inherit" }}>{text}</div>,
    },
    {
      title: t("addProduct.unit"),
      dataIndex: ["product", "unitOfMeasurement"],
      render: (text) => <div style={{ width: "inherit" }}>{text}</div>,
    },
    {
      title: t("products.salesPrice"),
      dataIndex: ["product", "unitPrice"],
      render: (text) => (
        <div style={{ width: "inherit" }}>
          {currencyFormatter(text, false, firm.currencyFormat)}
        </div>
      ),
    },
    {
      title: t("products.tags"),
      dataIndex: ["product", "tags"],
      render: (_, record) => {
        const tags: string[] = record?.product?.tags || [];
        return (
          <Tooltip
            autoAdjustOverflow
            placement="bottom"
            title={
              <ol>
                {tags.map((tag, index) => (
                  <li key={getRandomAlphaNumericString()}>{`${
                    index + 1
                  }. ${tag}`}</li>
                ))}
              </ol>
            }
          >
            <div className="tw-truncate" style={{ width: "inherit" }}>
              {tags.join(" | ")}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: t("global.actions"),
      dataIndex: "actions",
      render: (_, record) => (
        <div>
          <Button
            type="text"
            onClick={() =>
              setEditingState({
                editedRecord: {
                  _id: record._id,
                  productId: record.productId,
                  toId: record.binId,
                  oldValue: record.qty,
                },
                isEditing: true,
              })
            }
          >
            <EditOutlined className="s-default-icon-color" />
          </Button>
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
            placement="topRight"
            okText={t("global.delete")}
            cancelText={t("global.cancel")}
            okButtonProps={{ danger: true }}
          >
            <Button type="text">
              <DeleteOutlined className="tw-text-red-500" />
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];
  columns = columns.map((col) => ({
    ...col,
    title: <span className="s-col-title">{col.title}</span>,
    onCell: () => ({ className: "s-table-text" }),
  }));

  useEffect(() => {
    if (bin._id && visible) {
      setLoading(true);
      StockLevelService.find({
        query: {
          binId: bin._id,
          $multi_match: { $query: searchTerm },
          $sort: { qty: 1 },
          $limit: limit,
          $skip: skip,
        },
      })
        .then((res: PaginatedFeathersResponse<StockLevel>) => {
          const { data, ...rest } = res;
          setBinStock({
            ...rest,
            data: (data || []).filter((item) => item.qty !== 0),
          });
        })
        .finally(() => setLoading(false));
    }
  }, [bin._id, skip, limit, searchTerm, visible]);

  useEffect(() => {
    const handleEvent = (level: StockLevel) => {
      if (level.binId === bin._id) {
        setBinStock((old) => {
          let data = old?.data || [];
          if (level.qty === 0) {
            data = data?.filter((item) => item._id !== level._id);
          } else if (
            old?.data?.findIndex((item) => item._id === level._id) === -1
          ) {
            data = [...data, level];
          } else {
            data = data?.map((item) => (item._id === level._id ? level : item));
          }
          return { ...old, data };
        });
      }
    };

    StockLevelService.on("created", handleEvent);
    StockLevelService.on("patched", handleEvent);
    return () => {
      StockLevelService.off("created", handleEvent);
      StockLevelService.off("patched", handleEvent);
    };
  }, [bin._id]);

  return (
    <Drawer
      placement="right"
      closable={false}
      onClose={onClose}
      visible={visible}
      width={890}
      destroyOnClose
    >
      <div className="tw-mb-4 tw-flex tw-justify-between tw-items-center tw-border-b">
        <div className="s-page-title">{bin.title}</div>
        <Button
          type="primary"
          loading={loadingWatch}
          className="s-btn-spinner-align"
          onClick={() => toggleWatching()}
          danger={isWatching}
        >
          {isWatching ? t("Unfollow") : t("Follow")}
        </Button>
      </div>

      <Descriptions column={2} layout="horizontal" bordered>
        <Descriptions.Item label={t("warehouses.assignedTo")}>
          <Tooltip
            title={assignees.map((user) => getUsername(user)).join(" - ")}
          >
            <div className="tw-truncate" style={{ maxWidth: "225px" }}>
              {assignees.map((user) => getUsername(user)).join(" | ")}
            </div>
          </Tooltip>
        </Descriptions.Item>
        <Descriptions.Item label={t("warehouseDetails.createdAt")}>
          <div style={{ maxWidth: "100px" }}>
            {bin.createdAt && moment(bin.createdAt).format("DD/MM/YYYY")}
          </div>
        </Descriptions.Item>
        <Descriptions.Item label={t("warehouseDetails.updatedBy")}>
          <div
            className="tw-truncate"
            title={getUsername(updatedBy)}
            style={{ maxWidth: "225px" }}
          >
            {getUsername(updatedBy)}
          </div>
        </Descriptions.Item>
      </Descriptions>

      <Tabs
        className="tw-my-5"
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          setSearchTerm("");
        }}
        tabBarExtraContent={
          activeTab === "all" ? (
            <FilterBar
              resetFilters={() => setSearchTerm("")}
              fields={[
                {
                  label: t("products.elasticSearch"),
                  className: "tw-mr-2",
                  type: "shortText",
                  key: "title",
                },
              ]}
              handleChange={(key, val) => setSearchTerm(val)}
              styleClasses="tw-w-full"
            />
          ) : null
        }
      >
        <Tabs.TabPane tab={t("warehouseDetails.currentStock")} key="all">
          <Table
            rowKey={(record) => record._id}
            columns={columns}
            dataSource={binStock.data || []}
            pagination={{
              current: skip / limit + 1,
              size: "small",
              total,
              pageSize: limit,
              onChange: (pageNum) => handlePageChange(pageNum, limit),
              itemRender: (page, type) =>
                getPaginationButtons(
                  page,
                  type,
                  skip / limit + 1,
                  skip + limit >= total,
                  false,
                ),
              hideOnSinglePage: true,
            }}
            loading={loading}
            rowClassName={() => "s-hover-parent"}
            className="tw-mb-16"
            locale={{
              emptyText: <Empty description={t("tables.noData")} />,
            }}
            scroll={{ x: true }}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab={t("warehouseDetails.incoming")} key="incoming">
          <Incoming binId={bin._id} />
        </Tabs.TabPane>
        <Tabs.TabPane tab={t("warehouseDetails.outgoing")} key="outgoing">
          <Outgoing binId={bin._id} />
        </Tabs.TabPane>
      </Tabs>
      <section className="tw-mb-20">
        {bin._id && <BinActivities binId={bin._id} />}
      </section>
      <StockEdit
        visible={editingState.isEditing}
        editedRecord={editingState.editedRecord}
        handleClose={() =>
          setEditingState({
            editedRecord: {} as StockEditType,
            isEditing: false,
          })
        }
      />
      <div
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          width: "100%",
          borderTop: "1px solid #e9e9e9",
          padding: "10px 40px",
          background: "#fff",
          textAlign: "right",
          zIndex: 10,
        }}
      >
        <Button onClick={onClose} type="primary">
          {t("global.close")}
        </Button>
      </div>
    </Drawer>
  );
};
export default WarehouseDetails;
