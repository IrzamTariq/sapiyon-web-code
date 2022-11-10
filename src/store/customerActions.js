import { all, call, put, select, take } from "@redux-saga/core/effects";
import { message } from "antd";
import i18next from "i18next";
import { path } from "rambdax";
import { mapFormFieldValuesToCustomFields } from "utils/helpers";

import { CustomerActionsService } from "../services";

// Constants...
const CUSTOMER_ACTION_FETCH_REQUEST = "CUSTOMER_ACTION_FETCH_REQUEST";
const CUSTOMER_ACTION_FETCH_SUCCESS = "CUSTOMER_ACTION_FETCH_SUCCESS";
const CUSTOMER_ACTION_FETCH_ERROR = "CUSTOMER_ACTION_FETCH_ERROR";
const CUSTOMER_ACTION_CREATE_REQUEST = "CUSTOMER_ACTION_CREATE_REQUEST";
const CUSTOMER_ACTION_CREATE_SUCCESS = "CUSTOMER_ACTION_CREATE_SUCCESS";

// Action Creator...
export const doFetchCustomerAction = (payload) => {
  return { type: CUSTOMER_ACTION_FETCH_REQUEST, payload };
};
export const doCreateCustomerAction = (payload) => {
  return { type: CUSTOMER_ACTION_CREATE_REQUEST, payload };
};

// initialState...
const initialState = { isValid: false, loading: false };

// Reducer...\
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case CUSTOMER_ACTION_CREATE_REQUEST:
      return Object.assign({}, state, { loading: true });
    case CUSTOMER_ACTION_FETCH_SUCCESS:
      return applyCustomerActionFetchSuccess(state, action.payload);
    case CUSTOMER_ACTION_FETCH_ERROR:
      message.error({
        content: i18next.t("feedback.invalidRequest"),
        duration: 0,
      });
      return Object.assign({}, state, { isValid: false, loading: false });
    case CUSTOMER_ACTION_CREATE_SUCCESS:
      return applyCustomerActionCreateSuccess(state, action.payload);
    case "LOGOUT_SUCCESS":
      return initialState;
    default:
      return state;
  }
};
export default reducer;

// Reducer helpers...
const applyCustomerActionFetchSuccess = (state, payload) => {
  return Object.assign({}, state, payload, { isValid: true, loading: false });
};
const applyCustomerActionCreateSuccess = (state, payload) => {
  message.success({
    content: i18next.t("feedback.savedFeedback"),
    key: "savingFeedback",
  });
  return Object.assign({}, state);
};

// Sagas...
function* find() {
  while (true) {
    const { payload } = yield take(CUSTOMER_ACTION_FETCH_REQUEST);
    const { _id } = payload;
    try {
      const response = yield call(
        [CustomerActionsService, CustomerActionsService.get],
        _id,
      );
      yield put({ type: CUSTOMER_ACTION_FETCH_SUCCESS, payload: response });
    } catch (error) {
      yield put({ type: CUSTOMER_ACTION_FETCH_ERROR });
    }
  }
}

function* create() {
  while (true) {
    const { payload } = yield take(CUSTOMER_ACTION_CREATE_REQUEST);
    const { _id, ...data } = payload;

    const firmCustomFields = yield select((state) =>
      path("customerActions.fields", state),
    ) || [];

    data.fields = data.fields || {};
    data.fields = mapFormFieldValuesToCustomFields(
      firmCustomFields,
      data.fields,
    );

    try {
      message.loading({
        content: i18next.t("feedback.savingFeedback"),
        key: "savingFeedback",
        duration: 0,
      });
      const response = yield call(
        [CustomerActionsService, CustomerActionsService.patch],
        _id,
        data,
      );
      yield put({ type: CUSTOMER_ACTION_CREATE_SUCCESS, payload: response });
    } catch (error) {
      message.error({
        content: i18next.t("feedback.cantSaveFeedback"),
        key: "savingFeedback",
      });
      // console.log("Error: ", error);
    }
  }
}

export function* customerActionsSaga() {
  yield all([find(), create()]);
}
