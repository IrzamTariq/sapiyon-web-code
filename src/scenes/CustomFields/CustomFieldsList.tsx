import mixpanel from "analytics/mixpanel";
import { Button, Empty, Modal, Spin, message } from "antd";
import logger from "logger";
import React, { useContext, useMemo, useState } from "react";
import { DragDropContext, DropResult, Droppable } from "react-beautiful-dnd";
import { useTranslation } from "react-i18next";
import midString from "utils/helpers/midString";

import { FirmService } from "../../services";
import { CustomField, UserContextType } from "../../types";
import UserContext from "../../UserContext";
import CustomFieldRecord from "./CustomFieldRecord";
import EditField from "./EditCustomField";

interface CustomFieldsListProps {
  form:
    | "tasks"
    | "customers"
    | "users"
    | "rfq"
    | "quotes"
    | "invoices"
    | "stockItems"
    | "taskCustomerFeedback";
  visible: boolean;
  handleClose: () => void;
}

const CustomFieldsList = ({
  form,
  visible,
  handleClose,
}: CustomFieldsListProps) => {
  const [t] = useTranslation();
  const { firm } = useContext(UserContext) as UserContextType;
  const firmId = firm._id;
  const fields = useMemo(() => firm?.forms?.[form] || ([] as CustomField[]), [
    firm,
    form,
  ]);

  const [state, setState] = useState({
    editedRecord: {} as CustomField,
    isEditing: false,
    isLoading: false,
  });

  const handleEdit = (record = {} as CustomField) =>
    setState((old) => ({ ...old, isEditing: true, editedRecord: record }));

  const handleCancel = () =>
    setState((old) => ({
      ...old,
      isEditing: false,
      editedRecord: {} as CustomField,
    }));

  const handleOk = (field: CustomField) => {
    //@ts-ignore
    const { _id, oldId, ...rest } = field;
    const fieldData = { ...rest, form };
    const lastRank =
      fields?.sort((a, b) => (a.rank > b.rank ? 1 : 0))?.[fields.length - 1]
        ?.rank || "";

    setState((old) => ({ ...old, isLoading: true }));
    if (_id) {
      FirmService.patch(firmId, fieldData, {
        query: { action: "updateField", fieldId: _id },
      }).then(
        () => {
          mixpanel.track(`Custom field for ${form} updated`);
          setState((old) => ({
            ...old,
            isLoading: false,
            isEditing: false,
            editedRecord: {} as CustomField,
          }));
        },
        (error: Error) => {
          logger.error("Error in saving custom field: ", error);
          message.error(t("customFields.updateError"));
          setState((old) => ({
            ...old,
            isLoading: false,
          }));
        },
      );
    } else {
      FirmService.patch(
        firmId,
        { ...fieldData, rank: midString(lastRank, "") },
        {
          query: { action: "createField" },
        },
      ).then(
        () => {
          mixpanel.track(`Custom field for ${form} created`);
          setState((old) => ({
            ...old,
            isLoading: false,
            isEditing: false,
            editedRecord: {} as CustomField,
          }));
        },
        (error: Error) => {
          logger.error("Error in saving custom field: ", error);
          message.error(t("customFields.createError"));
          setState((old) => ({
            ...old,
            isLoading: false,
          }));
        },
      );
    }
  };

  const handleRemove = (fieldId: string) => {
    setState((old) => ({ ...old, isLoading: true }));
    FirmService.patch(
      firmId,
      { form },
      { query: { action: "removeField", fieldId } },
    )
      .then(
        () => mixpanel.track(`Custom field for ${form} removed`),
        (error: Error) => {
          logger.error("Error in removing custom field: ", error);
          message.error(t("customFields.removeError"));
        },
      )
      .finally(() => setState((old) => ({ ...old, isLoading: false })));
  };

  const handleDrag = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) {
      return;
    }
    if (
      source.index === destination.index &&
      source.droppableId === destination.droppableId
    ) {
      return;
    }

    const old = Array.from(fields);
    const target = old[source.index];

    let first,
      second = "";
    if (destination.index > source.index) {
      first = old[destination.index]?.rank;
      second = old[destination.index + 1]?.rank;
    } else {
      second = old[destination.index]?.rank;
      first = old[destination.index - 1]?.rank;
    }
    const rank = midString(first, second);
    const { createdAt, updatedAt, ...rest } = target;
    const data = { ...rest, rank } as CustomField;
    handleOk(data);
  };

  return (
    <Modal
      title={
        <span className="s-modal-title">{t("specialFields.pageTitle")}</span>
      }
      visible={visible}
      onCancel={handleClose}
      width={600}
      footer={false}
    >
      <Spin spinning={state.isLoading}>
        <div className="tw-px-4">
          <DragDropContext onDragEnd={handleDrag}>
            <Droppable droppableId="dnd-list">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {Array.isArray(fields) && fields.length > 0 ? (
                    fields
                      .sort((a, b) => (a.rank > b.rank ? 1 : -1))
                      .map((field, index) => (
                        <CustomFieldRecord
                          key={field._id}
                          field={field}
                          index={index}
                          handleEdit={() => handleEdit(field)}
                          handleRemove={() => handleRemove(field._id)}
                          handleDuplicate={() => {
                            const { _id, ...rest } = field;
                            handleEdit(rest as CustomField);
                          }}
                        />
                      ))
                  ) : (
                    <Empty />
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <Button
            type="link"
            disabled={state.isLoading}
            onClick={() => handleEdit()}
            className="tw-ml-1"
          >
            + {t("customFields.addField")}
          </Button>
        </div>
      </Spin>
      <EditField
        visible={state.isEditing}
        editedRecord={state.editedRecord}
        handleOk={handleOk}
        handleCancel={handleCancel}
        loading={state.isLoading}
      />
    </Modal>
  );
};

export default CustomFieldsList;
