import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  horizontalListSortingStrategy
} from '@dnd-kit/sortable';
import { Search, Filter, Users, Plus, MoreHorizontal, LayoutGrid, ChevronDown, Loader2 } from 'lucide-react';
import axios from '../api/axios';
import KanbanColumn from '../components/kanban/KanbanColumn';
import KanbanCard from '../components/kanban/KanbanCard';
import TaskDetailPanel from '../components/tasks/TaskDetailPanel';
import { toast } from 'react-hot-toast';

export default function Kanban() {
  const { projectId } = useParams();
  const [lists, setLists] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeDragItem, setActiveDragItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchBoardData();
  }, [projectId]);

  const fetchBoardData = async () => {
    setIsLoading(true);
    try {
      // 1. Get project boards
      let boardsRes = await axios.get(`/v1/projects/${projectId}/boards`);
      let board = boardsRes.data.data[0];
      
      // 2. If no board exists, create a default one
      if (!board) {
        const newBoardRes = await axios.post(`/v1/projects/${projectId}/boards`, {
          name: 'Main Board',
          type: 'kanban'
        });
        board = newBoardRes.data.data;
      }

      if (board) {
        // 3. Get lists for the active board
        const listsRes = await axios.get(`/v1/boards/${board.id}/lists`);
        let currentLists = listsRes.data.data;

        // 4. If no lists, create default ones
        if (currentLists.length === 0) {
          const defaults = ['TO DO', 'IN PROGRESS', 'IN REVIEW', 'DONE'];
          // Use sequential creation to avoid race conditions on order
          for (const name of defaults) {
            await axios.post(`/v1/boards/${board.id}/lists`, { name });
          }
          const updatedRes = await axios.get(`/v1/boards/${board.id}/lists`);
          currentLists = updatedRes.data.data;
        }
        setLists(currentLists);
      }
    } catch (error) {
      console.error('Failed to fetch board data', error);
      toast.error('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddColumn = async () => {
    const name = prompt('Enter column name:');
    if (!name) return;

    try {
      const boardsRes = await axios.get(`/v1/projects/${projectId}/boards`);
      const boardId = boardsRes.data.data[0].id;
      await axios.post(`/v1/boards/${boardId}/lists`, { name });
      fetchBoardData();
      toast.success('Column added');
    } catch (error) {
      toast.error('Failed to add column');
    }
  };

  const onDragStart = (event) => {
    setActiveDragItem(event.active.data.current);
  };

  const onDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType === 'Task' && overType === 'Task') {
        const activeTask = active.data.current.task;
        const overTask = over.data.current.task;
        
        if (activeTask.list_id !== overTask.list_id) {
            setLists(prev => {
                const activeList = prev.find(l => l.id === activeTask.list_id);
                const overList = prev.find(l => l.id === overTask.list_id);
                
                if (!activeList || !overList) return prev;

                const activeTasks = activeList.tasks.filter(t => t.id !== activeTask.id);
                const overTasks = [...overList.tasks];
                const overIndex = overTasks.findIndex(t => t.id === overTask.id);
                overTasks.splice(overIndex, 0, { ...activeTask, list_id: overTask.list_id });

                return prev.map(l => {
                    if (l.id === activeList.id) return { ...l, tasks: activeTasks };
                    if (l.id === overList.id) return { ...l, tasks: overTasks };
                    return l;
                });
            });
        }
    }

    if (activeType === 'Task' && overType === 'List') {
        const activeTask = active.data.current.task;
        const overListId = over.id;

        if (activeTask.list_id !== overListId) {
            setLists(prev => {
                const activeList = prev.find(l => l.id === activeTask.list_id);
                const overList = prev.find(l => l.id === overListId);

                if (!activeList || !overList) return prev;

                const activeTasks = activeList.tasks.filter(t => t.id !== activeTask.id);
                const overTasks = [...overList.tasks, { ...activeTask, list_id: overListId }];

                return prev.map(l => {
                    if (l.id === activeList.id) return { ...l, tasks: activeTasks };
                    if (l.id === overList.id) return { ...l, tasks: overTasks };
                    return l;
                });
            });
        }
    }
  };

  const onDragEnd = async (event) => {
    const { active, over } = event;
    setActiveDragItem(null);

    if (!over) return;

    if (active.data.current?.type === 'List' && active.id !== over.id) {
        const oldIndex = lists.findIndex(l => l.id === active.id);
        const newIndex = lists.findIndex(l => l.id === over.id);
        const newLists = arrayMove(lists, oldIndex, newIndex);
        setLists(newLists);
        
        try {
          const boardsRes = await axios.get(`/v1/projects/${projectId}/boards`);
          await axios.patch(`/v1/boards/${boardsRes.data.data[0].id}/lists/reorder`, {
            list_ids: newLists.map(l => l.id)
          });
        } catch (error) {
          toast.error('Failed to save list order');
        }
    }

    if (active.data.current?.type === 'Task') {
        const task = active.data.current.task;
        const overListId = over.id;
        // Simple move logic for now
        if (task.list_id !== overListId) {
            try {
                await axios.patch(`/v1/tasks/${task.id}/move`, {
                    list_id: overListId,
                    position: 0
                });
            } catch (error) {
                toast.error('Failed to update task');
                fetchBoardData();
            }
        }
    }
  };

  if (isLoading) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-jeallo-primary" />
            <div className="text-center">
                <p className="text-sm font-black text-slate-900 tracking-tight uppercase">Setting up your workspace</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Fetching boards & columns...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Sub-Header Toolbar */}
      <div className="px-8 py-3 flex items-center justify-between border-b border-slate-100 bg-white/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-jeallo-primary transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search board"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-lg py-1.5 pl-10 pr-4 text-sm font-medium focus:bg-white focus:border-jeallo-primary/30 outline-none transition-all w-48 focus:w-64"
            />
          </div>

          <div className="flex items-center gap-1">
             <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                <Users size={14} />
             </div>
             <div className="w-8 h-8 rounded-full bg-jeallo-primary flex items-center justify-center text-white text-[10px] font-black border-2 border-white shadow-sm">DJ</div>
          </div>

          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-slate-500 hover:text-jeallo-primary hover:bg-slate-50 rounded-lg transition-all">
            <Filter size={16} />
            <span>Filter</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-slate-500 hover:text-slate-900 bg-slate-50 border border-slate-100 rounded-lg hover:border-slate-200 transition-all">
                <span>Group</span>
                <ChevronDown size={14} />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-900 transition-all">
                <LayoutGrid size={18} />
            </button>
        </div>
      </div>

      {/* Kanban Board Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar bg-slate-50/30">
        <DndContext 
            sensors={sensors} 
            collisionDetection={closestCorners} 
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
        >
          <div className="inline-flex h-full p-8 gap-8 items-start">
            <SortableContext items={lists.map(l => l.id)} strategy={horizontalListSortingStrategy}>
              {lists.map((list) => (
                <KanbanColumn 
                  key={list.id} 
                  list={list} 
                  onCardClick={(task) => {
                    setActiveTask(task);
                    setIsPanelOpen(true);
                  }}
                />
              ))}
            </SortableContext>
            
            <button 
              onClick={handleAddColumn}
              className="min-w-[48px] h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-jeallo-primary hover:border-jeallo-primary/30 transition-all shadow-sm group shrink-0"
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform" />
            </button>
          </div>

          {/* Drag Overlay */}
          <DragOverlay dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: { opacity: '0.5' }
              }
            })
          }}>
            {activeDragItem?.type === 'List' ? (
                <KanbanColumn list={activeDragItem.list} isOverlay />
            ) : activeDragItem?.type === 'Task' ? (
                <KanbanCard task={activeDragItem.task} isOverlay />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <TaskDetailPanel 
        task={activeTask} 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)}
        onUpdate={() => fetchBoardData()}
      />
    </div>
  );
}
