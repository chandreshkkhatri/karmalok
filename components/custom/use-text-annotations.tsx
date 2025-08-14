"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export interface Annotation {
  id: string;
  text: string;
  startOffset: number;
  endOffset: number;
  question: string;
  response: string;
  position: { x: number; y: number };
  timestamp: Date;
  isLoading?: boolean;
}

interface UseTextAnnotationsProps {
  containerRef: React.RefObject<HTMLElement>;
  onAnnotationCreate?: (annotation: Annotation) => void;
}

export function useTextAnnotations({ 
  containerRef, 
  onAnnotationCreate 
}: UseTextAnnotationsProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null);

  // Create annotation from selected text
  const createAnnotation = useCallback(async (
    action: string,
    selectedText: string,
    selection?: Selection
  ) => {
    if (!selection || !containerRef.current) return null;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // Generate question based on action
    let question = "";
    switch (action) {
      case "lookup":
        question = `What is the meaning of "${selectedText}"?`;
        break;
      case "explain":
        question = `Can you explain "${selectedText}" in simple terms?`;
        break;
      case "summarize":
        question = `Can you summarize this: "${selectedText}"`;
        break;
      case "translate":
        question = `Translate "${selectedText}" to different languages`;
        break;
      case "improve":
        question = `How can I improve this text: "${selectedText}"`;
        break;
      case "ask":
        question = `Tell me more about "${selectedText}"`;
        break;
      case "quote":
        question = `Provide related quotes for: "${selectedText}"`;
        break;
      default:
        question = `${action}: "${selectedText}"`;
    }

    const annotationId = `annotation-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const annotation: Annotation = {
      id: annotationId,
      text: selectedText,
      startOffset: 0, // Will be calculated based on the actual position
      endOffset: selectedText.length,
      question,
      response: "",
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      },
      timestamp: new Date(),
      isLoading: true,
    };

    // Add annotation to state
    setAnnotations(prev => [...prev, annotation]);
    setActiveAnnotation(annotationId);

    // Highlight the selected text
    highlightText(range, annotationId);

    // Call callback if provided
    if (onAnnotationCreate) {
      onAnnotationCreate(annotation);
    }

    return annotation;
  }, [containerRef, onAnnotationCreate]);

  // Highlight selected text with a mark element
  const highlightText = useCallback((range: Range, annotationId: string) => {
    const mark = document.createElement("mark");
    mark.className = "annotation-highlight";
    mark.dataset.annotationId = annotationId;
    mark.style.backgroundColor = "rgba(59, 130, 246, 0.2)";
    mark.style.borderBottom = "2px solid rgba(59, 130, 246, 0.5)";
    mark.style.cursor = "pointer";
    mark.style.transition = "all 0.2s";
    
    // Add hover effect
    mark.addEventListener("mouseenter", () => {
      mark.style.backgroundColor = "rgba(59, 130, 246, 0.3)";
    });
    
    mark.addEventListener("mouseleave", () => {
      mark.style.backgroundColor = "rgba(59, 130, 246, 0.2)";
    });
    
    // Show annotation bubble on click
    mark.addEventListener("click", (e) => {
      e.stopPropagation();
      setActiveAnnotation(annotationId);
    });

    try {
      range.surroundContents(mark);
    } catch (e) {
      // If surroundContents fails, use alternative method
      const contents = range.extractContents();
      mark.appendChild(contents);
      range.insertNode(mark);
    }
  }, []);

  // Update annotation response
  const updateAnnotationResponse = useCallback((
    annotationId: string,
    response: string
  ) => {
    setAnnotations(prev =>
      prev.map(ann =>
        ann.id === annotationId
          ? { ...ann, response, isLoading: false }
          : ann
      )
    );
  }, []);

  // Remove annotation
  const removeAnnotation = useCallback((annotationId: string) => {
    // Remove highlight
    const marks = document.querySelectorAll(`mark[data-annotation-id="${annotationId}"]`);
    marks.forEach(mark => {
      const parent = mark.parentNode;
      while (mark.firstChild) {
        parent?.insertBefore(mark.firstChild, mark);
      }
      parent?.removeChild(mark);
    });

    // Remove from state
    setAnnotations(prev => prev.filter(ann => ann.id !== annotationId));
    
    if (activeAnnotation === annotationId) {
      setActiveAnnotation(null);
    }
  }, [activeAnnotation]);

  // Clear all annotations
  const clearAnnotations = useCallback(() => {
    // Remove all highlights
    const marks = document.querySelectorAll("mark.annotation-highlight");
    marks.forEach(mark => {
      const parent = mark.parentNode;
      while (mark.firstChild) {
        parent?.insertBefore(mark.firstChild, mark);
      }
      parent?.removeChild(mark);
    });

    setAnnotations([]);
    setActiveAnnotation(null);
  }, []);

  // Get annotation by ID
  const getAnnotation = useCallback((annotationId: string) => {
    return annotations.find(ann => ann.id === annotationId);
  }, [annotations]);

  return {
    annotations,
    activeAnnotation,
    setActiveAnnotation,
    createAnnotation,
    updateAnnotationResponse,
    removeAnnotation,
    clearAnnotations,
    getAnnotation,
  };
}