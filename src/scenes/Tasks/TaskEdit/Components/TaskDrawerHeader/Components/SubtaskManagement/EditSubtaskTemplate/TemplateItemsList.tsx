import React from "react";
import { DragDropContext, DropResult, Droppable } from "react-beautiful-dnd";
import { SubtaskItem } from "types";
import midString from "utils/helpers/midString";

import TemplateItem from "./TemplateItem";

interface TemplateItemsListProps {
  items: SubtaskItem[];
  updateItem: (item: SubtaskItem) => void;
  removeItem: (itemId: string) => void;
  editItem: (itemId: string) => void;
  editedId: string;
}

const TemplateItemsList = ({
  items,
  updateItem,
  removeItem,
  editItem,
  editedId,
}: TemplateItemsListProps) => {
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

    const old = Array.from(items);
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
    updateItem({ ...target, rank });
  };

  return (
    <DragDropContext onDragEnd={handleDrag}>
      <Droppable droppableId="dnd-list">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {items
              .sort((a, b) => (a.rank > b.rank ? 1 : -1))
              .map((item, index) => (
                <TemplateItem
                  key={item._id}
                  item={item}
                  index={index}
                  updateItem={updateItem}
                  removeItem={removeItem}
                  editItem={() => editItem(item._id)}
                  isEditing={editedId === item._id}
                  disableDelete={items.length === 1}
                />
              ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default TemplateItemsList;
