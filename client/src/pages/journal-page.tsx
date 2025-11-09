import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { JournalEntry, InsertJournalEntry } from "@shared/schema";
import { Calendar, Save } from "lucide-react";
import pandaIcon from "@assets/generated_images/Panda_character_avatar_icon_c3ecdae1.png";
import cookieIcon from "@assets/generated_images/Cookie_character_avatar_icon_f4fe2d95.png";

export default function JournalPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [owner, setOwner] = useState<"panda" | "cookie">("panda");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const { toast } = useToast();

  const { data: entries = [], isLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertJournalEntry) => {
      const res = await apiRequest("POST", "/api/journal", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
      toast({ title: "Journal entry saved!" });
      setContent("");
      setImageUrl("");
    },
  });

  const existingEntry = entries.find((e) => e.date === selectedDate && e.owner === owner);

  const handleSave = () => {
    if (!content.trim()) {
      toast({ title: "Please write something", variant: "destructive" });
      return;
    }

    const images = imageUrl.trim() ? [imageUrl] : [];
    createMutation.mutate({
      date: selectedDate,
      owner,
      content,
      images,
      stickers: "[]",
    });
  };

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const ownerEntries = useMemo(() => {
    const inRange = (d: string) => {
      if (fromDate && d < fromDate) return false;
      if (toDate && d > toDate) return false;
      return true;
    };
    return entries
      .filter((e) => e.owner === owner && inRange(e.date))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [entries, owner, fromDate, toDate]);

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Journal</h1>
          <div className="flex items-center gap-4">
            <Select value={owner} onValueChange={(value: "panda" | "cookie") => setOwner(value)}>
              <SelectTrigger className="w-36" data-testid="select-journal-owner">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="panda">
                  <div className="flex items-center gap-2">
                    <img src={pandaIcon} alt="Panda" className="w-4 h-4" />
                    Panda
                  </div>
                </SelectItem>
                <SelectItem value="cookie">
                  <div className="flex items-center gap-2">
                    <img src={cookieIcon} alt="Cookie" className="w-4 h-4" />
                    Cookie
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <div className="hidden md:flex items-center gap-2">
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-40" />
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-40" />
            </div>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              New Entry
            </CardTitle>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
              data-testid="input-journal-date"
            />
          </CardHeader>
          <CardContent className="space-y-4">
            {existingEntry && (
              <div className="bg-muted/50 p-4 rounded-md mb-4">
                <p className="text-sm text-muted-foreground mb-2">Existing entry for this date:</p>
                <p className="text-sm">{existingEntry.content}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="content">What's on your mind?</Label>
              <Textarea
                id="content"
                placeholder="Write your thoughts..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="resize-none"
                data-testid="input-journal-content"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Add Image (Optional)</Label>
              <Input
                id="imageUrl"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                data-testid="input-journal-image"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={createMutation.isPending || !content.trim()}
              className="w-full"
              data-testid="button-save-journal"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Entry
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Past Entries</h2>
          {ownerEntries.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                No entries yet
              </CardContent>
            </Card>
          ) : (
            ownerEntries.map((entry) => (
              <Card key={entry.id} data-testid={`journal-entry-${entry.id}`}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {entry.date}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="whitespace-pre-wrap">{entry.content}</p>
                  {entry.images && entry.images.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {entry.images.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt="Journal"
                          className="w-32 h-32 object-cover rounded-md"
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
