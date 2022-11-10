import { all, call, put, take } from "@redux-saga/core/effects";
import { message } from "antd";
import i18next from "i18next";
import logger from "logger";

import { CustomerLoginService, CustomerSignupService } from "../services";
import client from "../services/client";

// Action contants...
const CUSTOMER_SIGNUP_REQUEST = "CUSTOMER_SIGNUP_REQUEST";
const CUSTOMER_SIGNUP_REQUEST_SUCCESS = "CUSTOMER_SIGNUP_REQUEST_SUCCESS";
const CUSTOMER_LOGIN_REQUEST = "CUSTOMER_LOGIN_REQUEST";
const CUSTOMER_LOGIN_SUCCESS = "CUSTOMER_LOGIN_SUCCESS";
const CUSTOMER_LOGOUT_REQUEST = "CUSTOMER_LOGOUT_REQUEST";
const CUSTOMER_LOGOUT_SUCCESS = "CUSTOMER_LOGOUT_SUCCESS";

// Action creators...
export const doCustomerSignupRequest = (payload) => ({
  type: CUSTOMER_SIGNUP_REQUEST,
  payload,
});
export const doCustomerLoginRequest = (payload) => ({
  type: CUSTOMER_LOGIN_REQUEST,
  payload,
});
export const doCustomerLogoutRequest = (payload) => ({
  type: CUSTOMER_LOGOUT_REQUEST,
  payload,
});

// Initial state...
const initialState = {
  isLoading: false,
  isLoggedIn: false,
  isSignedUp: false,
};

// Reducer...
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case CUSTOMER_SIGNUP_REQUEST:
      return Object.assign({}, state, { isLoading: true });
    case CUSTOMER_SIGNUP_REQUEST_SUCCESS:
      return applyCustomerSignupSuccess(state, action.payload);
    case CUSTOMER_LOGIN_SUCCESS:
      return applyCustomerLoginSuccess(state, action.payload);
    case CUSTOMER_LOGOUT_SUCCESS:
      return initialState;
    default:
      return state;
  }
};
export default reducer;

// Reducer helpers...
const applyCustomerSignupSuccess = (state, payload) => {
  message.success({
    content: i18next.t("Successfully signed up"),
    key: "customerSignup",
  });
  return Object.assign({}, state, {
    isSignedUp: true,
    isLoading: false,
    isLoggedIn: false,
  });
};

const applyCustomerLoginSuccess = (state, payload) => {
  message.success({ content: i18next.t("Logged in!"), key: "customerLogin" });
  return Object.assign({}, state, {
    isLoggedIn: true,
    isLoading: false,
    ...payload,
  });
};

// Saga methods...
function* signup() {
  while (true) {
    const { payload } = yield take(CUSTOMER_SIGNUP_REQUEST);
    try {
      message.loading({
        content: i18next.t("Signing up..."),
        duration: 0,
        key: "customerSignup",
      });

      const response = yield call(
        [CustomerSignupService, CustomerSignupService.create],
        payload,
      );

      yield put({ type: CUSTOMER_SIGNUP_REQUEST_SUCCESS, payload: response });
      yield put(
        doCustomerLoginRequest({
          username: payload.username,
          password: payload.password,
        }),
      );
    } catch (error) {
      message.error({
        content: i18next.t("Error in sign up!"),
        key: "customerSignup",
      });
    }
  }
}

function* login() {
  while (true) {
    const { payload } = yield take(CUSTOMER_LOGIN_REQUEST);
    try {
      message.loading({
        content: i18next.t("Signing in..."),
        duration: 0,
        key: "customerLogin",
      });

      const response = yield call(
        [CustomerLoginService, CustomerLoginService.create],
        { ...payload, strategy: "local" },
      );

      yield put({ type: CUSTOMER_LOGIN_SUCCESS, payload: response });
    } catch (error) {
      message.error({
        content: i18next.t("Could not login!"),
        key: "customerLogin",
      });
    }
  }
}

function* logout() {
  while (true) {
    yield take(CUSTOMER_LOGOUT_REQUEST);
    try {
      yield call([client, client.logout]);
      yield put({ type: CUSTOMER_LOGOUT_SUCCESS });
    } catch (error) {
      logger.error("Logout error: ", error);
      message.error("Could not logout");
    }
  }
}

// Root saga...
export function* customerAuthenticationSaga() {
  yield all([signup(), login(), logout()]);
}
