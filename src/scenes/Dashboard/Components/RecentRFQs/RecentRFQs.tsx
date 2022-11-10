import { DatePicker, Select, message } from "antd";
import logger from "logger";
import moment from "moment";
import { Moment } from "moment";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import RFQEdit from "scenes/RFQs/RFQEdit/RFQEdit";
import { getRFQsQueryFromFilters } from "scenes/RFQs/RFQList/RFQsList";
import { RFQService } from "services";
import { PaginatedFeathersResponse, RFQ } from "types";
import AutocompleteField from "utils/components/AutocompleteField";
import { getPresetDateRanges } from "utils/helpers";
import { getTaskStatusLabel } from "utils/helpers/utils";

import Portal from "../Portal";
import RecentRFQsList from "./RecentRFQsList";

const defaultDateRange = [moment().add(-7, "day"), moment()];

const RecentRFQs = () => {
  const [t] = useTranslation();
  const [state, setState] = useState({
    isLoading: false,
    period: defaultDateRange,
    statusIds: [] as string[],
    isEditing: false,
    editedRecord: {} as RFQ,
  });
  const [rfqs, setRfqs] = useState<PaginatedFeathersResponse<RFQ>>({
    data: [],
    limit: 7,
    skip: 0,
    total: 0,
  });
  const { statusIds, period, isLoading } = state;
  const { limit = 7, skip = 0 } = rfqs;

  useEffect(() => {
    setState((old) => ({ ...old, isLoading: true }));
    const filtersQuery = getRFQsQueryFromFilters({
      createdAt: period,
      statusIds,
    } as any);

    RFQService.find({
      query: {
        ...filtersQuery,
        $limit: limit,
        $skip: skip,
        $sort: { createdAt: -1 },
      },
    })
      .then(
        (res: PaginatedFeathersResponse<RFQ>) => setRfqs(res),
        (e: Error) => {
          logger.error("Error in fetching FRQs: ", e);
          message.error(t("RFQs.fetchError"));
        },
      )
      .finally(() => setState((old) => ({ ...old, isLoading: false })));
  }, [period, statusIds, limit, skip, t]);

  useEffect(() => {
    const handleCreated = (res: RFQ) => {
      setRfqs((old) => ({
        ...old,
        total: old.total + 1,
        data: [res, ...old.data].slice(0, old.limit),
      }));
    };
    const handlePatched = (res: RFQ) => {
      setRfqs((old) => ({
        ...old,
        data: old.data.map((item) => (item._id === res._id ? res : item)),
      }));
    };
    const handleRemoved = (res: RFQ) => {
      setRfqs((old) => {
        const oldNum = old.data.length;
        const data = old.data.filter((item) => item._id !== res._id);
        return {
          ...old,
          total: oldNum !== data.length ? old.total - 1 : old.total,
          data,
        };
      });
    };

    RFQService.on("created", handleCreated);
    RFQService.on("patched", handlePatched);
    RFQService.on("removed", handleRemoved);

    return () => {
      RFQService.off("created", handleCreated);
      RFQService.off("patched", handlePatched);
      RFQService.off("removed", handleRemoved);
    };
  }, []);

  return (
    <>
      <Portal
        header={
          <div className="tw-flex tw-items-center tw-px-6 tw-h-full">
            <div className="s-modal-title tw-mr-auto">
              {t("requests.pageTitle")}
            </div>
            <AutocompleteField
              styleClasses="tw-w-64 tw-mr-5 s-tags-color st-field-color st-placeholder-color"
              mode="multiple"
              maxTagCount={2}
              maxTagTextLength={5}
              placeholder={t("taskSubHeader.filterByStatus")}
              currentValue={statusIds}
              serviceUrl={"firm/task-status"}
              defaultQuery={{ category: "rfq" }}
              serializeOptionsData
              transformOptionsData={[
                //@ts-ignore
                ({ _id, title, type, color }) => ({ _id, title, type, color }),
              ]}
              renderOptions={(items = [], Option: typeof Select.Option) =>
                items.map((item) => (
                  <Option key={item} value={item}>
                    {getTaskStatusLabel(JSON.parse(item))}
                  </Option>
                ))
              }
              onChange={(statusIds = []) =>
                setState((old) => ({ ...old, statusIds }))
              }
            />
            <div className="tw-hidden sm:tw-block">
              <DatePicker.RangePicker
                value={period as [Moment, Moment]}
                onChange={(period) =>
                  setState((old) => ({
                    ...old,
                    period: (period || []) as Moment[],
                  }))
                }
                ranges={getPresetDateRanges()}
              />
            </div>
          </div>
        }
        footer={
          <Link to="/rfqs" className="tw-ml-auto clickAble">
            {t("requests.seeAll")}
          </Link>
        }
      >
        <RecentRFQsList
          rfqs={rfqs}
          isLoading={isLoading}
          updateParentState={(changes) =>
            setState((old) => ({ ...old, ...changes }))
          }
          updateRFQsState={(changes) =>
            setRfqs((old) => ({ ...old, ...changes }))
          }
        />
      </Portal>

      <RFQEdit
        visible={state.isEditing}
        editedRecord={state.editedRecord}
        onClose={() =>
          setState((old) => ({
            ...old,
            isEditing: false,
            editedRecord: {} as RFQ,
          }))
        }
      />
    </>
  );
};

export default RecentRFQs;
