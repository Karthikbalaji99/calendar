import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Habit, HabitCheckin, InsertHabit, InsertHabitCheckin } from "@shared/schema";
import { OwnerFilter } from "@/components/owner-filter";
import { Plus, TrendingUp, Flame } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import pandaIcon from "@assets/generated_images/Panda_character_avatar_icon_c3ecdae1.png";
import cookieIcon from "@assets/generated_images/Cookie_character_avatar_icon_f4fe2d95.png";
import bothIcon from "@assets/generated_images/Combined_panda_cookie_heart_093d2d02.png";

export default function HabitsPage() {
  const [filter, setFilter] = useState<"all" | "panda" | "cookie" | "both">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    owner: "both" as "panda" | "cookie" | "both",
    color: "#8B5CF6",
  });
  const { toast } = useToast();

  const { data: habits = [] } = useQuery<Habit[]>({ queryKey: ["/api/habits"] });
  const { data: checkins = [] } = useQuery<HabitCheckin[]>({ queryKey: ["/api/habits/checkins"] });

  const createHabitMutation = useMutation({
    mutationFn: async (data: InsertHabit) => {
      const res = await apiRequest("POST", "/api/habits", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      toast({ title: "Habit created!" });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const toggleCheckinMutation = useMutation({
    mutationFn: async (data: { habitId: string; date: string; completed: boolean }) => {
      const res = await apiRequest("POST", "/api/habits/checkins", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits/checkins"] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      owner: "both",
      color: "#8B5CF6",
    });
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({ title: "Please enter a habit name", variant: "destructive" });
      return;
    }
    createHabitMutation.mutate(formData);
  };

  const filteredHabits = habits.filter((habit) => filter === "all" || habit.owner === filter);

  const getOwnerIcon = (owner: string) => {
    if (owner === "panda") return pandaIcon;
    if (owner === "cookie") return cookieIcon;
    return bothIcon;
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split("T")[0]);
    }
    return days;
  };

  const last7Days = getLast7Days();

  const isChecked = (habitId: string, date: string) => {
    return checkins.some((c) => c.habitId === habitId && c.date === date && c.completed);
  };

  const handleToggleCheckin = (habitId: string, date: string) => {
    const checked = isChecked(habitId, date);
    toggleCheckinMutation.mutate({ habitId, date, completed: !checked });
  };

  const getStreak = (habitId: string) => {
    let streak = 0;
    const sortedDates = [...last7Days].reverse();
    for (const date of sortedDates) {
      if (isChecked(habitId, date)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const getChartData = (habitId: string) => {
    return last7Days.map((date) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      completed: isChecked(habitId, date) ? 1 : 0,
    }));
  };

  const colors = [
    { value: "#8B5CF6", name: "Purple" },
    { value: "#EC4899", name: "Pink" },
    { value: "#3B82F6", name: "Blue" },
    { value: "#10B981", name: "Green" },
    { value: "#F59E0B", name: "Orange" },
    { value: "#EF4444", name: "Red" },
  ];

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Habits</h1>
          <div className="flex items-center gap-4">
            <OwnerFilter value={filter} onChange={setFilter} />
            <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-habit">
              <Plus className="w-4 h-4 mr-2" />
              Add Habit
            </Button>
          </div>
        </div>

        {filteredHabits.length === 0 ? (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <p className="text-lg text-muted-foreground">No habits yet</p>
              <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-first-habit">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Habit
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredHabits.map((habit) => {
              const streak = getStreak(habit.id);
              const chartData = getChartData(habit.id);

              return (
                <Card key={habit.id} data-testid={`habit-card-${habit.id}`}>
                  <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                    <CardTitle className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: habit.color }}
                      />
                      <span>{habit.name}</span>
                      <img src={getOwnerIcon(habit.owner)} alt={habit.owner} className="w-5 h-5" />
                    </CardTitle>
                    {streak > 0 && (
                      <Badge variant="outline" className="gap-1">
                        <Flame className="w-3 h-3 text-orange-500" />
                        {streak} day streak
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis
                            dataKey="date"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                          />
                          <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            domain={[0, 1]}
                            ticks={[0, 1]}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "6px",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="completed"
                            stroke={habit.color}
                            strokeWidth={2}
                            dot={{ fill: habit.color, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex gap-2 justify-between">
                      {last7Days.map((date) => (
                        <div key={date} className="flex flex-col items-center gap-2">
                          <div className="text-xs text-muted-foreground">
                            {new Date(date).toLocaleDateString("en-US", { weekday: "short" })}
                          </div>
                          <Checkbox
                            checked={isChecked(habit.id, date)}
                            onCheckedChange={() => handleToggleCheckin(habit.id, date)}
                            data-testid={`checkbox-habit-${habit.id}-${date}`}
                          />
                          <div className="text-xs text-muted-foreground">
                            {new Date(date).getDate()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent data-testid="dialog-add-habit">
            <DialogHeader>
              <DialogTitle>Add Habit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Habit Name</Label>
                <Input
                  id="name"
                  placeholder="Exercise, Read, Meditate..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="input-habit-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Select
                  value={formData.color}
                  onValueChange={(value) => setFormData({ ...formData, color: value })}
                >
                  <SelectTrigger data-testid="select-habit-color">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: color.value }}
                          />
                          {color.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner">Owner</Label>
                <Select
                  value={formData.owner}
                  onValueChange={(value: "panda" | "cookie" | "both") =>
                    setFormData({ ...formData, owner: value })
                  }
                >
                  <SelectTrigger data-testid="select-habit-owner">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="panda">Panda</SelectItem>
                    <SelectItem value="cookie">Cookie</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                data-testid="button-cancel-habit"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createHabitMutation.isPending}
                data-testid="button-submit-habit"
              >
                Create Habit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
