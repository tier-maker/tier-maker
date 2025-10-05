"use client";

import { useState } from "react";
import { DEFAULT_THEMES } from "@/types";
import Navbar from "@/components/Navbar";
import ClientWrapper from "@/components/ClientWrapper";
import HeroLibrary from "@/components/HeroLibrary";
import HexLibrary from "@/components/HexLibrary";
import { useNavigation } from "@/utils/navigation";
import { FolderOpen, Upload, Download, Star, GamepadIcon, Hexagon } from "lucide-react";

export default function LibraryPage() {
  const theme = DEFAULT_THEMES[0]; // 使用默认主题
  const { navigateToTab } = useNavigation();
  const [currentView, setCurrentView] = useState<'main' | 'heroes' | 'hexes'>('main');

  return (
    <ClientWrapper>
      <div
        className="min-h-screen"
        style={{ backgroundColor: theme.background }}
      >
        <Navbar
          theme={theme}
          activeTab="library"
          onTabChange={navigateToTab}
          onSearch={(value) => {
            console.log("Search:", value);
          }}
          onOpenLibrary={() => {
            navigateToTab("library");
          }}
          onShowHelp={() => {
            navigateToTab("help");
          }}
        />
        <div className="py-8">
          <div className="max-w-6xl mx-auto px-4">
            {currentView === 'main' ? (
              <div
                className="rounded-xl shadow-lg p-8 text-center"
                style={{
                  backgroundColor: theme.surface,
                  color: theme.text,
                }}
              >
                <div className="mb-8">
                  <FolderOpen
                    size={64}
                    className="mx-auto mb-4"
                    style={{ color: theme.primary }}
                  />
                  <h1 className="text-4xl font-bold mb-4">素材库</h1>
                  <p className="text-lg opacity-80">
                    管理你的图片素材和排行榜模板
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* LOL 英雄头像素材 */}
                  <div
                    className="p-6 rounded-lg border-2 border-dashed cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
                    style={{ borderColor: theme.secondary }}
                    onClick={() => setCurrentView('heroes')}
                  >
                    <GamepadIcon
                      size={32}
                      className="mx-auto mb-3"
                      style={{ color: theme.primary }}
                    />
                    <h3 className="text-lg font-semibold mb-2">LOL 英雄头像素材</h3>
                    <p className="text-sm opacity-70">170+ 个英雄头像，支持批量下载</p>
                    <div className="mt-3 text-xs px-2 py-1 rounded-full inline-block"
                         style={{ backgroundColor: theme.primary, color: '#ffffff' }}>
                      可用
                    </div>
                  </div>

                  {/* 斗魂海克斯素材 */}
                  <div
                    className="p-6 rounded-lg border-2 border-dashed cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
                    style={{ borderColor: theme.secondary }}
                    onClick={() => setCurrentView('hexes')}
                  >
                    <Hexagon
                      size={32}
                      className="mx-auto mb-3"
                      style={{ color: theme.primary }}
                    />
                    <h3 className="text-lg font-semibold mb-2">斗魂海克斯素材</h3>
                    <p className="text-sm opacity-70">50+ 个海克斯素材，支持批量下载</p>
                    <div className="mt-3 text-xs px-2 py-1 rounded-full inline-block"
                         style={{ backgroundColor: theme.primary, color: '#ffffff' }}>
                      可用
                    </div>
                  </div>

                  <div
                    className="p-6 rounded-lg border-2 border-dashed"
                    style={{ borderColor: theme.secondary }}
                  >
                    <Upload
                      size={32}
                      className="mx-auto mb-3"
                      style={{ color: theme.primary }}
                    />
                    <h3 className="text-lg font-semibold mb-2">上传素材</h3>
                    <p className="text-sm opacity-70">批量上传图片素材</p>
                    <div className="mt-3 text-xs px-2 py-1 rounded-full inline-block"
                         style={{ backgroundColor: theme.secondary, color: theme.text }}>
                      敬请期待
                    </div>
                  </div>

                  <div
                    className="p-6 rounded-lg border-2 border-dashed"
                    style={{ borderColor: theme.secondary }}
                  >
                    <Star
                      size={32}
                      className="mx-auto mb-3"
                      style={{ color: theme.primary }}
                    />
                    <h3 className="text-lg font-semibold mb-2">收藏夹</h3>
                    <p className="text-sm opacity-70">保存喜欢的排行榜</p>
                    <div className="mt-3 text-xs px-2 py-1 rounded-full inline-block"
                         style={{ backgroundColor: theme.secondary, color: theme.text }}>
                      敬请期待
                    </div>
                  </div>

                  <div
                    className="p-6 rounded-lg border-2 border-dashed"
                    style={{ borderColor: theme.secondary }}
                  >
                    <Download
                      size={32}
                      className="mx-auto mb-3"
                      style={{ color: theme.primary }}
                    />
                    <h3 className="text-lg font-semibold mb-2">模板库</h3>
                    <p className="text-sm opacity-70">下载预设模板</p>
                    <div className="mt-3 text-xs px-2 py-1 rounded-full inline-block"
                         style={{ backgroundColor: theme.secondary, color: theme.text }}>
                      敬请期待
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <div
                    className="text-2xl font-bold mb-2"
                    style={{ color: theme.primary }}
                  >
                    🎮 LOL 英雄头像 & 🔮 斗魂海克斯素材已上线！
                  </div>
                  <p className="text-sm opacity-70" style={{ color: theme.text }}>
                    点击上方卡片开始使用，更多素材正在开发中...
                  </p>
                </div>
              </div>
            ) : currentView === 'heroes' ? (
              <div
                className="rounded-xl shadow-lg p-6"
                style={{
                  backgroundColor: theme.surface,
                  color: theme.text,
                }}
              >
                <HeroLibrary 
                  theme={theme} 
                  onBack={() => setCurrentView('main')} 
                />
              </div>
            ) : currentView === 'hexes' ? (
              <div
                className="rounded-xl shadow-lg p-6"
                style={{
                  backgroundColor: theme.surface,
                  color: theme.text,
                }}
              >
                <HexLibrary 
                  theme={theme} 
                  onBack={() => setCurrentView('main')} 
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </ClientWrapper>
  );
}
