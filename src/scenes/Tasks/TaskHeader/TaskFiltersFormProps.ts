import moment from "moment";

export interface CustomFieldFilter {
  _id: string;
  value: string;
}

export interface CustomFieldFiterDictionary {
  [index: string]: string;
}

export interface TaskFilters {
  endAt?: moment.Moment[];
  searchTerm?: string;
  assigneeIds?: Array<string>;
  statusIds?: Array<string>;
  unscheduled?: boolean;
  unassigned?: boolean;

  state?: string;
  city?: string;
  fields?: Array<CustomFieldFilter>;
  recurringTasks?: boolean;
  subTasks?: boolean;
  isRecurring: boolean;
}

export interface TaskFiltersFormProps {
  filters: TaskFilters;
  appliedFilters: TaskFilters;
  showRangePicker?: boolean;

  clearFilters: Function;
  applyFilters: Function;
}
