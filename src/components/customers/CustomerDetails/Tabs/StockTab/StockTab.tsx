import { Empty, Table, Tooltip } from "antd";
import { ColumnProps } from "antd/lib/table";
import React, { useContext, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import UserContext from "UserContext";

import { getPaginationButtons } from "../../../../../scenes/Tasks/helpers";
import { StockItem, UserContextType } from "../../../../../types";
import { getRandomAlphaNumericString } from "../../../../../utils/helpers";
import { currencyFormatter } from "../../../../../utils/helpers/currencyFormatter";

interface StockTabProps extends WithTranslation {
  items: StockItem[];
  isLoading: boolean;
}
interface StockColumnProps extends ColumnProps<StockItem> {
  title: JSX.Element;
  dataIndex: string;
}

const StockTab = ({ t, items, isLoading }: StockTabProps) => {
  const { firm } = useContext(UserContext) as UserContextType;
  const [activeProductsPage, setActiveProductsPage] = useState(1);
  const [activeServicesPage, setActiveServicesPage] = useState(1);

  let productColumns: StockColumnProps[] = [
    {
      title: t("products.productName"),
      dataIndex: "title",
      render: (text) => (
        <div className="tw-w-64 tw-truncate" title={text}>
          {text}
        </div>
      ),
    },
    {
      title: t("products.serialNumber"),
      dataIndex: "barcode",
      render: (text) => (
        <div className="tw-w-32 tw-truncate" title={text}>
          {text}
        </div>
      ),
    },
    {
      title: t("products.salesPrice"),
      dataIndex: "unitPrice",
      render: (text) => currencyFormatter(text, false, firm.currencyFormat),
    },
    {
      title: t("products.tags"),
      dataIndex: "tags",
      render: (tags: string[]) => (
        <Tooltip
          autoAdjustOverflow
          placement="bottom"
          title={
            <ol>
              {tags.map((tag, index) => (
                <li key={getRandomAlphaNumericString(10)}>{`${
                  index + 1
                }. ${tag}`}</li>
              ))}
            </ol>
          }
        >
          <div className="tw-w-64 tw-truncate">{tags.join(", ")}</div>
        </Tooltip>
      ),
    },
  ];
  let serviceColumns: StockColumnProps[] = [
    {
      title: t("services.serviceName"),
      dataIndex: "title",
      render: (text) => (
        <div className="tw-w-64 tw-truncate" title={text}>
          {text}
        </div>
      ),
    },
    {
      title: t("services.description"),
      dataIndex: "description",
      render: (text) => (
        <div className="tw-w-64 tw-truncate" title={text}>
          {text}
        </div>
      ),
    },
    {
      title: t("services.price"),
      dataIndex: "unitPrice",
      render: (text) => currencyFormatter(text, false, firm.currencyFormat),
    },
  ];

  productColumns = productColumns.map((col) => ({
    ...col,
    title: <span className="s-col-title">{col.title}</span>,
    onCell: () => ({ className: "s-table-text" }),
  }));
  serviceColumns = serviceColumns.map((col) => ({
    ...col,
    title: <span className="s-col-title">{col.title}</span>,
    onCell: () => ({ className: "s-table-text" }),
  }));
  const products = items.filter((item) => item.type === "product");
  const services = items.filter((item) => item.type === "service");

  return (
    <div className="tw-px-6">
      <section className="tw-mb-6">
        <h2 className={"tw-text-2xl"}>{t("products.pageTitle")}</h2>
        <Table
          dataSource={products}
          columns={productColumns}
          rowKey={"_id"}
          pagination={{
            style: { display: "block", textAlign: "right", float: "unset" },
            itemRender: (page, type) =>
              getPaginationButtons(
                page,
                type,
                activeProductsPage,
                activeProductsPage * 25 >= (products?.length || 0),
              ),
            hideOnSinglePage: true,
            pageSize: 25,
            onChange: (page) => setActiveProductsPage(page),
          }}
          loading={isLoading}
          locale={{
            emptyText: <Empty description={t("tables.noData")} />,
          }}
        />
      </section>
      <section className="tw-mb-6">
        <h2 className={"tw-text-2xl"}>{t("services.pageTitle")}</h2>
        <Table
          dataSource={services}
          columns={serviceColumns}
          rowKey={"_id"}
          pagination={{
            style: { display: "block", textAlign: "right", float: "unset" },
            itemRender: (page, type) =>
              getPaginationButtons(
                page,
                type,
                activeServicesPage,
                activeServicesPage * 25 >= (services?.length || 0),
              ),
            hideOnSinglePage: true,
            pageSize: 25,
            onChange: (page) => setActiveServicesPage(page),
          }}
          loading={isLoading}
          locale={{
            emptyText: <Empty description={t("tables.noData")} />,
          }}
        />
      </section>
    </div>
  );
};

export default withTranslation()(StockTab);
