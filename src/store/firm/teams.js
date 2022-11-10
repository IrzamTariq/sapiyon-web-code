import { call, take, put, all } from "redux-saga/effects";
import { FirmTeamService } from "../../services";

import { Notify } from "../../components/notifications/Notify";

import {
  applyCreated,
  applyPatched,
  applyRemoved,
  applyInitialFetch,
  applyEditingSaveError,
  applyRemoveRequest,
  applyRemoveSuccess,
  applyRemoveError,
} from "../reducers/utils";

// constants
export const FIRM_TEAM_UPDATE_REQUEST = "FIRM_TEAM_UPDATE_REQUEST";
export const FIRM_TEAM_UPDATE_SUCCESS = "FIRM_TEAM_UPDATE_SUCCESS";
export const FIRM_TEAM_UPDATE_ERROR = "FIRM_TEAM_UPDATE_ERROR";

export const FIRM_TEAM_EDITING_START = "FIRM_TEAM_EDITING_START";
export const FIRM_TEAM_EDITING_END = "FIRM_TEAM_EDITING_END";
export const FIRM_TEAM_EDITING_CANCEL = "FIRM_TEAM_EDITING_CANCEL";

export const FIRM_TEAM_EDITING_SAVE_REQUEST = "FIRM_TEAM_EDITING_SAVE_REQUEST";
export const FIRM_TEAM_EDITING_SAVE_SUCCESS = "FIRM_TEAM_EDITING_SAVE_SUCCESS";
export const FIRM_TEAM_EDITING_SAVE_ERROR = "FIRM_TEAM_EDITING_SAVE_ERROR";

export const FIRM_TEAM_ADD_NEW = "FIRM_TEAM_ADD_NEW";
export const FIRM_TEAM_ADD_NEW_SUCCESS = "FIRM_TEAM_ADD_NEW_SUCCESS";
export const FIRM_TEAM_ADD_NEW_ERROR = "FIRM_TEAM_ADD_NEW_ERROR";

export const FIRM_TEAM_REMOVE = "FIRM_TEAM_REMOVE";
export const FIRM_TEAM_REMOVE_SUCCESS = "FIRM_TEAM_REMOVE_SUCCESS";
export const FIRM_TEAM_REMOVE_ERROR = "FIRM_TEAM_ADD_NEW_ERROR";

// action creators
export function doFirmTeamEditingSaveRequest(payload) {
  return { type: FIRM_TEAM_EDITING_SAVE_REQUEST, payload };
}

export function doFirmTeamEditingSaveError(payload) {
  return { type: FIRM_TEAM_EDITING_SAVE_ERROR, payload };
}

export function doFirmTeamEditingSaveSuccess(payload) {
  return { type: FIRM_TEAM_EDITING_SAVE_SUCCESS, payload };
}

export function doStartEditingFirmTeam(payload) {
  return { type: FIRM_TEAM_EDITING_START, payload };
}

export function doCancelEditingFirmTeam(payload) {
  return { type: FIRM_TEAM_EDITING_CANCEL, payload };
}

export function doEndEditingFirmTeam(payload) {
  return { type: FIRM_TEAM_EDITING_END, payload };
}

export function doAddNewFirmTeam() {
  return { type: FIRM_TEAM_ADD_NEW, payload: { title: "New Field" } };
}

export function doAddNewFirmTeamSuccess(payload) {
  return {
    type: FIRM_TEAM_ADD_NEW_SUCCESS,
    payload,
  };
}

export function doAddNewFirmTeamError(payload) {
  return {
    type: FIRM_TEAM_ADD_NEW_ERROR,
    payload,
  };
}

export function doFirmTeamRemove(payload) {
  return {
    type: FIRM_TEAM_REMOVE,
    payload,
  };
}

export function doFirmTeamRemoveSuccess(payload) {
  return {
    type: FIRM_TEAM_REMOVE_SUCCESS,
    payload,
  };
}

export function doFirmTeamRemoveError(payload) {
  return {
    type: FIRM_TEAM_REMOVE_ERROR,
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

const entityName = "FIRM_TEAM";
const initialState = {
  byIds: {},
  allIds: [],
  editingId: "",
  isLoading: false,
  isEditing: false,
  error: null,
};

//TODO: add proper constants
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case `${entityName}_INITIAL_FETCH`:
      return applyInitialFetch(state, action);
    case `SERVICE_WATCHER_${entityName}_CREATED`:
      return applyCreated(state, action);
    case `SERVICE_WATCHER_${entityName}_PATCHED`:
      return applyPatched(state, action);
    case `SERVICE_WATCHER_${entityName}_REMOVED`:
      return applyRemoved(state, action);
    case `${entityName}_EDITING_START`:
      return {
        ...state,
        editingId: action.payload,
      };
    case `${entityName}_EDITING_END`:
      return state;
    case `${entityName}_EDITING_CANCEL`:
      return {
        ...state,
        editingId: "",
      };
    case `${entityName}_EDITING_SAVE_REQUEST`:
      return state;
    case `${entityName}_EDITING_SAVE_SUCCESS`:
      return applySaveSuccess(state, action);
    case `${entityName}_EDITING_SAVE_ERROR`:
      return applyEditingSaveError(state, action);
    case `${entityName}_ADD_NEW`:
      return state;
    case `${entityName}_ADD_NEW_SUCCESS`:
      return applyAddSuccess(state, action);
    case `${entityName}_ADD_NEW_ERROR`:
      return state;
    case `${entityName}_REMOVE_REQUEST`:
      return applyRemoveRequest(state, action);
    case `${entityName}_REMOVE_SUCCESS`:
      return applyRemoveSuccess(state, action);
    case `${entityName}_REMOVE_ERROR`:
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
    } = yield take(FIRM_TEAM_ADD_NEW);
    try {
      const response = yield call([FirmTeamService, FirmTeamService.create], {
        title,
      });

      yield put(doAddNewFirmTeamSuccess(response));
    } catch (error) {
      yield put(doAddNewFirmTeamError(error));
    }
  }
}

export function* update() {
  while (true) {
    const {
      payload: { _id, title },
    } = yield take(FIRM_TEAM_EDITING_END);
    try {
      const response = yield call(
        [FirmTeamService, FirmTeamService.patch],
        _id,
        {
          title,
        },
      );

      yield put(doFirmTeamEditingSaveSuccess(response));
      yield call([Notify, Notify.saveSuccess], response.title);
    } catch (error) {
      yield put(doFirmTeamEditingSaveError(error));
      yield call([Notify, Notify.saveError], "Team");
    }
  }
}

export function* remove() {
  while (true) {
    const {
      payload: { _id },
    } = yield take(FIRM_TEAM_REMOVE);
    try {
      const response = yield call(
        [FirmTeamService, FirmTeamService.remove],
        _id,
      );

      yield put(doFirmTeamRemoveSuccess(response));
      yield call([Notify, Notify.removeSuccess], response.title);
    } catch (error) {
      yield put(doFirmTeamRemoveError(error));
      yield call([Notify, Notify.removeError], "Team");
    }
  }
}

export function* firmTeamsSaga() {
  yield all([create(), update(), remove()]);
}
