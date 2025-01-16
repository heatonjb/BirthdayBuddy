import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Admin({ params }: { params: { token: string }}) {
  const { toast } = useToast();
  const { token } = params;

  const { data: event, isLoading } = useQuery({
    queryKey: [`/api/events/${token}/admin`],
  });

  const { data: rsvps } = useQuery({
    queryKey: [`/api/events/${token}/admin/rsvps`],
    enabled: !!event,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/events/${token}/admin`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete event");
      }
    },
    onSuccess: () => {
      toast({
        title: "Event Deleted",
        description: "The birthday event has been cancelled.",
      });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!event) {
    return <div>Event not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-3xl text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Admin Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Event Details</h2>
              <p><strong>Child:</strong> {event.childName}</p>
              <p><strong>Age Turning:</strong> {event.ageTurning}</p>
              <p><strong>Date:</strong> {format(new Date(event.eventDate), "PPP p")}</p>
              <p><strong>Description:</strong> {event.description}</p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Share Links</h2>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">RSVP Link (share with guests):</p>
                <code className="block p-2 bg-muted rounded">
                  {window.location.origin}/event/{event.guestToken}
                </code>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold">RSVPs</h2>
              {rsvps?.length ? (
                <div className="space-y-2">
                  {rsvps.map((rsvp: any) => (
                    <Card key={rsvp.id}>
                      <CardContent className="p-4">
                        <p><strong>Email:</strong> {rsvp.parentEmail}</p>
                        <p><strong>Status:</strong> {rsvp.attending ? "Attending" : "Not attending"}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p>No RSVPs yet</p>
              )}
            </div>

            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                if (window.confirm("Are you sure you want to cancel this event?")) {
                  deleteMutation.mutate();
                }
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Cancelling..." : "Cancel Event"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
