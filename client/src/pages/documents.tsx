import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Upload, Download, Eye, FileText, File } from "lucide-react";
import FileUploadModal from "@/components/modals/file-upload-modal";
import type { Document } from "@shared/schema";

export default function Documents() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);

  const { data: documents, isLoading: documentsLoading, error } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
    enabled: isAuthenticated,
  });

  const { data: searchResults, isLoading: searchLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents/search", searchQuery],
    enabled: isAuthenticated && searchQuery.length > 2,
    queryFn: async () => {
      const response = await fetch(`/api/documents/search?q=${encodeURIComponent(searchQuery)}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
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
  }, [error, toast]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  const displayDocuments = searchQuery.length > 2 ? searchResults : documents;
  const isSearching = searchQuery.length > 2 && searchLoading;

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return <FileText className="w-5 h-5 text-red-600" />;
    if (mimeType.includes('word')) return <FileText className="w-5 h-5 text-blue-600" />;
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return <FileText className="w-5 h-5 text-green-600" />;
    return <File className="w-5 h-5 text-gray-600" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-neutral-900">Documents</h2>
                <p className="text-sm text-neutral-700">Manage and organize team documents</p>
              </div>
              <Button onClick={() => setShowUploadModal(true)} className="bg-blue-600 hover:bg-blue-700">
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </div>

            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-4 h-4" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                {searchQuery.length > 2 ? `Search Results for "${searchQuery}"` : "All Documents"}
              </CardTitle>
              <CardDescription>
                {displayDocuments?.length || 0} documents found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documentsLoading || isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : displayDocuments && displayDocuments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-300">
                    <thead className="bg-neutral-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                          Document Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                          Size
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                          Uploaded
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-300">
                      {displayDocuments.map((document) => (
                        <tr key={document.id} className="hover:bg-neutral-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getFileIcon(document.mimeType)}
                              <span className="ml-3 text-sm font-medium text-neutral-900">
                                {document.originalName}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                            {document.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                            {(document.fileSize / 1024).toFixed(1)} KB
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                            {new Date(document.createdAt!).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getStatusColor(document.status || 'pending')}>
                              {document.status || 'pending'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600">
                    {searchQuery.length > 2 ? "No documents found matching your search." : "No documents uploaded yet."}
                  </p>
                  {searchQuery.length <= 2 && (
                    <Button 
                      onClick={() => setShowUploadModal(true)} 
                      className="mt-4 bg-blue-600 hover:bg-blue-700"
                    >
                      Upload Your First Document
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
      <FileUploadModal open={showUploadModal} onOpenChange={setShowUploadModal} />
    </div>
  );
}
