import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function KanbanCard({ task, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task
    }
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const priorityColors = {
    critical: 'text-overdue-red bg-overdue-red/10',
    high: 'text-deadline-amber bg-deadline-amber/10',
    medium: 'text-jeallo-primary bg-jeallo-primary/10',
    low: 'text-slate-400 bg-slate-100',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-jeallo-primary/30 transition-all cursor-pointer group relative overflow-hidden
        ${isDragging ? 'opacity-30' : ''}
      `}
    >
      {/* Top Section */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{task.identifier}</span>
        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      {/* Title */}
      <h4 className="text-sm font-bold text-slate-800 mb-3 line-clamp-2 leading-snug group-hover:text-jeallo-primary transition-colors">
        {task.title}
      </h4>

      {/* Epic Tag */}
      {task.epic && (
        <div className="flex items-center gap-1.5 mb-4">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.epic.color }}></div>
          <span className="text-[10px] font-bold text-slate-500 truncate max-w-[120px]">{task.epic.name}</span>
        </div>
      )}

      {/* Bottom Section */}
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-3 text-slate-400">
          {task.subtasks_count > 0 && (
            <div className="flex items-center gap-1 text-[10px] font-bold">
              <i className="ti ti-git-branch rotate-180"></i>
              <span>{task.completed_subtasks_count}/{task.subtasks_count}</span>
            </div>
          )}
          {task.comments_count > 0 && (
            <div className="flex items-center gap-1 text-[10px] font-bold">
              <i className="ti ti-message-2"></i>
              <span>{task.comments_count}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-cloud-white border border-slate-200 flex items-center justify-center overflow-hidden">
            {task.assignee?.avatar ? (
              <img src={task.assignee.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <i className="ti ti-user text-xs text-slate-400"></i>
            )}
          </div>
        </div>
      </div>

      {/* Hover Decor */}
      <div className="absolute top-0 left-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: task.epic?.color || '#1B3A6B' }}></div>
    </div>
  );
}
