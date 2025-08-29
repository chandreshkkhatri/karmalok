"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Loader2, Move, Pin, PinOff } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AnnotationBubbleProps {
  id: string;
  text: string;
  question: string;
  response: string;
  position: { x: number; y: number };
  onClose: () => void;
  isLoading?: boolean;
}

export function AnnotationBubble({
  id,
  text,
  question,
  response,
  position,
  onClose,
  isLoading = false,
}: AnnotationBubbleProps) {
  const [isPinned, setIsPinned] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState(position);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;
      
      setDragPosition({
        x: position.x + deltaX,
        y: position.y + deltaY,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, position]);

  const handleDragStart = (e: React.MouseEvent) => {
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
  };

  return (
    <motion.div
      ref={dragRef}
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="fixed z-50 w-80 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl shadow-xl border border-yellow-200 dark:border-yellow-800/50 overflow-hidden"
      style={{
        left: `${dragPosition.x}px`,
        top: `${dragPosition.y}px`,
        cursor: isDragging ? "grabbing" : "default",
      }}
    >
      {/* Sticky note texture overlay */}
      <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/20 dark:to-yellow-800/20 pointer-events-none" />
      
      {/* Header */}
      <div
        className="relative flex items-center justify-between px-3 py-2 bg-yellow-100 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800/50"
        onMouseDown={handleDragStart}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-yellow-400 dark:bg-yellow-600 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-yellow-900 dark:text-yellow-100" />
          </div>
          <span className="text-xs font-semibold text-yellow-900 dark:text-yellow-100">
            AI Note
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsPinned(!isPinned)}
            className="p-1 hover:bg-yellow-200 dark:hover:bg-yellow-800/30 rounded transition-colors"
            title={isPinned ? "Unpin" : "Pin"}
          >
            {isPinned ? (
              <Pin className="w-3.5 h-3.5 text-yellow-700 dark:text-yellow-300" />
            ) : (
              <PinOff className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-yellow-200 dark:hover:bg-yellow-800/30 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5 text-yellow-700 dark:text-yellow-300" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="relative p-3 max-h-80 overflow-y-auto">
        {/* Selected text */}
        <div className="mb-2 p-2 bg-white/50 dark:bg-gray-900/30 rounded-lg border-l-3 border-yellow-400 dark:border-yellow-600">
          <p className="text-[10px] text-yellow-700 dark:text-yellow-400 uppercase tracking-wide font-semibold mb-1">
            Highlighted
          </p>
          <p className="text-xs text-gray-700 dark:text-gray-300 italic line-clamp-2">
            "{text}"
          </p>
        </div>

        {/* Question */}
        <div className="mb-2">
          <p className="text-[10px] text-yellow-700 dark:text-yellow-400 uppercase tracking-wide font-semibold mb-1">
            Your Question
          </p>
          <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
            {question}
          </p>
        </div>

        {/* Response */}
        <div>
          <p className="text-[10px] text-yellow-700 dark:text-yellow-400 uppercase tracking-wide font-semibold mb-1">
            AI Response
          </p>
          
          {isLoading ? (
            <div className="flex items-center gap-2 py-3">
              <Loader2 className="w-3 h-3 animate-spin text-yellow-600 dark:text-yellow-400" />
              <span className="text-xs text-yellow-700 dark:text-yellow-300">
                Thinking...
              </span>
            </div>
          ) : (
            <div className="prose prose-xs dark:prose-invert max-w-none">
              <div className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {response}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Paper fold effect */}
      <div className="absolute bottom-0 right-0 w-4 h-4">
        <div className="absolute inset-0 bg-yellow-100 dark:bg-yellow-900/20 transform rotate-45 translate-x-2 translate-y-2" />
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 to-yellow-300 dark:from-yellow-800/50 dark:to-yellow-700/50 transform rotate-45" />
      </div>
    </motion.div>
  );
}