import { all } from "redux-saga/effects";

import {
  CUSTOMER_SERVICE_PATH,
  FIRM_ROLE_SERVICE_PATH,
  FIRM_SERVICE_PATH,
  FIRM_TEAM_SERVICE_PATH,
  SUBSCRIPTION_SERVICE_PATH,
  USER_SERVICE_PATH,
} from "../../../services";
import {
  CUSTOMER_ENTITY,
  FIRM_ENTITY,
  FIRM_ROLE_ENTITY,
  FIRM_TEAM_ENTITY,
  SUBSCRIPTION_ENTITY,
  USER_ENTITY,
} from "../../constants/entities.constants";
import BaseServiceWatcher from "./base-service.watcher.saga";

const UserServiceWatcher = BaseServiceWatcher(USER_SERVICE_PATH, USER_ENTITY);

const CustomerServiceWatcher = BaseServiceWatcher(
  CUSTOMER_SERVICE_PATH,
  CUSTOMER_ENTITY,
);

const FirmTeamServiceWatcher = BaseServiceWatcher(
  FIRM_TEAM_SERVICE_PATH,
  FIRM_TEAM_ENTITY,
);

const FirmRoleServiceWatcher = BaseServiceWatcher(
  FIRM_ROLE_SERVICE_PATH,
  FIRM_ROLE_ENTITY,
);

const FirmServiceWatcher = BaseServiceWatcher(FIRM_SERVICE_PATH, FIRM_ENTITY);

const SubscriptionServiceWatcher = BaseServiceWatcher(
  SUBSCRIPTION_SERVICE_PATH,
  SUBSCRIPTION_ENTITY,
);

const rootSaga = function* () {
  yield all([
    UserServiceWatcher(),
    CustomerServiceWatcher(),
    FirmTeamServiceWatcher(),
    FirmRoleServiceWatcher(),
    FirmServiceWatcher(),
    SubscriptionServiceWatcher(),
  ]);
};
export default rootSaga;
