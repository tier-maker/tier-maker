"use client";

import { Theme, DEFAULT_THEMES } from "@/types";
import { Upload, Palette, X } from "lucide-react";
import { Button, Modal } from "antd";
import Image from "next/image";
import { useState, useCallback } from "react";

interface ThemeSettingsProps {
  currentTheme: Theme;
  backgroundImage?: string;
  onThemeChange: (theme: Theme) => void;
  onBackgroundChange: (imageUrl?: string) => void;
}

export default function ThemeSettings({
  currentTheme,
  backgroundImage,
  onThemeChange,
  onBackgroundChange,
}: ThemeSettingsProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleBackgroundUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith("image/")) {
        const imageUrl = URL.createObjectURL(file);
        onBackgroundChange(imageUrl);
      }
    },
    [onBackgroundChange]
  );

  const removeBackground = useCallback(() => {
    onBackgroundChange(undefined);
  }, [onBackgroundChange]);

  return (
    <>
      <Button
        type="primary"
        icon={<Palette />}
        onClick={() => setIsModalVisible(true)}
        className="flex items-center gap-2"
      >
        主题设置
      </Button>

      <Modal
        title="主题设置"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <div className="space-y-6">
          {/* Theme Selection */}
          <div>
            <h4 className="text-lg font-medium mb-3">选择主题</h4>
            <div className="grid grid-cols-1 gap-3">
              {DEFAULT_THEMES.map((theme) => (
                <div
                  key={theme.id}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${
                      currentTheme.id === theme.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }
                  `}
                  onClick={() => onThemeChange(theme)}
                  style={{
                    background: theme.background.includes("gradient")
                      ? theme.background
                      : theme.surface,
                    color: theme.text,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{theme.name}</span>
                    <div className="flex gap-2">
                      <div
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: theme.primary }}
                      />
                      <div
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: theme.secondary }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Background Image */}
          <div>
            <h4 className="text-lg font-medium mb-3">背景图片</h4>
            <div className="space-y-3">
              {backgroundImage && (
                <div className="relative inline-block">
                  <Image
                    src={backgroundImage}
                    alt="Background"
                    width={128}
                    height={80}
                    className="w-32 h-20 object-cover rounded-lg border"
                    unoptimized
                  />
                  <button
                    onClick={removeBackground}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundUpload}
                  className="hidden"
                  id="background-upload"
                />
                <label
                  htmlFor="background-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <Upload size={16} />
                  上传背景图片
                </label>
              </div>

              {!backgroundImage && (
                <p className="text-sm text-gray-500">
                  上传自定义背景图片来个性化你的 Tier List
                </p>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
