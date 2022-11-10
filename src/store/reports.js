import { all, call, put, take } from "@redux-saga/core/effects";
import { message } from "antd";
import i18next from "i18next";
import logger from "logger";
import moment from "moment";
import { path } from "rambdax";

import { getTaskStatusLabelForReports } from "../components/reports/utils";
import {
  CustomerService,
  StockItemService,
  StockTransactionService,
  TaskService,
} from "../services";

const t_noDate = i18next.t("reports.noDate");
const t_unknown = i18next.t("reports.unknown");
const t_unAssigned = i18next.t("reports.unAssigned");

const REPORT_FETCH_REQUEST = "REPORT_FETCH_REQUEST";
export const doFetchReport = (payload) => {
  return { type: REPORT_FETCH_REQUEST, payload };
};

const TASK_BY_DATE_REPORT_FETCH_SUCCESS = "TASK_BY_DATE_REPORT_FETCH_SUCCESS";
const TASK_BY_STATUS_REPORT_FETCH_SUCCESS =
  "TASK_BY_STATUS_REPORT_FETCH_SUCCESS";
const TASK_BY_USER_REPORT_FETCH_SUCCESS = "TASK_BY_USER_REPORT_FETCH_SUCCESS";
const TASK_BY_CUSTOMER_REPORT_FETCH_SUCCESS =
  "TASK_BY_CUSTOMER_REPORT_FETCH_SUCCESS";
const CUSTOMER_LOCATION_REPORT_FETCHED = "CUSTOMER_LOCATION_REPORT_FETCHED";
const SERVICE_GENERAL_REPORT_FETCHED = "SERVICE_GENERAL_REPORT_FETCHED";
const SERIVCE_BY_DATE_REPORT_FETCHED = "SERIVCE_BY_DATE_REPORT_FETCHED";
const PRODUCT_GENERAL_REPORT_FETCHED = "PRODUCT_GENERAL_REPORT_FETCHED";
const PRODUCT_BY_DATE_REPORT_FETCHED = "PRODUCT_BY_DATE_REPORT_FETCHED";
const PRODUCT_BY_WAREHOUSE_REPORT_FETCHED =
  "PRODUCT_BY_WAREHOUSE_REPORT_FETCHED";

const initialReportState = {
  reportName: "",
  filters: {},
  isLoading: false,
};

export const reportsReducer = (state = initialReportState, action) => {
  switch (action.type) {
    case REPORT_FETCH_REQUEST:
      return applyFetchReports(state, action.payload);
    case TASK_BY_DATE_REPORT_FETCH_SUCCESS:
      return applyTaskByDateReportFetchSuccess(state, action.payload);
    case TASK_BY_STATUS_REPORT_FETCH_SUCCESS:
      return applyTaskbYStatusReportFetchSuccess(state, action.payload);
    case TASK_BY_USER_REPORT_FETCH_SUCCESS:
      return applyTaskByUserReportFetchSuccess(state, action.payload);
    case TASK_BY_CUSTOMER_REPORT_FETCH_SUCCESS:
      return applyTaskByCustomerReportFetchSuccess(state, action.payload);
    case CUSTOMER_LOCATION_REPORT_FETCHED:
      return applyCustomerLocationReportFetched(state, action.payload);
    case SERVICE_GENERAL_REPORT_FETCHED:
      return applyServiceGeneralReportFetched(state, action.payload);
    case SERIVCE_BY_DATE_REPORT_FETCHED:
      return applyServiceByDateReportFetched(state, action.payload);
    case PRODUCT_GENERAL_REPORT_FETCHED:
      return applyProductGeneralReportFetched(state, action.payload);
    case PRODUCT_BY_DATE_REPORT_FETCHED:
      return applyProductByDateReportFetched(state, action.payload);
    case PRODUCT_BY_WAREHOUSE_REPORT_FETCHED:
      return applyProductByWarehouseReportFetched(state, action.payload);
    case "LOGOUT_SUCCESS":
      return initialReportState;
    default:
      return state;
  }
};
export default reportsReducer;

const applyFetchReports = (state, payload) => {
  const newReport = { isLoading: true, ...payload };
  return Object.assign({}, newReport);
};

const applyTaskByDateReportFetchSuccess = (state, payload) => {
  const data = payload.reduce(
    (acc, curr) =>
      acc.concat({
        date: curr.month
          ? moment(curr.month, "MM").format("MMMM") + ` ${curr.year}`
          : t_noDate,
        count: curr.count,
      }),
    [],
  );

  const newReport = { data, isLoading: false };
  return Object.assign({}, state, newReport);
};

const applyTaskbYStatusReportFetchSuccess = (state, payload) => {
  let statuses = [];
  let x_axis = [];

  const statistics = payload.reduce((acc, curr) => {
    const date = curr.month
      ? `${moment(curr.month, "M").format("MMM")} ${curr.year}`
      : t_noDate;
    const status = getTaskStatusLabelForReports(curr.status);
    const record = { date, [status]: curr.count };
    // if (!x_axis.includes(date)) {
    //   x_axis = x_axis.concat(date);
    // }

    if (!statuses.includes(status)) {
      statuses = statuses.concat(status);
    }

    if (acc.hasOwnProperty(date)) {
      return { ...acc, [date]: { ...acc[date], ...record } };
    } else {
      return { ...acc, [date]: record };
    }
  }, {});

  const newReports = {
    data: { statistics: Object.values(statistics), x_axis, statuses },
    isLoading: false,
  };
  return Object.assign({}, state, newReports);
};

const applyTaskByUserReportFetchSuccess = (state, payload) => {
  let users = {};
  const statistics = payload.reduce((acc, curr) => {
    const date = curr.month
      ? `${moment(curr.month, "M").format("MMM")} ${curr.year}`
      : t_noDate;

    const userId = curr.assigneeId ? curr.assigneeId : t_unAssigned;
    let userName = "";
    if (curr.assigneeId) {
      userName = curr.assignee
        ? curr.assignee.fullName || t_unknown
        : t_unknown;
    } else {
      userName = t_unAssigned;
    }

    if (!users.hasOwnProperty(userId)) {
      users = { ...users, [userId]: { _id: userId, name: userName } };
    }

    return {
      ...acc,
      [date]: {
        ...(acc[date] || {}),
        date,
        [userId]: curr.count,
      },
    };
  }, {});

  const newReport = { data: { statistics, users }, isLoading: false };
  return Object.assign({}, state, newReport);
};

const applyTaskByCustomerReportFetchSuccess = (state, payload) => {
  let x_axis = [];
  let customerIds = [];
  const statistics = payload.reduce((acc, curr) => {
    const date = curr.month
      ? `${moment(curr.month, "M").format("MMM")} ${curr.year}`
      : t_noDate;
    const customerId = curr.customerId ? curr.customerId : t_unAssigned;
    const customerName =
      path("customer.businessName", curr) ||
      path("customer.contactPerson", curr) ||
      t_unAssigned;
    if (!customerIds.includes(customerId)) {
      customerIds = customerIds.concat(customerId);
    }
    if (!x_axis.includes(date)) {
      x_axis = x_axis.concat(date);
    }
    const tableRecord = { [date]: curr.count };
    if (acc.hasOwnProperty(customerId)) {
      return {
        ...acc,
        [customerId]: {
          name: customerName,
          // chartData: [...acc[customerId].chartData, chartRecord],
          tableData: { ...acc[customerId].tableData, ...tableRecord },
        },
      };
    } else {
      return {
        ...acc,
        [customerId]: {
          name: customerName,
          // chartData: [chartRecord],
          tableData: tableRecord,
        },
      };
    }
  }, {});
  const newReport = {
    data: { statistics, x_axis, customerIds },
    isLoading: false,
  };
  logger.log("Report: ", newReport);
  return Object.assign({}, state, newReport);
};

const applyCustomerLocationReportFetched = (state, payload) => {
  let unknownCityCount = 0;
  let unknownStateCount = 0;
  let byCities = [];
  let byStates = [];

  payload.forEach((location) => {
    const city = location.city ? location.city : t_unknown;
    const locState = location.state ? location.state : t_unknown;
    const count = +location.count;

    if (city === t_unknown) {
      unknownCityCount += count;
    } else {
      byCities.push({ city, customers: count });
    }

    if (locState === t_unknown) {
      unknownStateCount += count;
    } else {
      const index = byStates.findIndex((st) => st.locState === locState);
      if (index >= 0) {
        byStates[index] = {
          locState,
          customers: byStates[index].customers + count,
        };
      } else {
        byStates.push({ locState, customers: count });
      }
    }
  });

  if (unknownCityCount > 0) {
    byCities.push({ city: t_unknown, customers: unknownCityCount });
  }
  if (unknownStateCount > 0) {
    byStates.push({ locState: t_unknown, customers: unknownStateCount });
  }

  const reports = { byCities, byStates };
  return Object.assign({}, state, reports, { isLoading: false });
};

const applyServiceGeneralReportFetched = (state, payload) => {
  let graphData = [];

  graphData = payload.reduce((accu, curr) => {
    return accu.concat({ service: curr.item.title, count: curr.count });
  }, []);

  const reports = { data: graphData };
  return Object.assign({}, state, reports, { isLoading: false });
};

const applyServiceByDateReportFetched = (state, payload) => {
  let graphData = [];

  payload.forEach((item) => {
    const date = item.month
      ? moment(`${item.month} ${item.year}`, "MM YYYY").format("MMMM YYYY")
      : t_noDate;
    const count = +item.count;

    const index = graphData.findIndex((data) => data.date === date);
    if (index >= 0) {
      graphData[index] = { date, count: graphData[index].count + count };
    } else {
      graphData.push({ date, count });
    }
  });

  const reports = { data: graphData };
  return Object.assign({}, state, reports, { isLoading: false });
};

const applyProductGeneralReportFetched = (state, payload) => {
  let graphData = [];

  graphData = payload.reduce((accu, curr) => {
    return accu.concat({ product: curr.item.title, count: curr.count });
  }, []);

  const reports = { data: graphData };
  return Object.assign({}, state, reports, { isLoading: false });
};

const applyProductByDateReportFetched = (state, payload) => {
  let graphData = [];

  payload.forEach((item) => {
    const date = item.month
      ? moment(`${item.month} ${item.year}`, "MM YYYY").format("MMMM YYYY")
      : t_noDate;
    const count = +item.count;

    const index = graphData.findIndex((data) => data.date === date);
    if (index >= 0) {
      graphData[index] = { date, count: graphData[index].count + count };
    } else {
      graphData.push({ date, count });
    }
  });

  const reports = { data: graphData };
  return Object.assign({}, state, reports, { isLoading: false });
};

const applyProductByWarehouseReportFetched = (
  state,
  { report: payload, defaultRecord } = {},
) => {
  let graphData = [];

  graphData = (payload || []).reduce((accu, curr) => {
    return accu.concat({ warehouse: curr.fromBin.title, count: curr.count });
  }, []);

  const reports = { warehouseData: graphData };
  return Object.assign({}, state, reports, { isLoading: false, defaultRecord });
};

function* find() {
  while (true) {
    const { payload: qry } = yield take(REPORT_FETCH_REQUEST);
    let { filters, ...rest } = qry;
    const { endAt, productId } = filters;
    filters = {};
    if (endAt && endAt.length === 2) {
      filters = Object.assign(
        {},
        {
          endAt: { $gte: endAt[0], $lte: endAt[1] },
        },
      );
    }

    if (productId && productId.length > 0) {
      filters = Object.assign({}, { productId });
    }

    const query = { ...rest, ...filters };
    let response;
    try {
      switch (query.reportName) {
        case "CustomerByLocation":
          response = yield call([CustomerService, CustomerService.find], {
            query,
          });
          break;
        case "TaskByDate":
        case "TaskByStatus":
        case "TaskByUser":
        case "TaskByCustomer":
        case "StockServiceGeneral":
        case "StockServiceByDate":
        case "StockProductGeneral":
        case "StockProductByDate":
          response = yield call([TaskService, TaskService.find], {
            query,
          });
          break;
        case "StockProductSoldByDepo":
          if (!query.productId) {
            const product = yield call(
              [StockItemService, StockItemService.find],
              {
                query: { $limit: 1, type: "product" },
              },
            );
            if (product && (product.data || []).length >= 1) {
              const newQuery = {
                ...query,
                productId: product.data[0]._id,
              };
              response = yield call(
                [StockTransactionService, StockTransactionService.find],
                {
                  query: newQuery,
                },
              );
              response = { report: response, defaultRecord: product.data[0] };
            }
          } else {
            response = yield call(
              [StockTransactionService, StockTransactionService.find],
              {
                query,
              },
            );
            response = { report: response };
          }
          break;
        default:
        // console.log("ERROR!: requested report does not exist!");
      }

      switch (query.reportName) {
        case "TaskByDate":
          yield put({
            type: TASK_BY_DATE_REPORT_FETCH_SUCCESS,
            payload: response,
          });
          break;
        case "TaskByStatus":
          yield put({
            type: TASK_BY_STATUS_REPORT_FETCH_SUCCESS,
            payload: response,
          });
          break;
        case "TaskByUser":
          yield put({
            type: TASK_BY_USER_REPORT_FETCH_SUCCESS,
            payload: response,
          });
          break;
        case "TaskByCustomer":
          yield put({
            type: TASK_BY_CUSTOMER_REPORT_FETCH_SUCCESS,
            payload: response,
          });
          break;
        case "CustomerByLocation":
          yield put({
            type: CUSTOMER_LOCATION_REPORT_FETCHED,
            payload: response,
          });
          break;
        case "StockServiceGeneral":
          yield put({
            type: SERVICE_GENERAL_REPORT_FETCHED,
            payload: response,
          });
          break;
        case "StockServiceByDate":
          yield put({
            type: SERIVCE_BY_DATE_REPORT_FETCHED,
            payload: response,
          });
          break;
        case "StockProductGeneral":
          yield put({
            type: PRODUCT_GENERAL_REPORT_FETCHED,
            payload: response,
          });
          break;
        case "StockProductByDate":
          yield put({
            type: PRODUCT_BY_DATE_REPORT_FETCHED,
            payload: response,
          });
          break;
        case "StockProductSoldByDepo":
          yield put({
            type: PRODUCT_BY_WAREHOUSE_REPORT_FETCHED,
            payload: response,
          });
          break;
        default:
        // console.log("Error: Invalid report name!");
      }
    } catch (error) {
      message.error(i18next.t("reports.cantFetch"));
      // console.log(error);
    }
  }
}

export function* reportsSagas() {
  yield all([find()]);
}
