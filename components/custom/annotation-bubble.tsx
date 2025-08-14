"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Loader2, Maximize2, Minimize2 } from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(false);
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
      initial={{ opacity: 0, scale: 0.9, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`fixed z-40 ${
        isExpanded ? "w-96" : "w-80"
      } bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-950 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-zinc-700/50 backdrop-blur-xl`}
      style={{
        left: `${dragPosition.x}px`,
        top: `${dragPosition.y}px`,
        cursor: isDragging ? "grabbing" : "grab",
      }}
    >
      {/* Glass morphism effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl" />
      
      {/* Header */}
      <div
        className="relative flex items-center justify-between p-3 border-b border-gray-200/50 dark:border-zinc-800/50"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            AI Assistant
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 hover:bg-gray-200/50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors"
          >
            {isExpanded ? (
              <Minimize2 className="w-3.5 h-3.5 text-gray-500" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 text-gray-500" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200/50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="relative p-4 max-h-96 overflow-y-auto">
        {/* Selected text */}
        <div className="mb-3 p-2 bg-gray-100/50 dark:bg-zinc-800/50 rounded-lg border-l-4 border-blue-500">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Selected text:</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{text}"</p>
        </div>

        {/* Question */}
        <div className="mb-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">You asked:</p>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{question}</p>
        </div>

        {/* Response */}
        <div className="relative">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Response:</p>
          
          {isLoading ? (
            <div className="flex items-center gap-2 py-4">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Thinking...
              </span>
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {response}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>

      {/* Decorative corner */}
      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-tl-2xl rounded-br-2xl" />
    </motion.div>
  );
}