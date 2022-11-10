import { TaskFilters } from "./TaskFiltersFormProps";

const areFiltersEmpty = (filters: TaskFilters) => {
  const {
    unassigned,
    unscheduled,
    isRecurring,
    recurringTasks,
    fields,
    ...restFilters
  } = filters;
  let restFiltersEmpty =
    Object.values(restFilters).filter((query = "") => query?.length).length ===
    0;

  let customFieldsFilterEmpty =
    !fields ||
    !Array.isArray(fields) ||
    fields.filter(({ value }) => {
      let result = false;
      if (value) {
        result = value.toString().trim().length > 0;
      }
      return result;
    }).length === 0;

  return (
    restFiltersEmpty &&
    customFieldsFilterEmpty &&
    !unassigned &&
    !unscheduled &&
    !isRecurring &&
    !recurringTasks
  );
};

export default areFiltersEmpty;
