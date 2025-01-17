import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function Event({ params }: { params: { token: string }}) {
  const { toast } = useToast();
  const { token } = params;
  const [rsvpSuccess, setRsvpSuccess] = useState(false);

  const { data: event, isLoading } = useQuery({
    queryKey: [`/api/events/${token}`],
  });

  const { data: rsvpCount } = useQuery({
    queryKey: [`/api/events/${token}/rsvp-count`],
    enabled: !!event,
  });

  const { data: rsvpList } = useQuery({
    queryKey: [`/api/events/${token}/rsvps`],
    enabled: !!event,
  });

  const { register, handleSubmit, setValue, watch, setError, formState: { errors } } = useForm({
    defaultValues: {
      parentEmail: "",
      childName: "",
      childBirthMonth: "",
      receiveUpdates: true,
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
        const error = await response.json();
        throw new Error(error.message || "Failed to RSVP");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "RSVP Confirmed!",
        description: "Check your email for the calendar invite.",
      });
      setRsvpSuccess(true);
    },
    onError: (error: Error) => {
      if (error.message.includes("duplicate")) {
        setError("childName", {
          type: "manual",
          message: "This child has already been RSVP'd to this event"
        });
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
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

  if (rsvpSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto pt-16">
          <Card className="bg-white shadow-sm">
            <CardContent className="pt-6 text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Thank You for RSVPing!</h2>
              <p className="text-gray-600 mb-6">
                We've sent you a confirmation email with a calendar invite.
                Looking forward to celebrating with you!
              </p>
              <Button
                onClick={() => setRsvpSuccess(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Return to Event Page
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
              <div className="mt-6 border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Who's Coming?</h3>
                {rsvpList?.length > 0 ? (
                  <ul className="list-disc pl-5 text-gray-600">
                    {rsvpList.map((rsvp: any) => (
                      <li key={rsvp.id}>{rsvp.childName}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">Be the first to RSVP!</p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Total RSVPs: {rsvpCount || 0} guest(s)
                </p>
              </div>
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

              <div className="space-y-2">
                <Label htmlFor="childName" className="text-sm font-medium text-gray-700">Child's Name</Label>
                <Input
                  id="childName"
                  type="text"
                  className="w-full"
                  {...register("childName", { required: true })}
                />
                {errors.childName && (
                  <p className="text-sm text-red-500">{errors.childName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="childBirthMonth" className="text-sm font-medium text-gray-700">Child's Birth Month</Label>
                <select
                  id="childBirthMonth"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  {...register("childBirthMonth", { required: true })}
                >
                  <option value="">Select month</option>
                  {MONTHS.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="receiveUpdates"
                  checked={watch("receiveUpdates")}
                  onCheckedChange={(checked) => setValue("receiveUpdates", checked)}
                />
                <Label
                  htmlFor="receiveUpdates"
                  className="text-sm text-gray-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Receive event reminders and updates
                </Label>
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