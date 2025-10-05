"use client";

import { TierItem } from "@/types";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { X, Grid, Maximize2 } from "lucide-react";

interface ImagePoolProps {
  items: TierItem[];
  onRemoveItem: (itemId: string) => void;
  displayMode: 'square' | 'original';
  onDisplayModeChange: (mode: 'square' | 'original') => void;
}

export default function ImagePool({ items, onRemoveItem, displayMode, onDisplayModeChange }: ImagePoolProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">图片池</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">显示模式:</span>
          <button
            onClick={() => onDisplayModeChange('square')}
            className={`p-2 rounded-lg transition-colors ${
              displayMode === 'square'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
            title="方块模式"
          >
            <Grid size={16} />
          </button>
          <button
            onClick={() => onDisplayModeChange('original')}
            className={`p-2 rounded-lg transition-colors ${
              displayMode === 'original'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
            title="原尺寸模式"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>
      <Droppable droppableId="image-pool" direction="horizontal">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              min-h-[120px] p-4 border-2 border-dashed rounded-lg
              flex flex-wrap transition-colors
              ${displayMode === 'square' ? 'gap-2' : 'gap-3 items-end'}
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
                        {displayMode === 'square' ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-lg border-2 border-transparent hover:border-blue-300 transition-colors"
                            crossOrigin="anonymous"
                          />
                        ) : (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="max-w-[120px] max-h-[80px] min-w-[60px] min-h-[40px] object-contain rounded-lg border-2 border-transparent hover:border-blue-300 transition-colors"
                            crossOrigin="anonymous"
                            style={{
                              width: 'auto',
                              height: 'auto'
                            }}
                          />
                        )}
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
