import { call, take, put, fork, cancelled } from "redux-saga/effects";
import mixpanel from "analytics/mixpanel";

import client from "./../../services/client";
// Authenticate with the local email/password strategy

export async function forgetPassword(accountInfo) {
  return client.service("user/recover-password").create(accountInfo);
}

export async function resetPassword(accountInfo) {
  return client.service("user/reset-password").create(accountInfo);
}

export const SERVICE_WATCHER_USER_PATCHED = "SERVICE_WATCHER_USER_PATCHED";

export const LOGIN_REQUEST = "LOGIN_REQUEST";
export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGIN_ERROR = "LOGIN_ERROR";

export const LOGIN_REAUTHENTICATE_REQUEST = "LOGIN_REAUTHENTICATE_REQUEST";
export const LOGIN_REAUTHENTICATE_SUCCESS = "LOGIN_REAUTHENTICATE_SUCCESS";
export const LOGIN_REAUTHENTICATE_ERROR = "LOGIN_REAUTHENTICATE_ERROR";

export const LOGOUT_REQUEST = "LOGOUT_REQUEST";
export const LOGOUT_SUCCESS = "LOGOUT_SUCCESS";
export const LOGOUT_ERROR = "LOGOUT_ERROR";

// action
export const doReAuthenticateRequest = (payload) => {
  return { type: LOGIN_REAUTHENTICATE_REQUEST, payload };
};

export const loginRequest = (payload) => {
  return { type: LOGIN_REQUEST, payload };
};

export const loginError = (errors) => {
  return { type: LOGIN_ERROR, payload: errors };
};

export const loginSuccess = (res) => {
  return { type: LOGIN_SUCCESS, payload: res };
};

export const doLogoutRequest = () => {
  return { type: LOGOUT_REQUEST };
};

export const doLogoutError = (errors) => {
  return { type: LOGOUT_ERROR, payload: errors };
};

export const doLogoutSuccess = () => {
  return { type: LOGOUT_SUCCESS };
};

function applyLoginSuccess(state, { payload }) {
  const { user, accessToken } = payload;
  return {
    ...state,
    isLoading: false,
    isLoggedIn: true,
    user,
    accessToken,
  };
}

function applyUserPatched(state, { payload: newUser = {} }) {
  const { user: oldUser = {} } = state;
  if (oldUser._id !== newUser._id) {
    return state;
  }

  return {
    ...state,
    user: {
      ...oldUser,
      ...newUser,
      role: {
        ...oldUser.role,
        ...newUser.role,
      },
      bin: {
        ...oldUser.bin,
        ...newUser.bin,
      },
      firm: {
        ...oldUser.firm,
        ...newUser.firm,
      },
    },
  };
}

const initialAuthState = {
  isLoggedIn: false,
  isLoading: false,
  error: null,
};

export default function authReducer(state = initialAuthState, action) {
  switch (action.type) {
    case LOGIN_REQUEST:
      return {
        isLoading: true,
        isLoggedIn: false,
        error: null,
      };
    case LOGIN_SUCCESS:
    case LOGIN_REAUTHENTICATE_SUCCESS:
      return applyLoginSuccess(state, action);
    case SERVICE_WATCHER_USER_PATCHED:
      return applyUserPatched(state, action);
    case LOGIN_ERROR:
      return { isLoading: false, isLoggedIn: false, error: action.payload };
    case LOGIN_REAUTHENTICATE_ERROR:
      return { isLoading: false, isLoggedIn: false };
    case LOGOUT_REQUEST:
      return { isLoading: true, error: null };
    case LOGOUT_SUCCESS:
      return {
        isLoading: false,
        isLoggedIn: false,
        auth: null,
        error: null,
      };
    case LOGOUT_ERROR:
      return { isLoading: false, error: action.payload };
    default:
      return state;
  }
}

export function* reAuthenticateFlow() {
  const token = localStorage.getItem("feathers-jwt");
  if (token) {
    yield put(doReAuthenticateRequest());
    try {
      const res = yield call([client, client.reAuthenticate]);
      if (res) {
        yield put({ type: LOGIN_REAUTHENTICATE_SUCCESS, payload: res });

        yield take(LOGOUT_REQUEST);
        yield call(logoutSaga);
      } else {
        yield put({ type: LOGIN_REAUTHENTICATE_ERROR });
      }
    } catch (error) {
      // do nothing
      yield put({ type: LOGIN_REAUTHENTICATE_ERROR, payload: error });
    }
  }
}

export function* authFlow() {
  while (true) {
    const { payload } = yield take([LOGIN_REQUEST]);
    yield fork(loginSaga, payload);
  }
}

export function* loginSaga(creds) {
  try {
    const response = yield call([client, client.authenticate], {
      strategy: "local",
      ...creds,
    });
    mixpanel.track("Login");
    yield put({ type: LOGIN_SUCCESS, payload: response });
    mixpanel.identify(response.user._id);
    yield take(LOGOUT_REQUEST);
    yield call(logoutSaga);
  } catch (error) {
    yield put({ type: LOGIN_ERROR, payload: error });
  } finally {
    if (yield cancelled()) {
      yield put({ type: LOGIN_ERROR });
    }
  }
}

export function* logoutSaga() {
  try {
    const response = yield call([client, client.logout]);
    yield put({ type: LOGOUT_SUCCESS, payload: response });
    window.location.reload(true);
  } catch (error) {
    yield put({ type: LOGOUT_ERROR, payload: error });
  }
}
