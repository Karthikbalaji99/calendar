import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Task, InsertTask } from "@shared/schema";
import { OwnerFilter } from "@/components/owner-filter";
import { Plus, Calendar, CheckCircle2 } from "lucide-react";
import pandaIcon from "@assets/generated_images/Panda_character_avatar_icon_c3ecdae1.png";
import cookieIcon from "@assets/generated_images/Cookie_character_avatar_icon_f4fe2d95.png";
import bothIcon from "@assets/generated_images/Combined_panda_cookie_heart_093d2d02.png";

export default function TasksPage() {
  const [filter, setFilter] = useState<"all" | "panda" | "cookie" | "both">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    owner: "both" as "panda" | "cookie" | "both",
    dueDate: "",
  });
  const { toast } = useToast();

  const { data: tasks = [], isLoading } = useQuery<Task[]>({ queryKey: ["/api/tasks"] });

  const createMutation = useMutation({
    mutationFn: async (data: InsertTask) => {
      const res = await apiRequest("POST", "/api/tasks", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Task created!" });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const res = await apiRequest("PATCH", `/api/tasks/${id}`, { completed });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      owner: "both",
      dueDate: "",
    });
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast({ title: "Please enter a task title", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      ...formData,
      dueDate: formData.dueDate || null,
    });
  };

  const handleToggleComplete = (task: Task) => {
    updateMutation.mutate({ id: task.id, completed: !task.completed });
  };

  const filteredTasks = tasks.filter((task) => filter === "all" || task.owner === filter);

  const completedCount = filteredTasks.filter((t) => t.completed).length;
  const totalCount = filteredTasks.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const getOwnerIcon = (owner: string) => {
    if (owner === "panda") return pandaIcon;
    if (owner === "cookie") return cookieIcon;
    return bothIcon;
  };

  const pendingTasks = filteredTasks.filter((t) => !t.completed);
  const completedTasks = filteredTasks.filter((t) => t.completed);

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Tasks</h1>
          <div className="flex items-center gap-4">
            <OwnerFilter value={filter} onChange={setFilter} />
            <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-task">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {completedCount} of {totalCount} tasks completed
              </span>
              <span className="font-medium">{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} data-testid="progress-tasks" />
          </CardContent>
        </Card>

        {pendingTasks.length === 0 && completedTasks.length === 0 ? (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <p className="text-lg text-muted-foreground">No tasks yet</p>
              <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-first-task">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Task
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {pendingTasks.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xl font-semibold">Pending</h2>
                {pendingTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="hover-elevate transition-all"
                    data-testid={`task-card-${task.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => handleToggleComplete(task)}
                          data-testid={`checkbox-task-${task.id}`}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{task.title}</h3>
                            <img
                              src={getOwnerIcon(task.owner)}
                              alt={task.owner}
                              className="w-5 h-5"
                            />
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                          )}
                          {task.dueDate && (
                            <Badge variant="outline" className="gap-1">
                              <Calendar className="w-3 h-3" />
                              {task.dueDate}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {completedTasks.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-chart-2" />
                  Completed
                </h2>
                {completedTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="opacity-60 hover:opacity-100 transition-opacity"
                    data-testid={`task-card-${task.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => handleToggleComplete(task)}
                          data-testid={`checkbox-task-${task.id}`}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium line-through">{task.title}</h3>
                            <img
                              src={getOwnerIcon(task.owner)}
                              alt={task.owner}
                              className="w-5 h-5"
                            />
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground line-through">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent data-testid="dialog-add-task">
            <DialogHeader>
              <DialogTitle>Add Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Task title..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  data-testid="input-task-title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Task details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  data-testid="input-task-description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date (Optional)</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  data-testid="input-task-due-date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner">Owner</Label>
                <Select
                  value={formData.owner}
                  onValueChange={(value: "panda" | "cookie" | "both") =>
                    setFormData({ ...formData, owner: value })
                  }
                >
                  <SelectTrigger data-testid="select-task-owner">
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
                data-testid="button-cancel-task"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending}
                data-testid="button-submit-task"
              >
                Create Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
