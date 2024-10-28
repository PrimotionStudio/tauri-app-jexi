"use client";
import { useState } from 'react';
import { FolderOpen, Download, ArrowRight, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { open } from '@tauri-apps/plugin-dialog';
import { readDir, BaseDirectory, DirEntry } from '@tauri-apps/plugin-fs';

const JexiInterface = () => {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  // In a real app, these would be connected to actual functionality
  const [isProcessing, setIsProcessing] = useState(false);
  const [filesProcessed, setFilesProcessed] = useState(0);
  const [files, setFiles] = useState<DirEntry[]>([]);

  const selectFolder = async () => {
    setIsProcessing(true);
    const folder = await open({
      directory: true,
      defaultPath: '~/Downloads'
    });
    if (folder) setSelectedFolder(folder);
    if (typeof selectedFolder === "string") {
      // Read directory contents
      const entries = await readDir(selectedFolder);

      // Filter to include only files (exclude subdirectories)
      // const fileEntries = entries.filter((entry) => !entry.children);

      setFiles(entries);
    }
    setIsProcessing(false);
  };

  const readDirectory = async () => {
    const entries = await readDir('users', { baseDir: BaseDirectory.AppLocalData });
    console.log(entries);
    setFiles(entries);
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
                <div className="text-sm text-gray-600">{selectedFolder?.split('/').at(-1)} Folder</div>
              </div>
              <ArrowRight className="h-5 w-5 text-blue-600" />
            </div>

            {/* Status */}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                {files?.map((file, index) => (
                  <span key={index}>{file.name}</span>
                ))}
              </p>
            </div>

            {/* Action Button */}
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={readDirectory}
              disabled={isProcessing}
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