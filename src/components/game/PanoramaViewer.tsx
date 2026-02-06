"use client";

import { useEffect, useRef } from "react";
import { Viewer } from "mapillary-js";
import "mapillary-js/dist/mapillary.css";

interface PanoramaViewerProps {
  imageId: string;
  allowMovement: boolean;
  className?: string;
}

export default function PanoramaViewer({
  imageId,
  allowMovement,
  className = "",
}: PanoramaViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const accessToken = process.env.NEXT_PUBLIC_MAPILLARY_ACCESS_TOKEN || "";

    const viewer = new Viewer({
      accessToken,
      container: containerRef.current,
      imageId,
    });

    viewerRef.current = viewer;

    if (!allowMovement) {
      viewer.deactivateCover();
      // Disable navigation to adjacent images
      viewer.setFilter(["==", "id", imageId]);
    }

    return () => {
      viewer.remove();
      viewerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (viewerRef.current && imageId) {
      viewerRef.current.moveTo(imageId).catch(() => {
        // Image may not exist or network error
      });

      if (!allowMovement) {
        viewerRef.current.setFilter(["==", "id", imageId]);
      }
    }
  }, [imageId, allowMovement]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${className}`}
      style={{ minHeight: "400px" }}
    />
  );
}
