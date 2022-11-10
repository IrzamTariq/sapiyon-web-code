import mixpanel from "analytics/mixpanel";
import { Button, Modal, message } from "antd";
import logger from "logger";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Bin,
  CustomField,
  PaginatedFeathersResponse,
  StockItem,
  UserContextType,
} from "types";
import { v4 as uuid } from "uuid";

import { StockBinService, StockItemService } from "../../../services";
import UserContext from "../../../UserContext";
import PreviewImportRecords from "./PreviewImportRecords";
import UploadFile from "./UploadFile";

interface ProductsImportContainerProps {
  visible: boolean;
  handleOk: () => void;
  handleCancel: () => void;
  onSave: () => void;
}

const ProductsImportContainer = ({
  visible,
  handleOk,
  handleCancel,
  onSave = () => {},
}: ProductsImportContainerProps) => {
  const [t] = useTranslation();
  const [records, setRecords] = useState([] as StockItem[]);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { firm } = useContext(UserContext) as UserContextType;
  const { forms = {} } = firm;
  const { stockItems = [] } = forms;

  const fieldsMap = stockItems.reduce(
    (a, c) => ({ ...a, [c.label]: c }),
    {} as { [fieldLabel: string]: CustomField },
  );

  const mapWarehouseIds = (records = [] as StockItem[]) => {
    setLoading(true);
    message.loading({
      content: t("productsImport.mapping"),
      duration: 0,
      key: "mappingBins",
    });
    StockBinService.find({
      query: { $limit: 500 },
    }).then(
      (res: PaginatedFeathersResponse<Bin>) => {
        const warehouses = res?.data?.reduce(
          (acc, { title = "", ...rest }) => ({
            ...acc,
            [title?.trim().toLowerCase()]: { title, ...rest },
          }),
          {} as { [warehouseTitle: string]: Bin },
        );

        let binQtyMap = {} as {
          [productTitle: string]: {
            [binId: string]: number;
          };
        };
        const cleanRecords = records.reduce((acc, curr) => {
          //@ts-ignore
          const { warehouse = "", qty = 0, ...rest } = curr;
          const bin = warehouse?.trim()?.toLowerCase() || "";
          const productName = curr?.title?.trim()?.toLowerCase();
          const existing = acc.some(
            (item) => item.title?.trim()?.toLowerCase() === productName,
          );

          if (warehouses.hasOwnProperty(bin) && qty > 0) {
            const binId = warehouses?.[bin]._id;
            binQtyMap = Object.assign({}, binQtyMap, {
              [productName]: {
                ...(binQtyMap[productName] || {}),
                [binId]: (binQtyMap?.[productName]?.[binId] || 0) + qty,
              },
            });
          }
          return existing ? acc : [...acc, rest as StockItem];
        }, [] as StockItem[]);
        const binByIds = Object.values(warehouses).reduce(
          (acc, curr) => ({
            ...acc,
            [curr._id]: curr,
          }),
          {} as { [binId: string]: Bin },
        );
        const mappedRecords = cleanRecords.map((item) => {
          const productName = item?.title?.trim()?.toLowerCase();
          if (binQtyMap.hasOwnProperty(productName)) {
            const stockMapping = binQtyMap[productName] || {};
            const initialStock = Object.entries(stockMapping).map(
              ([binId, qty]) => ({
                binId,
                qty,
                title: binByIds[binId]?.title || "Unnamed warehouse",
              }),
            );
            return { ...item, initialStock };
          } else {
            return item;
          }
        });

        setRecords(mappedRecords);
        setLoading(false);
        message.success({
          content: t("productsImport.mappingDone"),
          duration: 2,
          key: "mappingBins",
        });
      },
      (error: Error) => {
        setLoading(false);
        message.error({
          content: t("bins.fetchError"),
          key: "mappingBins",
        });
        logger.error("Could not fetch warehouses: ", error);
      },
    );
  };

  const handleRecordsLoad = (data = [] as any[]) => {
    if (!Array.isArray(data)) {
      message.error(t("productsImport.loadError"));
      setRecords([]);
      return;
    }
    const getTags = (str = "") => {
      return str
        .split(",")
        .reduce(
          (acc, curr = "") => (!!curr ? [...acc, curr?.trim()] : acc),
          [] as string[],
        );
    };
    const records = data.reduce(
      (
        acc,
        {
          "Ürün adı": title,
          "Seri numarası": barcode,
          "Mevcut stok": qty,
          Birim: unitOfMeasurement,
          "Birim fiyat": unitPrice,
          "Alış fiyatı": purchasePrice,
          KDV: taxRate,
          Etiketler: tags,
          Depo: warehouse,
          ...restFields
        },
      ) => {
        const fields = Object.entries(restFields).reduce(
          (a: CustomField[], [k]) => {
            if (k in fieldsMap) {
              let value =
                fieldsMap[k].type === "toggleSwitch"
                  ? !!parseInt(restFields[k] || 0)
                  : restFields[k];
              return [...a, { ...fieldsMap[k], value }];
            } else {
              return [...a];
            }
          },
          [],
        );

        const newRecord = ({
          title,
          barcode,
          qty: parseFloat(qty) || 0,
          unitOfMeasurement,
          unitPrice: parseFloat(unitPrice) || 0,
          purchasePrice: parseFloat(purchasePrice) || 0,
          taxRate: parseInt(taxRate) || 18,
          tags: getTags(tags),
          fields,
          type: "product",
          uid: uuid(),
          warehouse,
        } as unknown) as StockItem;

        return title ? [...acc, newRecord] : acc;
      },
      [],
    );

    mapWarehouseIds(records);
    setStep(1);
  };

  const handleSave = () => {
    if (records.length === 0) {
      setStep(0);
      message.warn(t("productsImport.noRecords"));
    } else {
      message.loading({
        content: t("productsImport.savingRecords"),
        duration: 0,
        key: "savingStockRecords",
      });
      const getChunks = (arr: any[], size = 500) => {
        let output = [];

        for (let i = 0; i < Math.ceil(arr.length / size); i++) {
          output[i] = arr.slice(i * size, i * size + size);
        }
        return output;
      };
      //@ts-ignore
      const chunks = getChunks(records.map(({ bin, ...rest }) => rest));

      let allChunkSaveRequest = chunks.map((chunk) => {
        return StockItemService.create(chunk, {
          query: { withQty: true, importingFile: true },
        })
          .then((res: StockItem[]) => {
            mixpanel.track("Stock items imported", {
              stockIds: Array.isArray(res)
                ? res.map((item) => item?._id)
                : null,
            });
            return res;
          })
          .catch((err: Error) => {
            message.error({
              content: t("productsImport.saveError"),
              key: "savingStockRecords",
            });
          });
      });

      Promise.all(allChunkSaveRequest).then((res) => {
        onSave();
        const count = res.reduce((total, item) => total + item?.length || 0, 0);
        message.success({
          content: `${count} ${t("productsImport.saveSuccess")}`,
          key: "savingStockRecords",
        });
      });

      close();
    }
  };

  useEffect(() => {
    return () => {
      setRecords([]);
      setStep(0);
    };
  }, []);

  const close = () => {
    setRecords([]);
    setStep(0);
    handleCancel();
  };

  return (
    <div>
      <Modal
        title={
          <span className="s-modal-title">{t("productsImport.pageTitle")}</span>
        }
        footer={
          <div className="tw-flex tw-justify-end tw-pr-2">
            <Button onClick={close}>{t("global.cancel")}</Button>
            {step === 1 && (
              <Button
                key="submit"
                onClick={handleSave}
                type="primary"
                className="tw-mx-0"
              >
                {t("importCustomers.okText")}
              </Button>
            )}
          </div>
        }
        destroyOnClose={true}
        visible={visible}
        onOk={handleOk}
        onCancel={close}
        bodyStyle={{ padding: "12px 24px" }}
        width={step === 0 ? 600 : "80%"}
      >
        {step === 0 && (
          <UploadFile onRecordsLoad={(data) => handleRecordsLoad(data)} />
        )}
        {step === 1 && (
          <PreviewImportRecords
            records={records}
            fields={stockItems}
            loading={loading}
          />
        )}
      </Modal>
    </div>
  );
};

export default ProductsImportContainer;
