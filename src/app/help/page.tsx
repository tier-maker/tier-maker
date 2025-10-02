"use client";

import { Theme, DEFAULT_THEMES } from "@/types";
import Navbar from "@/components/Navbar";
import ClientWrapper from "@/components/ClientWrapper";
import { useNavigation } from "@/utils/navigation";
import { HelpCircle, Book, MessageCircle, Mail, Github } from "lucide-react";

export default function HelpPage() {
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
          activeTab="help"
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
                <HelpCircle
                  size={64}
                  className="mx-auto mb-4"
                  style={{ color: theme.primary }}
                />
                <h1 className="text-4xl font-bold mb-4">帮助中心</h1>
                <p className="text-lg opacity-80">获取使用指南和技术支持</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div
                  className="p-6 rounded-lg border-2 border-dashed"
                  style={{ borderColor: theme.secondary }}
                >
                  <Book
                    size={32}
                    className="mx-auto mb-3"
                    style={{ color: theme.primary }}
                  />
                  <h3 className="text-lg font-semibold mb-2">使用教程</h3>
                  <p className="text-sm opacity-70">快速上手指南</p>
                </div>

                <div
                  className="p-6 rounded-lg border-2 border-dashed"
                  style={{ borderColor: theme.secondary }}
                >
                  <MessageCircle
                    size={32}
                    className="mx-auto mb-3"
                    style={{ color: theme.primary }}
                  />
                  <h3 className="text-lg font-semibold mb-2">常见问题</h3>
                  <p className="text-sm opacity-70">FAQ 和解决方案</p>
                </div>

                <div
                  className="p-6 rounded-lg border-2 border-dashed"
                  style={{ borderColor: theme.secondary }}
                >
                  <Mail
                    size={32}
                    className="mx-auto mb-3"
                    style={{ color: theme.primary }}
                  />
                  <h3 className="text-lg font-semibold mb-2">联系我们</h3>
                  <p className="text-sm opacity-70">获取技术支持</p>
                </div>

                <div
                  className="p-6 rounded-lg border-2 border-dashed"
                  style={{ borderColor: theme.secondary }}
                >
                  <Github
                    size={32}
                    className="mx-auto mb-3"
                    style={{ color: theme.primary }}
                  />
                  <h3 className="text-lg font-semibold mb-2">开源项目</h3>
                  <p className="text-sm opacity-70">查看源代码</p>
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
