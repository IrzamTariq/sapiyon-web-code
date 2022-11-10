import { all, call, put, select, take } from "@redux-saga/core/effects";
import { message } from "antd";
import i18next from "i18next";
import moment from "moment";
import { path } from "rambdax";
import { mapFormFieldValuesToCustomFields } from "utils/helpers";

import { TaskService } from "../services";

// Constants
const FEEDBACK_PAGE_CHANGE = "FEEDBACK_PAGE_CHANGE";
export function doFeedbackPageChange(payload) {
  return { type: FEEDBACK_PAGE_CHANGE, payload };
}
function applyPageChange(state, { payload }) {
  const { pageNumber = 1, pageSize = 25 } = payload;
  return {
    ...state,
    currentPage: pageNumber,
    pageSize,
    isLoading: true,
  };
}

const FEEDBACK_TASK_FETCH_REQUEST = "FEEDBACK_TASK_FETCH_REQUEST";
const FEEDBACK_TASK_FETCH_SUCCESS = "FEEDBACK_TASK_FETCH_SUCCESS";
const FEEDBACK_TASK_FETCH_ERROR = "FEEDBACK_TASK_FETCH_ERROR";
export const doFetchFeedbackTasks = (payload) => {
  return { type: FEEDBACK_TASK_FETCH_REQUEST, payload };
};
export const doFetchFeedbackTasksSuccess = (payload) => {
  return { type: FEEDBACK_TASK_FETCH_SUCCESS, payload };
};
export const doFetchFeedbackTasksError = (payload) => {
  return { type: FEEDBACK_TASK_FETCH_ERROR, payload };
};

// Action creators
const FEEDBACK_TASK_UPDATE_REQUEST = "FEEDBACK_TASK_UPDATE_REQUEST";
const FEEDBACK_TASK_UPDATE_SUCCESS = "FEEDBACK_TASK_UPDATE_SUCCESS";
export const doUpdateFeedback = (payload) => {
  return { type: FEEDBACK_TASK_UPDATE_REQUEST, payload };
};

// Initial state
const initialState = {
  byIds: {},
  allIds: [],
  isLoading: false,
  isEmpty: false,

  total: 0,
  pageSize: 25,
  currentPage: 1,
};

// Reducer

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FEEDBACK_TASK_FETCH_REQUEST:
      return Object.assign({}, state, { isLoading: true });
    case FEEDBACK_TASK_FETCH_SUCCESS:
      return applyFeedbackTaskFetchSuccess(state, action);
    case FEEDBACK_TASK_UPDATE_SUCCESS:
      return applyFeedbackUpdateSuccess(state, action);
    case FEEDBACK_PAGE_CHANGE:
      return applyPageChange(state, action);
    case "LOGOUT_SUCCESS":
      return initialState;
    default:
      return state;
  }
};
export default reducer;

// Reducer helpers
const applyFeedbackTaskFetchSuccess = (state, { payload }) => {
  const { data, ...rest } = payload;

  const byIds = (data || []).reduce(
    (acc, curr) => ({
      ...acc,
      [curr._id]: curr,
    }),
    {},
  );
  const allIds = Object.keys(byIds);
  return Object.assign({}, state, {
    isLoading: false,
    allIds,
    byIds,
    ...rest,
  });
};

const applyFeedbackUpdateSuccess = (state, { payload }) => {
  const byIds = { ...state.byIds, [payload._id]: payload };
  const allIds = Object.values(byIds);
  return Object.assign({}, state, { byIds, allIds });
};

// Sagas
function* pagination() {
  while (true) {
    yield take([FEEDBACK_PAGE_CHANGE]);
    yield put(doFetchFeedbackTasks());
  }
}

function* find() {
  while (true) {
    yield take(FEEDBACK_TASK_FETCH_REQUEST);

    const { pageSize, currentPage } = yield select((state) => state.feedback);
    const appliedFilters = yield select(
      (state) => state.feedbackFilters.applied,
    );

    let { assigneeIds = [], customerIds = [], rating, endAt = [] } =
      appliedFilters || {};

    let query = {};

    if (assigneeIds.length) {
      query = Object.assign({}, query, {
        assigneeIds: { $in: assigneeIds },
      });
    }

    if (customerIds.length) {
      query = Object.assign({}, query, {
        customerId: { $in: customerIds },
      });
    }

    rating = (rating || "").toLowerCase();
    if (["promoters", "passives", "detractors"].includes(rating)) {
      let range = [];
      if (rating === "detractors") {
        range = { $gte: 0, $lt: 7 };
      } else if (rating === "passives") {
        range = { $gte: 7, $lt: 9 };
      } else {
        range = { $gte: 9, $lte: 10 };
      }
      query = Object.assign({}, query, {
        "completionFeedbackByCustomer.rating": range,
      });
    }

    if (endAt.length === 2) {
      query = Object.assign({}, query, {
        endAt: {
          $gte: moment(endAt[0]).startOf("day"),
          $lte: moment(endAt[1]).endOf("day"),
        },
      });
    }

    const filtersNotApplied = Object.keys(query).length === 0;

    query = Object.assign({}, query, {
      feedbackTasks: true,
    });

    let pagination = {
      $skip: (currentPage - 1) * pageSize,
      $limit: pageSize,
    };

    query = {
      ...query,
      ...pagination,
      $sort: { endAt: -1 },
    };

    try {
      const response = yield call([TaskService, TaskService.find], {
        query,
      });

      yield put(
        doFetchFeedbackTasksSuccess({
          ...response,
          isEmpty: (response?.total || 0) === 0 && filtersNotApplied,
        }),
      );
    } catch (error) {
      // for now just ignore
      // TODO: show message with appropriate reason
    }
  }
}

function* update() {
  while (true) {
    const { payload } = yield take(FEEDBACK_TASK_UPDATE_REQUEST);
    let formFields = path("completionFeedbackByCustomer.fields", payload) || {};
    payload.completionFeedbackByCustomer.fields =
      path("completionFeedbackByCustomer.fields", payload) || {};

    if (Object.keys(formFields).length > 0) {
      const firm = yield select((state) => state.firm.data);
      const firmCustomFields = path("forms.taskCustomerFeedback", firm) || [];

      payload.completionFeedbackByCustomer.fields = mapFormFieldValuesToCustomFields(
        firmCustomFields,
        formFields,
      );
    } else {
      delete payload.completionFeedbackByCustomer.fields;
    }

    payload.completionFeedbackByCustomer.receivedAt = new Date();
    try {
      const response = yield call(
        [TaskService, TaskService.patch],
        payload._id,
        payload,
      );
      yield put({ type: FEEDBACK_TASK_UPDATE_SUCCESS, payload: response });
    } catch (error) {
      message.error(i18next.t("feedbackEdit.cantSaveFeedback"));
      // console.log(error);
    }
  }
}

// root Saga
export function* feedbackSaga() {
  yield all([pagination(), find(), update()]);
}
