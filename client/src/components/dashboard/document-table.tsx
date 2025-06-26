import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, Eye, Download, File } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import type { Document } from "@shared/schema";

export default function DocumentTable() {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents", { limit: 10 }],
    queryFn: async () => {
      const response = await fetch("/api/documents?limit=10", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: isAuthenticated,
  });

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) {
      return <FileText className="w-5 h-5 text-red-600" />;
    }
    if (mimeType.includes('word')) {
      return <FileText className="w-5 h-5 text-blue-600" />;
    }
    if (mimeType.includes('excel') || mimeType.includes('sheet')) {
      return <FileText className="w-5 h-5 text-green-600" />;
    }
    return <File className="w-5 h-5 text-gray-600" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-neutral-300">
          <CardTitle className="text-lg font-semibold text-neutral-900">Recent Documents</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-neutral-300">
        <CardTitle className="text-lg font-semibold text-neutral-900">Recent Documents</CardTitle>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-4 h-4" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Link href="/documents">
            <Button variant="ghost" size="sm" className="text-ms-blue hover:text-ms-blue-dark font-medium">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {documents && documents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-300">
              <thead className="bg-neutral-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Document Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Uploaded By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Date
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
                {documents
                  .filter((doc) => 
                    searchQuery.length === 0 || 
                    doc.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    doc.category.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((document) => (
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
                        {document.uploadedBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                        {format(new Date(document.createdAt!), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusColor(document.status || 'pending')}>
                          {document.status || 'pending'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" className="text-ms-blue hover:text-ms-blue-dark">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-neutral-500 hover:text-neutral-700">
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
            <p className="text-neutral-600">No documents found.</p>
            <Link href="/documents">
              <Button className="mt-4 bg-ms-blue hover:bg-ms-blue-dark">
                Upload Your First Document
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
