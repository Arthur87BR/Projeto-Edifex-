import React, { useState, useEffect } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  isToday,
  parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Info, X, HardHat } from 'lucide-react';
import { collection, query, where, onSnapshot, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useFirebase } from './FirebaseProvider';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Modal from './Modal';
import TaskForm from './TaskForm';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export default function InteractiveCalendar() {
  const { user } = useFirebase();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [projects, setProjects] = useState<any[]>([]);
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedProjectForNewTask, setSelectedProjectForNewTask] = useState<string>('');

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'projects'), where('ownerId', '==', user.uid));
    const unsubscribeProjects = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(projectsData);
      
      // For each project, listen to tasks
      // Note: This could be optimized, but for a reasonable number of projects it's fine
      projectsData.forEach((project: any) => {
        const tasksQ = collection(db, 'projects', project.id, 'tasks');
        onSnapshot(tasksQ, (taskSnap) => {
          setAllTasks(prev => {
            const otherTasks = prev.filter(t => t.projectId !== project.id);
            const newTasks = taskSnap.docs.map(d => ({ id: d.id, ...d.data(), projectName: project.name }));
            return [...otherTasks, ...newTasks];
          });
        });
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'projects');
    });

    return () => unsubscribeProjects();
  }, [user]);

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </h2>
          <p className="text-sm text-slate-500">Visualize o cronograma de todas as suas obras.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-600"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1 text-xs font-bold text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
          >
            HOJE
          </button>
          <button 
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-600"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map((day, index) => (
          <div key={index} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-2">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });

    const rows = [];
    let days = [];

    calendarDays.forEach((day, i) => {
      const dayTasks = allTasks.filter(task => {
        if (!task.startDate || !task.endDate) return false;
        const start = parseISO(task.startDate);
        const end = parseISO(task.endDate);
        return (isSameDay(day, start) || isSameDay(day, end) || (day > start && day < end));
      });

      days.push(
        <div
          key={day.toString()}
          onClick={() => {
            setSelectedDate(day);
            setIsDayModalOpen(true);
          }}
          className={cn(
            "relative h-32 border border-slate-100 p-2 transition-all cursor-pointer hover:bg-slate-50 group",
            !isSameMonth(day, monthStart) ? "bg-slate-50/50 text-slate-300" : "bg-white text-slate-700",
            isToday(day) && "bg-brand-50/30"
          )}
        >
          <div className="flex justify-between items-start">
            <span className={cn(
              "text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full transition-colors",
              isToday(day) ? "bg-brand-600 text-white shadow-lg shadow-brand-200" : ""
            )}>
              {format(day, 'd')}
            </span>
            {dayTasks.length > 0 && (
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                {dayTasks.length}
              </span>
            )}
          </div>
          
          <div className="mt-2 space-y-1 overflow-hidden">
            {dayTasks.slice(0, 3).map((task, idx) => (
              <div 
                key={task.id} 
                className={cn(
                  "text-[9px] px-1.5 py-0.5 rounded truncate font-medium border",
                  task.status === 'Concluído' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                  task.status === 'Atrasado' ? "bg-red-50 text-red-700 border-red-100" :
                  "bg-brand-50 text-brand-700 border-brand-100"
                )}
              >
                {task.name}
              </div>
            ))}
            {dayTasks.length > 3 && (
              <div className="text-[9px] text-slate-400 font-bold pl-1">
                + {dayTasks.length - 3} mais
              </div>
            )}
          </div>

          <button className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-brand-600 text-white rounded-lg shadow-lg">
            <Plus size={14} />
          </button>
        </div>
      );

      if ((i + 1) % 7 === 0) {
        rows.push(
          <div className="grid grid-cols-7" key={day.toString()}>
            {days}
          </div>
        );
        days = [];
      }
    });

    return <div className="border-t border-l border-slate-100 rounded-2xl overflow-hidden shadow-sm">{rows}</div>;
  };

  const handleAddTask = async (data: any) => {
    if (!selectedProjectForNewTask) return;
    try {
      await addDoc(collection(db, 'projects', selectedProjectForNewTask, 'tasks'), {
        ...data,
        projectId: selectedProjectForNewTask
      });
      setIsTaskModalOpen(false);
      setIsDayModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `projects/${selectedProjectForNewTask}/tasks`);
    }
  };

  const getTasksForSelectedDate = () => {
    if (!selectedDate) return [];
    return allTasks.filter(task => {
      if (!task.startDate || !task.endDate) return false;
      const start = parseISO(task.startDate);
      const end = parseISO(task.endDate);
      return (isSameDay(selectedDate, start) || isSameDay(selectedDate, end) || (selectedDate > start && selectedDate < end));
    });
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-3xl">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </div>

      {/* Day Details Modal */}
      <Modal 
        isOpen={isDayModalOpen} 
        onClose={() => setIsDayModalOpen(false)}
        title={selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : 'Detalhes do Dia'}
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Etapas em andamento</h4>
            {getTasksForSelectedDate().length > 0 ? (
              <div className="space-y-3">
                {getTasksForSelectedDate().map(task => (
                  <div key={task.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-brand-600 flex items-center gap-1">
                          <HardHat size={12} />
                          {task.projectName}
                        </span>
                      </div>
                      <h5 className="font-bold text-slate-900">{task.name}</h5>
                      <p className="text-xs text-slate-500">Status: {task.status} • {task.progress}% concluído</p>
                    </div>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      task.status === 'Concluído' ? "bg-emerald-500" :
                      task.status === 'Atrasado' ? "bg-red-500" : "bg-brand-500"
                    )} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-slate-500 text-sm">Nenhuma etapa para este dia.</p>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 mb-4">Adicionar nova etapa</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Selecione a Obra</label>
                <select 
                  value={selectedProjectForNewTask}
                  onChange={(e) => setSelectedProjectForNewTask(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  <option value="">Selecione um projeto...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <button 
                disabled={!selectedProjectForNewTask}
                onClick={() => setIsTaskModalOpen(true)}
                className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Criar Etapa
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Nova Etapa da Obra"
      >
        {selectedProjectForNewTask && (
          <TaskForm 
            onSubmit={handleAddTask}
            onCancel={() => setIsTaskModalOpen(false)}
            initialData={{
              startDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
              endDate: selectedDate ? format(addDays(selectedDate, 7), 'yyyy-MM-dd') : format(addDays(new Date(), 7), 'yyyy-MM-dd'),
              status: 'Pendente',
              progress: 0
            }}
          />
        )}
      </Modal>
    </div>
  );
}

