import { Pagination, Spin, message } from "antd";
import logger from "logger";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Placeholder from "scenes/Tasks/TaskList/Components/Placeholder";
import { AutomationsService } from "services";
import { Automation, PaginatedFeathersResponse, UserContextType } from "types";
import UserContext from "UserContext";

import EditAutomationSMS from "../AddAutomations/EditAutomationSMS";
import ActiveAutomationCard from "./ActiveAutomationCard";
import ActiveAutomationHistory from "./ActiveAutomationHistory";

interface ActiveAutomationsProps {
  viewAddTab: () => void;
}

const ActiveAutomations = ({ viewAddTab }: ActiveAutomationsProps) => {
  const [t] = useTranslation();
  const { hasFeature } = useContext(UserContext) as UserContextType;
  const [state, setState] = useState({
    updating: "",
    loading: false,
    doneLoading: false,
    historyVisible: false,
    historyId: "",
    isEditingSMS: false,
    editedRecord: {} as Automation,
  });
  const [automoations, setAutomoations] = useState<
    PaginatedFeathersResponse<Automation>
  >({ limit: 50, skip: 0, total: 0, data: [] });
  const { data = [], limit = 50, skip = 0, total = 0 } = automoations;

  const toggleActive = (_id: string, value: boolean) => {
    setState((old) => ({ ...old, updating: _id }));
    AutomationsService.patch(_id, { isPaused: value }).then(
      (res: Automation) => {
        setAutomoations((old) => ({
          ...old,
          data: old.data.map((item) => (item._id === res._id ? res : item)),
        }));
        setState((old) => ({ ...old, updating: "" }));
        message.success(
          res.isPaused
            ? t("automations.active.deactivated")
            : t("automations.active.activated"),
        );
      },
      (error: Error) => {
        logger.error("Error in updating automation");
        setState((old) => ({ ...old, updating: "" }));
        message.error(t("automations.active.updateError"));
      },
    );
  };

  const remove = (_id: string) => {
    AutomationsService.remove(_id).then(
      (res: Automation) => {
        setAutomoations((old) => ({
          ...old,
          data: old.data.filter((item) => item._id !== res._id),
        }));
        message.success(t("automations.active.removeSuccess"));
      },
      (error: Error) => {
        logger.error("Could not remove automation: ", error);
        message.error(t("automations.active.removeError"));
      },
    );
  };

  useEffect(() => {
    setState((old) => ({ ...old, loading: true, doneLoading: false }));
    AutomationsService.find({ query: { $limit: limit, $skip: skip } }).then(
      (res: PaginatedFeathersResponse<Automation>) => {
        setAutomoations(res);
        setState((old) => ({ ...old, loading: false, doneLoading: true }));
      },
      (error: Error) => {
        setState((old) => ({ ...old, loading: false, doneLoading: true }));
        logger.error("Error in fetching active automations: ", error);
        message.error(t("automations.active.fetchError"));
      },
    );
  }, [t, skip, limit]);

  useEffect(() => {
    const handleCreated = (res: Automation) => {
      setAutomoations((old) => {
        let taskExist = old.data.findIndex((item) => item._id === res._id);
        let data = [] as Automation[];
        let total = old.total || 0;
        if (taskExist === -1) {
          total += 1;
          data = [res, ...old.data];
        } else {
          data = old.data.map((item) => (item._id === res._id ? res : item));
        }
        return {
          ...old,
          total,
          data,
        };
      });
    };

    const handlePatched = (res: Automation) => {
      setAutomoations((old) => ({
        ...old,
        data: old.data.map((item: Automation) =>
          item._id === res._id ? res : item,
        ),
      }));
    };

    const handleRemoved = (res: Automation) => {
      setAutomoations((old) => {
        const data = old.data.filter((item) => item._id !== res._id);
        return {
          ...old,
          data,
          total: old.total - 1,
        };
      });
    };

    AutomationsService.on("created", handleCreated);
    AutomationsService.on("patched", handlePatched);
    AutomationsService.on("removed", handleRemoved);
    return () => {
      AutomationsService.off("created", handleCreated);
      AutomationsService.off("patched", handlePatched);
      AutomationsService.off("removed", handleRemoved);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state.doneLoading && automoations.data.length === 0) {
    return (
      <Placeholder
        primaryBtnText={t("automations.placeholder.addNew")}
        primaryText={t("automations.placeholder.primary")}
        secondaryText={t("automations.placeholder.secondary")}
        primaryAction={viewAddTab}
        heightReduction={37 + 24 + 46}
      />
    );
  }
  return state.loading ? (
    <div className="s-std-text tw-text-xl tw-text-center tw-mt-10">
      <Spin className="tw-mr-2" /> {t("global.loading")}
    </div>
  ) : (
    <div>
      {data?.map((automation, i) => (
        <div className="tw-mb-5" key={i}>
          <ActiveAutomationCard
            automation={automation}
            edit={() =>
              setState((old) => ({
                ...old,
                editedRecord: automation,
                isEditingSMS: true,
              }))
            }
            remove={() => remove(automation._id)}
            toggleActive={() =>
              toggleActive(automation._id, !automation.isPaused)
            }
            viewHistory={() =>
              setState((old) => ({
                ...old,
                historyVisible: true,
                historyId: automation._id,
              }))
            }
            updating={state.updating === automation._id}
            disabled={
              automation.actionToPerform === "sendNPSMsg" &&
              !hasFeature("taskCompletionFeedback")
            }
            disableMsg={
              automation.actionToPerform === "sendNPSMsg" &&
              !hasFeature("taskCompletionFeedback")
                ? t("automations.addCard.npsDisabled")
                : ""
            }
          />
        </div>
      ))}
      <div className="tw-flex tw-justify-end">
        <Pagination
          pageSize={limit}
          current={skip / limit + 1}
          total={total}
          onChange={(page = 1) =>
            setAutomoations((old) => ({ ...old, skip: (page - 1) * limit }))
          }
          hideOnSinglePage
        />
      </div>
      <EditAutomationSMS
        visible={state.isEditingSMS}
        editedRecord={state.editedRecord}
        handleClose={() =>
          setState((old) => ({
            ...old,
            isEditingSMS: false,
            editedRecord: {} as Automation,
          }))
        }
      />
      <ActiveAutomationHistory
        automationId={state.historyId}
        visible={state.historyVisible}
        handleClose={() =>
          setState((old) => ({ ...old, historyId: "", historyVisible: false }))
        }
      />
    </div>
  );
};

export default ActiveAutomations;
