import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { TaskStatus } from "../../../../types";
import numberFormatter from "../../../../utils/helpers/numberFormatter";

interface SingleCount extends TaskStatus {
  count: number;
  statusId: string;
}

interface TaskByStatusSummaryProps extends WithTranslation {
  report: SingleCount[];
}

const TaskByStatusSummary = ({ t, report }: TaskByStatusSummaryProps) => {
  return (
    <div
      style={{ height: "420px", overflow: "auto" }}
      className="tw-bg-white tw-p-6"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={report}
            dataKey="count"
            nameKey="title"
            cx="50%"
            cy="50%"
            outerRadius="70%"
            legendType="circle"
          >
            {report.map((count) => (
              <Cell key="statusId" fill={count.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            formatter={(value, entry) => (
              <div
                className="s-main-text-color s-main-font tw-inline-block tw-mb-2 tw-align-text-top"
                title={value}
              >
                <span
                  className="tw-inline-block tw-truncate"
                  style={{ maxWidth: "140px" }}
                >
                  {value}
                </span>
                <span className="tw-ml-2 tw-mr-6 tw-text-gray-600 tw-align-top">
                  :{" "}
                  {
                    // @ts-ignore
                    numberFormatter(entry?.payload?.count)
                  }
                </span>
              </div>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default withTranslation()(TaskByStatusSummary);
