import {
  faBoxes,
  faDolly,
  faMinus,
  faShoppingCart,
  faSlidersH,
  faWarehouse,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar, Button, List } from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  PaginatedFeathersResponse,
  StockTransaction,
  StockTransactionType,
} from "types";
import { getUsername } from "utils/helpers";

import { StockTransactionService } from "../../../../../../services";

interface BinActivitiesProps {
  binId: string;
}

const BinActivities = ({ binId }: BinActivitiesProps) => {
  const [t] = useTranslation();
  const [activities, setActivities] = useState({
    data: [] as StockTransaction[],
    total: 0,
    skip: 0,
    limit: 50,
  });

  const { total = 0, limit = 50, skip = 0 } = activities;

  const handlePageChange = () =>
    setActivities((old) => ({
      ...old,
      skip: skip + limit,
    }));

  const getAvatar = (type: StockTransactionType) => {
    let color = "gray";
    let icon = faWarehouse;
    if (type === "add") {
      icon = faBoxes;
      color = "darkseagreen";
    } else if (type === "transfer") {
      icon = faDolly;
      color = "gray";
    } else if (type === "remove") {
      icon = faMinus;
      color = "red";
    } else if (type === "adjust") {
      icon = faSlidersH;
      color = "orange";
    } else if (type === "sale") {
      icon = faShoppingCart;
      color = "blue";
    }
    return (
      <Avatar
        icon={<FontAwesomeIcon icon={icon} className="text-white" />}
        style={{
          backgroundColor: color,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "0.8rem",
        }}
      />
    );
  };

  const fillData = (data: StockTransaction, key: string) => {
    const interpolationData = {
      user: getUsername(data?.user) || t("binActivities.user"),
      unit: data?.product?.unitOfMeasurement || t("binActivities.unit"),
      product: data?.product?.title || t("binActivities.product"),
      toBin: data?.toBin?.title || t("binActivities.warehouse"),
      fromBin: data?.fromBin?.title || t("binActivities.warehouse"),
      quantity: data?.qty || t("binActivities.quantity"),
      interpolation: {
        prefix: "<",
        suffix: ">",
      },
    };
    return t(key, interpolationData);
  };

  const getDescription = (item: StockTransaction) => {
    if (item.type !== "adjust") {
      return fillData(item, `stockActivities.${item.type}`);
    } else {
      return (
        <div>
          <p>{fillData(item, `stockActivities.${item.type}`)}</p>
          <span>
            {t("stockActivities.reason")}: {item.description}
          </span>
        </div>
      );
    }
  };

  useEffect(() => {
    if (!!binId) {
      StockTransactionService.find({
        query: {
          $or: [{ toId: binId }, { fromId: binId }],
          $sort: { createdAt: -1 },
          $limit: limit,
          $skip: skip,
        },
      }).then((res: PaginatedFeathersResponse<StockTransaction>) => {
        const { data, ...rest } = res;
        setActivities((old) => ({
          data: [...(old.data || []), ...data],
          ...rest,
        }));
      });
    }
  }, [binId, skip, limit]);

  useEffect(() => {
    const handleCreated = (transaction: StockTransaction) => {
      if (transaction.fromId === binId || transaction.toId === binId) {
        setActivities((old) => ({ ...old, data: [transaction, ...old.data] }));
      }
    };

    StockTransactionService.on("created", handleCreated);
    return () => {
      StockTransactionService.off("created", handleCreated);
    };
  }, [binId]);

  return (
    <div>
      <h1 className="s-main-font s-main-text-color tw-text-xl">
        {t("stockActivities.pageTitle")}
      </h1>
      <List
        locale={{ emptyText: t("tables.noData") }}
        itemLayout="horizontal"
        dataSource={activities.data || []}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={getAvatar(item.type)}
              title={
                <span className="s-main-font s-light-text-color">
                  {moment(item.createdAt).format("dddd, DD MMMM YYYY - HH:mm")}
                </span>
              }
              description={
                <span className="s-main-font s-main-text-color">
                  {getDescription(item)}
                </span>
              }
            />
          </List.Item>
        )}
      />
      {total > skip + limit && (
        <div className="tw-flex tw-justify-end">
          <Button type="link" onClick={() => handlePageChange()}>
            {t("activities.showMore")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default BinActivities;
