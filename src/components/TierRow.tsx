"use client";

import { TierRow as TierRowType } from "@/types";
import Image from "next/image";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { X } from "lucide-react";

interface TierRowProps {
  row: TierRowType;
  onRemoveItem: (rowId: string, itemId: string) => void;
}

export default function TierRow({ row, onRemoveItem }: TierRowProps) {
  return (
    <div className="flex items-stretch border border-gray-300 rounded-lg overflow-hidden mb-2">
      {/* Tier Label */}
      <div
        className="flex items-center justify-center min-w-[80px] text-2xl font-bold text-white"
        style={{ backgroundColor: row.color }}
      >
        {row.label}
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
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="w-16 h-16 object-cover rounded border-2 border-transparent hover:border-blue-300 transition-colors"
                          unoptimized
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
