"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export default function FeedbackTypesPage() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create modal
  const [openCreate, setOpenCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newIcon, setNewIcon] = useState("");

  // Edit modal
  const [openEdit, setOpenEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [editActive, setEditActive] = useState(true);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("admin_token") : "";

  async function fetchTypes() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/config/feedbacks/types`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      setTypes(data.feedback_types || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Create feedback type
  async function createType() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/config/feedbacks/types`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newName,
          description: newDesc,
          icon: newIcon || "📝",
        }),
      }
    );

    if (res.ok) {
      setOpenCreate(false);
      setNewName("");
      setNewDesc("");
      setNewIcon("");
      fetchTypes();
    }
  }

  // Open edit modal
  function openEditModal(t: any) {
    setEditId(t.id);
    setEditName(t.name);
    setEditDesc(t.description);
    setEditIcon(t.icon);
    setEditActive(t.is_active);
    setOpenEdit(true);
  }

  // Update feedback type
  async function updateType() {
    if (!editId) return;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/config/feedbacks/types/${editId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName,
          description: editDesc,
          icon: editIcon,
          is_active: editActive,
        }),
      }
    );

    if (res.ok) {
      setOpenEdit(false);
      fetchTypes();
    }
  }

  // Delete feedback type
  async function deleteType(id: number) {
    const confirmDelete = confirm("Are you sure you want to delete this type?");
    if (!confirmDelete) return;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/config/feedbacks/types/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.ok) {
      fetchTypes();
    }
  }

  useEffect(() => {
    fetchTypes();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Feedback Types</h1>

        <Button onClick={() => setOpenCreate(true)}>+ Add Type</Button>
      </div>

      {/* LIST */}
      <Card>
        <CardHeader>
          <CardTitle>Total Types: {types.length}</CardTitle>
        </CardHeader>

        <CardContent>
          <Separator className="mb-4" />

          <div className="space-y-4">
            {types.map((t: any) => (
              <div
                key={t.id}
                className="flex items-center justify-between border rounded-md p-3"
              >
                <div className="flex flex-col">
                  <span className="text-xl">
                    {t.icon} <strong>{t.name}</strong>
                  </span>
                  <p className="text-sm text-muted-foreground max-w-lg">
                    {t.description}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={t.is_active ? "default" : "outline"}>
                    {t.is_active ? "Active" : "Inactive"}
                  </Badge>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditModal(t)}
                  >
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteType(t.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* MODAL CREATE */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Feedback Type</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Emoji icon (optional)"
              value={newIcon}
              onChange={(e) => setNewIcon(e.target.value)}
            />

            <EmojiPicker onSelect={(emoji) => setNewIcon(emoji)} />

            <Input
              placeholder="Type name (e.g. Bug Report)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />

            <Input
              placeholder="Description (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />

            <Button className="w-full" onClick={createType}>
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL EDIT */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Feedback Type</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Emoji icon"
                value={editIcon}
                onChange={(e) => setEditIcon(e.target.value)}
              />

              <EmojiPicker onSelect={(emoji) => setEditIcon(emoji)} />
            </div>

            <Input
              placeholder="Type name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />

            <Input
              placeholder="Description"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
            />

            <div>
              <label className="text-sm font-medium">Active Status</label>
              <select
                className="w-full border rounded-md p-2 mt-1"
                value={editActive ? "true" : "false"}
                onChange={(e) => setEditActive(e.target.value === "true")}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <Button className="w-full" onClick={updateType}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
