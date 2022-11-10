import { message } from "antd";
import logger from "logger";
import mixpanel from "mixpanel-browser";
import React, { Key, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StockBinService } from "services";
import { Bin, PaginatedFeathersResponse } from "types";

import BinEdit from "./Components/BinEdit";
import BinUsersList from "./Components/BinUsersList";
import WarehouseDetails from "./Components/WarehouseDetails";

interface WarehousesContainerProps {
  selectedRowKeys: Key[];
  setSelectedRowKeys: (keys: Key[]) => void;
}

const WarehousesContainer = ({
  selectedRowKeys,
  setSelectedRowKeys,
}: WarehousesContainerProps) => {
  const [t] = useTranslation();
  const [bins, setBins] = useState({
    data: [] as Bin[],
    limit: 50,
    skip: 0,
    total: 0,
  });
  const [state, setState] = useState({
    isEditingBin: false,
    editedBin: {} as Bin,
    viewingDetails: false,
    detailedBin: {} as Bin,
    loading: false,
  });
  const [sorts, setSorts] = useState({});
  const updateState = (changes: typeof state) =>
    setState((old) => ({ ...old, ...changes }));

  const removeBin = (binId: string) => {
    StockBinService.remove(binId).then(
      (res: Bin) => {
        message.success("Warehouse removed");
        setBins((old) => ({
          ...old,
          total: old.total - 1,
          data: old.data.filter((bin) => bin._id !== res._id),
        }));
        mixpanel.track("Warehouse removed", {
          _id: res._id,
        });
      },
      (error: Error) => {
        message.error("Error in deleting warehouse");
        logger.error("Could not delete warehouse: ", error);
      },
    );
  };

  useEffect(() => {
    updateState({ loading: true } as typeof state);
    const defaultSorting = { createdAt: -1 };
    const $sort = Object.keys(sorts).length > 0 ? sorts : defaultSorting;
    StockBinService.find({
      query: {
        withAssignees: true,
        $skip: bins.skip,
        $limit: bins.limit,
        $sort,
      },
    }).then(
      (res: PaginatedFeathersResponse<Bin>) => {
        setBins(res);
        updateState({ loading: false } as typeof state);
      },
      (error: Error) => {
        logger.error("Could not fetch bins: ", error);
        message.error(t("bins.fetchError"));
        updateState({ loading: false } as typeof state);
      },
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, bins.skip, bins.limit, sorts]);

  useEffect(() => {
    const handleCreated = (res: Bin) => {
      setBins((old) => {
        let exists = old.data.findIndex((item) => item._id === res._id);
        let data = [] as Bin[];
        let total = old.total;
        if (exists === -1) {
          data = [res, ...old.data];
          total += 1;
        }
        if (data.length > old.limit) {
          data.pop();
        }
        return {
          ...old,
          total,
          data,
        };
      });
    };

    const handlePatched = (res: Bin) => {
      if (res._id === state?.detailedBin?._id) {
        setState((old) => ({ ...old, detailedBin: res }));
      }
      setBins((old) => ({
        ...old,
        data: old.data.map((item) => (item._id === res._id ? res : item)),
      }));
    };

    const handleRemoved = (res: Bin) => {
      setBins((old) => {
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
    };

    StockBinService.on("created", handleCreated);
    StockBinService.on("patched", handlePatched);
    StockBinService.on("removed", handleRemoved);
    return () => {
      StockBinService.off("created", handleCreated);
      StockBinService.off("patched", handlePatched);
      StockBinService.off("removed", handleRemoved);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.detailedBin]);

  return (
    <div>
      <BinUsersList
        selectedRowKeys={selectedRowKeys}
        setSelectedRowKeys={setSelectedRowKeys}
        editBin={(bin: Bin) =>
          updateState({ isEditingBin: true, editedBin: bin } as typeof state)
        }
        bins={bins}
        loading={state.loading}
        removeBin={removeBin}
        viewDetails={(bin) =>
          updateState({
            viewingDetails: true,
            detailedBin: bin,
          } as typeof state)
        }
        handlePageChange={(skip) => setBins((old) => ({ ...old, skip }))}
        sorts={sorts}
        setSorts={setSorts}
      />
      <BinEdit
        visible={state.isEditingBin}
        editedBin={state.editedBin}
        handleClose={() =>
          updateState({
            isEditingBin: false,
            editedBin: {} as Bin,
          } as typeof state)
        }
      />
      <WarehouseDetails
        visible={state.viewingDetails}
        bin={state.detailedBin}
        onClose={() =>
          updateState({
            editedBin: {} as Bin,
            viewingDetails: false,
          } as typeof state)
        }
      />
    </div>
  );
};

export default WarehousesContainer;
