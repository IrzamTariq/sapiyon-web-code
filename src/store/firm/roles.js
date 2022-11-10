import mixpanel from "analytics/mixpanel";
import { all, call, put, take } from "redux-saga/effects";

import { Notify } from "../../components/notifications/Notify";
import { FirmRoleService } from "../../services";
import {
  applyCreated,
  applyEditingSaveError,
  applyInitialFetch,
  applyPatched,
  applyRemoveError,
  applyRemoveRequest,
  applyRemoveSuccess,
  applyRemoved,
} from "../reducers/utils";

// constants
export const FIRM_ROLE_FETCH_REQUEST = "FIRM_ROLE_FETCH_REQUEST";
export const FIRM_ROLE_FETCH_SUCCESS = "FIRM_ROLE_FETCH_SUCCESS";
export const FIRM_ROLE_FETCH_ERROR = "FIRM_ROLE_FETCH_ERROR";

export const FIRM_ROLE_UPDATE_REQUEST = "FIRM_ROLE_UPDATE_REQUEST";
export const FIRM_ROLE_UPDATE_SUCCESS = "FIRM_ROLE_UPDATE_SUCCESS";
export const FIRM_ROLE_UPDATE_ERROR = "FIRM_ROLE_UPDATE_ERROR";

export const FIRM_ROLE_EDITING_START = "FIRM_ROLE_EDITING_START";
export const FIRM_ROLE_EDITING_END = "FIRM_ROLE_EDITING_END";
export const FIRM_ROLE_EDITING_CANCEL = "FIRM_ROLE_EDITING_CANCEL";

export const FIRM_ROLE_EDITING_SAVE_REQUEST = "FIRM_ROLE_EDITING_SAVE_REQUEST";
export const FIRM_ROLE_EDITING_SAVE_SUCCESS = "FIRM_ROLE_EDITING_SAVE_SUCCESS";
export const FIRM_ROLE_EDITING_SAVE_ERROR = "FIRM_ROLE_EDITING_SAVE_ERROR";

export const FIRM_ROLE_ADD_NEW = "FIRM_ROLE_ADD_NEW";
export const FIRM_ROLE_ADD_NEW_SUCCESS = "FIRM_ROLE_ADD_NEW_SUCCESS";
export const FIRM_ROLE_ADD_NEW_ERROR = "FIRM_ROLE_ADD_NEW_ERROR";

export const FIRM_ROLE_REMOVE = "FIRM_ROLE_REMOVE";
export const FIRM_ROLE_REMOVE_SUCCESS = "FIRM_ROLE_REMOVE_SUCCESS";
export const FIRM_ROLE_REMOVE_ERROR = "FIRM_ROLE_ADD_NEW_ERROR";

// action creators
export function doFirmRoleFetchRequest(payload) {
  return { type: FIRM_ROLE_FETCH_REQUEST, payload };
}
export function doFirmRoleFetchSuccess(payload) {
  return { type: FIRM_ROLE_FETCH_SUCCESS, payload };
}
export function doFirmRoleFetchError(payload) {
  return { type: FIRM_ROLE_FETCH_ERROR, payload };
}

export function doFirmRoleEditingSaveRequest(payload) {
  return { type: FIRM_ROLE_EDITING_SAVE_REQUEST, payload };
}

export function doFirmRoleEditingSaveError(payload) {
  return { type: FIRM_ROLE_EDITING_SAVE_ERROR, payload };
}

export function doFirmRoleEditingSaveSuccess(payload) {
  return { type: FIRM_ROLE_EDITING_SAVE_SUCCESS, payload };
}

export function doStartEditingFirmRole(payload) {
  return { type: FIRM_ROLE_EDITING_START, payload };
}

export function doCancelEditingFirmRole(payload) {
  return { type: FIRM_ROLE_EDITING_CANCEL, payload };
}

export function doEndEditingFirmRole(payload) {
  return { type: FIRM_ROLE_EDITING_END, payload };
}

export function doAddNewFirmRole() {
  return { type: FIRM_ROLE_ADD_NEW, payload: { title: "New Role" } };
}

export function doAddNewFirmRoleSuccess(payload) {
  return {
    type: FIRM_ROLE_ADD_NEW_SUCCESS,
    payload,
  };
}

export function doAddNewFirmRoleError(payload) {
  return {
    type: FIRM_ROLE_ADD_NEW_ERROR,
    payload,
  };
}

export function doFirmRoleRemove(payload) {
  return {
    type: FIRM_ROLE_REMOVE,
    payload,
  };
}

export function doFirmRoleRemoveSuccess(payload) {
  return {
    type: FIRM_ROLE_REMOVE_SUCCESS,
    payload,
  };
}

export function doFirmRoleRemoveError(payload) {
  return {
    type: FIRM_ROLE_REMOVE_ERROR,
    payload,
  };
}

// reducer helpers
export function applySaveSuccess(state, { payload }) {
  let byIds = { ...state.byIds, [payload._id]: payload };

  return {
    ...state,
    byIds,
    allIds: Object.keys(byIds),
    isEditing: false,
    editingId: "",
    isLoading: false,
    error: null,
    editedRecord: {},
  };
}

export function applyAddSuccess(state, { payload }) {
  let byIds = { ...state.byIds, [payload._id]: payload };

  return {
    ...state,
    byIds,
    allIds: Object.keys(byIds),
    isEditing: false,
    editingId: payload._id,
    isLoading: false,
    error: null,
    editedRecord: {},
  };
}

const initialState = {
  byIds: {},
  allIds: [],
  editingId: "",
  isLoading: false,
  isEditing: false,
  error: null,
};

//TODO: Firm roles is using this redux state, update that before you remove this

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case `FIRM_ROLE_INITIAL_FETCH`:
    case FIRM_ROLE_FETCH_SUCCESS:
      return applyInitialFetch(state, action);
    case `SERVICE_WATCHER_FIRM_ROLE_CREATED`:
      return applyCreated(state, action);
    case `SERVICE_WATCHER_FIRM_ROLE_PATCHED`:
      return applyPatched(state, action);
    case `SERVICE_WATCHER_FIRM_ROLE_REMOVED`:
      return applyRemoved(state, action);
    case `FIRM_ROLE_EDITING_START`:
      return {
        ...state,
        editingId: action.payload,
      };
    case `FIRM_ROLE_EDITING_END`:
      return state;
    case `FIRM_ROLE_EDITING_CANCEL`:
      return {
        ...state,
        editingId: "",
      };
    case `FIRM_ROLE_EDITING_SAVE_REQUEST`:
      return state;
    case `FIRM_ROLE_EDITING_SAVE_SUCCESS`:
      return applySaveSuccess(state, action);
    case `FIRM_ROLE_EDITING_SAVE_ERROR`:
      return applyEditingSaveError(state, action);
    case `FIRM_ROLE_ADD_NEW`:
      return state;
    case `FIRM_ROLE_ADD_NEW_SUCCESS`:
      return applyAddSuccess(state, action);
    case `FIRM_ROLE_ADD_NEW_ERROR`:
      return state;
    case `FIRM_ROLE_REMOVE_REQUEST`:
      return applyRemoveRequest(state, action);
    case `FIRM_ROLE_REMOVE_SUCCESS`:
      return applyRemoveSuccess(state, action);
    case `FIRM_ROLE_REMOVE_ERROR`:
      return applyRemoveError(state, action);
    case "LOGOUT_SUCCESS":
      return initialState;
    default:
      return state;
  }
};

export default reducer;

export function* create() {
  while (true) {
    const {
      payload: { title },
    } = yield take(FIRM_ROLE_ADD_NEW);
    try {
      const response = yield call([FirmRoleService, FirmRoleService.create], {
        title,
      });

      yield put(doAddNewFirmRoleSuccess(response));
      mixpanel.track("User role created", {
        _id: response._id,
        title: response.title,
      });
    } catch (error) {
      yield put(doAddNewFirmRoleError(error));
    }
  }
}

export function* find() {
  while (true) {
    yield take(FIRM_ROLE_FETCH_REQUEST);
    try {
      const response = yield call([FirmRoleService, FirmRoleService.find]);
      yield put(doFirmRoleFetchSuccess(response));
    } catch (error) {
      yield put(doFirmRoleFetchError(error));
    }
  }
}

export function* update() {
  while (true) {
    const {
      payload: { _id, ...data },
    } = yield take(FIRM_ROLE_EDITING_END);
    try {
      const response = yield call(
        [FirmRoleService, FirmRoleService.patch],
        _id,
        data,
      );

      yield put(doFirmRoleEditingSaveSuccess(response));
      yield call([Notify, Notify.saveSuccess], "Role");

      mixpanel.track("User role updated", {
        _id: response._id,
        title: response.title,
      });
    } catch (error) {
      yield put(doFirmRoleEditingSaveError(error));
      yield call([Notify, Notify.saveError], "Role");
    }
  }
}

export function* remove() {
  while (true) {
    const {
      payload: { _id },
    } = yield take(FIRM_ROLE_REMOVE);
    try {
      const response = yield call(
        [FirmRoleService, FirmRoleService.remove],
        _id,
      );

      yield put(doFirmRoleRemoveSuccess(response));
      yield call([Notify, Notify.removeSuccess], "Role");
      mixpanel.track("User role removed", {
        _id: response._id,
        title: response.title,
      });
    } catch (error) {
      yield put(doFirmRoleRemoveError(error));
      yield call([Notify, Notify.removeError], "Role");
    }
  }
}

export function* firmRolesSaga() {
  yield all([create(), find(), update(), remove()]);
}
