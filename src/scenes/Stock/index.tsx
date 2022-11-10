import { Tabs } from "antd";
import Appshell from "Appshell";
import React, { Key, useState } from "react";
import { useTranslation } from "react-i18next";
import { Redirect, RouteComponentProps, withRouter } from "react-router-dom";

import ProductsContainer from "./Products";
import StockHeader from "./StockHeader";
import WarehousesContainer from "./Warehouses";

interface StockProps extends RouteComponentProps {}

const Stock = ({ history, location }: StockProps) => {
  const [t] = useTranslation();
  const [state, setState] = useState({
    selectedProductKeys: [] as Key[],
    selectedWarehouseKeys: [] as Key[],
    ripple: false,
  });

  const updateState = (changes: Partial<typeof state>) =>
    setState((old) => ({ ...old, ...changes }));

  const params = new URLSearchParams(location.search);
  const activeTab = params.get("tab");
  if (!activeTab || (activeTab !== "products" && activeTab !== "warehouses")) {
    return <Redirect to="/products?tab=products" />;
  }

  return (
    <Appshell activeLink={["", "products"]}>
      <StockHeader
        selectedProductKeys={state.selectedProductKeys}
        selectedWarehouseKeys={state.selectedWarehouseKeys}
        activeTab={activeTab}
        onRipple={() => updateState({ ripple: !state.ripple })}
        updateParentState={updateState}
      />
      <Tabs
        activeKey={activeTab}
        onChange={(tab) => history.push(`/products?tab=${tab}`)}
        type="card"
      >
        <Tabs.TabPane
          tab={
            <span className="tw-text-sm tw-font-medium">
              {t("header.products")}
            </span>
          }
          key="products"
        >
          <ProductsContainer
            selectedRowKeys={state.selectedProductKeys}
            setSelectedRowKeys={(keys) =>
              updateState({ selectedProductKeys: keys })
            }
            ripple={state.ripple}
          />
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={
            <span className="tw-text-sm tw-font-medium">
              {t("header.warehouses")}
            </span>
          }
          key="warehouses"
        >
          <WarehousesContainer
            selectedRowKeys={state.selectedWarehouseKeys}
            setSelectedRowKeys={(keys: Key[]) =>
              updateState({ selectedWarehouseKeys: keys })
            }
          />
        </Tabs.TabPane>
      </Tabs>
    </Appshell>
  );
};

export default withRouter(Stock);
