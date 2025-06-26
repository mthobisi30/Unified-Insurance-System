import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, FileText, File } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function FileUploadModal({ open, onOpenChange }: FileUploadModalProps) {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState("General");
  const [description, setDescription] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async ({ files, category, description }: { files: File[]; category: string; description: string }) => {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      formData.append('category', category);
      formData.append('description', description);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setFiles([]);
      setCategory("General");
      setDescription("");
      onOpenChange?.(false);
      toast({
        title: "Success",
        description: "Documents uploaded successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to upload documents",
        variant: "destructive",
      });
    },
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(file => {
      const allowedTypes = /\.(pdf|doc|docx|xls|xlsx)$/i;
      return allowedTypes.test(file.name) && file.size <= 10 * 1024 * 1024; // 10MB
    });

    if (validFiles.length !== droppedFiles.length) {
      toast({
        title: "Invalid files",
        description: "Only PDF, Word, and Excel files up to 10MB are allowed",
        variant: "destructive",
      });
    }

    setFiles(prev => [...prev, ...validFiles]);
  }, [toast]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') {
      return <FileText className="w-8 h-8 text-red-600" />;
    }
    if (extension === 'doc' || extension === 'docx') {
      return <FileText className="w-8 h-8 text-blue-600" />;
    }
    if (extension === 'xls' || extension === 'xlsx') {
      return <FileText className="w-8 h-8 text-green-600" />;
    }
    return <File className="w-8 h-8 text-gray-600" />;
  };

  const handleSubmit = () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate({ files, category, description });
  };

  const handleClose = () => {
    if (!uploadMutation.isPending) {
      setFiles([]);
      setCategory("General");
      setDescription("");
      onOpenChange?.(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogDescription>
            Upload documents for your team. Supports PDF, Word, and Excel files up to 10MB.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="category" className="text-sm font-medium text-neutral-700 mb-2 block">
              Document Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Policy Documents">Policy Documents</SelectItem>
                <SelectItem value="Claims Reports">Claims Reports</SelectItem>
                <SelectItem value="Financial Reports">Financial Reports</SelectItem>
                <SelectItem value="Correspondence">Correspondence</SelectItem>
                <SelectItem value="Legal Documents">Legal Documents</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="file-upload" className="text-sm font-medium text-neutral-700 mb-2 block">
              File Upload
            </Label>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                isDragOver 
                  ? "border-ms-blue bg-blue-50" 
                  : "border-neutral-300 hover:border-ms-blue"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600 mb-2">
                Drag and drop files here, or{" "}
                <label className="text-ms-blue hover:text-ms-blue-dark font-medium cursor-pointer">
                  browse
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileSelect}
                  />
                </label>
              </p>
              <p className="text-sm text-neutral-500">
                Supports PDF, Word, Excel files up to 10MB
              </p>
            </div>
          </div>

          {files.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-neutral-700 mb-2 block">
                Selected Files ({files.length})
              </Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border border-neutral-300 rounded-md">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file.name)}
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{file.name}</p>
                        <p className="text-xs text-neutral-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-neutral-500 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="description" className="text-sm font-medium text-neutral-700 mb-2 block">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Add a description for these documents..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={uploadMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={uploadMutation.isPending || files.length === 0}
            className="bg-ms-blue hover:bg-ms-blue-dark"
          >
            {uploadMutation.isPending ? "Uploading..." : "Upload Documents"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
