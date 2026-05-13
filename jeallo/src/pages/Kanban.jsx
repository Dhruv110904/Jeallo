import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  MoreHorizontal, Plus, Clock, 
  MessageSquare, Paperclip, AlertTriangle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import TaskModal from '../components/TaskModal';

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-500' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-indigo-500' },
  { id: 'in_review', title: 'In Review', color: 'bg-purple-500' },
  { id: 'done', title: 'Done', color: 'bg-emerald-500' },
];

const PRIORITY_COLORS = {
  low: 'bg-slate-500/20 text-slate-400',
  medium: 'bg-amber-500/20 text-amber-500',
  high: 'bg-orange-500/20 text-orange-500',
  critical: 'bg-red-500/20 text-red-500',
};

function TaskCard({ task, isOverlay, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: 'Task', task } });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  if (isDragging) {
    return (
      <div ref={setNodeRef} style={style} className="opacity-30 bg-slate-800 border-2 border-indigo-500/50 rounded-2xl h-[120px] mb-4" />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        // Prevent drag events from triggering click if needed, 
        // but dnd-kit usually handles this.
        onClick(task);
      }}
      className={`bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-4 shadow-lg hover:border-slate-700 transition-all group cursor-grab active:cursor-grabbing ${isOverlay ? 'shadow-2xl shadow-indigo-500/20 border-indigo-500/50 scale-105' : ''}`}
    >
      <div className="flex justify-between items-start mb-3">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider ${PRIORITY_COLORS[task.priority]}`}>
          {task.priority}
        </span>
        <button className="text-slate-600 hover:text-slate-400">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      
      <h4 className="text-sm font-bold text-slate-200 line-clamp-2 leading-tight group-hover:text-indigo-400 transition-colors">
        {task.title}
      </h4>
      
      <div className="mt-4 flex items-center justify-between">
        <div className="flex -space-x-1.5">
          {task.assignees?.slice(0, 2).map((a) => (
            <div key={a.id} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[8px] font-bold overflow-hidden">
              {a.avatar ? <img src={a.avatar} alt="" /> : a.name.charAt(0)}
            </div>
          ))}
          {task.assignees?.length > 2 && (
            <div className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-500">
              +{task.assignees.length - 2}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3 text-slate-500">
          {task.comments_count > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-medium">
              <MessageSquare className="w-3 h-3" />
              {task.comments_count}
            </span>
          )}
          {task.attachments_count > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-medium">
              <Paperclip className="w-3 h-3" />
              {task.attachments_count}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Kanban() {
  const queryClient = useQueryClient();
  const [activeTask, setActiveTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks-kanban'],
    queryFn: () => api.get('/tasks', { params: { per_page: 100 } }).then(res => res.data),
  });

  useEffect(() => {
    if (tasksData?.data) {
      setTasks(tasksData.data);
    }
  }, [tasksData]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/tasks/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks-kanban']);
      queryClient.invalidateQueries(['dashboard-stats']);
    },
    onError: () => toast.error('Failed to update task status'),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragStart(event) {
    setActiveTask(event.active.data.current.task);
  }

  function handleDragOver(event) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === 'Task';
    const isOverATask = over.data.current?.type === 'Task';

    if (!isActiveATask) return;

    // Implements dropping onto a task in a different column
    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (tasks[activeIndex].status !== tasks[overIndex].status) {
          tasks[activeIndex].status = tasks[overIndex].status;
          return arrayMove(tasks, activeIndex, overIndex);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    // Implements dropping onto a column
    const isOverAColumn = over.data.current?.type === 'Column';
    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        tasks[activeIndex].status = overId;
        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeTaskObj = tasks.find(t => t.id === activeId);
    if (activeTaskObj) {
      updateStatusMutation.mutate({ id: activeId, status: activeTaskObj.status });
    }
  }

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Kanban Board</h1>
          <p className="text-slate-400 mt-1">Drag and drop tasks to manage workflow</p>
        </div>
        <div className="flex -space-x-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="w-10 h-10 rounded-full border-4 border-[#0f172a] bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 ring-1 ring-slate-800">
              {i}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 h-full min-w-max">
            {COLUMNS.map((column) => (
              <div 
                key={column.id} 
                className="w-80 flex flex-col bg-slate-950/40 border border-slate-800/50 rounded-3xl p-4"
              >
                <div className="flex items-center justify-between mb-6 px-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${column.color}`}></div>
                    <h3 className="font-bold text-slate-300 text-sm uppercase tracking-widest">{column.title}</h3>
                    <span className="bg-slate-800 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                      {tasks.filter(t => t.status === column.id).length}
                    </span>
                  </div>
                  <button 
                    onClick={() => { 
                      setSelectedTask({ status: column.id }); 
                      setIsModalOpen(true); 
                    }}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                  <SortableContext
                    id={column.id}
                    items={tasks.filter(t => t.status === column.id).map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {tasks
                      .filter((task) => task.status === column.id)
                      .map((task) => (
                        <TaskCard 
                          key={task.id} 
                          task={task} 
                          onClick={(t) => { setSelectedTask(t); setIsModalOpen(true); }}
                        />
                      ))}
                  </SortableContext>
                </div>
              </div>
            ))}
          </div>

          <DragOverlay dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: {
                  opacity: '0.5',
                },
              },
            }),
          }}>
            {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        task={selectedTask}
      />
    </div>
  );
}
