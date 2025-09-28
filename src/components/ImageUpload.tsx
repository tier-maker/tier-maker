"use client";

import { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { TierItem } from "@/types";

interface ImageUploadProps {
  onImagesAdded: (items: TierItem[]) => void;
}

export default function ImageUpload({ onImagesAdded }: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const processFiles = useCallback(
    (files: FileList) => {
      const newItems: TierItem[] = [];

      Array.from(files).forEach((file) => {
        if (file.type.startsWith("image/")) {
          const item: TierItem = {
            id: `item-${Date.now()}-${Math.random()}`,
            name: file.name,
            imageUrl: URL.createObjectURL(file),
            file,
          };
          newItems.push(item);
        }
      });

      if (newItems.length > 0) {
        onImagesAdded(newItems);
      }
    },
    [onImagesAdded]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (e.dataTransfer.files) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        processFiles(e.target.files);
      }
    },
    [processFiles]
  );

  return (
    <div className="w-full p-4">
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${
            isDragOver
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          上传图片到图片池
        </p>
        <p className="text-sm text-gray-500 mb-4">
          拖拽图片到这里，或者点击选择文件
        </p>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
        >
          选择文件
        </label>
      </div>
    </div>
  );
}
