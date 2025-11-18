"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function FeedbackAdminPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<any>(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : "";

  // Fetch All Feedbacks
  async function fetchFeedbacks() {
    try {
      const url = new URL(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/config/feedbacks`
      );

      if (typeFilter !== "all") url.searchParams.set("type_id", typeFilter);

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setFeedbacks(data.feedbacks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Fetch Feedback Types
  async function fetchTypes() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/feedbacks/types`
    );
    const data = await res.json();
    setTypes(data.feedback_types || []);
  }

  useEffect(() => {
    fetchTypes();
    fetchFeedbacks();
  }, [typeFilter]);

  const filteredFeedbacks = feedbacks.filter((fb: any) =>
    fb.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Feedback</h1>
      </div>

      {/* FILTER BAR */}
      <div className="flex gap-3">
        <Input
          placeholder="Search feedback..."
          className="w-60"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">Type</SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {types.map((t: any) => (
              <SelectItem key={t.id} value={t.id.toString()}>
                {t.icon} {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Total Feedback: {filteredFeedbacks.length}</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="divide-y">
              {filteredFeedbacks.map((fb: any) => (
                <div
                  key={fb.id}
                  className="flex items-center justify-between py-4 hover:bg-muted rounded-lg transition cursor-pointer px-2"
                  onClick={() => setSelected(fb)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{fb.feedback_type?.icon}</span>
                      <p className="font-medium">{fb.feedback_type?.name}</p>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-xl">
                      {fb.description}
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {new Date(fb.created_at).toLocaleDateString()}
                  </p>

                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/30 text-white"
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* DETAIL PANEL */}
      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent className="w-[450px] p-6 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Feedback Detail</DialogTitle>
          </DialogHeader>

          {selected && (
            <>
              <h2 className="text-xl font-bold mb-2">
                {selected.feedback_type?.icon} {selected.feedback_type?.name}
              </h2>

              <Separator className="my-4" />

              <p className="text-sm text-muted-foreground mb-2">
                {selected.is_anonymous
                  ? "Anonymous User"
                  : selected.user?.name ?? "User"}
              </p>

              <p className="text-sm font-medium mb-4">{selected.description}</p>

              {selected.image_path && (
                <img
                  src={process.env.NEXT_PUBLIC_API_URL + selected.image_path}
                  className="rounded-lg border mb-4"
                />
              )}

              <Separator className="my-4" />
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
