"use client";

import { useState, useEffect, useMemo } from "react";
import { Theme } from "@/types";
import { 
  Download, 
  Search, 
  CheckSquare, 
  Square, 
  Package,
  ArrowLeft,
  Grid3X3,
  List
} from "lucide-react";
import JSZip from "jszip";

interface HexData {
  name: string;
  displayName: string;
  imageUrl: string;
}

interface HexLibraryProps {
  theme: Theme;
  onBack: () => void;
}

export default function HexLibrary({ theme, onBack }: HexLibraryProps) {
  const [hexes, setHexes] = useState<HexData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHexes, setSelectedHexes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [downloading, setDownloading] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadHexes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 预加载图片
  useEffect(() => {
    if (hexes.length > 0) {
      // 预加载前几个图片以提升用户体验
      const preloadImages = hexes.slice(0, 20);
      preloadImages.forEach(hex => {
        const img = new window.Image();
        img.src = hex.imageUrl;
        img.onload = () => {
          setLoadedImages(prev => new Set([...prev, hex.name]));
        };
        img.onerror = () => {
          setImageLoadErrors(prev => new Set([...prev, hex.name]));
        };
      });
    }
  }, [hexes]);

  const loadHexes = async () => {
    try {
      setLoading(true);
      
      // 获取所有海克斯图片文件名
      const hexFiles = [
        'capture_250914_092307.png', 'capture_250914_092345.png', 'capture_250914_092400.png',
        'capture_250914_092407.png', 'capture_250914_092411.png', 'capture_250914_092415.png',
        'capture_250914_092419.png', 'capture_250914_092423.png', 'capture_250914_092427.png',
        'capture_250914_092431.png', 'capture_250914_092436.png', 'capture_250914_092440.png',
        'capture_250914_092445.png', 'capture_250914_092449.png', 'capture_250914_092454.png',
        'capture_250914_092458.png', 'capture_250914_092502.png', 'capture_250914_092506.png',
        'capture_250914_092510.png', 'capture_250914_092513.png', 'capture_250914_092517.png',
        'capture_250914_092520.png', 'capture_250914_092524.png', 'capture_250914_092527.png',
        'capture_250914_092530.png', 'capture_250914_092534.png', 'capture_250914_092537.png',
        'capture_250914_092540.png', 'capture_250914_092544.png', 'capture_250914_092553.png',
        'capture_250914_092600.png', 'capture_250914_092604.png', 'capture_250914_092607.png',
        'capture_250914_092611.png', 'capture_250914_092614.png', 'capture_250914_092744.png',
        'capture_250914_092748.png', 'capture_250914_092752.png', 'capture_250914_092756.png',
        'capture_250914_092801.png', 'capture_250914_092805.png', 'capture_250914_092808.png',
        'capture_250914_092813.png', 'capture_250914_092816.png', 'capture_250914_092820.png',
        'capture_250914_092823.png', 'capture_250914_092826.png', 'capture_250914_092832.png',
        'capture_250914_092835.png', 'capture_250914_092839.png', 'capture_250914_092842.png',
        'capture_250914_092846.png'
      ];

      const hexData: HexData[] = hexFiles.map((filename, index) => {
        const name = filename.replace('.png', '');
        return {
          name,
          displayName: `斗魂海克斯 ${index + 1}`,
          imageUrl: `./hex/${filename}` // 使用相对路径，适配静态导出
        };
      });

      setHexes(hexData);
    } catch (error) {
      console.error('Failed to load hexes:', error);
    } finally {
      setLoading(false);
    }
  };

  // 过滤海克斯
  const filteredHexes = useMemo(() => {
    if (!searchQuery) return hexes;
    
    const query = searchQuery.toLowerCase();
    return hexes.filter(hex => 
      hex.name.toLowerCase().includes(query) ||
      hex.displayName.toLowerCase().includes(query)
    );
  }, [hexes, searchQuery]);

  // 选择/取消选择海克斯
  const toggleHexSelection = (hexName: string) => {
    const newSelected = new Set(selectedHexes);
    if (newSelected.has(hexName)) {
      newSelected.delete(hexName);
    } else {
      newSelected.add(hexName);
    }
    setSelectedHexes(newSelected);
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedHexes.size === filteredHexes.length) {
      setSelectedHexes(new Set());
    } else {
      setSelectedHexes(new Set(filteredHexes.map(hex => hex.name)));
    }
  };

  // 批量下载
  const downloadSelected = async () => {
    if (selectedHexes.size === 0) {
      alert('请先选择要下载的斗魂海克斯素材');
      return;
    }

    setDownloading(true);
    
    try {
      const zip = new JSZip();
      const selectedHexData = hexes.filter(hex => selectedHexes.has(hex.name));
      
      // 显示进度
      let completed = 0;
      const total = selectedHexData.length;
      
      for (const hex of selectedHexData) {
        try {
          const response = await fetch(hex.imageUrl);
          const blob = await response.blob();
          zip.file(`${hex.displayName}_${hex.name}.png`, blob);
          
          completed++;
          console.log(`下载进度: ${completed}/${total} - ${hex.displayName}`);
        } catch (error) {
          console.warn(`Failed to download ${hex.name}:`, error);
        }
      }
      
      // 生成并下载 ZIP 文件
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `斗魂海克斯素材_${selectedHexes.size}个_${new Date().toISOString().split('T')[0]}.zip`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      // 显示成功提示
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
      notification.textContent = `🎉 成功下载 ${selectedHexes.size} 个斗魂海克斯素材！`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 3000);
      
    } catch (error) {
      console.error('Download failed:', error);
      alert('下载失败，请稍后重试');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" 
               style={{ borderColor: theme.primary }}></div>
          <p style={{ color: theme.text }}>加载斗魂海克斯素材中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{ 
              backgroundColor: theme.secondary,
              color: theme.text 
            }}
          >
            <ArrowLeft size={20} />
            返回
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: theme.text }}>
              斗魂海克斯素材
            </h1>
            <p className="text-sm opacity-70" style={{ color: theme.text }}>
              共 {hexes.length} 个海克斯素材，已选择 {selectedHexes.size} 个
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 调试按钮 */}
          <button
            onClick={() => {
              console.log('=== 海克斯图片加载调试信息 ===');
              console.log('Hexes count:', hexes.length);
              console.log('Image load errors:', Array.from(imageLoadErrors));
              console.log('Sample hex image URL:', hexes[0]?.imageUrl);
              
              // 测试第一个图片是否可以加载
              if (hexes[0]) {
                const testImg = new window.Image();
                testImg.onload = () => console.log('✅ Test hex image loaded successfully');
                testImg.onerror = () => console.log('❌ Test hex image failed to load');
                testImg.src = hexes[0].imageUrl;
              }
            }}
            className="px-3 py-1 text-xs rounded"
            style={{ backgroundColor: theme.secondary, color: theme.text }}
          >
            调试
          </button>
          
          {/* 视图切换 */}
          <div className="flex rounded-lg overflow-hidden" style={{ backgroundColor: theme.secondary }}>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'opacity-100' : 'opacity-60'}`}
              style={{ color: theme.text }}
            >
              <Grid3X3 size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${viewMode === 'list' ? 'opacity-100' : 'opacity-60'}`}
              style={{ color: theme.text }}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* 搜索和操作栏 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* 搜索框 */}
        <div className="relative flex-1 max-w-md">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-50" 
                  style={{ color: theme.text }} />
          <input
            type="text"
            placeholder="搜索海克斯素材..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border-none outline-none"
            style={{ 
              backgroundColor: theme.secondary,
              color: theme.text 
            }}
          />
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{ 
              backgroundColor: theme.secondary,
              color: theme.text 
            }}
          >
            {selectedHexes.size === filteredHexes.length ? (
              <CheckSquare size={20} />
            ) : (
              <Square size={20} />
            )}
            {selectedHexes.size === filteredHexes.length ? '取消全选' : '全选'}
          </button>

          <button
            onClick={downloadSelected}
            disabled={selectedHexes.size === 0 || downloading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            style={{ 
              backgroundColor: theme.primary,
              color: '#ffffff'
            }}
          >
            {downloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                下载中...
              </>
            ) : (
              <>
                <Download size={20} />
                下载选中 ({selectedHexes.size})
              </>
            )}
          </button>
        </div>
      </div>

      {/* 海克斯网格/列表 */}
      {filteredHexes.length === 0 ? (
        <div className="text-center py-12">
          <Package size={64} className="mx-auto mb-4 opacity-50" style={{ color: theme.text }} />
          <p className="text-lg opacity-70" style={{ color: theme.text }}>
            没有找到匹配的海克斯素材
          </p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4"
            : "space-y-2"
        }>
          {filteredHexes.map((hex) => (
            <div
              key={hex.name}
              className={`
                relative group cursor-pointer transition-all duration-200 hover:scale-105
                ${viewMode === 'grid' ? 'aspect-square relative' : 'flex items-center gap-3 p-3'}
              `}
              style={{ 
                backgroundColor: theme.surface,
                borderRadius: '8px',
                overflow: 'hidden',
                ...(selectedHexes.has(hex.name) ? {
                  outline: `2px solid ${theme.primary}`
                } : {})
              }}
              onClick={() => toggleHexSelection(hex.name)}
            >
              {viewMode === 'grid' ? (
                <>
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    {!imageLoadErrors.has(hex.name) ? (
                      <img
                        src={hex.imageUrl}
                        alt={hex.displayName}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                          loadedImages.has(hex.name) ? 'opacity-100' : 'opacity-0'
                        }`}
                        onError={(_e) => { 
                          console.warn(`Failed to load image: ${hex.imageUrl}`);
                          setImageLoadErrors(prev => new Set([...prev, hex.name]));
                        }}
                        onLoad={(_e) => {
                          console.log(`Successfully loaded image: ${hex.name}`);
                          setLoadedImages(prev => new Set([...prev, hex.name]));
                        }}
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-500 text-xs p-2">
                        <Package size={24} className="mb-1" />
                        <span className="text-center">{hex.displayName}</span>
                      </div>
                    )}
                    {!loadedImages.has(hex.name) && !imageLoadErrors.has(hex.name) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
                      </div>
                    )}
                  </div>
                  {/* 选中状态指示器 */}
                  {selectedHexes.has(hex.name) && (
                    <div className="absolute top-2 right-2 z-10">
                      <CheckSquare size={20} className="text-white drop-shadow-lg" />
                    </div>
                  )}
                  
                  {/* 悬停覆盖层 */}
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-200 pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 rounded-b-lg flex items-center justify-center gap-2">
                    <div className="font-medium truncate">{hex.displayName}</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                    {!imageLoadErrors.has(hex.name) ? (
                      <img
                        src={hex.imageUrl}
                        alt={hex.displayName}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                          loadedImages.has(hex.name) ? 'opacity-100' : 'opacity-0'
                        }`}
                        onError={(_e) => {
                          console.warn(`Failed to load image: ${hex.imageUrl}`);
                          setImageLoadErrors(prev => new Set([...prev, hex.name]));
                        }}
                        onLoad={(_e) => {
                          console.log(`Successfully loaded image: ${hex.name}`);
                          setLoadedImages(prev => new Set([...prev, hex.name]));
                        }}
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="flex items-center justify-center text-gray-500">
                        <Package size={16} />
                      </div>
                    )}
                    {!loadedImages.has(hex.name) && !imageLoadErrors.has(hex.name) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium" style={{ color: theme.text }}>
                      {hex.displayName}
                    </div>
                    <div className="text-sm opacity-70" style={{ color: theme.text }}>
                      {hex.name}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {selectedHexes.has(hex.name) ? (
                      <CheckSquare size={20} style={{ color: theme.primary }} />
                    ) : (
                      <Square size={20} style={{ color: theme.text }} className="opacity-50" />
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
