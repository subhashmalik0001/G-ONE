/**
 * GazeTarget — Legacy stub (directional model doesn't use dwell/gaze targets).
 * Kept for import compatibility. Simply wraps children as a click target.
 */
import React from 'react';
import { cn } from '@/lib/utils';

interface GazeTargetProps {
  id: string;
  onSelect: () => void;
  important?: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function GazeTarget({ onSelect, children, className, disabled }: GazeTargetProps) {
  return (
    <div
      className={cn('relative', className)}
      onClick={disabled ? undefined : onSelect}
    >
      {children}
    </div>
  );
}
