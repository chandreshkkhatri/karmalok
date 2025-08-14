"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Command,
  Search,
  MessageSquare,
  Settings,
  User,
  FileText,
  Copy,
  X,
} from "lucide-react";

interface ShortcutItem {
  keys: string[];
  label: string;
  action: () => void;
  icon: React.ComponentType<any>;
}

export function KeyboardShortcuts() {
  const [showHelp, setShowHelp] = useState(false);
  const [recentCommand, setRecentCommand] = useState<string | null>(null);

  const shortcuts: ShortcutItem[] = [
    {
      keys: ["⌘", "K"],
      label: "Command palette",
      action: () => console.log("Open command palette"),
      icon: Command,
    },
    {
      keys: ["⌘", "/"],
      label: "Search messages",
      action: () => console.log("Search"),
      icon: Search,
    },
    {
      keys: ["⌘", "N"],
      label: "New chat",
      action: () => window.location.href = "/",
      icon: MessageSquare,
    },
    {
      keys: ["⌘", ","],
      label: "Settings",
      action: () => console.log("Open settings"),
      icon: Settings,
    },
    {
      keys: ["⌘", "⇧", "P"],
      label: "Profile",
      action: () => console.log("Open profile"),
      icon: User,
    },
    {
      keys: ["⌘", "E"],
      label: "Export chat",
      action: () => console.log("Export"),
      icon: FileText,
    },
    {
      keys: ["⌘", "C"],
      label: "Copy last message",
      action: () => {
        const messages = document.querySelectorAll(".message-content");
        if (messages.length > 0) {
          const lastMessage = messages[messages.length - 1];
          const text = lastMessage.textContent || "";
          navigator.clipboard.writeText(text);
          setRecentCommand("Copied to clipboard!");
          setTimeout(() => setRecentCommand(null), 2000);
        }
      },
      icon: Copy,
    },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show/hide help
      if (e.key === "?" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowHelp(!showHelp);
        return;
      }

      // Check shortcuts
      shortcuts.forEach((shortcut) => {
        const matchesKeys = shortcut.keys.every((key) => {
          switch (key) {
            case "⌘":
              return e.metaKey || e.ctrlKey;
            case "⇧":
              return e.shiftKey;
            case "⌥":
              return e.altKey;
            default:
              return e.key.toLowerCase() === key.toLowerCase();
          }
        });

        if (matchesKeys) {
          e.preventDefault();
          shortcut.action();
          setRecentCommand(shortcut.label);
          setTimeout(() => setRecentCommand(null), 2000);
        }
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showHelp, shortcuts]);

  return (
    <>
      {/* Recent command indicator */}
      <AnimatePresence>
        {recentCommand && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="px-4 py-2 bg-black/80 text-white text-sm rounded-lg backdrop-blur-sm">
              {recentCommand}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help modal */}
      <AnimatePresence>
        {showHelp && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setShowHelp(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl"
            >
              <div className="glass-card rounded-2xl p-6 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                    Keyboard Shortcuts
                  </h2>
                  <button
                    onClick={() => setShowHelp(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  {shortcuts.map((shortcut, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <shortcut.icon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">{shortcut.label}</span>
                      </div>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, i) => (
                          <kbd
                            key={i}
                            className="px-2 py-1 text-xs bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md font-mono"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-zinc-800">
                  <p className="text-xs text-gray-500 text-center">
                    Press <kbd className="px-2 py-1 bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded text-xs">⌘</kbd> + <kbd className="px-2 py-1 bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded text-xs">?</kbd> to toggle this help
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating help button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowHelp(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow z-30"
      >
        <Command className="w-5 h-5" />
      </motion.button>

      <style jsx global>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
        }

        .dark .glass-card {
          background: rgba(24, 24, 27, 0.95);
          border: 1px solid rgba(63, 63, 70, 0.3);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </>
  );
}