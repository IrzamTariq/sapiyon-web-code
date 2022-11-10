import "./resizable.css";

import { faBraille } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Switch, Tooltip } from "antd";
import React, { memo } from "react";
import { Draggable } from "react-beautiful-dnd";
import { useTranslation } from "react-i18next";
import { ResizableBox } from "react-resizable";

export interface ColumnModalProps {
  title: string;
  dataIndex: string;
  size: number | undefined;
  order: number;
  minSize: number;
  isHidden?: boolean;
  alwaysVisible?: boolean;
  fixedWidth?: boolean;
}

interface ColumnProps extends ColumnModalProps {
  updateColumn: (dataIndex: string, changes: Partial<ColumnModalProps>) => void;
  index: number;
}

const screenWidth = window?.innerWidth || 1100;
const referenceWidth = screenWidth - 150 - 48;
const getRelativeWidth = (width: number) => {
  const relativeSize = +(
    ((width / screenWidth) * 100 * referenceWidth) /
    100
  ).toFixed(2);
  return relativeSize <= referenceWidth ? relativeSize : referenceWidth;
};

const ColumnModal = ({
  title,
  size = 200,
  minSize = 200,
  alwaysVisible,
  dataIndex,
  isHidden,
  updateColumn,
  fixedWidth,
  index,
}: ColumnProps) => {
  const [t] = useTranslation();

  const updateWidth = (size = {} as any) => {
    const { width = 1 } = size;
    const percentage = +(
      ((width / referenceWidth) * 100 * screenWidth) /
      100
    ).toFixed(2);
    updateColumn(dataIndex, { size: percentage });
  };

  return (
    <Draggable draggableId={dataIndex} index={index}>
      {(provided, snapshot) => (
        <div {...provided.draggableProps} ref={provided.innerRef}>
          <Tooltip title={title} autoAdjustOverflow>
            <ResizableBox
              width={getRelativeWidth(size)}
              height={52}
              maxConstraints={[referenceWidth, 52]}
              minConstraints={[getRelativeWidth(minSize), 52]}
              onResizeStop={(e, { size }) => updateWidth(size)}
              axis={fixedWidth ? "none" : "x"}
              resizeHandles={["e"]}
              handle={
                <div
                  className="react-resizable-handle react-resizable-handle-e"
                  style={{
                    height: "20px",
                    width: "5px",
                    backgroundColor: fixedWidth ? "red" : "#d0d0d0",
                    borderRadius: "2px",
                    cursor: fixedWidth ? "not-allowed" : "ew-resize",
                  }}
                />
              }
            >
              <div
                className="tw-rounded tw-border tw-py-3 tw-px-5"
                style={{
                  backgroundColor: snapshot.isDragging ? "#f5f5f5" : "white",
                  transition: "all 200ms",
                  boxShadow: snapshot.isDragging
                    ? "5px 5px 5px lightgray"
                    : "none",
                  transform: snapshot.isDragging ? "scale(1.1)" : "none",
                }}
              >
                <div className="tw-flex tw-w-full tw-items-center">
                  <div {...provided.dragHandleProps}>
                    <FontAwesomeIcon
                      icon={faBraille}
                      rotation={90}
                      size="lg"
                      style={{ cursor: "grab" }}
                      className="tw-mr-2 tw-text-gray-500"
                    />
                  </div>
                  <div
                    className="tw-text-sm tw-truncate tw-mr-auto s-semibold"
                    style={{ maxWidth: "70%" }}
                  >
                    {title}
                  </div>
                  <Switch
                    size={size > 200 ? "default" : "small"}
                    className="tw-overflow-hidden"
                    disabled={alwaysVisible}
                    checkedChildren={
                      size > 200 ? t("tableSettings.visible") : null
                    }
                    unCheckedChildren={
                      size > 200 ? t("tableSettings.hidden") : null
                    }
                    checked={!isHidden}
                    onChange={(isHidden) =>
                      updateColumn(dataIndex, { isHidden: !isHidden })
                    }
                  />
                </div>
              </div>
            </ResizableBox>
          </Tooltip>
        </div>
      )}
    </Draggable>
  );
};

export default memo(ColumnModal);
