"use client";

import { Theme, DEFAULT_THEMES } from "@/types";
import Navbar from "@/components/Navbar";
import ClientWrapper from "@/components/ClientWrapper";
import { useNavigation } from "@/utils/navigation";
import { Search, Sparkles, TrendingUp, Star } from "lucide-react";

export default function ExplorePage() {
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
          activeTab="explore"
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
                <Search
                  size={64}
                  className="mx-auto mb-4"
                  style={{ color: theme.primary }}
                />
                <h1 className="text-4xl font-bold mb-4">探索</h1>
                <p className="text-lg opacity-80">
                  发现其他用户创建的精彩排行榜
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div
                  className="p-6 rounded-lg border-2 border-dashed"
                  style={{ borderColor: theme.secondary }}
                >
                  <TrendingUp
                    size={32}
                    className="mx-auto mb-3"
                    style={{ color: theme.primary }}
                  />
                  <h3 className="text-lg font-semibold mb-2">热门排行榜</h3>
                  <p className="text-sm opacity-70">查看最受欢迎的排行榜</p>
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
                  <h3 className="text-lg font-semibold mb-2">精选推荐</h3>
                  <p className="text-sm opacity-70">编辑精选的优质内容</p>
                </div>

                <div
                  className="p-6 rounded-lg border-2 border-dashed"
                  style={{ borderColor: theme.secondary }}
                >
                  <Sparkles
                    size={32}
                    className="mx-auto mb-3"
                    style={{ color: theme.primary }}
                  />
                  <h3 className="text-lg font-semibold mb-2">最新发布</h3>
                  <p className="text-sm opacity-70">发现最新创建的排行榜</p>
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
