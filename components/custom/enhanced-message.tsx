"use client";

import { useRef, useState, useCallback } from "react";
import { Message } from "ai";
import { Markdown } from "./markdown";
import { SelectionContextMenu } from "./selection-context-menu";
import { AnnotationBubble } from "./annotation-bubble";
import { useTextAnnotations } from "./use-text-annotations";
import { AnimatePresence } from "framer-motion";

interface EnhancedMessageProps {
  message: Message;
  onAnnotationReply?: (question: string, text: string) => void;
}

export function EnhancedMessage({ message, onAnnotationReply }: EnhancedMessageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [processingAnnotation, setProcessingAnnotation] = useState<string | null>(null);
  
  const {
    annotations,
    activeAnnotation,
    setActiveAnnotation,
    createAnnotation,
    updateAnnotationResponse,
    removeAnnotation,
  } = useTextAnnotations({ containerRef });

  const handleContextMenuAction = useCallback(async (action: string, text: string) => {
    const selection = window.getSelection();
    if (!selection) return;

    // Create annotation
    const annotation = await createAnnotation(action, text, selection);
    if (!annotation) return;

    setProcessingAnnotation(annotation.id);

    // Generate AI response
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: `annotation-${annotation.id}`,
          messages: [
            {
              role: "user",
              content: annotation.question,
            },
          ],
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        
        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              const content = line.slice(2).trim();
              if (content && content !== '""') {
                // Remove quotes and parse
                const parsed = JSON.parse(content);
                fullResponse += parsed;
                updateAnnotationResponse(annotation.id, fullResponse);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      // Notify parent component if callback provided
      if (onAnnotationReply) {
        onAnnotationReply(annotation.question, text);
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      updateAnnotationResponse(
        annotation.id,
        "Sorry, I couldn't process your request. Please try again."
      );
    } finally {
      setProcessingAnnotation(null);
    }
  }, [createAnnotation, updateAnnotationResponse, onAnnotationReply]);

  const activeAnnotationData = annotations.find(a => a.id === activeAnnotation);

  return (
    <div className="relative">
      <div ref={containerRef} className="message-content">
        <Markdown>{message.content}</Markdown>
      </div>

      {/* Selection Context Menu */}
      <SelectionContextMenu
        onAction={handleContextMenuAction}
        parentElement={containerRef.current}
      />

      {/* Annotation Bubbles */}
      <AnimatePresence>
        {activeAnnotationData && (
          <AnnotationBubble
            key={activeAnnotationData.id}
            id={activeAnnotationData.id}
            text={activeAnnotationData.text}
            question={activeAnnotationData.question}
            response={activeAnnotationData.response}
            position={activeAnnotationData.position}
            onClose={() => {
              setActiveAnnotation(null);
              removeAnnotation(activeAnnotationData.id);
            }}
            isLoading={activeAnnotationData.isLoading || processingAnnotation === activeAnnotationData.id}
          />
        )}
      </AnimatePresence>

      <style jsx global>{`
        .annotation-highlight {
          position: relative;
          background: linear-gradient(
            180deg,
            transparent 60%,
            rgba(59, 130, 246, 0.15) 60%
          );
          border-bottom: 2px solid rgba(59, 130, 246, 0.4);
          padding: 0 2px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .annotation-highlight:hover {
          background: linear-gradient(
            180deg,
            transparent 60%,
            rgba(59, 130, 246, 0.25) 60%
          );
          border-bottom-color: rgba(59, 130, 246, 0.6);
        }

        .annotation-highlight::after {
          content: "💡";
          position: absolute;
          top: -8px;
          right: -8px;
          font-size: 12px;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .annotation-highlight:hover::after {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}