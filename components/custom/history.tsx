"use client";

import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import cx from "classnames";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { User } from "next-auth";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import useSWR from "swr";

import { IChat } from "@/db/models";
import { fetcher } from "@/lib/utils";

import {
  InfoIcon,
  MenuIcon,
  MoreHorizontalIcon,
  PencilEditIcon,
  TrashIcon,
} from "./icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { Input } from "../ui/input";

export const History = ({ user }: { user: User | undefined }) => {
  const { id } = useParams();
  const pathname = usePathname();

  // Always keep history visible - no longer controlled by state
  const {
    data: history,
    isLoading,
    mutate,
  } = useSWR<Array<IChat>>(user ? "/api/history" : null, fetcher, {
    fallbackData: [],
  });

  useEffect(() => {
    mutate();
  }, [pathname, mutate]);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleEditClick = (chat: IChat) => {
    setEditingChatId(chat._id.toString());
    setEditingTitle(chat.title || "");
  };

  useEffect(() => {
    if (editingChatId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingChatId]);

  const handleTitleUpdate = async () => {
    if (!editingChatId || !editingTitle) {
      setEditingChatId(null);
      return;
    }

    mutate(
      (history) =>
        history?.map((c) =>
          c._id.toString() === editingChatId ? { ...c, title: editingTitle } : c
        ),
      false
    );

    const updatePromise = fetch(`/api/chat`, {
      method: "PUT",
      body: JSON.stringify({ id: editingChatId, title: editingTitle }),
      headers: { "Content-Type": "application/json" },
    });

    toast.promise(updatePromise, {
      loading: "Saving...",
      success: "Title saved.",
      error: "Error saving title.",
    });

    setEditingChatId(null);
  };

  const handleDelete = async () => {
    const deletePromise = fetch(`/api/chat?id=${deleteId}`, {
      method: "DELETE",
    });

    toast.promise(deletePromise, {
      loading: "Deleting...",
      success: () => {
        mutate((history) => {
          if (history) {
            return history.filter((h) => h._id.toString() !== deleteId);
          }
        });
        return "Chat deleted.";
      },
      error: "Error deleting chat.",
    });

    setShowDeleteDialog(false);
  };

  return (
    <>
      {/* Remove the toggle button since panel is always open */}

      <div className="w-64 bg-gray-100 h-full border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900">Chats</h1>
          <p className="text-sm text-gray-500">
            {history === undefined
              ? "Loading chats..."
              : `${history.length} conversations`}
          </p>
        </div>

        {/* New Chat Button */}
        {user && (
          <div className="p-4 border-b border-gray-200">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              asChild
            >
              <Link href="/">
                <PencilEditIcon size={14} />
                <span className="ml-2">New Chat</span>
              </Link>
            </Button>
          </div>
        )}

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-2">
          {!user ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm text-center p-4">
              <InfoIcon size={32} />
              <p className="mt-2">Please log in to see your chat history.</p>
            </div>
          ) : null}

          {!isLoading && history?.length === 0 && user ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm text-center p-4">
              <InfoIcon size={32} />
              <p className="mt-2">You have no saved chats.</p>
            </div>
          ) : null}

          {isLoading && user ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="p-3 rounded-lg">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                </div>
              ))}
            </div>
          ) : null}

          <div className="space-y-1">
            {history &&
              history.map((chat) => (
                <div
                  key={chat._id.toString()}
                  className={cx(
                    "group flex items-center justify-between p-3 rounded-lg hover:bg-white transition-colors",
                    { "bg-white shadow-sm": chat._id.toString() === id }
                  )}
                >
                  {editingChatId === chat._id.toString() ? (
                    <Input
                      ref={inputRef}
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={handleTitleUpdate}
                      onKeyDown={(e) => e.key === "Enter" && handleTitleUpdate()}
                      className="h-8 text-sm"
                    />
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        className="flex-1 justify-start p-0 h-auto font-normal text-left"
                        asChild
                      >
                        <Link
                          href={`/chat/${chat._id.toString()}`}
                          className="block truncate"
                          title={chat.title || "Untitled Chat"}
                        >
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {chat.title || "Untitled Chat"}
                          </div>
                        </Link>
                      </Button>
                    </>
                  )}

                  <DropdownMenu modal={true}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 hover:bg-gray-200"
                        variant="ghost"
                      >
                        <MoreHorizontalIcon size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" className="z-[60]">
                      <DropdownMenuItem asChild>
                        <Button
                          className="flex items-center gap-2 w-full justify-start font-normal"
                          variant="ghost"
                          onClick={() => handleEditClick(chat)}
                        >
                          <PencilEditIcon size={16} />
                          Edit
                        </Button>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Button
                          className="flex items-center gap-2 w-full justify-start font-normal"
                          variant="ghost"
                          onClick={() => {
                            setDeleteId(chat._id.toString());
                            setShowDeleteDialog(true);
                          }}
                        >
                          <TrashIcon size={16} />
                          Delete
                        </Button>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this chat. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
