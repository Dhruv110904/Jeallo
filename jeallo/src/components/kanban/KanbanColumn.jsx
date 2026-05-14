import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import KanbanCard from './KanbanCard';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

export default function KanbanColumn({ list, onCardClick }) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col w-[320px] max-h-full bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-jeallo-primary/30 transition-all group relative overflow-hidden ${isDragging ? 'opacity-50' : ''}`}
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
          <button className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-400 hover:text-jeallo-primary"><i className="ti ti-plus"></i></button>
          <button className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-400 hover:text-jeallo-primary"><i className="ti ti-dots"></i></button>
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
        
        {list.tasks?.length === 0 && (
          <div className="h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-300 text-sm font-medium italic">
            Drop tasks here
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 mt-3 border-t border-slate-100">
        <button className="w-full flex items-center gap-2 p-2 text-slate-400 hover:text-jeallo-primary hover:bg-jeallo-primary/10 rounded-lg transition-all text-sm font-bold group">
          <i className="ti ti-plus group-hover:rotate-90 transition-transform"></i>
          Add a card
        </button>
      </div>
    </div>
  );
}
