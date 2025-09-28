"use client";

import { useState, useCallback } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import {
  TierList,
  TierItem,
  DEFAULT_TIER_ROWS,
  DEFAULT_THEMES,
  Theme,
} from "@/types";
import ImageUpload from "./ImageUpload";
import ImagePool from "./ImagePool";
import TierRowComponent from "./TierRow";
import ClientWrapper from "./ClientWrapper";
import ThemeSettings from "./ThemeSettings";
import Navbar from "./Navbar";
import { Download } from "lucide-react";
import { exportElementAsImage } from "@/utils/exportUtils";

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
    theme: DEFAULT_THEMES[0],
  });

  const [activeTab, setActiveTab] = useState("create");

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

  const handleRowLabelUpdate = useCallback(
    (rowId: string, newLabel: string) => {
      setTierList((prev) => ({
        ...prev,
        rows: prev.rows.map((row) =>
          row.id === rowId ? { ...row, label: newLabel } : row
        ),
      }));
    },
    []
  );

  const handleThemeChange = useCallback((theme: Theme) => {
    setTierList((prev) => ({
      ...prev,
      theme,
    }));
  }, []);

  const handleBackgroundChange = useCallback((imageUrl?: string) => {
    setTierList((prev) => ({
      ...prev,
      backgroundImage: imageUrl,
    }));
  }, []);

  const exportTierList = useCallback(async () => {
    const element = document.getElementById("tier-maker-content");
    if (!element) return;

    try {
      await exportElementAsImage(element, tierList.title);
    } catch (error) {
      console.error("Export failed:", error);
      // 如果导出失败，回退到JSON导出
      const data = {
        title: tierList.title,
        rows: tierList.rows.map((row) => ({
          label: row.label,
          color: row.color,
          items: row.items.map((item) => ({
            name: item.name,
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
    }
  }, [tierList]);

  const containerStyle = {
    background: tierList.backgroundImage
      ? `url(${tierList.backgroundImage})`
      : tierList.theme.background,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
  };

  const surfaceStyle = {
    backgroundColor: tierList.theme.surface,
    color: tierList.theme.text,
  };

  return (
    <ClientWrapper>
      <div className="min-h-screen" style={containerStyle}>
        <Navbar
          theme={tierList.theme}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onCreateNew={() => {
            // Reset to new tier list
            setTierList({
              id: `tier-${Date.now()}`,
              title: "我的 Tier List",
              rows: DEFAULT_TIER_ROWS.map((row, index) => ({
                ...row,
                id: `tier-${index}`,
                items: [],
              })),
              imagePool: [],
              theme: tierList.theme,
            });
          }}
          onSearch={(value) => {
            // Search functionality could be implemented here
            console.log("Search:", value);
          }}
          onOpenLibrary={() => {
            // Library functionality could be implemented here
            console.log("Open library");
          }}
          onShowHelp={() => {
            // Help functionality could be implemented here
            console.log("Show help");
          }}
        />
        <div className="py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div
              id="tier-maker-content"
              className="rounded-xl shadow-lg p-6 overflow-visible"
              style={{
                ...surfaceStyle,
                minHeight: "auto",
                position: "relative",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <input
                  type="text"
                  value={tierList.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="text-3xl font-bold bg-transparent border-none outline-none focus:bg-opacity-10 rounded px-2 py-1 transition-colors"
                  style={{
                    color: tierList.theme.text,
                    backgroundColor: "transparent",
                  }}
                  onFocus={(e) => {
                    e.target.style.backgroundColor =
                      tierList.theme.secondary + "40";
                  }}
                  onBlur={(e) => {
                    e.target.style.backgroundColor = "transparent";
                  }}
                />
                <div className="flex gap-2">
                  <ThemeSettings
                    currentTheme={tierList.theme}
                    backgroundImage={tierList.backgroundImage}
                    onThemeChange={handleThemeChange}
                    onBackgroundChange={handleBackgroundChange}
                  />
                  <button
                    onClick={exportTierList}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:opacity-80 transition-colors"
                    style={{
                      backgroundColor: tierList.theme.primary,
                      color: tierList.theme.surface,
                    }}
                  >
                    <Download size={20} />
                    导出
                  </button>
                </div>
              </div>

              <DragDropContext onDragEnd={handleDragEnd}>
                {/* Tier Rows */}
                <div className="mb-8">
                  <h2
                    className="text-xl font-semibold mb-4"
                    style={{ color: tierList.theme.text }}
                  >
                    Tier 排行榜
                  </h2>
                  <div className="space-y-2">
                    {tierList.rows.map((row) => (
                      <TierRowComponent
                        key={row.id}
                        row={row}
                        onRemoveItem={handleRemoveFromTier}
                        onUpdateLabel={handleRowLabelUpdate}
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
      </div>
    </ClientWrapper>
  );
}
