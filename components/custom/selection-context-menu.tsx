"use client";

import { useEffect, useState, useRef } from "react";
import {
  BookOpen,
  Brain,
  Languages,
  MessageSquare,
  Search,
  Sparkles,
  Copy,
  Quote,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ContextMenuProps {
  onAction: (action: string, text: string) => void;
  parentElement?: HTMLElement | null;
}

export function SelectionContextMenu({ onAction, parentElement }: ContextMenuProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState("");
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionLength, setSelectionLength] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    { icon: Search, label: "Look up meaning", action: "lookup", color: "text-blue-500", group: "ai" },
    { icon: Brain, label: "Explain this", action: "explain", color: "text-purple-500", group: "ai" },
    { icon: BookOpen, label: "Summarize", action: "summarize", color: "text-green-500", group: "ai" },
    { icon: Languages, label: "Translate", action: "translate", color: "text-orange-500", group: "ai" },
    { icon: Sparkles, label: "Improve writing", action: "improve", color: "text-pink-500", group: "ai" },
    { icon: MessageSquare, label: "Ask about this", action: "ask", color: "text-indigo-500", group: "ai" },
    { icon: Quote, label: "Find quotes", action: "quote", color: "text-amber-500", group: "utility" },
    { icon: Copy, label: "Copy text", action: "copy", color: "text-gray-500", group: "utility" },
  ];

  useEffect(() => {
    let selectionTimeout: NodeJS.Timeout;
    let lastSelectionText = "";
    let localIsSelecting = false;

    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        setIsVisible(false);
        setIsSelecting(false);
        setSelectionLength(0);
        lastSelectionText = "";
        return;
      }

      const text = selection.toString().trim();
      
      // Update selection length for visual feedback
      setSelectionLength(text.length);
      
      // Hide menu if selection is cleared
      if (text.length === 0) {
        setIsVisible(false);
        setIsSelecting(false);
        setSelectionLength(0);
        lastSelectionText = "";
        return;
      }

      // Check if selection is within the parent element if provided
      if (parentElement) {
        const range = selection.getRangeAt(0);
        if (!parentElement.contains(range.commonAncestorContainer)) {
          setIsVisible(false);
          setIsSelecting(false);
          return;
        }
      }

      // Track that user is actively selecting
      if (text !== lastSelectionText) {
        lastSelectionText = text;
        localIsSelecting = true;
        setIsSelecting(true); // Show selection indicator
        setIsVisible(false); // Hide menu while selecting
        clearTimeout(selectionTimeout);
      }
    };

    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const text = selection.toString().trim();
      
      // Only show menu if there's selected text and minimum length
      if (text.length < 2) {
        setIsVisible(false);
        return;
      }

      // Check if selection is within the parent element if provided
      if (parentElement) {
        const range = selection.getRangeAt(0);
        if (!parentElement.contains(range.commonAncestorContainer)) {
          return;
        }
      }

      // Clear any existing timeout
      clearTimeout(selectionTimeout);

      // Wait longer to ensure user has finished selecting
      selectionTimeout = setTimeout(() => {
        const currentSelection = window.getSelection();
        if (!currentSelection || currentSelection.rangeCount === 0) return;
        
        const currentText = currentSelection.toString().trim();
        
        // Only show if text hasn't changed (selection is stable)
        if (currentText === text && currentText.length >= 2) {
          setSelectedText(currentText);
          
          // Get selection bounds
          const range = currentSelection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          
          // Position menu above selection
          setPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
          });
          
          setIsVisible(true);
          localIsSelecting = false;
          setIsSelecting(false);
        }
      }, 800); // Wait 800ms after mouse up to show menu
    };

    // Only listen to selection changes to hide menu when selection is cleared
    document.addEventListener("selectionchange", handleSelectionChange);
    // Listen to mouseup to show menu after selection is complete
    document.addEventListener("mouseup", handleMouseUp);

    // Hide menu on scroll or click outside
    const handleHide = (e: Event) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsVisible(false);
      }
    };

    document.addEventListener("mousedown", handleHide);
    document.addEventListener("scroll", () => setIsVisible(false), true);
    
    // Also hide on keyboard events that might change selection
    const handleKeyDown = (e: KeyboardEvent) => {
      // Hide on Escape key
      if (e.key === "Escape") {
        setIsVisible(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(selectionTimeout);
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleHide);
      document.removeEventListener("scroll", () => setIsVisible(false), true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [parentElement]);

  const handleAction = (action: string) => {
    if (action === "copy") {
      navigator.clipboard.writeText(selectedText);
      setIsVisible(false);
      return;
    }
    
    onAction(action, selectedText);
    setIsVisible(false);
    
    // Clear selection
    window.getSelection()?.removeAllRanges();
  };

  return (
    <>
      {/* Selection indicator - shows while user is selecting text */}
      <AnimatePresence>
        {isSelecting && selectionLength > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.1 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 px-3 py-1.5 bg-black/70 text-white text-xs rounded-full backdrop-blur-sm"
          >
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span>Selecting {selectionLength} characters...</span>
              <span className="text-gray-300">Release to see options</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context menu */}
      <AnimatePresence>
        {isVisible && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="fixed z-50 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 p-2 flex flex-col min-w-52"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: "translate(-50%, -100%)",
            pointerEvents: "auto", // Ensure menu is clickable
          }}
          // Prevent menu from disappearing when hovering over it
          onMouseEnter={(e) => e.stopPropagation()}
          onMouseLeave={(e) => e.stopPropagation()}
        >
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-zinc-900 rotate-45 border-r border-b border-gray-200 dark:border-zinc-800" />
          
          {/* Menu header */}
          <div className="px-2 py-1 border-b border-gray-100 dark:border-zinc-800 mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              AI Actions
            </p>
          </div>
          
          {menuItems.slice(0, 6).map((item) => (
            <button
              key={item.action}
              onClick={() => handleAction(item.action)}
              className="group relative flex items-center gap-3 p-2.5 mx-1 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all duration-200 text-left w-[calc(100%-8px)]"
            >
              <item.icon className={`w-4 h-4 ${item.color} group-hover:scale-110 transition-transform flex-shrink-0`} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                {item.label}
              </span>
              
              {/* Hover indicator */}
              <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-gray-200 dark:group-hover:border-zinc-700 transition-colors pointer-events-none" />
            </button>
          ))}
          
          {/* Separator */}
          <div className="h-px bg-gray-200 dark:bg-zinc-700 mx-2 my-2" />
          
          {/* Utility actions */}
          <div className="px-2 py-1 mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Quick Actions
            </p>
          </div>
          
          {menuItems.slice(6).map((item) => (
            <button
              key={item.action}
              onClick={() => handleAction(item.action)}
              className="group relative flex items-center gap-3 p-2.5 mx-1 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all duration-200 text-left w-[calc(100%-8px)]"
            >
              <item.icon className={`w-4 h-4 ${item.color} group-hover:scale-110 transition-transform flex-shrink-0`} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                {item.label}
              </span>
              
              {/* Hover indicator */}
              <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-gray-200 dark:group-hover:border-zinc-700 transition-colors pointer-events-none" />
            </button>
          ))}
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}