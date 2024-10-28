"use client";
import { useState } from 'react';
import { FolderOpen, Download, ArrowRight, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { open } from '@tauri-apps/plugin-dialog';
import { readDir, BaseDirectory, DirEntry } from '@tauri-apps/plugin-fs';
import os from 'os';
import path from 'path';
import fs from 'fs';


const JexiInterface = () => {
  const homeDir = os.homedir();
  const directories = {
    Home: homeDir,
    Pictures: path.join(homeDir, "Pictures"),
    Videos: path.join(homeDir, "Videos"),
    Downloads: path.join(homeDir, "Downloads"),
    Documents: path.join(homeDir, "Documents"),
    Music: path.join(homeDir, "Music"),
    Templates: path.join(homeDir, "Templates"),
  };
  const extensions = {
    Pictures: [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg"],
    Videos: [".mp4", ".mkv", ".avi", ".mov", ".flv"],
    Music: [".mp3", ".wav", ".flac", ".aac", ".ogg"],
    Documents: [".pdf", ".docx", ".doc", ".txt", ".xlsx", ".pptx"]
  };
  const [selectedFolder, setSelectedFolder] = useState<string | null>(directories.Downloads);
  // In a real app, these would be connected to actual functionality
  const [isProcessing, setIsProcessing] = useState(false);
  const [filesProcessed, setFilesProcessed] = useState(0);
  const [directoryItems, setDirectoryItems] = useState<DirEntry[]>([]);

  const selectFolder = async () => {
    setIsProcessing(true);
    const folder = await open({
      directory: true,
      defaultPath: '~/Downloads',
    });
    if (folder) {
      const entries = await readDir(folder);
      setDirectoryItems(entries);
    }
    setIsProcessing(false);
  };
  const getDestinationFolder = (fileName: string): string => {
    const extension = path.extname(fileName).toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg"].includes(extension)) {
      return directories.Pictures;
    } else if ([".mp4", ".mkv", ".avi", ".mov", ".flv"].includes(extension)) {
      return directories.Videos;
    } else if ([".mp3", ".wav", ".flac", ".aac", ".ogg"].includes(extension)) {
      return directories.Music;
    } else if ([".pdf", ".docx", ".doc", ".txt", ".xlsx", ".pptx"].includes(extension)) {
      return directories.Documents;
    } else {
      return directories.Downloads;
    }
  };
  const organizeFiles = async () => {
    setIsProcessing(true);
    directoryItems.forEach((item) => {
      if (item.isFile) {
        const currentFilePath = path.join(process.cwd(), item.name);  // current file path
        const destinationFolder = getDestinationFolder(item.name);
        const fileDestination = path.join(destinationFolder, item.name);
        fs.mkdirSync(destinationFolder, { recursive: true });  // destination folder

        // move the file
        fs.rename(currentFilePath, fileDestination, (err) => {
          if (err) {
            console.error(`Error moving file ${item.name}:`, err);
          } else {
            console.log(`Moved ${item.name} to ${destinationFolder}`);
          }
        });
      }
    });
    setIsProcessing(false);
  };
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-semibold text-gray-800">Jexi</h1>
            </div>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5 text-gray-600" />
            </Button>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 cursor-pointer" onClick={selectFolder}>
              <div className="flex items-center gap-3">
                <FolderOpen className="h-5 w-5 text-blue-600" />
                <div className="text-sm text-gray-600">{selectedFolder?.split('/').at(-1) ? selectedFolder?.split('/').at(-1) : 'Downloads'}</div>
              </div>
              <ArrowRight className="h-5 w-5 text-blue-600" />
            </div>

            {/* Status */}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                {directoryItems?.map((directoryItem, index) => (
                  <span key={index}>{directoryItem.name}</span>
                ))}
              </p>
            </div>

            {/* Action Button */}
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={organizeFiles}
            // disabled={isProcessing}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Organizing...</span>
                </div>
              ) : (
                'Organize Files'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JexiInterface;