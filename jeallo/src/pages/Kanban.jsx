import { useState, useEffect, useRef } from 'react';
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
import { Search, Filter, Users, Plus, MoreHorizontal, LayoutGrid, ChevronDown, Loader2, FolderPlus, Edit3, AlertTriangle, X } from 'lucide-react';
import axios from '../api/axios';
import KanbanColumn from '../components/kanban/KanbanColumn';
import KanbanCard from '../components/kanban/KanbanCard';
import TaskDetailPanel from '../components/tasks/TaskDetailPanel';
import { toast } from 'react-hot-toast';

export default function Kanban() {
  const { projectId } = useParams();
  const [lists, setLists] = useState([]);
  const listsRef = useRef(lists);
  const dragStartInfoRef = useRef(null);

  useEffect(() => {
    listsRef.current = lists;
  }, [lists]);
  const [activeTask, setActiveTask] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeDragItem, setActiveDragItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [dialogConfig, setDialogConfig] = useState({
    isOpen: false,
    type: '', // 'add', 'rename', 'delete'
    title: '',
    description: '',
    inputValue: '',
    confirmText: '',
    cancelText: '',
    onConfirm: null
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchBoardData();
  }, [projectId]);

  const fetchBoardData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
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

  const handleAddColumn = () => {
    setDialogConfig({
      isOpen: true,
      type: 'add',
      title: 'Create New Column',
      description: 'Add a new workflow stage to organize tasks on your board.',
      inputValue: '',
      confirmText: 'Create Column',
      cancelText: 'Cancel',
      onConfirm: async (name) => {
        if (!name || !name.trim()) return;
        try {
          const boardsRes = await axios.get(`/v1/projects/${projectId}/boards`);
          const boardId = boardsRes.data.data[0].id;
          await axios.post(`/v1/boards/${boardId}/lists`, { name: name.trim() });
          fetchBoardData(false);
          toast.success('Column added');
          setDialogConfig(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          toast.error('Failed to add column');
        }
      }
    });
  };

  const handleRenameColumn = (listId, currentName) => {
    setDialogConfig({
      isOpen: true,
      type: 'rename',
      title: 'Rename Column',
      description: 'Choose a new name for this workflow stage.',
      inputValue: currentName,
      confirmText: 'Save Changes',
      cancelText: 'Cancel',
      onConfirm: async (newName) => {
        if (!newName || !newName.trim() || newName.trim() === currentName) {
          setDialogConfig(prev => ({ ...prev, isOpen: false }));
          return;
        }
        try {
          await axios.patch(`/v1/lists/${listId}`, { name: newName.trim() });
          fetchBoardData(false);
          toast.success('Column renamed');
          setDialogConfig(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error('Failed to rename column', error);
          toast.error('Failed to rename column');
        }
      }
    });
  };

  const handleDeleteColumn = (listId, columnName) => {
    setDialogConfig({
      isOpen: true,
      type: 'delete',
      title: 'Delete Column',
      description: `Are you sure you want to permanently delete "${columnName}"? All tasks inside this column will be deleted forever.`,
      confirmText: 'Delete Column',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          await axios.delete(`/v1/lists/${listId}`);
          fetchBoardData(false);
          toast.success('Column deleted');
          setDialogConfig(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error('Failed to delete column', error);
          toast.error('Failed to delete column');
        }
      }
    });
  };

  const handleAddCard = async (listId, title) => {
    try {
      const boardsRes = await axios.get(`/v1/projects/${projectId}/boards`);
      const boardId = boardsRes.data.data[0].id;

      await axios.post(`/v1/projects/${projectId}/tasks`, {
        board_id: boardId,
        list_id: listId,
        title: title,
        priority: 'medium',
        type: 'task',
      });

      fetchBoardData(false);
      toast.success('Card added successfully');
    } catch (error) {
      console.error('Failed to create task', error);
      toast.error(error.response?.data?.message || 'Failed to create card');
    }
  };

  const onDragStart = (event) => {
    const activeTask = event.active.data.current?.task;
    if (activeTask) {
        const originalList = lists.find(l => (l.tasks || []).some(t => t.id === activeTask.id));
        const originalPosition = originalList?.tasks?.findIndex(t => t.id === activeTask.id) ?? -1;
        dragStartInfoRef.current = {
            listId: originalList?.id || activeTask.list_id,
            position: originalPosition
        };
        console.log('[onDragStart] Registered starting coordinates:', dragStartInfoRef.current);
    }
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
        
        setLists(prev => {
            const activeList = prev.find(l => (l.tasks || []).some(t => t.id === activeTask.id));
            const overList = prev.find(l => (l.tasks || []).some(t => t.id === overTask.id));
            
            if (!activeList || !overList) return prev;

            if (activeList.id === overList.id) {
                const oldIndex = (activeList.tasks || []).findIndex(t => t.id === activeTask.id);
                const newIndex = (activeList.tasks || []).findIndex(t => t.id === overTask.id);
                const newTasks = arrayMove(activeList.tasks || [], oldIndex, newIndex);
                return prev.map(l => {
                    if (l.id === activeList.id) return { ...l, tasks: newTasks };
                    return l;
                });
            }

            const activeTasks = (activeList.tasks || []).filter(t => t.id !== activeTask.id);
            const overTasks = [...(overList.tasks || [])];
            const overIndex = overTasks.findIndex(t => t.id === overTask.id);
            overTasks.splice(overIndex, 0, { ...activeTask, list_id: overList.id });

            return prev.map(l => {
                if (l.id === activeList.id) return { ...l, tasks: activeTasks };
                if (l.id === overList.id) return { ...l, tasks: overTasks };
                return l;
            });
        });
    }

    if (activeType === 'Task' && overType === 'List') {
        const activeTask = active.data.current.task;
        const overListId = over.id;

        setLists(prev => {
            const activeList = prev.find(l => (l.tasks || []).some(t => t.id === activeTask.id));
            const overList = prev.find(l => l.id === overListId);

            if (!activeList || !overList || activeList.id === overListId) return prev;

            const activeTasks = (activeList.tasks || []).filter(t => t.id !== activeTask.id);
            const overTasks = [...(overList.tasks || []), { ...activeTask, list_id: overListId }];

            return prev.map(l => {
                if (l.id === activeList.id) return { ...l, tasks: activeTasks };
                if (l.id === overList.id) return { ...l, tasks: overTasks };
                return l;
            });
        });
    }
  };

  const onDragEnd = async (event) => {
    const { active, over } = event;
    setActiveDragItem(null);

    if (active.data.current?.type === 'List') {
        if (!over || active.id === over.id) {
            fetchBoardData(false);
            return;
        }
        const oldIndex = listsRef.current.findIndex(l => l.id === active.id);
        const newIndex = listsRef.current.findIndex(l => l.id === over.id);
        const newLists = arrayMove(listsRef.current, oldIndex, newIndex);
        setLists(newLists);
        
        try {
          const boardsRes = await axios.get(`/v1/projects/${projectId}/boards`);
          await axios.patch(`/v1/boards/${boardsRes.data.data[0].id}/lists/reorder`, {
            list_ids: newLists.map(l => l.id)
          });
          fetchBoardData(false);
        } catch (error) {
          toast.error('Failed to save list order');
          fetchBoardData(false);
        }
        return;
    }

    if (active.data.current?.type === 'Task') {
        const task = active.data.current.task;
        
        // If dropped outside, revert visual state to DB state
        if (!over) {
            fetchBoardData(false);
            return;
        }

        // Find where the task ended up visually in listsRef.current
        const finalList = listsRef.current.find(list => (list.tasks || []).some(t => t.id === task.id));
        
        if (finalList) {
            const finalListId = finalList.id;
            const finalPosition = (finalList.tasks || []).findIndex(t => t.id === task.id);
            
            const original = dragStartInfoRef.current || { listId: task.list_id, position: -1 };
            
            const isDifferentColumn = String(original.listId) !== String(finalListId);
            const isDifferentPosition = finalPosition !== original.position;
            
            console.log('[onDragEnd] Task Movement resolved:', {
                taskId: task.id,
                originalListId: original.listId,
                originalPosition: original.position,
                finalListId: finalListId,
                finalPosition: finalPosition,
                isDifferentColumn,
                isDifferentPosition
            });

            if (isDifferentColumn || isDifferentPosition) {
                try {
                    await axios.patch(`/v1/tasks/${task.id}/move`, {
                        list_id: finalListId,
                        position: finalPosition
                    });
                    fetchBoardData(false);
                } catch (error) {
                    console.error('[onDragEnd] Move failed:', error);
                    const errorMessage = error.response?.data?.message || error.message || 'Server error';
                    toast.error(`Failed to save task move: ${errorMessage}`);
                    fetchBoardData(false);
                }
            } else {
                fetchBoardData(false);
            }
        } else {
            fetchBoardData(false);
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
          <div className="inline-flex h-full p-8 gap-8 items-stretch">
            <SortableContext items={lists.map(l => l.id)} strategy={horizontalListSortingStrategy}>
              {lists.map((list) => (
                <KanbanColumn 
                  key={list.id} 
                  list={list} 
                  onCardClick={(task) => {
                    setActiveTask(task);
                    setIsPanelOpen(true);
                  }}
                  onAddCard={handleAddCard}
                  onRenameColumn={handleRenameColumn}
                  onDeleteColumn={handleDeleteColumn}
                />
              ))}
            </SortableContext>
            
            <button 
              onClick={handleAddColumn}
              className="min-w-[48px] h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-jeallo-primary hover:border-jeallo-primary/30 transition-all shadow-sm group shrink-0 self-start"
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
        onUpdate={() => fetchBoardData(false)}
      />

      {/* Beautiful Custom Dialog Modal */}
      {dialogConfig.isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
            onClick={() => setDialogConfig(prev => ({ ...prev, isOpen: false }))}
          />
          
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden relative z-10 p-6 flex flex-col gap-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  dialogConfig.type === 'delete' 
                    ? 'bg-rose-50 text-rose-600' 
                    : dialogConfig.type === 'rename'
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-jeallo-primary/10 text-jeallo-primary'
                }`}>
                  {dialogConfig.type === 'delete' && <AlertTriangle size={20} />}
                  {dialogConfig.type === 'rename' && <Edit3 size={20} />}
                  {dialogConfig.type === 'add' && <FolderPlus size={20} />}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">{dialogConfig.title}</h3>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5 leading-relaxed">{dialogConfig.description}</p>
                </div>
              </div>
              <button 
                onClick={() => setDialogConfig(prev => ({ ...prev, isOpen: false }))}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {(dialogConfig.type === 'add' || dialogConfig.type === 'rename') && (
              <div className="mt-2">
                <input 
                  type="text"
                  value={dialogConfig.inputValue}
                  onChange={(e) => setDialogConfig(prev => ({ ...prev, inputValue: e.target.value }))}
                  placeholder={dialogConfig.type === 'add' ? "e.g., In Progress, Under Review" : "Enter column name"}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-jeallo-primary rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none transition-all"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      dialogConfig.onConfirm?.(dialogConfig.inputValue);
                    }
                  }}
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                onClick={() => setDialogConfig(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2.5 rounded-xl text-xs font-black text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-slate-100 transition-all active:scale-95"
              >
                {dialogConfig.cancelText || 'Cancel'}
              </button>
              <button
                onClick={() => dialogConfig.onConfirm?.(dialogConfig.inputValue)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black text-white shadow-md transition-all active:scale-95 ${
                  dialogConfig.type === 'delete'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/10'
                    : 'bg-jeallo-primary hover:bg-jeallo-primary/95 shadow-jeallo-primary/10'
                }`}
              >
                {dialogConfig.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
