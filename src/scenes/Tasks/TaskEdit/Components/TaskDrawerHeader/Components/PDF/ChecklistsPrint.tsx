import { Checkbox, Table } from "antd";
import React from "react";
import { Checklist } from "types";

interface ChecklistsPrintProps {
  checklists: Checklist[];
}

const columns = [
  {
    dataIndex: "isDone",
    render: (isDone: boolean) => <Checkbox checked={isDone} />,
    width: 20,
  },
  { dataIndex: "title" },
];

const ChecklistsPrint = ({ checklists }: ChecklistsPrintProps) => {
  return (
    <div>
      {checklists.map((checklist) => (
        <>
          <div className="tw-flex tw-justify-around tw-bg-gray-400 tw-uppercase tw-text-xs s-std-text s-semibold tw-py-1 tw-mt-4">
            <span>{checklist.title}</span>
          </div>
          <Table
            showHeader={false}
            columns={columns}
            dataSource={checklist.items}
            size="small"
            pagination={false}
          />
        </>
      ))}
    </div>
  );
};

export default ChecklistsPrint;
