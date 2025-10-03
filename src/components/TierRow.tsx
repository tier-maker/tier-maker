"use client";

import { TierRow as TierRowType } from "@/types";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { X, Edit2 } from "lucide-react";
import { useState } from "react";

interface TierRowProps {
  row: TierRowType;
  onRemoveItem: (rowId: string, itemId: string) => void;
  onUpdateLabel: (rowId: string, newLabel: string) => void;
}

export default function TierRow({
  row,
  onRemoveItem,
  onUpdateLabel,
}: TierRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempLabel, setTempLabel] = useState(row.label);

  const handleLabelSubmit = () => {
    if (tempLabel.trim() && tempLabel !== row.label) {
      onUpdateLabel(row.id, tempLabel.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLabelSubmit();
    } else if (e.key === "Escape") {
      setTempLabel(row.label);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-stretch border border-gray-300 rounded-lg overflow-hidden mb-2">
      {/* Tier Label */}
      <div
        className="flex items-center justify-center min-w-[80px] text-2xl font-bold text-white relative group"
        style={{ backgroundColor: row.color }}
      >
        {isEditing ? (
          <input
            type="text"
            value={tempLabel}
            onChange={(e) => setTempLabel(e.target.value)}
            onBlur={handleLabelSubmit}
            onKeyDown={handleKeyDown}
            className="bg-transparent text-white text-center text-2xl font-bold border-none outline-none w-full"
            autoFocus
            maxLength={3}
          />
        ) : (
          <>
            <span>{row.label}</span>
            <button
              onClick={() => setIsEditing(true)}
              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-20 rounded p-1 hover:bg-opacity-40"
            >
              <Edit2 size={12} />
            </button>
          </>
        )}
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={row.id} direction="horizontal">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              flex-1 min-h-[100px] p-3 flex items-center gap-2
              transition-colors
              ${
                snapshot.isDraggingOver
                  ? "bg-blue-50 border-blue-300"
                  : "bg-gray-50"
              }
            `}
          >
            {row.items.length === 0 ? (
              <div className="text-gray-400 text-sm">拖拽图片到这里</div>
            ) : (
              row.items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`
                        relative group cursor-grab active:cursor-grabbing
                        ${snapshot.isDragging ? "opacity-50" : ""}
                      `}
                    >
                      <div className="relative">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded border-2 border-transparent hover:border-blue-300 transition-colors"
                          crossOrigin="anonymous"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveItem(row.id, item.id);
                          }}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
