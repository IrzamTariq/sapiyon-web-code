import moment, { Moment } from "moment";

export interface AssigneeTaskRanking {
  assignee: {
    fullName: string;
  };
  assignedCount: number;
  completedCount: number;
  cancelledCount: number;
  assigneeId: string;
  percentage: number;
  rank: number;
}

export interface AssigneeByEarnings {
  assigneeId: string;
  assignee: {
    fullName: string;
  };

  debit: number;
}

export interface NPSReport {
  score: number;
  totalResponses: number;

  promotersCount: number;
  promotersPercentage: number;
  detractorsCount: number;
  detractorsPercentage: number;
  passivesCount: number;
  passivesPercentage: number;
}

export function getPeriodFilterQuery(period = [] as Moment[]) {
  let result = {};
  if (Array.isArray(period) && period.length === 2) {
    result = {
      endAt: {
        $gte: moment(period[0]).startOf("day"),
        $lte: moment(period[1]).endOf("day"),
      },
    };
  }
  return result;
}

export const defaultDashboardRange = [
  moment().startOf("week"),
  moment().endOf("week"),
];
