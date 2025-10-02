"use client";

import { Theme, DEFAULT_THEMES } from "@/types";
import Navbar from "@/components/Navbar";
import ClientWrapper from "@/components/ClientWrapper";
import { useNavigation } from "@/utils/navigation";
import { FolderOpen, Upload, Download, Trash2, Star } from "lucide-react";

export default function LibraryPage() {
  const theme = DEFAULT_THEMES[0]; // 使用默认主题
  const { navigateToTab } = useNavigation();

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
                </div>

                <div
                  className="p-6 rounded-lg border-2 border-dashed"
                  style={{ borderColor: theme.secondary }}
                >
                  <Trash2
                    size={32}
                    className="mx-auto mb-3"
                    style={{ color: theme.primary }}
                  />
                  <h3 className="text-lg font-semibold mb-2">回收站</h3>
                  <p className="text-sm opacity-70">管理已删除的内容</p>
                </div>
              </div>

              <div
                className="text-2xl font-bold"
                style={{ color: theme.primary }}
              >
                敬请期待 🚀
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientWrapper>
  );
}
