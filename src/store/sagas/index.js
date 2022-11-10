import { all } from "redux-saga/effects";

import {
  forgetPasswordSaga,
  resendVerifyEmailSaga,
  resetPasswordSaga,
  signupFlow,
  verifyAccountSaga,
} from "./../auth";
import { authFlow } from "./../auth/authentication";
import { reAuthenticateFlow } from "./../auth/authentication";
import { customerSagas } from "./../customers";
import { firmSaga } from "./../firm";
import { firmRolesSaga } from "./../firm/roles";
import { firmTeamsSaga } from "./../firm/teams";
import { reportsSagas } from "./../reports";
import { usersSagas } from "./../users";
import { customerActionsSaga } from "../customerActions";
import { customerAuthenticationSaga } from "../customerAuthentication";
import { feedbackSaga } from "../feedback";
import { feedbackFiltersSaga } from "../feedbackFilters";
import { subscriptionSagas } from "../subscription";
import postLoginFlows from "./postLoginFlows";
import serviceWatcherSaga from "./service-watchers";

export default function* rootSaga() {
  yield all([
    reAuthenticateFlow(),
    authFlow(),
    signupFlow(),
    resendVerifyEmailSaga(),
    verifyAccountSaga(),
    forgetPasswordSaga(),
    resetPasswordSaga(),
    postLoginFlows(),
    serviceWatcherSaga(),
    usersSagas(),

    customerSagas(),
    firmTeamsSaga(),
    firmRolesSaga(),
    firmSaga(),
    reportsSagas(),
    subscriptionSagas(),
    feedbackSaga(),
    feedbackFiltersSaga(),
    customerActionsSaga(),
    customerAuthenticationSaga(),
  ]);
}
