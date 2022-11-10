import { Button, Drawer, Tabs } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";
import { StockItem } from "types";

import ProductDetailsGeneralTab from "./Components/GeneralTab";
import ProductDetailsTasksTab from "./Components/TasksTab";

interface ProductDetailsDrawerProps {
  visible: boolean;
  onClose: () => void;
  product: StockItem;
}

const ProductDetailsDrawer = ({
  onClose,
  visible,
  product,
}: ProductDetailsDrawerProps) => {
  const [t] = useTranslation();

  return (
    <Drawer
      placement="right"
      closable={false}
      onClose={onClose}
      visible={visible}
      width={1000}
      className="z-10"
      bodyStyle={{ paddingTop: "0px" }}
    >
      <Tabs defaultActiveKey="1" tabBarStyle={{ marginTop: "12px" }}>
        <Tabs.TabPane tab={t("productDetails.general")} key="1">
          <ProductDetailsGeneralTab product={product} />
        </Tabs.TabPane>
        <Tabs.TabPane tab={t("productDetails.tasks")} key="2">
          <ProductDetailsTasksTab productId={product._id} />
        </Tabs.TabPane>
      </Tabs>

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

export default ProductDetailsDrawer;
