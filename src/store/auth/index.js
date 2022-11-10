import mixpanel from "analytics/mixpanel";
import { message } from "antd";
import i18next from "i18next";
import logger from "logger";
import TagManager from "react-gtm-module";
import { call, put, take } from "redux-saga/effects";

import { UserService } from "../../services";
import { forgetPassword, resetPassword } from "../../services/auth.service";
import { resendVerifyEmail, signup } from "../../services/signup.service";
import getUserProfile from "../../utils/analytics/getUserProfile";
import { loginRequest } from "./authentication";

// constants
export const SIGNUP_REQUEST = "USER_SIGNUP_REQUEST";
export const SIGNUP_SUCCESS = "USER_SIGNUP_SUCCESS";
export const SIGNUP_ERROR = "USER_SIGNUP_ERROR";

export const FORGET_PASSWORD_REQUEST = "FORGET_PASSWORD_REQUEST";
export const FORGET_PASSWORD_ERROR = "FORGET_PASSWORD_ERROR";
export const FORGET_PASSWORD_SUCCESS = "FORGET_PASSWORD_SUCCESS";

export const RESET_PASSWORD_REQUEST = "RESET_PASSWORD_REQUEST";
export const RESET_PASSWORD_ERROR = "RESET_PASSWORD_ERROR";
export const RESET_PASSWORD_SUCCESS = "RESET_PASSWORD_SUCCESS";

export const VERIFY_ACCOUNT_REQUEST = "VERIFY_ACCOUNT_REQUEST";
export const VERIFY_ACCOUNT_ERROR = "VERIFY_ACCOUNT_ERROR";
export const VERIFY_ACCOUNT_SUCCESS = "VERIFY_ACCOUNT_SUCCESS";

export const RESEND_VERIFY_EMAIL_REQUEST = "RESEND_VERIFY_EMAIL_REQUEST";
export const RESEND_VERIFY_EMAIL_SUCCESS = "RESEND_VERIFY_EMAIL_SUCCESS";
export const RESEND_VERIFY_EMAIL_ERROR = "RESEND_VERIFY_EMAIL_ERROR";

// authentication action creators

export const doSignupRequest = (signupInfo) => {
  return { type: SIGNUP_REQUEST, payload: signupInfo };
};

export const doSignupError = (errors) => {
  return { type: SIGNUP_ERROR, payload: errors };
};

export const doSignupSuccess = () => {
  return { type: SIGNUP_SUCCESS };
};

// forget password actoins
export const doForgetPasswordRequest = (signupInfo) => {
  return { type: FORGET_PASSWORD_REQUEST, payload: signupInfo };
};

export const doForgetPasswordError = (errors) => {
  return { type: FORGET_PASSWORD_ERROR, payload: errors };
};

export const doForgetPasswordSuccess = () => {
  return { type: FORGET_PASSWORD_SUCCESS };
};

// reset password actions
export const doResetPasswordRequest = (resetInfo) => {
  return { type: RESET_PASSWORD_REQUEST, payload: resetInfo };
};

export const doResetPasswordError = (errors) => {
  return { type: RESET_PASSWORD_ERROR, payload: errors };
};

export const doResetPasswordSuccess = () => {
  return { type: RESET_PASSWORD_SUCCESS };
};

// verify account actions
export const doVerifyAccountRequest = (accountInfo) => {
  return { type: VERIFY_ACCOUNT_REQUEST, payload: accountInfo };
};

export const doVerifyAccountError = (errors) => {
  return { type: VERIFY_ACCOUNT_ERROR, payload: errors };
};

export const doVerifyAccountSuccess = () => {
  return { type: VERIFY_ACCOUNT_SUCCESS };
};

// resend verify email actions
export function doResendVerifyEmailRequest(email) {
  return { type: RESEND_VERIFY_EMAIL_REQUEST, payload: { email } };
}

export function doResendVerifyEmailError(payload) {
  return { type: RESEND_VERIFY_EMAIL_ERROR, payload };
}

export function doResendVerifyEmailSuccess(payload) {
  return { type: RESEND_VERIFY_EMAIL_SUCCESS, payload };
}

// account verify reducer
const initialVerifyEmailState = {
  isLoading: false,
  isDone: false,
  error: null,
};

export function verifyEmailReducer(state = initialVerifyEmailState, action) {
  switch (action.type) {
    case VERIFY_ACCOUNT_REQUEST:
      return { isLoading: true, isDone: false, error: null };
    case VERIFY_ACCOUNT_SUCCESS:
      return {
        isLoading: false,
        isDone: true,
        error: null,
      };
    case VERIFY_ACCOUNT_ERROR:
      return {
        isLoading: false,
        isDone: false,
        error: action.payload,
      };
    case "LOGOUT_SUCCESS":
      return initialVerifyEmailState;
    default:
      return state;
  }
}

const initialForgetPasswordState = {
  isLoading: false,
  isDone: false,
  error: null,
};
export function forgetPasswordReducer(
  state = initialForgetPasswordState,
  action,
) {
  switch (action.type) {
    case FORGET_PASSWORD_REQUEST:
      return {
        isLoading: true,
        isDone: false,
        error: null,
      };
    case FORGET_PASSWORD_SUCCESS:
      return { isLoading: false, isDone: true, error: null };
    case FORGET_PASSWORD_ERROR:
      return {
        isLoading: false,
        isDone: false,
        error: action.payload,
      };
    case "LOGOUT_SUCCESS":
      return initialForgetPasswordState;
    default:
      return state;
  }
}

const initialResendVerifyEmailState = {
  isLoading: false,
  isDone: false,
  error: null,
};
export function resendVerifyEmailReducer(
  state = initialResendVerifyEmailState,
  action,
) {
  switch (action.type) {
    case RESEND_VERIFY_EMAIL_REQUEST:
      return { isLoading: true, isDone: false, error: null };
    case RESEND_VERIFY_EMAIL_SUCCESS:
      message.success(i18next.t("verifyEmail.sent"));

      return {
        isLoading: false,
        isDone: true,
        error: null,
      };
    case RESEND_VERIFY_EMAIL_ERROR:
      message.error(i18next.t("verifyEmail.cantSend"));

      return {
        isLoading: false,
        isDone: false,
        error: action.payload,
      };
    case "LOGOUT_SUCCESS":
      return initialResendVerifyEmailState;
    default:
      return state;
  }
}

const initialResetPasswordState = {
  isLoading: false,
  isDone: false,
  error: null,
};
export function resetPasswordReducer(
  state = initialResetPasswordState,
  action,
) {
  switch (action.type) {
    case RESET_PASSWORD_REQUEST:
      return {
        isLoading: true,
        isDone: false,
        error: null,
      };
    case RESET_PASSWORD_SUCCESS:
      return { isLoading: false, isDone: true, error: null };
    case RESET_PASSWORD_ERROR:
      return { isLoading: false, isDone: false, error: action.payload };
    case "LOGOUT_SUCCESS":
      return initialResetPasswordState;
    default:
      return state;
  }
}

const initialSignupState = {
  isLoading: false,
  isDone: false,
  error: null,
  user: null,
};

export function signupReducer(state = initialSignupState, action) {
  switch (action.type) {
    case SIGNUP_REQUEST:
      return { isLoading: true, isDone: false, error: null, user: null };
    case SIGNUP_SUCCESS:
      return {
        isLoading: false,
        isDone: true,
        user: action.payload,
      };
    case SIGNUP_ERROR:
      return {
        isLoading: false,
        isDone: false,
        error: action.payload,
        user: null,
      };
    case "LOGOUT_SUCCESS":
      return initialSignupState;
    default:
      return state;
  }
}

// sagas start here
// auth saga

export function* forgetPasswordSaga() {
  while (true) {
    try {
      const { payload } = yield take(FORGET_PASSWORD_REQUEST);
      yield call(forgetPassword, payload);
      yield put({ type: FORGET_PASSWORD_SUCCESS });
    } catch (error) {
      yield put({ type: FORGET_PASSWORD_ERROR, payload: error });
    }
  }
}

export function* resetPasswordSaga() {
  while (true) {
    try {
      const { payload } = yield take(RESET_PASSWORD_REQUEST);
      yield call(resetPassword, payload);
      yield put({ type: RESET_PASSWORD_SUCCESS });
    } catch (error) {
      yield put({ type: RESET_PASSWORD_ERROR, payload: error });
    }
  }
}

export function* resendVerifyEmailSaga(action) {
  while (true) {
    const action = yield take(RESEND_VERIFY_EMAIL_REQUEST);
    try {
      yield call(resendVerifyEmail, action.payload);
      yield put({ type: RESEND_VERIFY_EMAIL_SUCCESS });
    } catch (error) {
      yield put({ type: RESEND_VERIFY_EMAIL_ERROR, payload: error });
    }
  }
}

export function* verifyAccountSaga(action) {
  while (true) {
    const { payload } = yield take(VERIFY_ACCOUNT_REQUEST);

    const { _id, verifyToken } = payload;

    try {
      yield call([localStorage, localStorage.clear]);
      yield call([UserService, UserService.patch], _id, { verifyToken });
      yield put({ type: VERIFY_ACCOUNT_SUCCESS });
    } catch (error) {
      yield put({ type: VERIFY_ACCOUNT_ERROR, payload: error });
    }
  }
}

export function* signupFlow(action) {
  while (true) {
    const { payload } = yield take(SIGNUP_REQUEST);
    const { email, password, ...rest } = payload;
    const signUpMsg = message.loading({
      content: i18next.t("signUp.signingUp"),
      duration: 0,
      key: "signingUp",
    });
    try {
      const res = yield call(signup, {
        email,
        password,
        ...rest,
        addDemoData: false,
      });

      TagManager.dataLayer({ dataLayer: { event: "signup" } });
      yield put({ type: SIGNUP_SUCCESS, payload: res });

      mixpanel.identify(res._id);
      let userData = getUserProfile(res);
      mixpanel.people.set(userData);
      mixpanel.track("Signup", userData);

      try {
        message.loading({
          content: i18next.t("signUp.loggingIn"),
          duration: 0,
          key: "signingUp",
        });
        yield put(loginRequest({ strategy: "local", email, password }));
        message.success({
          content: i18next.t("signUp.success"),
          key: "signingUp",
        });
      } catch (error) {
        message.error({
          content: i18next.t("signUp.loginError"),
          key: "signingUp",
        });
        logger.error("Error in post sign up login: ", error);
      }
    } catch (error) {
      logger.error("Error in sign up: ", error);
      yield put({ type: SIGNUP_ERROR, payload: error });
      if (error.code !== 409) {
        message.error({
          content: i18next.t("signUp.signUpError"),
          key: "signingUp",
        });
      } else {
        signUpMsg();
      }
    }
  }
}
