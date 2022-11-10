import { all, take } from "redux-saga/effects";

import {
  FirmService,
  FirmTeamService,
  SubscriptionService,
  UserService,
} from "./../../../services/";
import {
  LOGIN_REAUTHENTICATE_SUCCESS,
  LOGIN_SUCCESS,
} from "./../../auth/authentication";
import {
  FIRM_ENTITY,
  FIRM_TEAM_ENTITY,
  SUBSCRIPTION_ENTITY,
  USER_ENTITY,
} from "../../constants/entities.constants";
import initialFetchSaga from "./init-fetch.saga";

export default function* postLoginFlows() {
  while (true) {
    yield take([LOGIN_SUCCESS, LOGIN_REAUTHENTICATE_SUCCESS]);
    yield all([
      initialFetchSaga(UserService, USER_ENTITY),
      initialFetchSaga(FirmService, FIRM_ENTITY),
      initialFetchSaga(SubscriptionService, SUBSCRIPTION_ENTITY),
      initialFetchSaga(FirmTeamService, FIRM_TEAM_ENTITY),
    ]);
  }
}
