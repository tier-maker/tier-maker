"use client";

import { useState } from "react";
import { Theme } from "@/types";
import {
  Trophy,
  Plus,
  Search,
  FolderOpen,
  HelpCircle,
  Menu,
  X,
  Star,
  Grid3X3,
  Sparkles,
} from "lucide-react";
import { Button, Input, Tooltip } from "antd";

interface NavbarProps {
  theme: Theme;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onCreateNew?: () => void;
  onSearch?: (value: string) => void;
  onOpenLibrary?: () => void;
  onShowHelp?: () => void;
}

export default function Navbar({
  theme,
  activeTab = "create",
  onTabChange,
  onCreateNew,
  onSearch,
  onOpenLibrary,
  onShowHelp,
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const navItems = [
    {
      key: "create",
      label: "创建排行榜",
      icon: <Plus size={18} />,
      onClick: () => {
        onTabChange?.("create");
        onCreateNew?.();
      },
      primary: activeTab === "create",
    },
    {
      key: "explore",
      label: "探索",
      icon: <Search size={18} />,
      onClick: () => {
        onTabChange?.("explore");
        onSearch?.(searchValue);
      },
      primary: activeTab === "explore",
    },
    {
      key: "library",
      label: "素材库",
      icon: <FolderOpen size={18} />,
      onClick: () => {
        onTabChange?.("library");
        onOpenLibrary?.();
      },
      primary: activeTab === "library",
    },
    {
      key: "help",
      label: "帮助",
      icon: <HelpCircle size={18} />,
      onClick: () => {
        onTabChange?.("help");
        onShowHelp?.();
      },
      primary: activeTab === "help",
    },
  ];

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  return (
    <nav
      className="sticky top-0 z-50 border-b backdrop-blur-md transition-all duration-300"
      style={{
        backgroundColor: `${theme.surface}f0`,
        borderColor: `${theme.secondary}40`,
        boxShadow: `0 1px 3px ${theme.text}10`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.primary}cc)`,
              }}
            >
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1
                className="text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${theme.primary}, ${theme.primary}80)`,
                }}
              >
                TierMaker
              </h1>
              <div className="flex items-center space-x-1 text-xs opacity-60">
                <Sparkles size={10} />
                <span style={{ color: theme.text }}>专业排行榜制作工具</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Tooltip key={item.key} title={item.label}>
                <Button
                  type={item.primary ? "primary" : "text"}
                  onClick={item.onClick}
                  className={`
                    inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                    ${
                      item.primary
                        ? "shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        : "hover:bg-opacity-80"
                    }
                  `}
                  style={
                    item.primary
                      ? {
                          background: `linear-gradient(135deg, ${theme.primary}, ${theme.primary}dd)`,
                          borderColor: "transparent",
                          color: "white",
                        }
                      : {
                          color: theme.text,
                          backgroundColor: "transparent",
                        }
                  }
                >
                  {item.icon}
                  <span className="hidden lg:inline">{item.label}</span>
                </Button>
              </Tooltip>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden sm:block flex-1 max-w-xs mx-4">
            <Input
              placeholder="搜索模板或素材..."
              prefix={<Search size={16} style={{ color: `${theme.text}60` }} />}
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              className="rounded-full border-none shadow-sm"
              style={{
                backgroundColor: `${theme.secondary}30`,
                color: theme.text,
              }}
            />
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <Tooltip title="我的收藏">
              <Button
                type="text"
                icon={<Star size={18} />}
                className="rounded-full"
                style={{ color: theme.text }}
              />
            </Tooltip>
            <Tooltip title="网格视图">
              <Button
                type="text"
                icon={<Grid3X3 size={18} />}
                className="rounded-full"
                style={{ color: theme.text }}
              />
            </Tooltip>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              type="text"
              icon={isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-lg"
              style={{ color: theme.text }}
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            className="md:hidden border-t mt-2 pt-4 pb-6 space-y-3"
            style={{ borderColor: `${theme.secondary}40` }}
          >
            {/* Mobile Search */}
            <div className="px-2">
              <Input
                placeholder="搜索模板或素材..."
                prefix={
                  <Search size={16} style={{ color: `${theme.text}60` }} />
                }
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="rounded-lg"
                style={{
                  backgroundColor: `${theme.secondary}30`,
                  color: theme.text,
                }}
              />
            </div>

            {/* Mobile Nav Items */}
            <div className="space-y-2 px-2">
              {navItems.map((item) => (
                <Button
                  key={item.key}
                  type={item.primary ? "primary" : "text"}
                  onClick={() => {
                    item.onClick?.();
                    setIsMenuOpen(false);
                  }}
                  className="w-full h-12 text-left rounded-lg inline-flex items-center gap-3 justify-start"
                  style={
                    item.primary
                      ? {
                          background: `linear-gradient(135deg, ${theme.primary}, ${theme.primary}dd)`,
                          borderColor: "transparent",
                          color: "white",
                        }
                      : {
                          color: theme.text,
                          backgroundColor: "transparent",
                        }
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Button>
              ))}
            </div>

            {/* Mobile User Actions */}
            <div
              className="flex space-x-2 px-2 pt-2 border-t"
              style={{ borderColor: `${theme.secondary}40` }}
            >
              <Button
                type="text"
                icon={<Star size={18} />}
                className="flex-1 rounded-lg"
                style={{ color: theme.text }}
              >
                收藏
              </Button>
              <Button
                type="text"
                icon={<Grid3X3 size={18} />}
                className="flex-1 rounded-lg"
                style={{ color: theme.text }}
              >
                网格
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
