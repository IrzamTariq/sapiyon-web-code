import { message } from "antd";
import Appshell from "Appshell";
import FilterBar, { isFilterBarEmpty } from "components/FilterBar/FilterBar";
import logger from "logger";
import { equals } from "rambdax";
import React, { Key, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Placeholder from "scenes/Tasks/TaskList/Components/Placeholder";
import { StockItemService } from "services";
import { PaginatedFeathersResponse, StockItem } from "types";
import { getRandomAlphaNumericString } from "utils/helpers";

import ServicesHeader from "./Components/ServicesHeader";
import ServicesList from "./Components/ServicesList";

const Services = () => {
  const [t] = useTranslation();
  const [services, setServices] = useState({
    data: [],
    limit: 25,
    skip: 0,
    total: 0,
  } as PaginatedFeathersResponse<StockItem>);
  const [filters, setFilters] = useState({} as any);
  const [state, setState] = useState({
    selectedRowKeys: [] as Key[],
    isLoading: false,
    editedRecordId: "",
    ripple: false,
    sorts: {},
    isEmpty: false,
  });
  const { skip, limit } = services;

  const updateState = (changes: Partial<typeof state>) =>
    setState((old) => ({ ...old, ...changes }));

  const addNewService = () => {
    const _id = `NEW-${getRandomAlphaNumericString()}`;
    const service = {
      _id,
      title: t("services.newTitle"),
      type: "service",
    } as StockItem;
    updateState({ editedRecordId: _id, isEmpty: false });
    updateServices(service, "create");
  };

  const updateServices = (
    service: StockItem,
    type: "create" | "update" | "remove",
  ) => {
    if (type === "create") {
      setServices((old) => {
        const data = [service, ...old.data];
        return { ...old, data, total: old.total + 1 };
      });
    } else if (type === "update") {
      setServices((old) => ({
        ...old,
        data: old.data.map((item) =>
          item._id === service._id ? service : item,
        ),
      }));
    } else if (type === "remove") {
      setServices((old) => ({
        ...old,
        total: old.total - 1,
        data: old.data.filter((item) => item._id !== service._id),
      }));
    }
  };

  const filtersRef = useRef(filters);
  const rippleRef = useRef(state.ripple);
  const sortsRef = useRef(state.sorts);
  const fetchServices = useCallback(
    (query: any, areFiltersEmpty: boolean) => {
      setState((old) => ({ ...old, isLoading: true }));
      StockItemService.find({
        query,
      }).then(
        (res: PaginatedFeathersResponse<StockItem>) => {
          setServices(res);
          setState((old) => ({
            ...old,
            isLoading: false,
            isEmpty: areFiltersEmpty && res?.data?.length === 0,
          }));
        },
        (error: Error) => {
          message.error(t("Could not fetch services"));
          logger.error("Could not fetch services: ", error);
          setState((old) => ({
            ...old,
            isLoading: false,
          }));
        },
      );
    },
    [t],
  );
  useEffect(() => {
    let $skip = skip;
    if (!equals(filters, filtersRef.current)) {
      $skip = 0;
    }
    if (rippleRef.current !== state.ripple) {
      $skip = 0;
    }
    if (!equals(sortsRef.current !== state.sorts)) {
      sortsRef.current = state.sorts;
    }
    const { title = "", ...rest } = filters;
    let query = {
      type: "service",
      $limit: limit,
      $skip,
      $sort: state.sorts,
      ...rest,
    };
    if (title?.trim()) {
      query = Object.assign({}, query, { $multi_match: { $query: title } });
    }
    fetchServices(query, isFilterBarEmpty(filters));
  }, [skip, limit, filters, fetchServices, state.ripple, state.sorts]);

  useEffect(() => {
    const handleCreated = (res: StockItem) => {
      if (res.type === "service") {
        setServices((old) => {
          const exists = old.data.findIndex((item) => item._id === res._id);
          let data = [] as StockItem[];
          let total = old.total;
          if (exists === -1) {
            data = [res, ...old.data];
            total = old.total + 1;
          } else {
            data = old.data.map((item) => (item._id === res._id ? res : item));
          }
          if (data.length > limit) {
            data.pop();
          }

          setState((old) => ({
            ...old,
            isEmpty: isFilterBarEmpty(filters) && total === 0,
          }));
          return {
            ...old,
            total,
            data,
          };
        });
      }
    };

    const handlePatched = (res: StockItem) => {
      if (res.type === "service") {
        setServices((old) => ({
          ...old,
          data: old.data.map((item) =>
            item._id === res._id ? { ...res, qty: item.qty } : item,
          ),
        }));
      }
    };

    const handleRemoved = (res: StockItem) => {
      if (res.type === "service") {
        setServices((old) => {
          const data = old.data.filter((item) => item._id !== res._id);
          const total =
            data.length !== old.data.length ? old.total - 1 : old.total;
          return {
            ...old,
            data,
            total,
          };
        });
        setState((old) => ({
          ...old,
          selectedRowKeys: old.selectedRowKeys.filter(
            (item) => item !== res._id,
          ),
          isEmpty: isFilterBarEmpty(filters) && services.total === 0,
        }));
      }
    };

    StockItemService.on("created", handleCreated);
    StockItemService.on("patched", handlePatched);
    StockItemService.on("removed", handleRemoved);
    return () => {
      StockItemService.off("created", handleCreated);
      StockItemService.off("patched", handlePatched);
      StockItemService.off("removed", handleRemoved);
    };
  }, [filters, limit, services.total]);

  return (
    <Appshell activeLink={["", "services"]}>
      <ServicesHeader
        selectedRowKeys={state.selectedRowKeys}
        addNewService={addNewService}
        onRipple={() => setState((old) => ({ ...old, ripple: !old.ripple }))}
      />
      <FilterBar
        styleClasses="lg:tw-flex tw-mb-6"
        resetFilters={() => setFilters({})}
        fields={[
          {
            label: t("services.elasticSearch"),
            type: "shortText",
            key: "title",
            className: "tw-w-3/12 tw-mr-2",
            placeholder: t("services.searchTerm"),
          },
        ]}
        handleChange={(key, value) => setFilters({ ...filters, [key]: value })}
      />
      {state.isEmpty ? (
        <Placeholder
          primaryAction={addNewService}
          primaryBtnText={t("dataPlaceholder.services.action")}
          primaryText={t("dataPlaceholder.services.title")}
          secondaryText={t("dataPlaceholder.services.description")}
        />
      ) : (
        <ServicesList
          services={services}
          setSorts={(sortQuery) => updateState({ sorts: sortQuery })}
          handlePageChange={(page, size) =>
            setServices((old) => ({
              ...old,
              skip: (page - 1) * size,
              limit: size,
            }))
          }
          setSelectedRowKeys={(keys: Key[]) =>
            updateState({ selectedRowKeys: keys })
          }
          setEditedRecordId={(serviceId) =>
            updateState({ editedRecordId: serviceId })
          }
          updateServices={updateServices}
          areFiltersEmpty={isFilterBarEmpty(filters)}
          {...state}
        />
      )}
    </Appshell>
  );
};

export default Services;
