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
import Button from "./Button";
import { Download } from "lucide-react";
import { exportTierListAsCanvas, exportTierListAsSVG } from "@/utils/canvasExport";
import { useNavigation } from "@/utils/navigation";
import { usePathname } from "next/navigation";

export default function TierMaker() {
  const pathname = usePathname();
  const { navigateToTab } = useNavigation();

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

  // 根据当前路径确定活跃的 tab
  const getActiveTab = () => {
    switch (pathname) {
      case "/":
        return "create";
      case "/explore":
        return "explore";
      case "/library":
        return "library";
      case "/help":
        return "help";
      default:
        return "create";
    }
  };

  const activeTab = getActiveTab();

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
    console.log("🚀 开始导出 Tier List...");

    try {
      // 首先尝试 Canvas 导出（推荐方案）
      await exportTierListAsCanvas(tierList, tierList.title);
      console.log("✅ Canvas 导出成功！");
      
      // 显示成功提示
      const showSuccess = () => {
        const notification = document.createElement('div');
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #10b981;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 10000;
          font-family: Arial, sans-serif;
          font-size: 14px;
        `;
        notification.textContent = '🎉 导出成功！';
        document.body.appendChild(notification);
        
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 3000);
      };
      
      showSuccess();
      
    } catch (canvasError) {
      console.warn("Canvas 导出失败，尝试 SVG 导出:", canvasError);
      
      try {
        // 尝试 SVG 导出作为备选方案
        await exportTierListAsSVG(tierList, tierList.title);
        console.log("✅ SVG 导出成功！");
        alert("已导出为 SVG 格式");
        
      } catch (svgError) {
        console.error("SVG 导出也失败，使用 JSON 导出:", svgError);
        
        // 最后的备选方案：JSON 导出
        const fallbackToJson = confirm(
          "图片导出失败，是否要导出为 JSON 格式作为备选方案？"
        );
        
        if (fallbackToJson) {
          try {
            const data = {
              title: tierList.title,
              rows: tierList.rows.map((row) => ({
                label: row.label,
                color: row.color,
                items: row.items.map((item) => ({
                  id: item.id,
                  name: item.name,
                  imageUrl: item.imageUrl,
                })),
              })),
              theme: tierList.theme,
              backgroundImage: tierList.backgroundImage,
              exportDate: new Date().toISOString(),
              version: "1.0",
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
            
            console.log("✅ JSON 导出成功！");
            alert("已导出为 JSON 格式");
          } catch (jsonError) {
            console.error("所有导出方案都失败了:", jsonError);
            alert("导出失败，请稍后重试或联系技术支持");
          }
        }
      }
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
          onTabChange={navigateToTab}
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
            navigateToTab("library");
          }}
          onShowHelp={() => {
            navigateToTab("help");
          }}
        />
        <div className="py-4">
          <div className="max-w-6xl mx-auto px-4">
            <div
              id="tier-maker-content"
              className="rounded-xl shadow-lg p-4 overflow-visible"
              style={{
                ...surfaceStyle,
                minHeight: "calc(100vh - 140px)",
                position: "relative",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
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
                    theme={tierList.theme}
                  />
                  <Button
                    onClick={exportTierList}
                    variant="primary"
                    size="md"
                    theme={tierList.theme}
                    icon={<Download size={18} />}
                  >
                    导出
                  </Button>
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
              <ImageUpload
                onImagesAdded={handleImagesAdded}
                theme={tierList.theme}
              />
            </div>
          </div>
        </div>
      </div>
    </ClientWrapper>
  );
}
