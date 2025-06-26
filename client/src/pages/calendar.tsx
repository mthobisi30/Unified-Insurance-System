import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Calendar as CalendarIcon, Clock, MapPin, Video } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMeetingSchema } from "@shared/schema";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Meeting } from "@shared/schema";
import { z } from "zod";

const createMeetingSchema = insertMeetingSchema.extend({
  startTime: z.date(),
  endTime: z.date(),
});

export default function Calendar() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const { data: meetings, isLoading: meetingsLoading, error } = useQuery<Meeting[]>({
    queryKey: ["/api/meetings"],
    enabled: isAuthenticated,
  });

  const form = useForm<z.infer<typeof createMeetingSchema>>({
    resolver: zodResolver(createMeetingSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      meetingLink: "",
      status: "scheduled",
      startTime: new Date(),
      endTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    },
  });

  const createMeetingMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createMeetingSchema>) => {
      const payload = {
        ...data,
        startTime: data.startTime.toISOString(),
        endTime: data.endTime.toISOString(),
      };
      await apiRequest("POST", "/api/meetings", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meetings"] });
      setShowCreateDialog(false);
      form.reset();
      toast({
        title: "Success",
        description: "Meeting scheduled successfully",
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
        description: "Failed to schedule meeting",
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

  const onSubmit = (values: z.infer<typeof createMeetingSchema>) => {
    createMeetingMutation.mutate(values);
  };

  const selectedDateMeetings = meetings?.filter(meeting => {
    if (!selectedDate) return false;
    const meetingDate = new Date(meeting.startTime);
    return meetingDate.toDateString() === selectedDate.toDateString();
  });

  const getMeetingDates = () => {
    if (!meetings) return [];
    return meetings.map(meeting => new Date(meeting.startTime));
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
                <h2 className="text-2xl font-semibold text-neutral-900">Calendar</h2>
                <p className="text-sm text-neutral-700">Schedule and manage team meetings</p>
              </div>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Meeting
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Schedule New Meeting</DialogTitle>
                    <DialogDescription>
                      Create a new meeting for your team.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter meeting title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter meeting description" 
                                {...field} 
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="startTime"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Start Time</FormLabel>
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
                                        format(field.value, "PPP p")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <CalendarComponent
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date < new Date(new Date().setHours(0, 0, 0, 0))
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="endTime"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>End Time</FormLabel>
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
                                        format(field.value, "PPP p")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <CalendarComponent
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date < new Date(new Date().setHours(0, 0, 0, 0))
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter meeting location" 
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
                        name="meetingLink"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meeting Link</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter video meeting link" 
                                {...field} 
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="submit" disabled={createMeetingMutation.isPending}>
                          {createMeetingMutation.isPending ? "Scheduling..." : "Schedule Meeting"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>
                  Select a date to view scheduled meetings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  modifiers={{
                    meeting: getMeetingDates(),
                  }}
                  modifiersStyles={{
                    meeting: { backgroundColor: '#3B82F6', color: 'white' },
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDate ? format(selectedDate, "PPP") : "Select a Date"}
                </CardTitle>
                <CardDescription>
                  {selectedDateMeetings?.length || 0} meetings scheduled
                </CardDescription>
              </CardHeader>
              <CardContent>
                {meetingsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : selectedDateMeetings && selectedDateMeetings.length > 0 ? (
                  <div className="space-y-4">
                    {selectedDateMeetings.map((meeting) => (
                      <div key={meeting.id} className="border rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">{meeting.title}</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            {format(new Date(meeting.startTime), "h:mm a")} - {format(new Date(meeting.endTime), "h:mm a")}
                          </div>
                          {meeting.location && (
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              {meeting.location}
                            </div>
                          )}
                          {meeting.meetingLink && (
                            <div className="flex items-center">
                              <Video className="w-4 h-4 mr-2" />
                              <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                Join Meeting
                              </a>
                            </div>
                          )}
                        </div>
                        {meeting.description && (
                          <p className="mt-2 text-sm text-gray-600">{meeting.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <CalendarIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No meetings scheduled for this date.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
