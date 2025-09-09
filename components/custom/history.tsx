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
  const [isOpen, setIsOpen] = useState(false);

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
    setEditingChatId((chat as any)._id.toString());
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
          (c as any)._id.toString() === editingChatId ? { ...c, title: editingTitle } : c
        ) as IChat[],
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
      loading: "Deleting chat...",
      success: () => {
        mutate((history) => {
          if (history) {
            return history.filter((h) => (h as any)._id.toString() !== deleteId);
          }
        });
        return "Chat deleted.";
      },
      error: "Failed to delete chat.",
    });

    setDeleteId(null);
    setShowDeleteDialog(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-20 left-4 z-40 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
      >
        <MenuIcon size={20} />
      </button>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-64 bg-gray-50 dark:bg-gray-900 h-full border-r border-gray-200 dark:border-gray-700 flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Chats</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {history === undefined
              ? "Loading chats..."
              : `${history.length} conversations`}
          </p>
        </div>

        {/* New Chat Button */}
        {user && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
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
                  key={(chat as any)._id.toString()}
                  className={cx(
                    "group flex items-center justify-between p-3 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors",
                    { "bg-white dark:bg-gray-800 shadow-sm": (chat as any)._id.toString() === id }
                  )}
                >
                  {editingChatId === (chat as any)._id.toString() ? (
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
                          href={`/chat/${(chat as any)._id.toString()}`}
                          className="block truncate"
                          title={chat.title || "Untitled Chat"}
                        >
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {chat.title || "Untitled Chat"}
                          </div>
                        </Link>
                      </Button>
                    </>
                  )}

                  <DropdownMenu modal={true}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                      >
                        <MoreHorizontalIcon size={16} />
                        <VisuallyHidden.Root>Dropdown Menu</VisuallyHidden.Root>
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
                            setDeleteId((chat as any)._id.toString());
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

      {/* Mobile sidebar sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-[280px] sm:w-[350px] p-0">
          <div className="h-full flex flex-col">
            <SheetHeader className="p-4 border-b border-gray-200 dark:border-gray-700">
              <SheetTitle>Chats</SheetTitle>
              <SheetDescription>
                {history === undefined
                  ? "Loading chats..."
                  : `${history.length} conversations`}
              </SheetDescription>
            </SheetHeader>

            {/* New Chat Button */}
            {user && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  asChild
                  onClick={() => setIsOpen(false)}
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

              <div className="space-y-1">
                {history &&
                  history.map((chat) => (
                    <div
                      key={(chat as any)._id.toString()}
                      className={cx(
                        "group flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                        { "bg-gray-100 dark:bg-gray-800": (chat as any)._id.toString() === id }
                      )}
                    >
                      <Button
                        variant="ghost"
                        className="flex-1 justify-start p-0 h-auto font-normal text-left"
                        asChild
                        onClick={() => setIsOpen(false)}
                      >
                        <Link
                          href={`/chat/${(chat as any)._id.toString()}`}
                          className="block truncate"
                        >
                          <div className="text-sm font-medium truncate">
                            {chat.title || "Untitled Chat"}
                          </div>
                        </Link>
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

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
