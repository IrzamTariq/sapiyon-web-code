import { put, call } from "redux-saga/effects";

export default function* initialFetchSaga(service, entityName, initQuery = {}) {
  let query = { $limit: 50, $sort: { createdAt: -1 }, ...initQuery };

  try {
    const payload = yield call([service, service.find], {
      query,
    });
    yield put({ type: `${entityName}_INITIAL_FETCH`, payload });
  } catch (error) {
    yield put({ type: `${entityName}_INITIAL_FETCH_ERROR`, payload: error });
  }
}
