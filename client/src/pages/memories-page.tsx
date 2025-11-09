import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Memory, InsertMemory } from "@shared/schema";
import { OwnerFilter } from "@/components/owner-filter";
import { Plus, Calendar, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import pandaIcon from "@assets/generated_images/Panda_character_avatar_icon_c3ecdae1.png";
import cookieIcon from "@assets/generated_images/Cookie_character_avatar_icon_f4fe2d95.png";
import bothIcon from "@assets/generated_images/Combined_panda_cookie_heart_093d2d02.png";

export default function MemoriesPage() {
  const [filter, setFilter] = useState<"all" | "panda" | "cookie" | "both">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [formData, setFormData] = useState({
    imageUrl: "",
    caption: "",
    date: new Date().toISOString().split("T")[0],
    owner: "both" as "panda" | "cookie" | "both",
  });
  const { toast } = useToast();

  const { data: memories = [], isLoading } = useQuery<Memory[]>({ queryKey: ["/api/memories"] });

  const createMutation = useMutation({
    mutationFn: async (data: InsertMemory) => {
      const res = await apiRequest("POST", "/api/memories", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/memories"] });
      toast({ title: "Memory saved!" });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setFormData({
      imageUrl: "",
      caption: "",
      date: new Date().toISOString().split("T")[0],
      owner: "both",
    });
  };

  const handleSubmit = () => {
    if (!formData.imageUrl.trim()) {
      toast({ title: "Please enter an image URL", variant: "destructive" });
      return;
    }
    createMutation.mutate(formData);
  };

  const filteredMemories = memories.filter(
    (memory) => filter === "all" || memory.owner === filter
  );

  const getOwnerIcon = (owner: string) => {
    if (owner === "panda") return pandaIcon;
    if (owner === "cookie") return cookieIcon;
    return bothIcon;
  };

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Memories</h1>
          <div className="flex items-center gap-4">
            <OwnerFilter value={filter} onChange={setFilter} />
            <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-memory">
              <Plus className="w-4 h-4 mr-2" />
              Add Memory
            </Button>
          </div>
        </div>

        {filteredMemories.length === 0 ? (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <p className="text-lg text-muted-foreground">No memories yet</p>
              <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-first-memory">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Memory
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMemories.map((memory) => (
              <Card
                key={memory.id}
                className="overflow-hidden hover-elevate cursor-pointer transition-all"
                onClick={() => setSelectedMemory(memory)}
                data-testid={`memory-card-${memory.id}`}
              >
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={memory.imageUrl}
                    alt={memory.caption || "Memory"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {memory.date}
                    </div>
                    <img src={getOwnerIcon(memory.owner)} alt={memory.owner} className="w-5 h-5" />
                  </div>
                  {memory.caption && <p className="text-sm line-clamp-2">{memory.caption}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent data-testid="dialog-add-memory">
            <DialogHeader>
              <DialogTitle>Add Memory</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  data-testid="input-image-url"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="caption">Caption (Optional)</Label>
                <Textarea
                  id="caption"
                  placeholder="Describe this memory..."
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  data-testid="input-caption"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  data-testid="input-date"
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
                  <SelectTrigger data-testid="select-owner">
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
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending}
                data-testid="button-submit"
              >
                Save Memory
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!selectedMemory} onOpenChange={() => setSelectedMemory(null)}>
          <DialogContent className="max-w-3xl" data-testid="dialog-view-memory">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
              onClick={() => setSelectedMemory(null)}
              data-testid="button-close-memory"
            >
              <X className="w-4 h-4" />
            </Button>
            {selectedMemory && (
              <div className="space-y-4">
                <img
                  src={selectedMemory.imageUrl}
                  alt={selectedMemory.caption || "Memory"}
                  className="w-full rounded-md"
                />
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="gap-1">
                    <Calendar className="w-3 h-3" />
                    {selectedMemory.date}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <img
                      src={getOwnerIcon(selectedMemory.owner)}
                      alt={selectedMemory.owner}
                      className="w-4 h-4"
                    />
                    {selectedMemory.owner}
                  </Badge>
                </div>
                {selectedMemory.caption && <p className="text-base">{selectedMemory.caption}</p>}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
