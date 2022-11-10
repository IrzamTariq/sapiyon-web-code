import { all, call, put, select, take } from "@redux-saga/core/effects";
import mixpanel from "analytics/mixpanel";
import { message } from "antd";
import i18next from "i18next";
import logger from "logger";
import { path } from "rambdax";

import {
  SubscriptionService,
  SubscriptionTransactionService,
  UserService,
} from "../services";

// action constants
export const SUBSCRIPTION_START = "SUBSCRIPTION_START";
export const SUBSCRIPTION_END = "SUBSCRIPTION_END";
export const SUBSCRIPTION_FETCH_REQUEST = "SUBSCRIPTION_FETCH_REQUEST";
export const SUBSCRIPTION_FETCH_SUCCESS = "SUBSCRIPTION_FETCH_SUCCESS";
export const SUBSCRIPTION_FETCH_ERROR = "SUBSCRIPTION_FETCH_ERROR";
export const SUBSCRIPTION_CANCEL_REQUEST = "SUBSCRIPTION_CANCEL_REQUEST";
export const SUBSCRIPTION_CANCEL_SUCCESS = "SUBSCRIPTION_CANCEL_SUCCESS";
export const SUBSCRIPTION_SAVE_REQUEST = "SUBSCRIPTION_SAVE_REQUEST";
export const SUBSCRIPTION_SAVE_SUCCESS = "SUBSCRIPTION_SAVE_SUCCESS";
export const SUBSCRIPTION_SAVE_ERROR = "SUBSCRIPTION_SAVE_ERROR";
export const SUBSCRIPTION_USER_COUNT_FETCH_REQUEST =
  "SUBSCRIPTION_USER_COUNT_FETCH_REQUEST";
export const SUBSCRIPTION_USER_COUNT_FETCH_SUCCESS =
  "SUBSCRIPTION_USER_COUNT_FETCH_SUCCESS";
const SUBSCRIPTION_TRANSACTION_FETCH_REQUEST =
  "SUBSCRIPTION_TRANSACTION_FETCH_REQUEST";
const SUBSCRIPTION_TRANSACTION_FETCH_SUCCESS =
  "SUBSCRIPTION_TRANSACTION_FETCH_SUCCESS";

export const SUBSCRIPTION_SAVE_LOCALLY = "SUBSCRIPTION_SAVE_LOCALLY";
export const SUBSCRIPTION_INITIAL_FETCH = "SUBSCRIPTION_INITIAL_FETCH";

export const SERVICE_WATCHER_SUBSCRIPTION_CREATED =
  "SERVICE_WATCHER_SUBSCRIPTION_CREATED";
export const SERVICE_WATCHER_SUBSCRIPTION_PATCHED =
  "SERVICE_WATCHER_SUBSCRIPTION_PATCHED";
export const SERVICE_WATCHER_SUBSCRIPTION_REMOVED =
  "SERVICE_WATCHER_SUBSCRIPTION_REMOVED";
const SET_FORM_PROCESSING_STATE = "SET_FORM_PROCESSING_STATE";

// action creators
export function doStartSubscription() {
  return { type: SUBSCRIPTION_START };
}

export function doEndSubscription() {
  return { type: SUBSCRIPTION_END };
}

export function doSubscriptionFetchRequest(payload) {
  return { type: SUBSCRIPTION_FETCH_REQUEST, payload };
}

export function doFetchUserCount() {
  return { type: SUBSCRIPTION_USER_COUNT_FETCH_REQUEST };
}

export function doSubscriptionFetchSuccess(payload) {
  return { type: SUBSCRIPTION_FETCH_SUCCESS, payload };
}

export function doSubscriptionFetchError(payload) {
  return { type: SUBSCRIPTION_FETCH_ERROR, payload };
}

export function doSaveChangesLocally(payload) {
  return { type: SUBSCRIPTION_SAVE_LOCALLY, payload };
}

export function doSubscriptionSaveRequest(payload) {
  return { type: SUBSCRIPTION_SAVE_REQUEST, payload };
}

export function doSubscriptionSaveSuccess(payload) {
  return { type: SUBSCRIPTION_SAVE_SUCCESS, payload };
}

export function doSubscriptionSaveError(payload) {
  return { type: SUBSCRIPTION_SAVE_ERROR, payload };
}
export function doCancelSubscription() {
  return { type: SUBSCRIPTION_CANCEL_REQUEST };
}

export function doSubscriptionTransactionFetchRequest() {
  return { type: SUBSCRIPTION_TRANSACTION_FETCH_REQUEST };
}

export const doSetFormProcessingState = (payload) => {
  return { type: SET_FORM_PROCESSING_STATE, payload };
};

// reducer helpers
function applySubscriptionSaveRequest(state, { payload }) {
  return {
    ...state,
    isLoading: true,
    editedRecord: payload,
    isProcessing: true,
  };
}
function applySubscriptionSaveSuccess(state, { payload }) {
  message.success({
    content: i18next.t("subscription.subscribedSuccessfully"),
    key: "subscribing",
  });
  const current = payload;
  return {
    ...state,
    isLoading: false,
    editedRecord: {},
    isSubscribing: false,
    isProcessing: false,
    current,
  };
}
function applySubscriptionSaveError(state, { payload }) {
  return { ...state, isLoading: false, error: payload, isProcessing: false };
}

function applySaveLocally(state, { payload }) {
  return {
    ...state,
    editedRecord: Object.assign({}, state.editedRecord, payload),
  };
}

function applySubscriptionFetchRequest(state) {
  return {
    ...state,
    isLoading: true,
  };
}

function applySubscriptionFetchSuccess(state, { payload }) {
  const data = payload.data[0];

  return {
    ...state,
    isLoading: false,
    current: data,
  };
}

function applySubscriptionFetchError(state, { payload }) {
  return {
    ...state,
    isLoading: false,
    error: payload,
  };
}

function applyCancelSubscriptionSuccess(state) {
  message.success({
    content: i18next.t("subscription.subscriptionCancelled"),
    key: "cancelling",
  });
  return Object.assign({}, state, {
    current: { subscriptionStatus: "" },
  });
}

function applyUserCountFetchSuccess(state, { payload }) {
  return Object.assign({}, state, { userCount: payload.total });
}

// intial state
const initialState = {
  editedRecord: {},
  isLoading: false,
  isSubscribing: false,
  userCount: 0,
  current: {},
  transactions: [],
  isProcessing: false,
};

const applyStartSubscription = (state) => {
  return Object.assign({}, state, { isSubscribing: true });
};

const applyEndSubscription = (state) => {
  return Object.assign({}, state, {
    isSubscribing: false,
    isLoading: false,
    editedRecord: {},
  });
};

const applyCreated = (state, { payload }) => {
  return { ...state, data: payload };
};

const applyPatched = (state, { payload }) => {
  return { ...state, data: payload };
};

const applyRemoved = (state, { payload }) => {
  return { ...state, data: payload };
};

const applySubscriptionTransactionFetchSuccess = (state, payload) => {
  return Object.assign({}, state, { transactions: payload.data || [] });
};

// reducer
const subscriptionReducer = (state = initialState, action) => {
  switch (action.type) {
    case SUBSCRIPTION_START:
      return applyStartSubscription(state);
    case SUBSCRIPTION_END:
      return applyEndSubscription(state);
    case SUBSCRIPTION_FETCH_REQUEST:
      return applySubscriptionFetchRequest(state, action);
    case SUBSCRIPTION_FETCH_SUCCESS:
    case SUBSCRIPTION_INITIAL_FETCH:
      return applySubscriptionFetchSuccess(state, action);
    case SUBSCRIPTION_TRANSACTION_FETCH_SUCCESS:
      return applySubscriptionTransactionFetchSuccess(state, action.payload);
    case SERVICE_WATCHER_SUBSCRIPTION_CREATED:
      return applyCreated(state, action);
    case SERVICE_WATCHER_SUBSCRIPTION_PATCHED:
      return applyPatched(state, action);
    case SERVICE_WATCHER_SUBSCRIPTION_REMOVED:
      return applyRemoved(state, action);
    case SUBSCRIPTION_FETCH_ERROR:
      return applySubscriptionFetchError(state, action);
    case SUBSCRIPTION_SAVE_REQUEST:
      return applySubscriptionSaveRequest(state, action);
    case SUBSCRIPTION_SAVE_SUCCESS:
      return applySubscriptionSaveSuccess(state, action);
    case SUBSCRIPTION_SAVE_ERROR:
      return applySubscriptionSaveError(state, action);
    case SUBSCRIPTION_SAVE_LOCALLY:
      return applySaveLocally(state, action);
    case SUBSCRIPTION_CANCEL_SUCCESS:
      return applyCancelSubscriptionSuccess(state);
    case SUBSCRIPTION_USER_COUNT_FETCH_SUCCESS:
      return applyUserCountFetchSuccess(state, action);
    case SET_FORM_PROCESSING_STATE:
      return Object.assign({}, state, { isProcessing: action.payload });
    case "LOGOUT_SUCCESS":
      return initialState;
    default:
      return state;
  }
};
export default subscriptionReducer;

// sagas
function* find() {
  while (true) {
    yield take(SUBSCRIPTION_FETCH_REQUEST);
    try {
      const response = yield call([
        SubscriptionService,
        SubscriptionService.find,
      ]);
      yield put(doSubscriptionFetchSuccess(response.data[0]));
    } catch (error) {
      yield put(doSubscriptionFetchError(error));
    }
  }
}

function* fetchUserCount() {
  while (true) {
    yield take(SUBSCRIPTION_USER_COUNT_FETCH_REQUEST);
    try {
      const response = yield call([
        UserService,
        UserService.find,
        { query: { $limit: 0 } },
      ]);
      yield put({
        type: SUBSCRIPTION_USER_COUNT_FETCH_SUCCESS,
        payload: response,
      });
    } catch (error) {
      message.error(i18next.t("subscription.cantFetchUserCount"));
    }
  }
}
function* create() {
  while (true) {
    const { payload } = yield take(SUBSCRIPTION_SAVE_REQUEST);
    const subscription = yield select((state) =>
      path("auth.user.firm.subscription", state),
    );

    try {
      message.loading({
        content: i18next.t("subscription.pleaseWait"),
        duration: 0,
        key: "subscribing",
      });
      const response = yield call(
        [SubscriptionService, SubscriptionService.patch],
        subscription._id,
        payload,
        { query: { action: "startSubscription" } },
      );
      mixpanel.track("Subscription created", { _id: response._id });
      yield put(doSubscriptionSaveSuccess(response));
    } catch (error) {
      message.error({ content: error.message, key: "subscribing" });
      yield put(doSubscriptionSaveError(error));
    }
  }
}

function* remove() {
  while (true) {
    yield take(SUBSCRIPTION_CANCEL_REQUEST);
    const subscription = yield select((state) =>
      path("auth.user.firm.subscription", state),
    );
    try {
      message.loading({
        content: i18next.t("subscription.pleaseWait"),
        duration: 0,
        key: "cancelling",
      });
      const response = yield call(
        [SubscriptionService, SubscriptionService.remove],
        subscription._id,
      );
      mixpanel.track("Subscription removed", { _id: response._id });
      yield put({ type: SUBSCRIPTION_CANCEL_SUCCESS });
    } catch (error) {
      message.error({
        content: i18next.t("subscription.cantCancelSubscription"),
        key: "cancelling",
      });
    }
  }
}

function* findTransactions() {
  while (true) {
    yield take(SUBSCRIPTION_TRANSACTION_FETCH_REQUEST);

    try {
      const response = yield call([
        SubscriptionTransactionService,
        SubscriptionTransactionService.find,
      ]);
      yield put({
        type: SUBSCRIPTION_TRANSACTION_FETCH_SUCCESS,
        payload: response,
      });
    } catch (error) {
      logger.error("Error in fetching billing history: ", error);
      message.error(i18next.t("subscription.cantFetchBillingHistory"));
    }
  }
}

export function* subscriptionSagas() {
  yield all([create(), find(), fetchUserCount(), remove(), findTransactions()]);
}
