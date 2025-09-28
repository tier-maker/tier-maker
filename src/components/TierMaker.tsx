"use client";

import { useState, useCallback } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { TierList, TierRow, TierItem, DEFAULT_TIER_ROWS } from "@/types";
import ImageUpload from "./ImageUpload";
import ImagePool from "./ImagePool";
import TierRowComponent from "./TierRow";
import ClientWrapper from "./ClientWrapper";
import { Download, Save } from "lucide-react";

export default function TierMaker() {
  const [tierList, setTierList] = useState<TierList>({
    id: "tier-1",
    title: "我的 Tier List",
    rows: DEFAULT_TIER_ROWS.map((row, index) => ({
      ...row,
      id: `tier-${index}`,
      items: [],
    })),
    imagePool: [],
  });

  const handleImagesAdded = useCallback((newItems: TierItem[]) => {
    setTierList((prev) => ({
      ...prev,
      imagePool: [...prev.imagePool, ...newItems],
    }));
  }, []);

  const handleRemoveFromPool = useCallback((itemId: string) => {
    setTierList((prev) => ({
      ...prev,
      imagePool: prev.imagePool.filter((item) => item.id !== itemId),
    }));
  }, []);

  const handleRemoveFromTier = useCallback((rowId: string, itemId: string) => {
    setTierList((prev) => ({
      ...prev,
      rows: prev.rows.map((row) =>
        row.id === rowId
          ? { ...row, items: row.items.filter((item) => item.id !== itemId) }
          : row
      ),
    }));
  }, []);

  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    setTierList((prev) => {
      const newTierList = { ...prev };

      // Find the dragged item
      let draggedItem: TierItem | null = null;

      // Remove item from source
      if (source.droppableId === "image-pool") {
        const itemIndex = newTierList.imagePool.findIndex(
          (item) => item.id === draggableId
        );
        if (itemIndex !== -1) {
          draggedItem = newTierList.imagePool[itemIndex];
          newTierList.imagePool.splice(itemIndex, 1);
        }
      } else {
        const sourceRow = newTierList.rows.find(
          (row) => row.id === source.droppableId
        );
        if (sourceRow) {
          const itemIndex = sourceRow.items.findIndex(
            (item) => item.id === draggableId
          );
          if (itemIndex !== -1) {
            draggedItem = sourceRow.items[itemIndex];
            sourceRow.items.splice(itemIndex, 1);
          }
        }
      }

      if (!draggedItem) {
        return prev;
      }

      // Add item to destination
      if (destination.droppableId === "image-pool") {
        newTierList.imagePool.splice(destination.index, 0, draggedItem);
      } else {
        const destRow = newTierList.rows.find(
          (row) => row.id === destination.droppableId
        );
        if (destRow) {
          destRow.items.splice(destination.index, 0, draggedItem);
        }
      }

      return newTierList;
    });
  }, []);

  const handleTitleChange = useCallback((newTitle: string) => {
    setTierList((prev) => ({
      ...prev,
      title: newTitle,
    }));
  }, []);

  const exportTierList = useCallback(() => {
    // Simple export functionality - could be enhanced to export as image
    const data = {
      title: tierList.title,
      rows: tierList.rows.map((row) => ({
        label: row.label,
        color: row.color,
        items: row.items.map((item) => ({
          name: item.name,
          // Note: imageUrl would need to be converted to base64 for proper export
        })),
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tierList.title}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [tierList]);

  return (
    <ClientWrapper>
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <input
                type="text"
                value={tierList.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="text-3xl font-bold text-gray-800 bg-transparent border-none outline-none focus:bg-gray-50 rounded px-2 py-1"
              />
              <div className="flex gap-2">
                <button
                  onClick={exportTierList}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download size={20} />
                  导出
                </button>
              </div>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              {/* Tier Rows */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Tier 排行榜
                </h2>
                <div className="space-y-2">
                  {tierList.rows.map((row) => (
                    <TierRowComponent
                      key={row.id}
                      row={row}
                      onRemoveItem={handleRemoveFromTier}
                    />
                  ))}
                </div>
              </div>

              {/* Image Pool */}
              <div className="mb-6">
                <ImagePool
                  items={tierList.imagePool}
                  onRemoveItem={handleRemoveFromPool}
                />
              </div>
            </DragDropContext>

            {/* Image Upload */}
            <ImageUpload onImagesAdded={handleImagesAdded} />
          </div>
        </div>
      </div>
    </ClientWrapper>
  );
}
