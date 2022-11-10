import { SettingOutlined } from "@ant-design/icons";
import { Collapse, Dropdown, Input, Menu, Popconfirm, Progress } from "antd";
import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";

import { Checklist, ChecklistItem } from "../../../../../../types";
import { getRandomAlphaNumericString } from "../../../../../../utils/helpers";
import {
  ChecklistsQuery,
  getChecklistProgress,
  queryMaker,
} from "../../../../helpers";
import ItemsTable from "./ItemsTable";

interface ChecklistsViewProps extends WithTranslation {
  checklists: Checklist[];
  editingId: string;
  updatedName: string;
  updateState: (change: { editingId?: string; updatedName?: string }) => void;
  updateChecklist: (
    docId: string,
    data: Checklist,
    query: ChecklistsQuery,
  ) => void;
  removeChecklist: (bucketId: string, query: ChecklistsQuery) => void;
  addChecklistItem: (data: ChecklistItem, query: ChecklistsQuery) => void;
  updateChecklistItem: (
    docId: string,
    data: ChecklistItem,
    query: ChecklistsQuery,
  ) => void;
  removeChecklistItem: (docId: string, query: ChecklistsQuery) => void;
}

const ChecklistsView = ({
  t,
  editingId,
  updatedName,
  updateState,
  checklists,
  updateChecklist,
  removeChecklist,
  addChecklistItem,
  updateChecklistItem,
  removeChecklistItem,
}: ChecklistsViewProps) => {
  return (
    <div className="tw-my-10">
      <div className="tw-flex tw-items-center tw-mb-4">
        <h1 className="tw-text-dark tw-text-xl">{t("checklists.pageTitle")}</h1>
      </div>
      <Collapse accordion>
        {checklists.map((checklist) => {
          const progress = getChecklistProgress(checklist.items);
          const { bucketId: docId, _id: checklistId } = checklist;
          return (
            <Collapse.Panel
              style={{
                backgroundImage: `linear-gradient(to right, #b6ff567d ${progress}%, transparent ${progress}%)`,
              }}
              className="subtask-item s-hover-parent"
              header={
                editingId !== checklist._id ? (
                  checklist.title
                ) : (
                  <Input
                    placeholder={t("checklists.enterName")}
                    className="tw-ml-1 tw-w-11/12"
                    autoFocus
                    value={updatedName}
                    onChange={(e) => {
                      const updatedName = e.target.value;
                      updateState({ updatedName });
                    }}
                    onBlur={(e) => {
                      const updatedName = e.target.value;
                      updateState({
                        updatedName,
                      });
                    }}
                    onPressEnter={(e) =>
                      updateChecklist(
                        docId,
                        {
                          title: updatedName,
                        } as Checklist,
                        queryMaker("updateChecklist", {
                          docId,
                          checklistId,
                        }),
                      )
                    }
                  />
                )
              }
              key={checklist._id || getRandomAlphaNumericString()}
              extra={
                <Dropdown
                  overlay={
                    <Menu>
                      <Menu.Item className="s-font-roboto">
                        <Popconfirm
                          title={t("checklists.confirmDelete")}
                          onConfirm={() =>
                            removeChecklist(
                              docId,
                              queryMaker("removeChecklist", { checklistId }),
                            )
                          }
                          okButtonProps={{ danger: true }}
                          okText={t("global.delete")}
                          cancelText={t("global.cancel")}
                        >
                          <div className="tw-text-red-500">
                            {t("checklists.deleteChecklist")}
                          </div>
                        </Popconfirm>
                      </Menu.Item>
                      <Menu.Item
                        className="s-font-roboto"
                        onClick={() =>
                          updateState({
                            editingId: checklist._id || "",
                            updatedName: checklist.title,
                          })
                        }
                      >
                        {t("checklists.renameChecklist")}
                      </Menu.Item>
                    </Menu>
                  }
                  placement="bottomLeft"
                >
                  <SettingOutlined
                    className="s-text-gray s-hover-target"
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                  />
                </Dropdown>
              }
            >
              <Progress percent={progress} className="tw-my-4" />
              <ItemsTable
                items={checklist.items}
                selectAble={true}
                addItem={(item) =>
                  addChecklistItem(
                    item as ChecklistItem,
                    queryMaker("createChecklistItem", { docId, checklistId }),
                  )
                }
                updateItem={(item) =>
                  updateChecklistItem(
                    docId,
                    item as ChecklistItem,
                    queryMaker("updateChecklistItem", {
                      checklistId,
                      itemId: item._id,
                    }),
                  )
                }
                deleteItem={(itemId) =>
                  removeChecklistItem(
                    docId,
                    queryMaker("removeChecklistItem", {
                      checklistId,
                      itemId,
                    }),
                  )
                }
              />
            </Collapse.Panel>
          );
        })}
      </Collapse>
    </div>
  );
};

export default withTranslation()(ChecklistsView);
