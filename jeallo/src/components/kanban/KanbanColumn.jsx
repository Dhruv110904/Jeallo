import { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import KanbanCard from './KanbanCard';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

export default function KanbanColumn({ list, onCardClick, onAddCard, onRenameColumn, onDeleteColumn, isOverlay }) {
  const [isCreating, setIsCreating] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!showDropdown) return;
    const handleClose = () => setShowDropdown(false);
    document.addEventListener('click', handleClose);
    return () => document.removeEventListener('click', handleClose);
  }, [showDropdown]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: list.id,
    data: {
      type: 'List',
      list
    }
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const handleSubmit = () => {
    if (!newCardTitle.trim()) return;
    onAddCard(list.id, newCardTitle.trim());
    setNewCardTitle('');
    setIsCreating(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col w-[320px] h-full bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-jeallo-primary/30 transition-all group relative overflow-hidden ${isDragging ? 'opacity-50' : ''}`}
    >
      {/* Column Header */}
      <div 
        {...attributes} 
        {...listeners}
        className="flex items-center justify-between cursor-grab active:cursor-grabbing mb-4"
      >
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-jeallo-primary transition-colors">{list.name}</h4>
          <span className="bg-slate-200 text-slate-500 text-[10px] font-bold px-1.5 py-0.5 rounded-md">{list.tasks?.length || 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsCreating(true);
            }}
            className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-400 hover:text-jeallo-primary"
          >
            <i className="ti ti-plus"></i>
          </button>
          {!isOverlay && (
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown(!showDropdown);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-400 hover:text-jeallo-primary"
              >
                <i className="ti ti-dots"></i>
              </button>

              {showDropdown && (
                <div 
                  onPointerDown={(e) => e.stopPropagation()}
                  className="absolute right-0 top-8 w-40 bg-white border border-slate-150 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDropdown(false);
                      onRenameColumn?.(list.id, list.name);
                    }}
                    className="flex items-center gap-2 w-full px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-jeallo-primary hover:bg-slate-50 transition-all text-left"
                  >
                    <i className="ti ti-pencil text-sm"></i>
                    <span>Rename Column</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDropdown(false);
                      onDeleteColumn?.(list.id, list.name);
                    }}
                    className="flex items-center gap-2 w-full px-3.5 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50/50 transition-all text-left border-t border-slate-50"
                  >
                    <i className="ti ti-trash text-sm"></i>
                    <span>Delete Column</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
        <SortableContext items={list.tasks?.map(t => t.id) || []} strategy={verticalListSortingStrategy}>
          {list.tasks?.map((task) => (
            <KanbanCard 
              key={task.id} 
              task={task} 
              onClick={() => onCardClick(task)}
            />
          ))}
        </SortableContext>
        
        {list.tasks?.length === 0 && !isCreating && (
          <div className="h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-300 text-sm font-medium italic">
            Drop tasks here
          </div>
        )}
      </div>

      {/* Footer / Inline Input */}
      <div className="pt-3 mt-3 border-t border-slate-100">
        {isCreating ? (
          <div className="space-y-2">
            <textarea
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="Enter a title for this card..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-medium focus:bg-white focus:border-jeallo-primary outline-none transition-all resize-none"
              rows={2}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                } else if (e.key === 'Escape') {
                  setIsCreating(false);
                  setNewCardTitle('');
                }
              }}
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleSubmit}
                className="bg-jeallo-primary hover:bg-jeallo-primary/95 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              >
                Add card
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewCardTitle('');
                }}
                className="hover:bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setIsCreating(true)}
            className="w-full flex items-center gap-2 p-2 text-slate-400 hover:text-jeallo-primary hover:bg-jeallo-primary/10 rounded-lg transition-all text-sm font-bold group"
          >
            <i className="ti ti-plus group-hover:rotate-90 transition-transform"></i>
            Add a card
          </button>
        )}
      </div>
    </div>
  );
}
