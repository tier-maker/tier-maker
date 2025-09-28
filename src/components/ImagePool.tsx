"use client";

import { TierItem } from "@/types";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { X, Eye } from "lucide-react";
import { Image as AntImage } from "antd";

interface ImagePoolProps {
  items: TierItem[];
  onRemoveItem: (itemId: string) => void;
}

export default function ImagePool({ items, onRemoveItem }: ImagePoolProps) {
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">图片池</h3>
      <Droppable droppableId="image-pool" direction="horizontal">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              min-h-[120px] p-4 border-2 border-dashed rounded-lg
              flex flex-wrap gap-2 transition-colors
              ${
                snapshot.isDraggingOver
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300"
              }
            `}
          >
            {items.length === 0 ? (
              <div className="w-full text-center text-gray-500 py-8">
                暂无图片，请上传图片
              </div>
            ) : (
              items.map((item, index) => (
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
                        <AntImage
                          src={item.imageUrl}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="object-cover rounded-lg border-2 border-transparent hover:border-blue-300 transition-colors"
                          preview={{
                            mask: (
                              <div className="flex items-center justify-center">
                                <Eye size={16} className="text-white" />
                              </div>
                            ),
                          }}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveItem(item.id);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X size={12} />
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
