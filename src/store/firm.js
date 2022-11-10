import mixpanel from "analytics/mixpanel";
import { message } from "antd";
import i18next from "i18next";
import logger from "logger";
import { all, call, put, select, take } from "redux-saga/effects";

import { Notify } from "./../components/notifications/Notify";
import { AutomationsService, FirmService } from "./../services";

export const FIRM_UPDATE_REQUEST = "FIRM_UPDATE_REQUEST";
export const FIRM_UPDATE_SUCCESS = "FIRM_UPDATE_SUCCESS";
export const FIRM_UPDATE_ERROR = "FIRM_UPDATE_ERROR";

export const FIRM_EDITING_START = "FIRM_EDITING_START";
export const FIRM_EDITING_END = "FIRM_EDITING_END";
export const FIRM_EDITING_CANCEL = "FIRM_EDITING_CANCEL";

export const FIRM_EDITING_SAVE_REQUEST = "FIRM_EDITING_SAVE_REQUEST";
export const FIRM_EDITING_SAVE_SUCCESS = "FIRM_EDITING_SAVE_SUCCESS";
export const FIRM_EDITING_SAVE_ERROR = "FIRM_EDITING_SAVE_ERROR";

const FIRM_REMOVE_DEMO_DATA_REQUEST = "FIRM_REMOVE_DEMO_DATA_REQUEST";
const FIRM_REMOVE_DEMO_DATA_SUCCESS = "FIRM_REMOVE_DEMO_DATA_SUCCESS";

export const FIRM_FEATURE_FLAG_UPDATE_REQUEST =
  "FIRM_FEATURE_FLAG_UPDATE_REQUEST";
export const FIRM_FEATURE_FLAG_UPDATE_SUCCESS =
  "FIRM_FEATURE_FLAG_UPDATE_SUCCESS";
export const FIRM_FEATURE_FLAG_UPDATE_ERROR = "FIRM_UPDATE_ERROR";

export function doUpdateFirmFeatureFlagRequest(flagName, flagValue) {
  return {
    type: FIRM_FEATURE_FLAG_UPDATE_REQUEST,
    payload: { flagName, flagValue },
  };
}

export function doUpdateFirmFeatureFlagSuccess(payload) {
  return { type: FIRM_FEATURE_FLAG_UPDATE_SUCCESS, payload };
}

export function doUpdateFirmFeatureFlagError(payload) {
  return { type: FIRM_FEATURE_FLAG_UPDATE_ERROR, payload };
}

export function doFirmEditingSaveRequest(payload) {
  return { type: FIRM_EDITING_SAVE_REQUEST, payload };
}

export function doFirmEditingSaveError(payload) {
  return { type: FIRM_EDITING_SAVE_ERROR, payload };
}

export function doFirmEditingSaveSuccess(payload) {
  return { type: FIRM_EDITING_SAVE_SUCCESS, payload };
}

export function doStartEditingFirm(payload) {
  return { type: FIRM_EDITING_START, payload };
}

export function doCancelEditingFirm(payload) {
  return { type: FIRM_EDITING_CANCEL, payload };
}

export function doEndEditingFirm(payload) {
  return { type: FIRM_EDITING_END, payload };
}

export function doRemoveDemoDataRequest(payload) {
  return { type: FIRM_REMOVE_DEMO_DATA_REQUEST, payload };
}

const initialState = {
  data: {},
  isLoading: false,
  isEditing: false,
  error: null,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case `FIRM_INITIAL_FETCH`:
      return { ...state, data: action.payload.data[0] };
    case `SERVICE_WATCHER_FIRM_PATCHED`:
      return { ...state, data: action.payload };
    case FIRM_REMOVE_DEMO_DATA_SUCCESS:
      // console.log("Response: ", action.payload);
      return state;
    case "LOGOUT_SUCCESS":
      return initialState;
    default:
      return state;
  }
};
export default reducer;

function* updateFeatureFlags() {
  while (true) {
    const { payload } = yield take(FIRM_FEATURE_FLAG_UPDATE_REQUEST);
    const firmId = yield select((state) => state.firm.data._id);

    const { flagName, flagValue } = payload;
    const data = {
      [`featureFlags.${flagName}`]: flagValue,

      // if it was about turning off extended tasks then disable portal as well
      ...(flagName === "extendedTasks" && !flagValue
        ? { [`featureFlags.customerPortal`]: false }
        : {}),
    };

    function getFeatureLabel(flagName = "") {
      let result = "";
      if (flagName === "taskCompletionAcknowledgementByCustomer") {
        result = "Signature";
      }

      if (flagName === "taskCompletionFeedback") {
        result = "NPS";
      }

      if (flagName === "extendedTasks") {
        result = "RFQ, Quote, Invoice";
      }

      if (flagName === "customerPortal") {
        result = "Customer Portal";
      }

      if (flagName === "dailyAccounting") {
        result = "Daily Accounting";
      }

      if (flagName === "customSMSAPI") {
        result = "Custom SMS API";
      }

      return result;
    }

    try {
      const response = yield call(
        [FirmService, FirmService.patch],
        firmId,
        data,
      );

      yield put(doUpdateFirmFeatureFlagSuccess(response));
      yield call([Notify, Notify.saveSuccess], "Firm");
      if (flagName === "taskCompletionFeedback" && !flagValue) {
        AutomationsService.find({
          query: { actionToPerform: "sendNPSMsg", isPaused: { $ne: true } },
        }).then(
          (res) => {
            if (res.total > 0) {
              message.loading({
                content: i18next.t("automations.disablingNPS"),
                key: "nps",
                duration: 0,
              });
              AutomationsService.patch(
                null,
                { isPaused: true },
                {
                  query: { actionToPerform: "sendNPSMsg" },
                },
              ).then(
                (res) =>
                  message.success({
                    content: i18next.t("automations.disabledNPS"),
                    key: "nps",
                  }),
                (error) => {
                  message.error({
                    content: i18next.t("automations.active.updateError"),
                    key: "nps",
                  });
                  logger.error("Could not disable NPS automations: ", error);
                },
              );
            }
          },
          (error) => logger.error("Could not fetch automations"),
        );
      }
      mixpanel.track(`Feature ${flagValue ? "enabled" : "disabled"}`, {
        name: getFeatureLabel(flagName),
      });
    } catch (error) {
      yield put(doFirmEditingSaveError(error));
      yield call([Notify, Notify.saveError], "Firm");
    }
  }
}

function* update() {
  while (true) {
    const { payload } = yield take(FIRM_EDITING_END);
    const { _id, ...rest } = payload;
    try {
      const response = yield call([FirmService, FirmService.patch], _id, rest);

      yield put(doFirmEditingSaveSuccess(response));
      yield call([Notify, Notify.saveSuccess], "Firm");
    } catch (error) {
      if (
        (error.message || "").toLowerCase().includes("account id") &&
        error.name === "Conflict"
      ) {
        message.error(i18next.t("businessProfile.accountIdTaken"));
      } else {
        yield put(doFirmEditingSaveError(error));
        yield call([Notify, Notify.saveError], "Firm");
      }
    }
  }
}

function* hideDemoData() {
  while (true) {
    const { payload: firmId } = yield take(FIRM_REMOVE_DEMO_DATA_REQUEST);
    try {
      const response = yield call([FirmService, FirmService.patch], firmId, {
        removeDemoData: true,
      });
      yield put({ type: FIRM_REMOVE_DEMO_DATA_SUCCESS, payload: response });
      message.success(i18next.t("navbar.demoDataRemoved"));
    } catch (error) {
      logger.error("Error in removing demo data: ", error);
      message.error(i18next.t("navbar.cantRemoveDemoData"));
    }
  }
}

export function* firmSaga() {
  yield all([update(), hideDemoData(), updateFeatureFlags()]);
}
