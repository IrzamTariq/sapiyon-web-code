export function applyInitialFetch(state, action) {
  const { payload } = action;
  if (!payload) {
    return state;
  }
  const { data, ...rest } = payload;
  const byIds = data.reduce((prev, cur) => {
    return Object.assign({}, prev, { [cur._id]: cur });
  }, {});

  const allIds = Object.keys(byIds);

  return Object.assign({}, state, {
    allIds,
    byIds,
    isLoading: false,
    ...rest,
  });
}

export function applyFetchMoreSuccess(state, action) {
  const { payload } = action;
  if (!payload) {
    return state;
  }
  const entities = payload.data.reduce((prev, cur) => {
    return Object.assign({}, prev, { [cur._id]: cur });
  }, state.byIds);

  const byIds = entities;
  const allIds = Object.keys(byIds);

  return Object.assign({}, state, {
    isLoading: false,
    total: payload.total,
    skip: payload.skip,
    limit: payload.limit,
    allIds,
    byIds,
  });
}

export function applyCreated(state, action) {
  const { payload } = action;
  return {
    ...state,
    byIds: Object.assign({ [payload._id]: payload }, state.byIds),
    allIds: [payload._id, ...state.allIds],
    total: (state?.allIds?.length || 0) + 1,
    isEmpty: false,
  };
}

export function applyPatched(state, action) {
  const { payload } = action;

  let allIds = state.allIds;
  if (!allIds.includes(payload._id)) {
    allIds.unshift(payload._id);
  }

  return {
    ...state,
    byIds: Object.assign({}, state.byIds, { [payload._id]: payload }),
    allIds,
    editedRecord: state.isEditing ? payload : undefined,
  };
}

export function applyRemoved(state, action) {
  const { payload } = action;
  const { filtersNotApplied = false } = state;

  const { [payload._id]: omit, ...byIds } = state.byIds;
  const allIds = state.allIds.filter((_id) => _id !== payload._id);
  const total = (state?.total || 0) > 0 ? (state?.total || 0) - 1 : 0;

  return {
    ...state,
    byIds,
    allIds,
    total,
    isEmpty: total === 0 && filtersNotApplied,
  };
}

export function applyEditingStart(state, { payload }) {
  return {
    ...state,
    isEditing: true,
    error: null,
    editedRecord: payload,
    changes: { _id: payload._id },
  };
}

export function applyEditingCancel(state) {
  return {
    ...state,
    isEditing: false,
    error: null,
    changes: {},
    editedRecord: {},
    editingId: "",
  };
}

export function applyEditingEnd(state, action) {
  return {
    ...state,
    isEditing: false,
    error: null,
    editedRecord: Object.assign({}, state.editedRecord, action.payload),
  };
}

export function applyEditingSaveRequest(state, action) {
  return {
    ...state,
    isLoading: true,
    isEditing: false,
    error: null,
  };
}

export function applyEditingSaveError(state, action) {
  return {
    ...state,
    isEditing: true,
    isLoading: false,
    error: action.payload,
  };
}

export function applyEditingSaveSuccess(state, action) {
  return {
    ...state,
    isEditing: false,
    isLoading: false,
    error: null,
    editedRecord: null,
  };
}

export function applyRemoveRequest(state, action) {
  return {
    ...state,
    isRemoving: true,
    error: null,
  };
}

export function applyRemoveSuccess(state, action) {
  const { [action.payload._id]: omit, ...byIds } = state.byIds;
  const allIds = state.allIds.filter((id) => id !== action.payload._id);
  const total = (state?.total || 0) > 0 ? (state?.total || 0) - 1 : 0;

  return {
    ...state,
    byIds,
    allIds,
    total,
    isEmpty: total === 0 && state.filtersNotApplied,
    isRemoving: false,
    error: null,
  };
}

export function applyRemoveError(state, action) {
  return {
    ...state,
    isRemoving: false,
    error: action.payload,
  };
}

export function applyGetSuccess(state, action) {
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
}

export function applyDeleteManyRequest(state, action) {
  return {
    ...state,
    isRemoving: true,
    error: null,
  };
}

export function applyDeleteManySuccess(state, action) {
  return {
    ...state,
    isRemoving: false,
    error: null,
    selectedRowKeys: [],
  };
}

export function applyDeleteManyError(state, action) {
  return {
    ...state,
    isRemoving: false,
    error: action.payload,
  };
}

export function applySelectRows(state, action) {
  return {
    ...state,
    selectedRowKeys: action.payload.selectedRowKeys,
  };
}
