import { message } from "antd";
import i18next from "i18next";
import React, { useEffect, useState } from "react";
import { TaskService } from "../../../../../services";
import { StockItem } from "../../../../../types";
import StockTab from "./StockTab";

interface StockTabContainerProps {
  customerId: string;
}

const StockTabContainer = ({ customerId }: StockTabContainerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<StockItem[]>([]);

  useEffect(() => {
    setIsLoading(true);
    TaskService.find({
      query: { customerId, reportName: "SoldStockItems" },
    }).then(
      (res: StockItem[]) => {
        setItems(res);
        setIsLoading(false);
      },
      () => {
        // console.log("Error in fetching customer utilization report: ", error);
        setIsLoading(false);
        message.error(i18next.t("customers.stockReportFetchError"));
      },
    );
  }, [customerId]);

  return <StockTab items={items} isLoading={isLoading} />;
};
export default StockTabContainer;
