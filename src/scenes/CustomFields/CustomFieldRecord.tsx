import { faBraille } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Popconfirm } from "antd";
import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { useTranslation } from "react-i18next";
import { getCustomFieldIcon } from "scenes/Tasks/helpers";
import { CustomField } from "types";

interface CustomFieldRecordProps {
  field: CustomField;
  index: number;
  handleEdit: () => void;
  handleRemove: () => void;
  handleDuplicate: () => void;
}

const CustomFieldRecord = ({
  field,
  index,
  handleEdit,
  handleRemove,
  handleDuplicate,
}: CustomFieldRecordProps) => {
  const [t] = useTranslation();

  return (
    <Draggable draggableId={field._id} index={index} key={field._id}>
      {(provided) => (
        <div {...provided.draggableProps} ref={provided.innerRef}>
          <div className="tw-flex tw-items-center s-hover-parent tw-border tw-rounded tw-bg-white tw-px-1 tw-my-1 s-std-text">
            <div
              className="tw-w-1/12 tw-flex tw-items-center"
              {...provided.dragHandleProps}
            >
              <FontAwesomeIcon
                icon={faBraille}
                rotation={90}
                style={{ cursor: "grab" }}
                className="tw-text-xs tw-text-gray-500"
              />
            </div>
            <p className="tw-flex tw-items-center s-std-text">
              {getCustomFieldIcon(field.type, "tw-mr-2 tw-mb-1 s-icon-color")}
              <span className="s-table-text">{field.label}</span>
            </p>
            <div className="s-text-gray s-hover-target tw-ml-auto">
              <Button
                type="link"
                className="tw-text-sm tw-p-0 s-text-gray s-font-roboto"
                onClick={handleDuplicate}
              >
                {t("customForms.duplicate")}
              </Button>
              <Button
                type="link"
                className="tw-text-sm tw-p-0 s-text-gray s-font-roboto tw-mx-2"
                onClick={handleEdit}
              >
                {t("global.edit")}
              </Button>
              <Popconfirm
                title={
                  <div>
                    <p>{t("customFields.deleteWarning1")}</p>
                    <p>{t("customFields.deleteWarning2")}</p>
                    <p>{t("customFields.deleteWarning3")}</p>
                  </div>
                }
                onConfirm={handleRemove}
                okText={t("global.delete")}
                okButtonProps={{ danger: true }}
                cancelText={t("global.cancel")}
              >
                <Button
                  type="link"
                  className="tw-text-sm tw-p-0 s-text-gray s-font-roboto"
                >
                  {t("global.delete")}
                </Button>
              </Popconfirm>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default CustomFieldRecord;
