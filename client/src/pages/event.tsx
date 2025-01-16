import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { format } from "date-fns";

const GIFT_SUGGESTIONS: Record<string, string[]> = {
  "Art & Crafting": ["Art supplies set", "Craft kit", "Drawing tablet"],
  "Sports": ["Sports equipment", "Team jersey", "Training gear"],
  "Science": ["Science kit", "Microscope", "Chemistry set"],
  "Music": ["Musical instrument", "Headphones", "Music lessons"],
  "Reading": ["Book series", "E-reader", "Bookstore gift card"],
  "Video Games": ["Video game", "Gaming accessory", "Gaming gift card"],
  "Outdoor Activities": ["Bike", "Scooter", "Outdoor games"],
  "Cooking": ["Kids cookbook", "Cooking kit", "Baking set"],
  "Animals": ["Stuffed animals", "Animal books", "Zoo membership"],
  "Building & Construction": ["Building blocks", "Construction set", "Robot kit"],
};

export default function Event({ params }: { params: { token: string }}) {
  const { toast } = useToast();
  const { token } = params;

  const { data: event, isLoading } = useQuery({
    queryKey: [`/api/events/${token}`],
  });

  const { data: rsvpCount } = useQuery({
    queryKey: [`/api/events/${token}/rsvp-count`],
    enabled: !!event,
  });

  const { register, handleSubmit } = useForm({
    defaultValues: {
      parentEmail: "",
      attending: "yes",
    }
  });

  const rsvpMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/events/${token}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to RSVP");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "RSVP Confirmed!",
        description: "Check your email for the calendar invite.",
      });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!event) {
    return <div>Event not found</div>;
  }

  const giftSuggestions = event.interests.flatMap(
    (interest: string) => GIFT_SUGGESTIONS[interest] || []
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-3xl text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {event.childName}'s {event.ageTurning}th Birthday Party!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center text-lg">
              <p className="font-semibold">
                {format(new Date(event.eventDate), "EEEE, MMMM do 'at' h:mm a")}
              </p>
              <p className="mt-2">{event.description}</p>
              <p className="mt-4 text-sm text-muted-foreground">
                Current RSVPs: {rsvpCount || 0} guest(s)
              </p>
            </div>

            <form onSubmit={handleSubmit((data) => rsvpMutation.mutate(data))} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parentEmail">Your Email</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  {...register("parentEmail", { required: true })}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={rsvpMutation.isPending}
              >
                {rsvpMutation.isPending ? "Confirming..." : "Confirm RSVP"}
              </Button>
            </form>

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Gift Suggestions</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {giftSuggestions.map((gift, index) => (
                  <Card key={index}>
                    <CardContent className="p-4 text-center">
                      {gift}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
