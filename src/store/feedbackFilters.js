import { all, call, put, take } from "@redux-saga/core/effects";

import { CustomerService, UserService } from "../services";
import { doFetchFeedbackTasks } from "./feedback";

// clear filters
const FEEDBACK_CLEAR_FILTERS = "FEEDBACK_CLEAR_FILTERS";
export function doClearFeedbackFilters() {
  return { type: FEEDBACK_CLEAR_FILTERS };
}
function applyClearFilters(state) {
  return { ...state, edited: {}, applied: {} };
}

// update filters
const FEEDBACK_UPDATE_FILTERS = "FEEDBACK_UPDATE_FILTERS";
export function doUpdateFeedbackFilters(payload) {
  return { type: FEEDBACK_UPDATE_FILTERS, payload };
}
function applyUpdateFilters(state, { payload }) {
  return { ...state, edited: payload };
}

// apply filters
const FEEDBACK_FILTERS_APPLY_REQUEST = "FEEDBACK_FILTERS_APPLY_REQUEST";
const FEEDBACK_FILTERS_APPLY_SUCCESS = "FEEDBACK_FILTERS_APPLY_SUCCESS";
const FEEDBACK_FILTERS_APPLY_ERROR = "FEEDBACK_FILTERS_APPLY_ERROR";

export function doFeedbackFiltersRequest(payload) {
  return { type: FEEDBACK_FILTERS_APPLY_REQUEST, payload };
}
export function doFeedbackFiltersSuccess(payload) {
  return { type: FEEDBACK_FILTERS_APPLY_SUCCESS, payload };
}
export function doFeedbackFiltersError(payload) {
  return { type: FEEDBACK_FILTERS_APPLY_ERROR, payload };
}

function applyRequest(state, action) {
  return { ...state, edited: action.payload, isLoading: true };
}
function applySuccess(state, { payload }) {
  return { ...state, applied: payload };
}
function applyError(state, action) {
  return { ...state, error: action.payload };
}

// filters users
const FEEDBACK_FILTERS_USERS_REQUEST = "FEEDBACK_FILTERS_USERS_REQUEST";
const FEEDBACK_FILTERS_USERS_SUCCESS = "FEEDBACK_FILTERS_USERS_SUCCESS";
const FEEDBACK_FILTERS_USERS_ERROR = "FEEDBACK_FILTERS_USERS_ERROR";

export function doFeedbackFiltersUsersRequest(payload) {
  return { type: FEEDBACK_FILTERS_USERS_REQUEST, payload };
}
export function doFeedbackFiltersUsersSuccess(payload) {
  return { type: FEEDBACK_FILTERS_USERS_SUCCESS, payload };
}
export function doFeedbackFiltersUsersError(payload) {
  return { type: FEEDBACK_FILTERS_USERS_ERROR, payload };
}

function applyUsersRequest(state, action) {
  return { ...state };
}
function applyUsersSuccess(state, { payload }) {
  return { ...state, users: [...payload.data] };
}
function applyUsersError(state, action) {
  return { ...state, error: action.payload };
}

//filters customers
const FEEDBACK_FILTERS_CUSTOMERS_REQUEST = "FEEDBACK_FILTERS_CUSTOMERS_REQUEST";
const FEEDBACK_FILTERS_CUSTOMERS_SUCCESS = "FEEDBACK_FILTERS_CUSTOMERS_SUCCESS";
const FEEDBACK_FILTERS_CUSTOMERS_ERROR = "FEEDBACK_FILTERS_CUSTOMERS_ERROR";

export function doFeedbackFiltersCustomersRequest(payload) {
  return { type: FEEDBACK_FILTERS_CUSTOMERS_REQUEST, payload };
}
export function doFeedbackFiltersCustomersSuccess(payload) {
  return { type: FEEDBACK_FILTERS_CUSTOMERS_SUCCESS, payload };
}
export function doFeedbackFiltersCustomersError(payload) {
  return { type: FEEDBACK_FILTERS_CUSTOMERS_ERROR, payload };
}

function applyCustomersRequest(state, action) {
  return { ...state };
}
function applyCustomersSuccess(state, { payload = {} }) {
  return { ...state, customers: [...payload.data] };
}
function applyCustomersError(state, action) {
  return { ...state, error: action.payload };
}

//reducer
const initialState = {
  edited: {},
  applied: {},
  users: [],
  customers: [],
};
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FEEDBACK_FILTERS_APPLY_REQUEST:
      return applyRequest(state, action);
    case FEEDBACK_FILTERS_APPLY_SUCCESS:
      return applySuccess(state, action);
    case FEEDBACK_FILTERS_APPLY_ERROR:
      return applyError(state, action);
    case FEEDBACK_CLEAR_FILTERS:
      return applyClearFilters(state, action);
    case FEEDBACK_UPDATE_FILTERS:
      return applyUpdateFilters(state, action);
    case FEEDBACK_FILTERS_CUSTOMERS_REQUEST:
      return applyCustomersRequest(state, action);
    case FEEDBACK_FILTERS_CUSTOMERS_SUCCESS:
      return applyCustomersSuccess(state, action);
    case FEEDBACK_FILTERS_CUSTOMERS_ERROR:
      return applyCustomersError(state, action);
    case FEEDBACK_FILTERS_USERS_REQUEST:
      return applyUsersRequest(state, action);
    case FEEDBACK_FILTERS_USERS_SUCCESS:
      return applyUsersSuccess(state, action);
    case FEEDBACK_FILTERS_USERS_ERROR:
      return applyUsersError(state, action);
    case "LOGOUT_SUCCESS":
      return initialState;
    default:
      return state;
  }
};
export default reducer;

function* filterUsers() {
  while (true) {
    const { payload: query } = yield take(FEEDBACK_FILTERS_USERS_REQUEST);
    try {
      const response = yield call([UserService, UserService.find], {
        query,
      });
      yield put({ type: FEEDBACK_FILTERS_USERS_SUCCESS, payload: response });
    } catch (error) {
      // do nothing
    }
  }
}

function* filterCustomers() {
  while (true) {
    const { payload: query } = yield take(FEEDBACK_FILTERS_CUSTOMERS_REQUEST);
    try {
      const response = yield call([CustomerService, CustomerService.find], {
        query,
      });
      yield put({
        type: FEEDBACK_FILTERS_CUSTOMERS_SUCCESS,
        payload: response,
      });
    } catch (error) {
      // do nothing
    }
  }
}

function* applyFilters() {
  while (true) {
    const { payload } = yield take([
      FEEDBACK_FILTERS_APPLY_REQUEST,
      FEEDBACK_CLEAR_FILTERS,
    ]);
    yield put(doFeedbackFiltersSuccess(payload));
    yield put(doFetchFeedbackTasks());
  }
}

export function* feedbackFiltersSaga() {
  yield all([filterUsers(), filterCustomers(), applyFilters()]);
}
