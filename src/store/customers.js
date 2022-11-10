import { all, call, put, select, take } from "@redux-saga/core/effects";
import mixpanel from "analytics/mixpanel";
import { message } from "antd";
import i18next from "i18next";
import logger from "logger";
import { path } from "rambdax";

import { Notify } from "../components/notifications/Notify";
import { CustomerService, ImportCustomerService } from "../services";
import {
  applyCreated,
  applyDeleteManyError,
  applyDeleteManyRequest,
  applyEditingCancel,
  applyEditingEnd,
  applyEditingSaveError,
  applyEditingSaveRequest,
  applyEditingStart,
  applyRemoveError,
  applyRemoveRequest,
  applyRemoved,
  applySelectRows,
} from "./reducers/utils";

export const CUSTOMER_INITIAL_FETCH = "CUSTOMER_INITIAL_FETCH";

export const SERVICE_WATCHER_CUSTOMER_CREATED =
  "SERVICE_WATCHER_CUSTOMER_CREATED";
export const SERVICE_WATCHER_CUSTOMER_REMOVED =
  "SERVICE_WATCHER_CUSTOMER_REMOVED";
export const SERVICE_WATCHER_CUSTOMER_PATCHED =
  "SERVICE_WATCHER_CUSTOMER_PATCHED";

export const CUSTOMER_EDITING_START = "CUSTOMER_EDITING_START";
export const CUSTOMER_EDITING_END = "CUSTOMER_EDITING_END";
export const CUSTOMER_EDITING_CANCEL = "CUSTOMER_EDITING_CANCEL";

export const CUSTOMER_EDITING_SAVE_REQUEST = "CUSTOMER_EDITING_SAVE_REQUEST";
export const CUSTOMER_EDITING_SAVE_SUCCESS = "CUSTOMER_EDITING_SAVE_SUCCESS";
export const CUSTOMER_EDITING_SAVE_ERROR = "CUSTOMER_EDITING_SAVE_ERROR";

export const CUSTOMER_REMOVE_REQUEST = "CUSTOMER_REMOVE_REQUEST";
export const CUSTOMER_REMOVE_SUCCESS = "CUSTOMER_REMOVE_SUCCESS";
export const CUSTOMER_REMOVE_ERROR = "CUSTOMER_REMOVE_ERROR";

export const CUSTOMER_PAGE_CHANGE = "CUSTOMER_PAGE_CHANGE";
export const CUSTOMER_FETCH_REQUEST = "CUSTOMER_FETCH_REQUEST";

export const CUSTOMER_DELETE_MANY_REQUEST = "CUSTOMER_DELETE_MANY_REQUEST";
export const CUSTOMER_DELETE_MANY_SUCCESS = "CUSTOMER_DELETE_MANY_SUCCESS";
export const CUSTOMER_DELETE_MANY_ERROR = "CUSTOMER_DELETE_MANY_ERROR";

export const CUSTOMER_UPDATE_SELECTED_ROW_KEYS =
  "CUSTOMER_UPDATE_SELECTED_ROW_KEYS";

export const CUSTOMER_SAVE_LOCALLY = "CUSTOMER_SAVE_LOCALLY";

export const CUSTOMER_CLEAR_EDITED_RECORD = "CUSTOMER_CLEAR_EDITED_RECORD";

export const CUSTOMER_TOGGLE_IMPORT_MODAL = "CUSTOMER_TOGGLE_IMPORT_MODAL";
export const CUSTOMER_IMPORT_FILE_LIST_UPDATE =
  "CUSTOMER_IMPORT_FILE_LIST_UPDATE";
export const CUSTOMER_IMPORT_REQUEST = "CUSTOMER_IMPORT_REQUEST";
export const CUSTOMER_IMPORT_SUCCESS = "CUSTOMER_IMPORT_SUCCESS";
export const CUSTOMER_IMPORT_ERROR = "CUSTOMER_IMPORT_ERROR";
export const TWIMC_CUSTOMER_CREATED = "TWIMC_CUSTOMER_CREATED";
export const TWIMC_CUSTOMER_UPDATED = "TWIMC_CUSTOMER_UPDATED";
export const CUSTOMER_SORTS_UPDATE = "CUSTOMER_SORTS_UPDATE";

const defaultSortQuery = { createdAt: -1 };
export function doStartEditingCustomer(customer = {}) {
  return { type: CUSTOMER_EDITING_START, payload: customer };
}

export function doCancelCustomerEditing() {
  return { type: CUSTOMER_EDITING_CANCEL };
}

export function doEndCustomerEditing(customer) {
  return { type: CUSTOMER_EDITING_END, payload: customer };
}

export function doCustomerEditingSaveRequest(customer) {
  return { type: CUSTOMER_EDITING_SAVE_REQUEST, payload: customer };
}

export function doCustomerEditingSaveError(error) {
  return { type: CUSTOMER_EDITING_SAVE_ERROR, payload: error };
}

export function doCustomerEditingSaveSuccess(payload) {
  return { type: CUSTOMER_EDITING_SAVE_SUCCESS, payload };
}

export function doCustomerDeleteRequest(payload) {
  return { type: CUSTOMER_REMOVE_REQUEST, payload };
}

export function doCustomerDeleteSuccess(payload) {
  return { type: CUSTOMER_REMOVE_SUCCESS, payload };
}

export function doCustomerDeleteError(payload) {
  return { type: CUSTOMER_REMOVE_ERROR, payload };
}

export function doHandlePageUpdate(payload) {
  return { type: CUSTOMER_PAGE_CHANGE, payload };
}

export function doFetchCustomersRequest(payload) {
  return { type: CUSTOMER_FETCH_REQUEST, payload };
}

export function doCustomerDeleteManyRequest(payload) {
  return { type: CUSTOMER_DELETE_MANY_REQUEST, payload };
}

export function doCustomerDeleteManySuccess(payload) {
  return { type: CUSTOMER_DELETE_MANY_SUCCESS, payload };
}

export function doCustomerBulkRemoveError(payload) {
  return { type: CUSTOMER_DELETE_MANY_ERROR, payload };
}

export function doUpdateSelectedRowKeys(payload) {
  return { type: CUSTOMER_UPDATE_SELECTED_ROW_KEYS, payload };
}

export function doSaveCustomerLocally(payload) {
  return { type: CUSTOMER_SAVE_LOCALLY, payload };
}

export function doClearEditedCustomer() {
  return { type: CUSTOMER_CLEAR_EDITED_RECORD };
}

export function doToggleCustomersImportModal() {
  return { type: CUSTOMER_TOGGLE_IMPORT_MODAL };
}

export function doUpdateFileListForCustomersImport(payload) {
  return { type: CUSTOMER_IMPORT_FILE_LIST_UPDATE, payload };
}

export function doCustomersImportRequest(payload) {
  return { type: CUSTOMER_IMPORT_REQUEST, payload };
}

export function doCustomersImportSuccess(payload) {
  return { type: CUSTOMER_IMPORT_SUCCESS, payload };
}

export function doCustomersImportError(payload) {
  return { type: CUSTOMER_IMPORT_ERROR, payload };
}

export function newCustomerCreated(payload) {
  return { type: TWIMC_CUSTOMER_CREATED, payload };
}

export function customerUpdated(payload) {
  return { type: TWIMC_CUSTOMER_UPDATED, payload };
}

export const doUpdateCustomerSorts = (payload) => ({
  type: CUSTOMER_SORTS_UPDATE,
  payload,
});

// reducer helpers
export function applySaveSuccess(state, { payload }) {
  let { byIds = {} } = state;

  if (state.byIds[payload._id]) {
    byIds = { ...state.byIds, [payload._id]: payload };
  } else {
    byIds = { [payload._id]: payload, ...state.byIds };
  }

  return {
    ...state,
    byIds,
    allIds: Object.keys(byIds),
    isEditing: false,
    isLoading: false,
    error: null,
    editedRecord: {},
    total: Object.keys(byIds)?.length || 0,
    isEmpty: false,
  };
}

export function applyRemoveSuccess(state, { payload }) {
  let { byIds, filtersNotApplied = false } = state;
  let entities = { ...byIds };
  delete entities[payload._id];
  const total = (state?.total || 0) > 0 ? (state?.total || 0) - 1 : 0;

  return {
    ...state,
    byIds: entities,
    allIds: Object.keys(byIds),
    isEditing: false,
    isLoading: false,
    error: null,
    editedRecord: {},
    total,
    isEmpty: total === 0 && filtersNotApplied,
  };
}

function applySaveLocally(state, action) {
  const editedRecord = state.editedRecord || {};
  const payload = action.payload || {};
  if (payload.accountType === "individual") {
    delete editedRecord.businessName;
  }

  return {
    ...state,
    editedRecord: {
      ...editedRecord,
      ...payload,
      address: {
        ...editedRecord.address,
        ...payload.address,
      },
    },
  };
}

const applyDeleteManySuccess = (state, payload) => {
  const deleted = Array.isArray(payload) ? payload.length : 0;
  message.success({
    content: `${i18next.t("bulkActions.deleted")} ${deleted} ${i18next.t(
      "bulkActions.selectedRecords",
    )}`,
    key: "deletingCustomers",
  });

  return {
    ...state,
    isRemoving: false,
    error: null,
    selectedRowKeys: [],
  };
};

const applyPatched = (state, action) => {
  const { payload } = action;

  let allIds = state.allIds;
  if (!allIds.includes(payload._id)) {
    allIds.unshift(payload._id);
  }

  return {
    ...state,
    byIds: Object.assign({}, state.byIds, { [payload._id]: payload }),
    allIds,
  };
};

function applyPageChange(state, { payload }) {
  const { pageNumber = 1, pageSize = 25, filtersNotApplied = false } = payload;
  return {
    ...state,
    currentPage: pageNumber,
    pageSize,
    isLoading: true,
    filtersNotApplied,
  };
}

// function applyPageSizeChange(state, { payload }) {
//   const { pageSize = 25 } = payload;

//   return {
//     ...state,
//     pageSize,
//   };
// }

export function applyInitialFetch(state, action) {
  const { payload } = action;
  if (!payload) {
    return state;
  }
  const { data, ...rest } = payload;
  const entities = data.reduce((prev, cur) => {
    return Object.assign({}, prev, { [cur._id]: cur });
  }, {});

  const byIds = entities;
  const allIds = Object.keys(byIds);

  return Object.assign({}, state, {
    allIds,
    byIds,
    isLoading: false,
    ...rest,
  });
}

const initialState = {
  byIds: {},
  allIds: [],
  editingId: null,
  isLoading: false,
  isEmpty: false,
  filtersNotApplied: false,
  isEditing: false,
  error: null,
  selectedRowKeys: [],
  importFormVisible: false,
  importFileList: [],
  pageSize: 25,
  currentPage: 1,
  sorts: defaultSortQuery,
};

const entityName = "CUSTOMER";

const baseReducer = (state = initialState, action) => {
  switch (action.type) {
    case CUSTOMER_FETCH_REQUEST:
      return Object.assign({}, state, { isLoading: true });
    case CUSTOMER_PAGE_CHANGE:
      return applyPageChange(state, action);
    // case CUSTOMER_PAGE_SIZE_CHANGE_REQUEST:
    //   return applyPageSizeChange(state, action);
    case CUSTOMER_INITIAL_FETCH:
      return applyInitialFetch(state, action);
    case SERVICE_WATCHER_CUSTOMER_CREATED:
      return applyCreated(state, action);
    case SERVICE_WATCHER_CUSTOMER_PATCHED:
      return applyPatched(state, action);
    case SERVICE_WATCHER_CUSTOMER_REMOVED:
      return applyRemoved(state, action);
    case CUSTOMER_EDITING_START:
      return applyEditingStart(state, action);
    case CUSTOMER_EDITING_END:
      return applyEditingEnd(state, action);
    case CUSTOMER_EDITING_CANCEL:
      return applyEditingCancel(state, action);
    case CUSTOMER_EDITING_SAVE_REQUEST:
      return applyEditingSaveRequest(state, action);
    case CUSTOMER_EDITING_SAVE_SUCCESS:
      return applySaveSuccess(state, action);
    case CUSTOMER_EDITING_SAVE_ERROR:
      return applyEditingSaveError(state, action);
    case CUSTOMER_REMOVE_REQUEST:
      return applyRemoveRequest(state, action);
    case CUSTOMER_REMOVE_SUCCESS:
      return applyRemoveSuccess(state, action);
    case CUSTOMER_REMOVE_ERROR:
      return applyRemoveError(state, action);
    case CUSTOMER_DELETE_MANY_REQUEST:
      return applyDeleteManyRequest(state, action);
    case CUSTOMER_DELETE_MANY_SUCCESS:
      return applyDeleteManySuccess(state, action.payload);
    case CUSTOMER_DELETE_MANY_ERROR:
      return applyDeleteManyError(state, action);
    case CUSTOMER_UPDATE_SELECTED_ROW_KEYS:
      return applySelectRows(state, action);
    case CUSTOMER_SAVE_LOCALLY:
      return applySaveLocally(state, action);
    case CUSTOMER_SORTS_UPDATE:
      const sorts =
        Object.keys(action.payload).length > 0
          ? action.payload
          : defaultSortQuery;
      return Object.assign({}, state, {
        isLoading: true,
        sorts,
      });
    case `TASK_EDITING_START`:
      return {
        ...state,
        editedRecord: { ...action.payload.customer },
      };
    case `TASK_EDITING_CANCEL`:
      return Object.assign({}, state, {
        isEditing: false,
        editingId: "",
        editedRecord: {},
      });
    case `${entityName}_CLEAR_EDITED_RECORD`:
      return {
        ...state,
        editedRecord: {},
      };
    case `${entityName}_TOGGLE_IMPORT_MODAL`:
      return {
        ...state,
        importFormVisible: !state.importFormVisible,
      };
    case `${entityName}_IMPORT_FILE_LIST_UPDATE`:
      return {
        ...state,
        importFileList: action.payload,
      };
    case `${entityName}_IMPORT_SUCCESS`:
      return {
        ...state,
        importFormVisible: false,
        importFileList: [],
      };
    case "LOGOUT_SUCCESS":
      return initialState;
    default:
      return state;
  }
};

export default baseReducer;

function* paginate() {
  while (true) {
    const {
      payload: {
        pageSize = 25,
        pageNumber = 1,
        filtersNotApplied = false,
        query,
      },
    } = yield take(CUSTOMER_PAGE_CHANGE);
    try {
      let params = {
        $skip: (pageNumber - 1) * pageSize,
        $limit: pageSize,
        filtersNotApplied,
      };

      if (query) {
        params = Object.assign(params, query);
      }

      yield put(doFetchCustomersRequest(params));
    } catch (error) {
      // do nothing
    }
  }
}

function* find() {
  while (true) {
    const { payload } = yield take(CUSTOMER_FETCH_REQUEST);
    const { pageSize = 25, currentPage = 1, sorts = {} } = yield select(
      (state) => state.customers,
    );
    try {
      let pagination = {
        $skip: (currentPage - 1) * pageSize,
        $limit: pageSize,
      };
      const { filtersNotApplied = false, searchTerm = "", ...query } = payload;
      let elasticQuery = {};
      if (searchTerm) {
        elasticQuery = {
          $multi_match: { $query: searchTerm },
        };
      }

      const response = yield call([CustomerService, CustomerService.find], {
        query: { ...query, ...pagination, ...elasticQuery, $sort: sorts },
      });

      yield put({
        type: CUSTOMER_INITIAL_FETCH,
        payload: {
          ...response,
          isEmpty: (response?.total || 0) === 0 && filtersNotApplied,
          filtersNotApplied,
        },
      });
    } catch (error) {
      logger.error("Error in fetching customers: ", error);
    }
  }
}

function* create() {
  while (true) {
    let { payload } = yield take(CUSTOMER_EDITING_END);
    payload.fields = payload.fields || {};

    if (Object.keys(payload.fields).length > 0) {
      const firm = yield select((state) => state.firm.data);
      const firmCustomFields = path("forms.customers", firm) || [];

      let completeFields = [];
      for (let fieldId in payload.fields) {
        let field = firmCustomFields.find((item) => item._id === fieldId);
        if (field) {
          completeFields.push({
            ...field,
            value: payload.fields[fieldId],
          });
        }
      }

      payload.fields = completeFields;
    }

    let response;

    if (payload._id) {
      try {
        response = yield call(
          [CustomerService, CustomerService.patch],
          payload._id,
          payload,
        );

        mixpanel.track("Customer updated", {
          _id: response._id,
        });

        yield put(doCustomerEditingSaveSuccess(response));
        yield call(
          [Notify, Notify.updateSuccess],
          response.businessName || response.contactPerson || "Customer",
        );
      } catch (error) {
        yield call([Notify, Notify.updateError], "Customer");
        yield put(doCustomerEditingSaveError(error));
      }
    } else {
      try {
        response = yield call(
          [CustomerService, CustomerService.create],
          payload,
        );

        mixpanel.track("Customer created", {
          _id: response._id,
        });

        yield put(doCustomerEditingSaveSuccess(response));
        yield call(
          [Notify, Notify.createSuccess],
          response.businessName || response.contactPerson || "Customer",
        );

        const needNewCustomer = yield select(
          (state) =>
            state.requests.isEditing ||
            state.estimates.isEditing ||
            state.invoices.isEditing,
        );
        if (needNewCustomer) {
          yield put(newCustomerCreated(response));
        }
      } catch (error) {
        yield call([Notify, Notify.createError], "Customer");
        yield put(doCustomerEditingSaveSuccess());
      }
    }
  }
}

function* remove() {
  while (true) {
    try {
      const { payload } = yield take(CUSTOMER_REMOVE_REQUEST);

      const response = yield call(
        [CustomerService, CustomerService.remove],
        payload._id,
      );

      mixpanel.track("Customer removed", {
        _id: response._id,
      });

      yield call(
        [Notify, Notify.removeSuccess],
        response.businessName || response.contactPerson || "Customer",
      );
      yield put(doCustomerDeleteSuccess(response));
    } catch (error) {
      yield call([Notify, Notify.removeError], "Customer");
      yield put(doCustomerDeleteError(error));
    }
  }
}

function* deleteMany() {
  while (true) {
    const { payload } = yield take(CUSTOMER_DELETE_MANY_REQUEST);
    const { selectedRowKeys, totalCustomers, pageSize, pageNumber } = payload;

    message.loading({
      content: `${i18next.t("bulkActions.deleting")} ${
        selectedRowKeys.length
      } ${i18next.t("bulkActions.records")}`,
      key: "deletingCustomers",
    });

    try {
      const response = yield call(
        [CustomerService, CustomerService.remove],
        null,
        { query: { _id: { $in: selectedRowKeys } } },
      );

      mixpanel.track("Customer remove many", {
        customerIds: Array.isArray(response)
          ? response.map((item) => item._id)
          : null,
      });

      yield put(doCustomerDeleteManySuccess(response));
      if (totalCustomers <= selectedRowKeys.length) {
        yield put(
          doHandlePageUpdate({
            pageNumber: pageNumber > 1 ? pageNumber - 1 : pageNumber,
            pageSize,
            filtersNotApplied: false,
          }),
        );
      } else {
        yield put(
          doHandlePageUpdate({
            pageNumber,
            pageSize,
            filtersNotApplied: false,
          }),
        );
      }
    } catch (error) {
      // console.log("Error: ", error);
    }
  }
}

function* importFiles() {
  while (true) {
    const {
      payload: { files },
    } = yield take(CUSTOMER_IMPORT_REQUEST);

    try {
      const response = yield call(
        [ImportCustomerService, ImportCustomerService.create],
        {
          files,
        },
      );
      mixpanel.track("Customer import", {
        customerIds: Array.isArray(response)
          ? response.map((item) => item._id)
          : null,
      });
      yield put(doCustomersImportSuccess());
      message.success(`Your data will be imported shortly`);
    } catch (error) {
      yield put(doCustomersImportError(error));
    }
  }
}

export function* customerSagas() {
  yield all([
    paginate(),
    find(),
    create(),
    remove(),
    deleteMany(),
    importFiles(),
  ]);
}
