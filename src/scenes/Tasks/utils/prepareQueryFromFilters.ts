import moment from "moment";

import { TaskFilters } from "../TaskHeader/TaskFiltersFormProps";

export default function prepareQueryFromFilters(filters = {} as TaskFilters) {
  let {
    searchTerm = "",
    assigneeIds = [],
    statusIds = [],
    endAt = [],
    state = "",
    city = "",
    fields = [],
    recurringTasks = false,
    isRecurring = false,
    subTasks = false,
    unscheduled,
    unassigned,
  } = filters;

  let result = {};

  if (searchTerm.length) {
    result = Object.assign({}, result, {
      $multi_match: { $query: searchTerm },
    });
  }

  if (assigneeIds.length) {
    assigneeIds = assigneeIds.map((item) => JSON.parse(item)._id);
    result = Object.assign({}, result, {
      assigneeIds: { $in: assigneeIds },
    });
  }

  if (unassigned) {
    result = Object.assign({}, result, {
      "assigneeIds.0": { $exists: false },
    });
  }

  if (statusIds.length) {
    const statuses = statusIds.map((item) => JSON.parse(item)._id);

    statusIds = statuses.filter(
      (item) => (item || "").substr(0, 9) !== "converted",
    );
    const isInvoiceCreated = statuses.includes("convertedToInvoice");

    if (!isInvoiceCreated) {
      result = Object.assign({}, result, { statusId: { $in: statusIds } });
    } else {
      result = Object.assign(
        {},
        result,
        statusIds.length > 0
          ? {
              $or: [{ statusId: { $in: statusIds } }, { isInvoiceCreated }],
            }
          : { isInvoiceCreated },
      );
    }
  }

  if (endAt && endAt.length === 2) {
    result = Object.assign({}, result, {
      endAt: {
        $gte: moment(endAt[0]).startOf("day"),
        $lte: moment(endAt[1]).endOf("day"),
      },
    });
  }

  if (unscheduled) {
    result = Object.assign({}, result, { endAt: null });
  }

  if (state.length) {
    result = Object.assign({}, result, {
      state,
    });
  }

  if (city.length) {
    result = Object.assign({}, result, {
      city,
    });
  }

  fields = fields.filter(({ value = "" }) => {
    let result = false;
    if (value) {
      result = value.toString().trim().length > 0;
    }
    return result;
  });

  result = Object.assign({}, result, {
    recurringTasks,
    ...(isRecurring ? { isRecurring } : {}),
    subTasks,
    fields,
  });

  return result;
}
