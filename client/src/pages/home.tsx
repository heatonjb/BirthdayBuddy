import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-3xl text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Create a Birthday Party Event
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit((data) => createEvent.mutate(data))} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="parentEmail">Your Email</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  {...register("parentEmail", { required: true })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="childName">Birthday Child's Name</Label>
                <Input
                  id="childName"
                  {...register("childName", { required: true })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ageTurning">Age Turning</Label>
                  <Input
                    id="ageTurning"
                    type="number"
                    {...register("ageTurning", { required: true, min: 1 })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="eventDate">Event Date & Time</Label>
                  <Input
                    id="eventDate"
                    type="datetime-local"
                    {...register("eventDate", { required: true })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Child's Interests (for gift suggestions)</Label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => (
                    <Button
                      key={interest}
                      type="button"
                      variant={selectedInterests.includes(interest) ? "secondary" : "outline"}
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
                <Label htmlFor="description">Event Description</Label>
                <Textarea
                  id="description"
                  {...register("description", { required: true })}
                  placeholder="Share details about the party..."
                />
              </div>

              <Button
                type="submit"
                className="w-full"
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
