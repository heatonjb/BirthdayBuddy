import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
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
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!event) {
    return <div className="min-h-screen flex items-center justify-center">Event not found</div>;
  }

  const giftSuggestions = event.interests.flatMap(
    (interest: string) => GIFT_SUGGESTIONS[interest] || []
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto pt-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            {event.childName}'s {event.ageTurning}th Birthday!
          </h1>
          <p className="text-gray-600">
            {format(new Date(event.eventDate), "EEEE, MMMM do 'at' h:mm a")}
          </p>
        </div>

        <Card className="bg-white shadow-sm mb-8">
          <CardContent className="pt-6">
            <div className="prose max-w-none mb-6">
              <p className="text-gray-700">{event.description}</p>
              <p className="text-sm text-gray-500 mt-4">
                Current RSVPs: {rsvpCount || 0} guest(s)
              </p>
            </div>

            <form onSubmit={handleSubmit((data) => rsvpMutation.mutate(data))} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parentEmail" className="text-sm font-medium text-gray-700">Your Email</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  className="w-full"
                  {...register("parentEmail", { required: true })}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={rsvpMutation.isPending}
              >
                {rsvpMutation.isPending ? "Confirming..." : "Confirm RSVP"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Gift Suggestions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {giftSuggestions.map((gift, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-lg text-center text-gray-700"
              >
                {gift}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}