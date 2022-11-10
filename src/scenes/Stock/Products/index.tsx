import { message } from "antd";
import { isFilterBarEmpty } from "components/FilterBar/FilterBar";
import logger from "logger";
import mixpanel from "mixpanel-browser";
import { equals } from "rambdax";
import React, { Key, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { StockFilesService, StockItemService } from "services";
import { PaginatedFeathersResponse, StockItem, UploadedFile } from "types";

import ProductDetailsDrawer from "./Components/ProductDetailsDrawer";
import ProductEdit from "./Components/ProductEdit/ProductEdit";
import ProductList from "./Components/ProductList/ProductList";

const INITIAL_PRODUCTS_STATE = {
  data: [],
  total: 0,
  limit: 25,
  skip: 0,
};

interface ProductsProps {
  selectedRowKeys: Key[];
  ripple: boolean;
  setSelectedRowKeys: (keys: Key[]) => void;
}

const Products = ({
  selectedRowKeys,
  setSelectedRowKeys,
  ripple,
}: ProductsProps) => {
  const [t] = useTranslation();
  const [state, setState] = useState({
    isEditing: false,
    editedRecord: {} as StockItem,
    isEditingCustomFields: false,
    detailsVisible: false,
    detailedProduct: {} as StockItem,
    loading: false,
    isEmpty: false,
  });
  const [products, setProducts] = useState<
    PaginatedFeathersResponse<StockItem>
  >(INITIAL_PRODUCTS_STATE);
  const [filters, setFilters] = useState({} as any);
  const [sorts, setSorts] = useState({});
  const { skip = 0, limit = 25 } = products;

  const removeProduct = (productId: string) => {
    StockItemService.remove(productId).then(
      (res: StockItem) => {
        message.success(t("products.removeSuccess"));
        mixpanel.track(`Service removed`, {
          _id: res._id,
        });
      },
      (error: Error) => {
        message.error(t("products.removeError"));
        logger.error("Could not delete product: ", error);
      },
    );
  };

  const filtersRef = useRef(filters);
  const rippleRef = useRef(ripple);
  const sortsRef = useRef(sorts);
  const fetchProducts = useCallback(
    (query: any, areFiltersEmpty) => {
      setState((old) => ({ ...old, loading: true }));
      StockItemService.find({
        query,
      }).then(
        (res: PaginatedFeathersResponse<StockItem>) => {
          setProducts(res);
          setState((old) => ({
            ...old,
            loading: false,
            isEmpty: areFiltersEmpty && res?.data.length === 0,
          }));
        },
        (error: Error) => {
          setState((old) => ({ ...old, loading: false }));
          logger.error("Could not fetch products: ", error);
          message.error(t("products.fetchError"));
        },
      );
    },
    [t],
  );

  useEffect(() => {
    let $skip = skip;
    if (!equals(filters, filtersRef.current)) {
      filtersRef.current = filters;
      $skip = 0;
    }
    if (rippleRef.current !== ripple) {
      $skip = 0;
      rippleRef.current = ripple;
    }
    if (sortsRef.current !== sorts) {
      sortsRef.current = sorts;
    }
    const { title = "", ...rest } = filters;
    const defaultSorting = { createdAt: -1 };
    const $sort = Object.keys(sorts).length > 0 ? sorts : defaultSorting;
    let query = {
      type: "product",
      withQty: true,
      $limit: limit,
      $skip,
      $sort,
      ...rest,
    };
    if (title?.trim()) {
      query = Object.assign({}, query, { $multi_match: { $query: title } });
    }
    fetchProducts(query, isFilterBarEmpty(filters));
  }, [t, limit, skip, filters, fetchProducts, ripple, sorts]);

  useEffect(() => {
    const handleCreated = (res: StockItem) => {
      if (res.type === "product") {
        setProducts((old) => {
          let exists = old.data.findIndex((item) => item._id === res._id);
          let data = [] as StockItem[];
          let total = old.total;
          if (exists === -1) {
            data = [res, ...old.data];
            total += 1;
          } else {
            data = old.data.map((item) => (item._id === res._id ? res : item));
          }
          if (data.length > limit) {
            data.pop();
          }
          setState((old) => ({ ...old, isEmpty: false }));
          return {
            ...old,
            total,
            data,
          };
        });
      }
    };

    const handlePatched = (res: StockItem) => {
      if (res.type === "product") {
        setProducts((old) => ({
          ...old,
          data: old.data.map((item) =>
            item._id === res._id ? { ...res, qty: item.qty } : item,
          ),
        }));
      }
    };

    const handleRemoved = (res: StockItem) => {
      if (res.type === "product") {
        setProducts((old) => {
          const data = old.data.filter((item) => item._id !== res._id);
          const total =
            data.length !== old.data.length ? old.total - 1 : old.total;
          return {
            ...old,
            data,
            total,
          };
        });

        setSelectedRowKeys(selectedRowKeys.filter((item) => item !== res._id));
      }
    };

    const handleFileCreated = (file: UploadedFile) => {
      setProducts((old) => {
        const { data = [] } = old;
        const newProducts = data.map((item) => {
          if (item._id === file.stockItemId) {
            const { files = [] } = item;
            return { ...item, files: [...files, file] };
          } else {
            return item;
          }
        });

        return { ...old, data: newProducts };
      });
    };

    const handleFileRemoved = (file: UploadedFile) => {
      setProducts((old) => {
        const { data = [] } = old;
        const newProducts = data.map((item) => {
          if (item._id === file.stockItemId) {
            const { files = [] } = item;
            return {
              ...item,
              files: files.filter((item) => item._id !== file._id),
            };
          } else {
            return item;
          }
        });
        return { ...old, data: newProducts };
      });
    };

    StockItemService.on("created", handleCreated);
    StockItemService.on("patched", handlePatched);
    StockItemService.on("removed", handleRemoved);

    StockFilesService.on("created", handleFileCreated);
    StockFilesService.on("removed", handleFileRemoved);
    return () => {
      StockItemService.off("created", handleCreated);
      StockItemService.off("patched", handlePatched);
      StockItemService.off("removed", handleRemoved);

      StockFilesService.off("created", handleFileCreated);
      StockFilesService.off("removed", handleFileRemoved);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <ProductList
        editProduct={(product: StockItem) =>
          setState((old) => ({
            ...old,
            isEditing: true,
            editedRecord: product,
          }))
        }
        changePage={(page, size) =>
          setProducts((old) => ({
            ...old,
            skip: (page - 1) * size,
            limit: size,
          }))
        }
        sorts={sorts}
        setSorts={setSorts}
        filters={filters}
        setFilters={setFilters}
        isEmpty={state.isEmpty}
        loading={state.loading}
        products={products}
        removeProduct={removeProduct}
        selectedRowKeys={selectedRowKeys}
        setSelectedRowKeys={setSelectedRowKeys}
        viewDetails={(product) =>
          setState((old) => ({
            ...old,
            detailsVisible: true,
            detailedProduct: product,
          }))
        }
        areFiltersEmpty={isFilterBarEmpty(filters)}
      />
      <ProductEdit
        visible={state.isEditing}
        editedRecord={state.editedRecord}
        handleClose={() =>
          setState((old) => ({
            ...old,
            isEditing: false,
            editedRecord: {} as StockItem,
          }))
        }
      />
      <ProductDetailsDrawer
        visible={state.detailsVisible}
        onClose={() =>
          setState((old) => ({
            ...old,
            detailsVisible: false,
            detailedProduct: {} as StockItem,
          }))
        }
        product={state.detailedProduct}
      />
    </div>
  );
};

export default Products;
