import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useState } from "react";

const INTERESTS = [
  "Art & Crafting",
  "Sports",
  "Science",
  "Music",
  "Reading",
  "Video Games",
  "Outdoor Activities",
  "Cooking",
  "Animals",
  "Building & Construction",
];

export default function Admin({ params }: { params: { token: string }}) {
  const { toast } = useToast();
  const { token } = params;
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  const { data: event, isLoading } = useQuery({
    queryKey: [`/api/events/${token}/admin`],
  });

  const { data: rsvps } = useQuery({
    queryKey: [`/api/events/${token}/admin/rsvps`],
    enabled: !!event,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/events/${token}/admin`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update event");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Event details updated successfully.",
      });
      setIsEditing(false);
    },
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

  const handleEdit = () => {
    setFormData({
      parentEmail: event.parentEmail,
      childName: event.childName,
      ageTurning: event.ageTurning,
      eventDate: format(new Date(event.eventDate), "yyyy-MM-dd'T'HH:mm"),
      description: event.description,
      interests: event.interests,
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-3xl text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {event.childName}'s {event.ageTurning}th Birthday Party (Admin Page)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="parentEmail">Parent Email</Label>
                  <Input
                    id="parentEmail"
                    value={formData.parentEmail}
                    onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="childName">Child's Name</Label>
                  <Input
                    id="childName"
                    value={formData.childName}
                    onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ageTurning">Age Turning</Label>
                    <Input
                      id="ageTurning"
                      type="number"
                      value={formData.ageTurning}
                      onChange={(e) => setFormData({ ...formData, ageTurning: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eventDate">Event Date & Time</Label>
                    <Input
                      id="eventDate"
                      type="datetime-local"
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Child's Interests</Label>
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS.map((interest) => (
                      <Button
                        key={interest}
                        type="button"
                        variant={formData.interests.includes(interest) ? "secondary" : "outline"}
                        onClick={() => {
                          setFormData({
                            ...formData,
                            interests: formData.interests.includes(interest)
                              ? formData.interests.filter((i: string) => i !== interest)
                              : [...formData.interests, interest],
                          });
                        }}
                      >
                        {interest}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Event Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    className="flex-1"
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Event Details</h2>
                  <p><strong>Parent Email:</strong> {event.parentEmail}</p>
                  <p><strong>Child:</strong> {event.childName}</p>
                  <p><strong>Age Turning:</strong> {event.ageTurning}</p>
                  <p><strong>Date:</strong> {format(new Date(event.eventDate), "PPP p")}</p>
                  <p><strong>Description:</strong> {event.description}</p>
                  <p><strong>Interests:</strong> {event.interests.join(", ")}</p>
                  <Button onClick={handleEdit} className="mt-2">Edit Details</Button>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-gray-900">Share Links</h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">RSVP Link (share with guests)</p>
                      <div className="flex flex-col gap-2">
                        <code className="block p-2 bg-gray-50 rounded text-sm break-all">
                          {window.location.origin}/event/{event.guestToken}
                        </code>
                        <a
                          href={`${window.location.origin}/event/${event.guestToken}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center gap-1"
                        >
                          Open RSVP page
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </div>
                    </div>
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
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}