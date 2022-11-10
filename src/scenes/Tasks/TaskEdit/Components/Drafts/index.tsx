import { CheckOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import {
  Button,
  Divider,
  Empty,
  List,
  Modal,
  Popconfirm,
  Tooltip,
  message,
} from "antd";
import logger from "logger";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getPaginationButtons } from "scenes/Tasks/helpers";
import { TaskService } from "services";
import { PaginatedFeathersResponse, Task } from "types";
import RTE, { getRTEMarkup, getRTEText } from "utils/components/RTE/RTE";

interface TaskDraftsProps {
  visible: boolean;
  handleClose: () => void;
  utilizeDraft: (taskTitle: string) => void;
}

const defaultLimit = 25;

const TaskDrafts = ({
  visible,
  utilizeDraft,
  handleClose,
}: TaskDraftsProps) => {
  const [t] = useTranslation();
  const [drafts, setDrafts] = useState<PaginatedFeathersResponse<Task>>({
    data: [],
    limit: defaultLimit,
    skip: 0,
    total: 0,
  });
  const [state, setState] = useState({
    isLoading: false,
    rteState: { touched: false, value: "" },
    editedId: "",
    isSaving: false,
  });
  const { data = [], limit = defaultLimit, skip = 0, total = 0 } = drafts;
  const handleRTEChange = (value = "") => {
    setState((old) => ({ ...old, rteState: { touched: true, value } }));
  };

  const updateDraft = () => {
    setState((old) => ({ ...old, isSaving: true }));
    TaskService.patch(state.editedId, {
      title: state.rteState.value,
    })
      .then((draft: Task) =>
        setDrafts((old) => ({
          ...old,
          data: old.data.map((item) => (item._id === draft._id ? draft : item)),
        })),
      )
      .catch((e: Error) => {
        logger.error("Error in updating draft: ", e);
        message.error(t("drafts.saveError"));
      })
      .finally(() =>
        setState((old) => ({
          ...old,
          rteState: { touched: false, value: "" },
          editedId: "",
          isSaving: false,
        })),
      );
  };
  const deleteDraft = (draftId: string) => {
    TaskService.remove(draftId)
      .then((draft: Task) =>
        setDrafts((old) => ({
          ...old,
          data: old.data.filter((item) => item._id !== draft._id),
        })),
      )
      .catch((e: Error) => {
        logger.error("Error in removing draft: ", e);
        message.error(t("drafts.removeError"));
      });
  };
  useEffect(() => {
    if (visible) {
      setState((old) => ({ ...old, isLoading: true }));
      TaskService.find({
        query: { isTemplate: true, $sort: { createdAt: -1 } },
      })
        .then(setDrafts)
        .catch((e: Error) => {
          logger.error("Error in fetching drafts: ", e);
          message.error("Error in fetching drafts");
        })
        .finally(() => setState((old) => ({ ...old, isLoading: false })));
    }
  }, [visible]);

  return (
    <Modal
      title={
        <div className="s-std-text s-semibold">{t("drafts.pageTitle")}</div>
      }
      visible={visible}
      onCancel={handleClose}
      onOk={handleClose}
      width={700}
      bodyStyle={{ padding: "16px 24px" }}
      footer={null}
    >
      <List
        dataSource={data}
        renderItem={(item) =>
          state.editedId !== item._id ? (
            <List.Item
              className="s-hover-parent"
              key={item._id}
              actions={[
                <div className="s-hover-target">
                  <Button
                    type="text"
                    size="small"
                    onClick={() => utilizeDraft(item.title)}
                  >
                    <CheckOutlined className="tw-text-blue-700" />
                  </Button>
                  <Divider type="vertical" />
                  <Button
                    type="text"
                    size="small"
                    onClick={() =>
                      setState((old) => ({
                        ...old,
                        rteState: { touched: true, value: item.title },
                        editedId: item._id,
                      }))
                    }
                  >
                    <EditOutlined className="tw-text-blue-500" />
                  </Button>
                  <Divider type="vertical" />
                  <Popconfirm
                    title={t("global.deleteSurety")}
                    onConfirm={() => deleteDraft(item._id)}
                    okButtonProps={{ danger: true }}
                    okText={t("global.delete")}
                    cancelText={t("global.cancel")}
                  >
                    <Button type="text" size="small">
                      <DeleteOutlined className="tw-text-red-500" />
                    </Button>
                  </Popconfirm>
                </div>,
              ]}
            >
              <Tooltip
                title={
                  <div className="tw-text-white">
                    {getRTEMarkup(item.title)}
                  </div>
                }
                overlayStyle={{
                  maxWidth: "600px",
                }}
                color="rgba(0, 0, 0, 0.8)"
              >
                <div className="tw-truncate">{getRTEText(item.title)}</div>
              </Tooltip>
            </List.Item>
          ) : (
            <div className="tw-p-1">
              <RTE
                value={state.rteState.value}
                onChange={handleRTEChange}
                touched={state.rteState.touched}
                placeholder={t("taskEdit.enterTitle")}
                requiredMsg={t("taskEdit.detailsReq")}
                handleCancel={() =>
                  setState((old) => ({
                    ...old,
                    rteState: { touched: false, value: "" },
                    editedId: "",
                  }))
                }
                handleOk={updateDraft}
                okBtnProps={{
                  className: "s-btn-spinner-align",
                  loading: state.isSaving,
                  disabled: state.isSaving,
                }}
                actionBtns
                required
              />
            </div>
          )
        }
        pagination={{
          pageSize: limit,
          current: skip / limit + 1,
          total,
          onChange: (page = 1, limit = defaultLimit) =>
            setDrafts((old) => ({ ...old, skip: (page - 1) * limit })),
          itemRender: (page, type) =>
            getPaginationButtons(
              page,
              type,
              skip / limit + 1,
              skip + limit >= total,
              false,
            ),
          hideOnSinglePage: true,
          className: "tw-flex tw-justify-center",
          size: "small",
        }}
        loading={state.isLoading}
        locale={{ emptyText: <Empty description={t("drafts.noDrafts")} /> }}
      />
    </Modal>
  );
};

export default TaskDrafts;
