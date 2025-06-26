import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Mail, Search, Calendar as CalendarIcon, Tag } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEmailArchiveSchema } from "@shared/schema";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { EmailArchive } from "@shared/schema";
import { z } from "zod";

const createEmailArchiveSchema = insertEmailArchiveSchema.extend({
  emailDate: z.date(),
});

export default function EmailArchive() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: emails, isLoading: emailsLoading, error } = useQuery<EmailArchive[]>({
    queryKey: ["/api/email-archives"],
    enabled: isAuthenticated,
  });

  const { data: searchResults, isLoading: searchLoading } = useQuery<EmailArchive[]>({
    queryKey: ["/api/email-archives/search", searchQuery],
    enabled: isAuthenticated && searchQuery.length > 2,
    queryFn: async () => {
      const response = await fetch(`/api/email-archives/search?q=${encodeURIComponent(searchQuery)}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
  });

  const form = useForm<z.infer<typeof createEmailArchiveSchema>>({
    resolver: zodResolver(createEmailArchiveSchema),
    defaultValues: {
      subject: "",
      sender: "",
      recipient: "",
      body: "",
      category: "",
      tags: [],
      emailDate: new Date(),
    },
  });

  const createEmailMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createEmailArchiveSchema>) => {
      const payload = {
        ...data,
        emailDate: data.emailDate.toISOString(),
      };
      await apiRequest("POST", "/api/email-archives", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-archives"] });
      setShowCreateDialog(false);
      form.reset();
      toast({
        title: "Success",
        description: "Email archived successfully",
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
        description: "Failed to archive email",
        variant: "destructive",
      });
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

  const displayEmails = searchQuery.length > 2 ? searchResults : emails;
  const isSearching = searchQuery.length > 2 && searchLoading;

  const onSubmit = (values: z.infer<typeof createEmailArchiveSchema>) => {
    createEmailMutation.mutate(values);
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
                <h2 className="text-2xl font-semibold text-neutral-900">Email Archive</h2>
                <p className="text-sm text-neutral-700">Archive and organize important emails</p>
              </div>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Archive Email
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>Archive Email</DialogTitle>
                    <DialogDescription>
                      Archive an important email for your team records.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter email subject" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="sender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sender</FormLabel>
                              <FormControl>
                                <Input placeholder="sender@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="recipient"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Recipient</FormLabel>
                              <FormControl>
                                <Input placeholder="recipient@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="body"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Body</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Paste the email content here..." 
                                {...field} 
                                value={field.value || ""}
                                rows={4}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g., Claims, Policy, General" 
                                  {...field} 
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="emailDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Email Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={createEmailMutation.isPending}>
                          {createEmailMutation.isPending ? "Archiving..." : "Archive Email"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-4 h-4" />
              <Input
                placeholder="Search archived emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-6">
            {emailsLoading || isSearching ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : displayEmails && displayEmails.length > 0 ? (
              displayEmails.map((email) => (
                <Card key={email.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center">
                          <Mail className="w-5 h-5 mr-2 text-blue-600" />
                          {email.subject}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium">From:</span>
                            <span className="ml-1">{email.sender}</span>
                            <span className="mx-2">•</span>
                            <span className="font-medium">To:</span>
                            <span className="ml-1">{email.recipient}</span>
                            <span className="mx-2">•</span>
                            <span>{format(new Date(email.emailDate), "PPP")}</span>
                          </div>
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        {email.category && (
                          <Badge variant="outline">
                            <Tag className="w-3 h-3 mr-1" />
                            {email.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {email.body && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">
                          {email.body.length > 200 
                            ? `${email.body.substring(0, 200)}...` 
                            : email.body
                          }
                        </p>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Archived: {format(new Date(email.createdAt!), "PPP")}</span>
                      {email.tags && email.tags.length > 0 && (
                        <div className="flex items-center space-x-1">
                          {email.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Mail className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600">
                    {searchQuery.length > 2 ? "No emails found matching your search." : "No emails archived yet."}
                  </p>
                  {searchQuery.length <= 2 && (
                    <Button 
                      onClick={() => setShowCreateDialog(true)} 
                      className="mt-4 bg-blue-600 hover:bg-blue-700"
                    >
                      Archive Your First Email
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
