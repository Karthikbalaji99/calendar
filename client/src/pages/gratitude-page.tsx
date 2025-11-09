import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { GratitudeLog, InsertGratitudeLog } from "@shared/schema";
import { ArrowRight } from "lucide-react";
import pandaIcon from "@assets/generated_images/Panda_character_avatar_icon_c3ecdae1.png";
import cookieIcon from "@assets/generated_images/Cookie_character_avatar_icon_f4fe2d95.png";

export default function GratitudePage() {
  const [pandaToCookieContent, setPandaToCookieContent] = useState("");
  const [cookieToPandaContent, setCookieToPandaContent] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const { toast } = useToast();

  const { data: gratitudeLogs = [], isLoading } = useQuery<GratitudeLog[]>({
    queryKey: ["/api/gratitude"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertGratitudeLog) => {
      const res = await apiRequest("POST", "/api/gratitude", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gratitude"] });
      toast({ title: "Gratitude log saved!" });
    },
  });

  const handleSavePandaToCookie = () => {
    if (!pandaToCookieContent.trim()) return;
    createMutation.mutate({
      date: selectedDate,
      from: "panda",
      to: "cookie",
      content: pandaToCookieContent,
    });
    setPandaToCookieContent("");
  };

  const handleSaveCookieToPanda = () => {
    if (!cookieToPandaContent.trim()) return;
    createMutation.mutate({
      date: selectedDate,
      from: "cookie",
      to: "panda",
      content: cookieToPandaContent,
    });
    setCookieToPandaContent("");
  };

  const pandaToCookieLogs = gratitudeLogs.filter(
    (log) => log.from === "panda" && log.to === "cookie"
  );
  const cookieToPandaLogs = gratitudeLogs.filter(
    (log) => log.from === "cookie" && log.to === "panda"
  );

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Gratitude Logs</h1>
          <div className="flex items-center gap-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
              data-testid="input-gratitude-date"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <img src={pandaIcon} alt="Panda" className="w-6 h-6" />
                <span>Panda</span>
                <ArrowRight className="w-4 h-4" />
                <img src={cookieIcon} alt="Cookie" className="w-6 h-6" />
                <span>Cookie</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="What are you grateful for today?"
                  value={pandaToCookieContent}
                  onChange={(e) => setPandaToCookieContent(e.target.value)}
                  rows={4}
                  data-testid="input-panda-to-cookie"
                />
                <Button
                  onClick={handleSavePandaToCookie}
                  disabled={!pandaToCookieContent.trim() || createMutation.isPending}
                  data-testid="button-save-panda-to-cookie"
                  className="w-full"
                >
                  Save
                </Button>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <h3 className="font-semibold text-sm text-muted-foreground">Past Entries</h3>
                {pandaToCookieLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No entries yet
                  </p>
                ) : (
                  pandaToCookieLogs.map((log) => (
                    <Card key={log.id} className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="text-xs text-muted-foreground mb-1">{log.date}</div>
                        <p className="text-sm">{log.content}</p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <img src={cookieIcon} alt="Cookie" className="w-6 h-6" />
                <span>Cookie</span>
                <ArrowRight className="w-4 h-4" />
                <img src={pandaIcon} alt="Panda" className="w-6 h-6" />
                <span>Panda</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="What are you grateful for today?"
                  value={cookieToPandaContent}
                  onChange={(e) => setCookieToPandaContent(e.target.value)}
                  rows={4}
                  data-testid="input-cookie-to-panda"
                />
                <Button
                  onClick={handleSaveCookieToPanda}
                  disabled={!cookieToPandaContent.trim() || createMutation.isPending}
                  data-testid="button-save-cookie-to-panda"
                  className="w-full"
                >
                  Save
                </Button>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <h3 className="font-semibold text-sm text-muted-foreground">Past Entries</h3>
                {cookieToPandaLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No entries yet
                  </p>
                ) : (
                  cookieToPandaLogs.map((log) => (
                    <Card key={log.id} className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="text-xs text-muted-foreground mb-1">{log.date}</div>
                        <p className="text-sm">{log.content}</p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
