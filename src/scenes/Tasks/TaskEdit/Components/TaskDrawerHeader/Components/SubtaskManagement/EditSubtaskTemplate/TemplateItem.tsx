import { MinusCircleOutlined } from "@ant-design/icons";
import { faBraille } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Input, Popconfirm } from "antd";
import React, { useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { useTranslation } from "react-i18next";
import { SubtaskItem } from "types";
import ValidationMessage from "utils/components/ValidationMessage";

interface TemplateItemProps {
  item: SubtaskItem;
  index: number;
  isEditing: boolean;
  disableDelete?: boolean;
  editItem: () => void;
  updateItem: (item: SubtaskItem) => void;
  removeItem: (itemId: string) => void;
}

const TemplateItem = ({
  item,
  index,
  isEditing,
  disableDelete,
  updateItem,
  editItem,
  removeItem,
}: TemplateItemProps) => {
  const [t] = useTranslation();
  const [title, setTitle] = useState("");
  const [isInvalid, setIsInvalid] = useState(false);

  const startEditing = () => {
    setTitle(item.title);
    editItem();
  };
  const saveValue = () => {
    const value = title.trim();
    if (value) {
      updateItem({ ...item, title: value });
    } else {
      setIsInvalid(true);
    }
  };

  return isEditing ? (
    <>
      <Input
        placeholder={t("subtasks.enterSubtaskTitle")}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onPressEnter={saveValue}
        onBlur={saveValue}
        autoFocus
      />
      <ValidationMessage
        message={t("checklists.titleRequired")}
        visible={isInvalid && !title.trim()}
      />
    </>
  ) : (
    <Draggable draggableId={item._id} index={index} key={item._id}>
      {(provided) => (
        <div {...provided.draggableProps} ref={provided.innerRef}>
          <div className="tw-flex tw-items-center tw-w-full tw-bg-white s-hover-parent tw-border tw-rounded tw-p-1 tw-my-1">
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
            <div className="tw-w-10/12 tw-truncate" onClick={startEditing}>
              {item.title}
            </div>
            <Popconfirm
              title={t("global.deleteSurety")}
              onConfirm={() => removeItem(item._id || "")}
              okText={t("global.delete")}
              okButtonProps={{ danger: true }}
              cancelText={t("global.cancel")}
            >
              <div className="tw-w-1/12 s-hover-target tw-text-right">
                <MinusCircleOutlined
                  className="s-anticon-v-align s-pointer"
                  hidden={disableDelete}
                />
              </div>
            </Popconfirm>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TemplateItem;
