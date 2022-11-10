import { all, call, put, select, take } from "@redux-saga/core/effects";
import mixpanel from "analytics/mixpanel";
import { message } from "antd";
import i18next from "i18next";
import { getUsername } from "utils/helpers";

import { Notify } from "../components/notifications/Notify";
import { UserService } from "../services";
import {
  applyCreated,
  applyEditingCancel,
  applyEditingSaveError,
  applyEditingSaveRequest,
  applyFetchMoreSuccess,
  applyInitialFetch,
  applyRemoveError,
  applyRemoveRequest,
  applyRemoved,
} from "./reducers/utils";

export const USER_INITIAL_FETCH = "USER_INITIAL_FETCH";
export const USER_FETCH_MORE_SUCCESS = "USER_FETCH_MORE_SUCCESS";

export const SERVICE_WATCHER_USER_CREATED = "SERVICE_WATCHER_USER_CREATED";
export const SERVICE_WATCHER_USER_PATCHED = "SERVICE_WATCHER_USER_PATCHED";
export const SERVICE_WATCHER_USER_REMOVED = "SERVICE_WATCHER_USER_REMOVED";

export const USER_EDITING_START = "USER_EDITING_START";
export const USER_EDITING_END = "USER_EDITING_END";
export const USER_EDITING_CANCEL = "USER_EDITING_CANCEL";

export const USER_EDITING_SAVE_REQUEST = "USER_EDITING_SAVE_REQUEST";
export const USER_EDITING_SAVE_SUCCESS = "USER_EDITING_SAVE_SUCCESS";
export const USER_EDITING_SAVE_ERROR = "USER_EDITING_SAVE_ERROR";

export const USER_DELETE_REQUEST = "USER_DELETE_REQUEST";
export const USER_DELETE_SUCCESS = "USER_DELETE_SUCCESS";
export const USER_DELETE_ERROR = "USER_DELETE_ERROR";

export const USER_PAGE_CHANGE = "USER_PAGE_CHANGE";
export const USER_FETCH_REQUEST = "USER_FETCH_REQUEST";

export const USER_FETCH_MORE_REQUEST = "USER_FETCH_MORE_REQUEST";
export const USER_TOGGLE_INVITE_FORM = "USER_TOGGLE_INVITE_FORM";
export const USER_BULK_INVITE_REQUEST = "USER_BULK_INVITE_REQUEST";

export const USER_UPDATE_DEPO_REQUEST = "USER_UPDATE_DEPO_REQUEST";
export const USER_UPDATE_DEPO_SUCCESS = "USER_UPDATE_DEPO_SUCCESS";
export const USER_UPDATE_DEPO_ERROR = "USER_UPDATE_DEPO_ERROR";
const SAVE_USER_LOCALLY = "SAVE_USER_LOCALLY";
const USER_UPDATE_SELECTED_ROWS = "USER_UPDATE_SELECTED_ROWS";
const USER_DELETE_MANY_REQUEST = "USER_DELETE_MANY_REQUEST";
const USER_DELETE_MANY_SUCCESS = "USER_DELETE_MANY_SUCCESS";

const USER_FETCH_ALL_SUCCESS = "USER_FETCH_ALL_SUCCESS";
const USERS_SORTS_UPDATE = "USERS_SORTS_UPDATE";

const defaultSorting = { createdAt: -1 };
export function doStartEditing(payload) {
  return { type: USER_EDITING_START, payload };
}

export function doCancelEditing(payload) {
  return { type: USER_EDITING_CANCEL, payload };
}

export function doEndEditing(payload) {
  return { type: USER_EDITING_END, payload };
}

export function doEditingSaveRequest(payload) {
  return { type: USER_EDITING_SAVE_REQUEST, payload };
}

export function doEditingSaveSuccess(payload) {
  return { type: USER_EDITING_SAVE_SUCCESS, payload };
}

export function doEditingSaveError(payload) {
  return { type: USER_EDITING_SAVE_ERROR, payload };
}

export function doUserDeleteRequest(payload) {
  return { type: USER_DELETE_REQUEST, payload };
}

export function doUserDeleteSuccess(payload) {
  return { type: USER_DELETE_SUCCESS, payload };
}

export function doUserDeleteError(payload) {
  return { type: USER_DELETE_ERROR, payload };
}

export function doHandlePageChange(payload) {
  return { type: USER_PAGE_CHANGE, payload };
}

export function doFetchUsers(payload) {
  return { type: USER_FETCH_REQUEST, payload };
}

export function doFetchMoreUsers(payload) {
  return { type: USER_FETCH_MORE_REQUEST, payload };
}

export function doToggleInviteUsersForm(payload) {
  return { type: USER_TOGGLE_INVITE_FORM, payload };
}

export function doBulkInviteUsersRequest(payload) {
  return { type: USER_BULK_INVITE_REQUEST, payload };
}

export function doUpdateSelectedRowKeys(payload) {
  return { type: USER_UPDATE_SELECTED_ROWS, payload };
}

export function doDeleteUsersMany(payload) {
  return { type: USER_DELETE_MANY_REQUEST, payload };
}

export function doUpdateUserDepo(payload) {
  return {
    type: USER_UPDATE_DEPO_REQUEST,
    payload,
  };
}

export const doSaveChangesLocally = (payload) => {
  return {
    type: SAVE_USER_LOCALLY,
    payload,
  };
};

export const doUpdateUsersSorts = (payload) => ({
  type: USERS_SORTS_UPDATE,
  payload,
});

const applySaveChangesLocally = (state, payload) => {
  return Object.assign({}, state, {
    editedRecord: Object.assign({}, state.editedRecord, payload),
    changes: { ...state.changes, ...payload },
  });
};

export function doUpdateUserDepoSuccess(payload) {
  return {
    type: USER_UPDATE_DEPO_SUCCESS,
    payload,
  };
}

export function doUpdateUserDepoError(payload) {
  return {
    type: USER_UPDATE_DEPO_ERROR,
    payload,
  };
}

// reducer helpers
export function applyUserSaveSuccess(state, { payload }) {
  const { user, updated } = payload;
  let byIds;
  mixpanel.track(`User ${updated ? "updated" : "created"}`, {
    _id: user._id,
    fullName: getUsername(user),
  });
  if (state.byIds[user._id]) {
    byIds = { ...state.byIds, [user._id]: user };
  } else {
    byIds = { [user._id]: user, ...state.byIds };
  }

  return {
    ...state,
    byIds,
    allIds: Object.keys(byIds),
    isEditing: false,
    isLoading: false,
    error: null,
    changes: {},
    editedRecord: {},
  };
}

export function applyUserRemoveSuccess(state, { payload }) {
  let byIds = { ...state.byIds };
  delete byIds[payload._id];

  return {
    ...state,
    byIds,
    allIds: Object.keys(byIds),
    isEditing: false,
    isLoading: false,
    error: null,
    editedRecord: {},
  };
}

const applyEditingStart = (state, { payload }) => {
  return {
    ...state,
    isEditing: true,
    error: null,
    editedRecord: payload,
    changes: { _id: payload._id },
  };
};

export function applyEditingEnd(state, action) {
  return {
    ...state,
    isEditing: false,
    error: null,
    // Since upon failure the state already has editedRecord so we don't need to set it here again.
    // editedRecord: Object.assign({}, state.editedRecord, action.payload),
  };
}

const applyDeleteManySuccess = (state, payload) => {
  const deleted = Array.isArray(payload) ? payload.length : 0;
  message.success({
    content: `${i18next.t("bulkActions.deleted")} ${deleted} ${i18next.t(
      "bulkActions.selectedRecords",
    )}`,
    key: "deletingUsers",
  });
  return Object.assign({}, state, { isLoading: false, selectedRowKeys: [] });
};

const initialState = {
  byIds: {},
  allIds: [],
  editingId: null,
  isLoading: false,
  isEditing: false,
  error: null,
  changes: {},
  editedRecord: {},
  selectedRowKeys: [],
  allUsersByIds: {},
  sorts: {},
};

const applyUserPatched = (state, action) => {
  const { payload } = action;

  const oldRecord = state.byIds[action.payload._id] || {};

  let byIds = {
    ...state.byIds,
    [payload._id]: {
      ...payload,
      role: { ...oldRecord.role, ...payload.role },
    },
  };

  let allUsersByIds = { ...state.allUsersByIds, [payload._id]: payload };

  return {
    ...state,
    byIds,
    allIds: Object.keys(byIds),
    allUsersByIds,
  };
};

const applyFetchAllSuccess = (state, { data }) => {
  const allUsersByIds = (data || []).reduce(
    (prev, cur) => ({ ...prev, [cur._id]: cur }),
    {},
  );

  return Object.assign({}, state, {
    isLoading: false,
    allUsersByIds,
  });
};

const baseReducer = (state = initialState, action) => {
  switch (action.type) {
    case USER_INITIAL_FETCH:
      return applyInitialFetch(state, action);
    case USER_PAGE_CHANGE:
    case USER_FETCH_REQUEST:
      return Object.assign({}, state, { isLoading: true });
    case USER_FETCH_MORE_REQUEST:
      return { ...state, isLoading: true };
    case USER_FETCH_MORE_SUCCESS:
      return applyFetchMoreSuccess(state, action);
    case USER_TOGGLE_INVITE_FORM:
      return { ...state, isInviteFormVisible: !state.isInviteFormVisible };
    case SERVICE_WATCHER_USER_CREATED:
      return applyCreated(state, action);
    case SERVICE_WATCHER_USER_PATCHED:
    case USER_UPDATE_DEPO_SUCCESS:
      return applyUserPatched(state, action);
    case SERVICE_WATCHER_USER_REMOVED:
      return applyRemoved(state, action);
    case USER_EDITING_START:
      return applyEditingStart(state, action);
    case USER_EDITING_END:
      return applyEditingEnd(state, action);
    case USER_EDITING_CANCEL:
      return applyEditingCancel(state, action);
    case USER_EDITING_SAVE_REQUEST:
      return applyEditingSaveRequest(state, action);
    case USER_EDITING_SAVE_SUCCESS:
      return applyUserSaveSuccess(state, action);
    case USER_EDITING_SAVE_ERROR:
      return applyEditingSaveError(state, action);
    case USER_DELETE_REQUEST:
      return applyRemoveRequest(state, action);
    case USER_DELETE_SUCCESS:
      return applyUserRemoveSuccess(state, action);
    case USER_DELETE_ERROR:
      return applyRemoveError(state, action);
    case SAVE_USER_LOCALLY:
      return applySaveChangesLocally(state, action.payload);
    case USER_UPDATE_SELECTED_ROWS:
      return Object.assign({}, state, { selectedRowKeys: action.payload });
    case USERS_SORTS_UPDATE:
      const sorts =
        Object.keys(action.payload).length > 0
          ? action.payload
          : defaultSorting;
      return Object.assign({}, state, {
        isLoading: true,
        sorts,
      });
    case USER_DELETE_MANY_REQUEST:
      return Object.assign({}, state, { selectedRowKeys: [] });
    case "LOGOUT_SUCCESS":
      return initialState;
    case USER_DELETE_MANY_SUCCESS:
      return applyDeleteManySuccess(state, action.payload);
    case USER_FETCH_ALL_SUCCESS:
      return applyFetchAllSuccess(state, action.payload);
    default:
      return state;
  }
};
export default baseReducer;

function* paginate() {
  while (true) {
    const {
      payload: { pageSize, pageNumber, query },
    } = yield take(USER_PAGE_CHANGE);
    try {
      let params = {
        $skip: (pageNumber - 1) * pageSize,
        $limit: 10,
      };

      if (query) {
        params = Object.assign(params, query);
      }

      yield put({
        type: USER_FETCH_REQUEST,
        payload: params,
      });
    } catch (error) {
      // do nothing
    }
  }
}

function* find() {
  while (true) {
    const { type, payload: query } = yield take([
      USER_FETCH_REQUEST,
      USER_FETCH_MORE_REQUEST,
    ]);
    const sorts = yield select((state) => state.users.sorts);
    try {
      const response = yield call([UserService, UserService.find], {
        query: { ...query, $sort: sorts },
      });
      if (type === USER_FETCH_REQUEST) {
        yield put({ type: "USER_INITIAL_FETCH", payload: response });
      }

      if (type === USER_FETCH_MORE_REQUEST) {
        yield put({ type: "USER_FETCH_MORE_SUCCESS", payload: response });
      }
    } catch (error) {
      // do nothing
    }
  }
}

function* create() {
  while (true) {
    yield take(USER_EDITING_END);
    const payload = yield select((state) => state.users.changes);

    if (payload._id) {
      const { _id, ...rest } = payload;
      try {
        const response = yield call(
          [UserService, UserService.patch],
          _id,
          rest,
        );
        yield call(
          [Notify, Notify.updateSuccess],
          getUsername(response) || i18next.t("users.entityName"),
        );
        yield put(doEditingSaveSuccess({ user: response, updated: true }));
      } catch (error) {
        yield call([Notify, Notify.updateError], i18next.t("users.entityName"));
        yield put(doEditingSaveError(error));
      }
    } else {
      try {
        const response = yield call([UserService, UserService.create], payload);
        yield call(
          [Notify, Notify.createSuccess],
          getUsername(response) || i18next.t("users.entityName"),
        );
        yield put(doEditingSaveSuccess({ user: response, updated: false }));
      } catch (error) {
        yield call([Notify, Notify.createError], i18next.t("users.entityName"));
        yield put(doEditingSaveError(error));
      }
    }
  }
}
function* remove() {
  while (true) {
    try {
      const { payload } = yield take(USER_DELETE_REQUEST);

      const response = yield call(
        [UserService, UserService.remove],
        payload._id,
      );

      yield call(
        [Notify, Notify.removeSuccess],
        getUsername(response) || i18next.t("users.entityName"),
      );
      mixpanel.track("User removed", {
        _id: response._id,
        fullName: getUsername(response),
      });
      yield put(doUserDeleteSuccess(response));
    } catch (error) {
      yield call([Notify, Notify.removeError], i18next.t("users.entityName"));
      yield put(doUserDeleteError(error));
    }
  }
}

function* removeMany() {
  while (true) {
    const { payload } = yield take(USER_DELETE_MANY_REQUEST);
    const { selectedRowKeys } = payload;
    message.loading({
      content: `${i18next.t("bulkActions.deleting")} ${
        selectedRowKeys.length
      } ${i18next.t("bulkActions.records")}`,
      key: "deletingUsers",
      duration: 0,
    });

    try {
      const response = yield call([UserService, UserService.remove], null, {
        query: { _id: { $in: selectedRowKeys } },
      });
      yield put({ type: USER_DELETE_MANY_SUCCESS, payload: response });
      const sorts = yield select((state) => state.users.sorts);
      yield put(doFetchUsers({ $sort: sorts }));
      mixpanel.track("User bulk removed", {
        count: response.length,
      });
    } catch (error) {
      // console.log("Error: ", error);
      // errorIds.push(selectedRowKeys[i]);
    }
  }
}

function* bulkInviteUsers() {
  while (true) {
    const {
      payload: { roleId, emails, password },
    } = yield take(USER_BULK_INVITE_REQUEST);

    yield put(doToggleInviteUsersForm());

    for (let i = 0; i < emails.length; i++) {
      try {
        yield call([UserService, UserService.create], {
          roleId,
          email: emails[i],
          password,
        });
        yield call(
          [Notify, Notify.createSuccess],
          i18next.t("users.entityName"),
        );
      } catch (error) {
        yield call([Notify, Notify.createError], i18next.t("users.entityName"));
      }
    }

    mixpanel.track("User bulk invited", {
      count: emails.length,
    });
  }
}

export function* usersSagas() {
  yield all([
    paginate(),
    find(),
    create(),
    remove(),
    bulkInviteUsers(),
    removeMany(),
  ]);
}
