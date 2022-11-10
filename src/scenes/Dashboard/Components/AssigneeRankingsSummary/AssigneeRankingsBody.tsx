import { Empty } from "antd";
import Table, { ColumnProps } from "antd/lib/table";
import React, { ReactNode, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";

import numberFormatter from "../../../../utils/helpers/numberFormatter";
import { getPaginationButtons } from "../../../Tasks/helpers";
import { AssigneeTaskRanking } from "../dashboard";

interface AssigneeRankingsBodyProps extends WithTranslation {
  data: Array<AssigneeTaskRanking>;
  isLoading: boolean;
}
interface ColInterface extends ColumnProps<AssigneeTaskRanking> {
  render?: (text: any, record: AssigneeTaskRanking, index: number) => ReactNode;
}

function AssigneeRankingsBody(props: AssigneeRankingsBodyProps) {
  const { t, data: raw, isLoading } = props;
  const [activePage, setActivePage] = useState(1);
  const data = raw.map((item, index) => ({ ...item, rank: index + 1 }));
  const total = data.length;

  let columns: ColInterface[] = [
    {
      dataIndex: ["assignee", "fullName"],
      title: t("assigneeRankings.assignee"),
      sorter: (a, b) =>
        a?.assignee?.fullName < b?.assignee?.fullName ? -1 : 1,
      render: (text) => (
        <div className="tw-truncate" style={{ maxWidth: "130px" }} title={text}>
          {text}
        </div>
      ),
    },
    {
      dataIndex: "assignedCount",
      title: t("assigneeRankings.assignedJobs"),
      sorter: (a, b) => (a.assignedCount < b.assignedCount ? -1 : 1),
      render: (text) => numberFormatter(text),
    },
    {
      dataIndex: "cancelledCount",
      title: t("assigneeRankings.cancelledJobs"),
      sorter: (a, b) => (a.cancelledCount < b.cancelledCount ? -1 : 1),
      render: (text) => numberFormatter(text),
    },
    {
      dataIndex: "completedCount",
      title: t("assigneeRankings.completedJobs"),
      sorter: (a, b) => (a.completedCount < b.completedCount ? -1 : 1),
      render: (text) => numberFormatter(text),
    },
    {
      dataIndex: "percentage",
      sorter: (a, b) => (a.percentage < b.percentage ? -1 : 1),
      title: t("assigneeRankings.percentage"),
      width: "100px",
      render: (text = 0) => `${text.toFixed(0)}%`,
    },
  ];

  columns = columns.map((col) => ({
    ...col,
    title: <span className="s-col-title">{col.title}</span>,
    onCell: () => ({ className: "s-table-text" }),
  }));

  return (
    <div className="tw-p-4">
      <Table
        columns={columns}
        rowKey={"assigneeId"}
        dataSource={data}
        pagination={{
          pageSize: 5,
          size: "small",
          style: { display: "block", textAlign: "center", float: "unset" },
          itemRender: (page, type) =>
            getPaginationButtons(
              page,
              type,
              activePage,
              activePage * 5 >= total,
              false,
            ),
          onChange: (page) => setActivePage(page),
          // hideOnSinglePage: true,
        }}
        loading={isLoading}
        scroll={{ x: true }}
        locale={{
          emptyText: <Empty description={t("tables.noData")} />,
        }}
      />
    </div>
  );
}

export default withTranslation()(AssigneeRankingsBody);
