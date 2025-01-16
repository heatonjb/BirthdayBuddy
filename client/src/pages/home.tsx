import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

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

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      parentEmail: "",
      childName: "",
      ageTurning: "",
      eventDate: "",
      description: "",
    }
  });

  const createEvent = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, interests: selectedInterests }),
      });

      if (!response.ok) {
        throw new Error("Failed to create event");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: "Birthday event created! Check your email for the links.",
      });
      setLocation(`/admin/${data.adminToken}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create the event. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto pt-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Create a Birthday Event</h1>
          <p className="text-gray-600">Plan your child's special day with ease</p>
        </div>

        <Card className="bg-white shadow-sm">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit((data) => createEvent.mutate(data))} className="space-y-6">
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
                <Label htmlFor="childName" className="text-sm font-medium text-gray-700">Birthday Child's Name</Label>
                <Input
                  id="childName"
                  className="w-full"
                  {...register("childName", { required: true })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ageTurning" className="text-sm font-medium text-gray-700">Age Turning</Label>
                  <Input
                    id="ageTurning"
                    type="number"
                    className="w-full"
                    {...register("ageTurning", { required: true, min: 1 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventDate" className="text-sm font-medium text-gray-700">Event Date & Time</Label>
                  <Input
                    id="eventDate"
                    type="datetime-local"
                    className="w-full"
                    {...register("eventDate", { required: true })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Child's Interests</Label>
                <p className="text-sm text-gray-500 mb-2">Select interests for gift suggestions</p>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => (
                    <Button
                      key={interest}
                      type="button"
                      variant={selectedInterests.includes(interest) ? "secondary" : "outline"}
                      className={`text-sm ${
                        selectedInterests.includes(interest) 
                          ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        setSelectedInterests((prev) =>
                          prev.includes(interest)
                            ? prev.filter((i) => i !== interest)
                            : [...prev, interest]
                        );
                      }}
                    >
                      {interest}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">Event Description</Label>
                <Textarea
                  id="description"
                  className="w-full min-h-[100px]"
                  {...register("description", { required: true })}
                  placeholder="Share details about the party..."
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={createEvent.isPending}
              >
                {createEvent.isPending ? "Creating..." : "Create Birthday Event"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}