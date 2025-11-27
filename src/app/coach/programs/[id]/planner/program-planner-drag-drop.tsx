'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

export function DraggableWorkoutCard({
  workout,
  onRemove,
}: {
  workout: any;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: workout.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-3 rounded-lg bg-slate-900/60 hover:bg-slate-900/80 cursor-move border border-slate-700"
    >
      <div className="flex items-center gap-2">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm">{workout.name}</div>
          <div className="flex flex-wrap gap-1 mt-1">
            {workout.estimatedDuration && (
              <span className="text-xs text-slate-400">{workout.estimatedDuration}m</span>
            )}
            {workout.difficulty && (
              <span className="text-xs text-slate-400">{workout.difficulty}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DroppableDayCell({
  dayIndex,
  weekIndex,
  workout,
  isRestDay,
  onDrop,
  onAdd,
  onRemove,
  lang,
}: {
  dayIndex: number;
  weekIndex: number;
  workout: any;
  isRestDay: boolean;
  onDrop: (workoutId: string) => void;
  onAdd: () => void;
  onRemove: () => void;
  lang: 'en' | 'es';
}) {
  const dayNames = lang === 'en' 
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div
      className={`min-h-[120px] p-2 rounded-lg border-2 ${
        workout
          ? 'border-emerald-500/50 bg-emerald-500/10'
          : isRestDay
          ? 'border-yellow-500/50 bg-yellow-500/10'
          : 'border-slate-700 bg-slate-900/60'
      }`}
      onDrop={(e) => {
        e.preventDefault();
        const workoutId = e.dataTransfer.getData('workoutId');
        if (workoutId) {
          onDrop(workoutId);
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.currentTarget.classList.add('border-blue-500/50');
      }}
      onDragLeave={(e) => {
        e.currentTarget.classList.remove('border-blue-500/50');
      }}
    >
      <div className="text-xs font-semibold text-slate-400 mb-1">
        {dayNames[dayIndex - 1]}
      </div>
      {workout ? (
        <div className="space-y-1">
          <div className="text-xs font-bold line-clamp-2">{workout.name}</div>
          <button
            onClick={onRemove}
            className="text-xs text-red-400 hover:text-red-300"
          >
            {lang === 'en' ? 'Remove' : 'Quitar'}
          </button>
        </div>
      ) : isRestDay ? (
        <div className="text-xs text-yellow-400">
          {lang === 'en' ? 'Rest Day' : 'Día de Descanso'}
        </div>
      ) : (
        <button
          onClick={onAdd}
          className="text-xs text-slate-400 hover:text-slate-200 w-full text-left"
        >
          {lang === 'en' ? '+ Add' : '+ Agregar'}
        </button>
      )}
    </div>
  );
}

