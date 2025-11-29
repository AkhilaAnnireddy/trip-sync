import React, { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, CheckCircle2, Clock, ClipboardList, Users } from 'lucide-react';
import { TasksAPI, InviteAPI } from './apiService';

export default function TaskTab({ currentTrip, setCurrentTrip, trips, setTrips }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  useEffect(() => {
    if (currentTrip?.id) {
      loadTasks();
      loadParticipants();
    }
  }, [currentTrip?.id]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const fetchedTasks = await TasksAPI.getTasksForTrip(currentTrip.id);
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };
const loadParticipants = async () => {
  try {
    console.log('🔍 TaskTab: Loading participants for trip', currentTrip.id);
    
    // Try to fetch from backend first
    const backendParticipants = await InviteAPI.getTripParticipants(currentTrip.id);
    console.log('✅ TaskTab: Loaded participants from backend:', backendParticipants);
    
    setParticipants(backendParticipants);
  } catch (error) {
    console.warn('⚠️ TaskTab: Could not load participants from backend, using fallback:', error.message);
    
    // Fallback: Use trip members from currentTrip
    if (currentTrip?.members) {
      const participantList = currentTrip.members.map((member, index) => ({
        id: index + 1, // Temporary ID - won't work for task assignment!
        firstName: member.split(' ')[0] || member,
        lastName: member.split(' ').slice(1).join(' ') || '',
        email: `${member.toLowerCase().replace(/\s+/g, '.')}@temp.com` // Temp email
      }));
      console.log('📋 TaskTab: Using fallback participants:', participantList);
      setParticipants(participantList);
    } else if (currentTrip?.createdBy) {
      // At minimum, show the trip creator
      setParticipants([
        {
          id: currentTrip.createdBy.id,
          firstName: currentTrip.createdBy.firstName,
          lastName: currentTrip.createdBy.lastName,
          email: currentTrip.createdBy.email
        }
      ]);
      console.log('📋 TaskTab: Using trip creator as only participant');
    } else {
      setParticipants([]);
      console.warn('⚠️ TaskTab: No participants available');
    }
  }
};

  const addTask = async () => {
  if (currentTrip && newTask && newAssignee) {
    try {
      const taskData = {
        title: newTask,
        description: newDescription || newTask,
        status: 'TODO',
        assignedToId: parseInt(newAssignee),
        dueDate: dueDate || null
      };

      const createdTask = await TasksAPI.createTask(currentTrip.id, taskData);
      setTasks([...tasks, createdTask]);
      
      setNewTask('');
      setNewDescription('');
      setNewAssignee('');
      setDueDate('');
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please try again.');
    }
  }
};

  const deleteTask = async (taskId) => {
    try {
      await TasksAPI.deleteTask(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const updatedTask = await TasksAPI.updateTaskStatus(taskId, newStatus);
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status. Please try again.');
    }
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, column) => {
    e.preventDefault();
    setDragOverColumn(column);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== newStatus) {
      await updateTaskStatus(draggedTask.id, newStatus);
    }
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(t => t.status === status);
  };

  const todoTasks = getTasksByStatus('TODO');
  const inProgressTasks = getTasksByStatus('IN_PROGRESS');
  const completedTasks = getTasksByStatus('DONE');

  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">To Do</p>
              <p className="text-2xl font-bold text-gray-900">{todoTasks.length}</p>
            </div>
            <div className="bg-blue-100 rounded-lg p-2.5">
              <ClipboardList className="text-blue-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{inProgressTasks.length}</p>
            </div>
            <div className="bg-amber-100 rounded-lg p-2.5">
              <Clock className="text-amber-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedTasks.length}</p>
            </div>
            <div className="bg-green-100 rounded-lg p-2.5">
              <CheckCircle2 className="text-green-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-gray-500 text-sm mb-1">Progress</p>
              <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
            </div>
            <div className="bg-indigo-100 rounded-lg p-2.5">
              <span className="text-xl">📊</span>
            </div>
          </div>
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>
      </div>


<div className="bg-white rounded-lg border border-gray-200 p-5">
  <div className="flex items-center gap-2 mb-4">
    <div className="bg-indigo-100 rounded-lg p-2">
      <Plus className="text-indigo-600" size={18} />
    </div>
    <h3 className="text-lg font-semibold text-gray-900">Add New Task</h3>
  </div>
  
  <div className="space-y-3">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <input
        type="text"
        placeholder="Task title *"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && newTask && newAssignee && addTask()}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
      />
      
      {/* Assignee Dropdown */}
      <select
        value={newAssignee}
        onChange={(e) => setNewAssignee(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
      >
        <option value="">Assign to *</option>
        {participants.map((participant) => (
          <option key={participant.id} value={participant.id}>
            {participant.firstName} {participant.lastName}
          </option>
        ))}
      </select>
      
      <input
        type="date"
        placeholder="Due date (optional)"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        min={new Date().toISOString().split('T')[0]}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
      />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      <input
        type="text"
        placeholder="Description (optional)"
        value={newDescription}
        onChange={(e) => setNewDescription(e.target.value)}
        className="md:col-span-3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
      />
      <button
        onClick={addTask}
        disabled={!newTask || !newAssignee}
        className="bg-indigo-600 text-white py-2 rounded-lg font-medium text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        <Plus size={18} />
        Add Task
      </button>
    </div>
  </div>
</div>

      {/* Kanban Board - 3 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* To Do Column */}
        <div
          onDragOver={(e) => handleDragOver(e, 'TODO')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'TODO')}
          className={`bg-white rounded-lg border p-4 min-h-96 transition-all ${
            dragOverColumn === 'TODO' 
              ? 'border-blue-500 ring-2 ring-blue-200' 
              : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 rounded-lg p-1.5">
                <ClipboardList className="text-blue-600" size={16} />
              </div>
              <h3 className="text-base font-semibold text-gray-900">To Do</h3>
            </div>
            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              {todoTasks.length}
            </span>
          </div>
          
          <div className="space-y-2">
            {todoTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <ClipboardList size={24} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">No tasks to do</p>
              </div>
            ) : (
              todoTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-move hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start gap-2">
                    <GripVertical size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 mb-1 break-words">
                        {task.title}
                      </h4>
                      {task.description && task.description !== task.title && (
                        <p className="text-xs text-gray-600 mb-2">{task.description}</p>
                      )}
                      {task.assignedTo && (
  <div className="flex items-center gap-1.5 mb-2">
    <Users size={10} className="text-gray-500" />
    <span className="text-xs text-gray-600">
      {task.assignedTo.firstName} {task.assignedTo.lastName}
    </span>
  </div>
)}
                      {task.dueDate && (
                        <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full inline-block">
                          {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-gray-400 hover:text-red-600 rounded p-1 transition-all opacity-0 group-hover:opacity-100"
                      title="Delete task"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* In Progress Column */}
        <div
          onDragOver={(e) => handleDragOver(e, 'IN_PROGRESS')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'IN_PROGRESS')}
          className={`bg-white rounded-lg border p-4 min-h-96 transition-all ${
            dragOverColumn === 'IN_PROGRESS' 
              ? 'border-amber-500 ring-2 ring-amber-200' 
              : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-amber-100 rounded-lg p-1.5">
                <Clock className="text-amber-600" size={16} />
              </div>
              <h3 className="text-base font-semibold text-gray-900">In Progress</h3>
            </div>
            <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              {inProgressTasks.length}
            </span>
          </div>
          
          <div className="space-y-2">
            {inProgressTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <Clock size={24} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">No tasks in progress</p>
              </div>
            ) : (
              inProgressTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  className="bg-amber-50 border border-amber-200 rounded-lg p-3 cursor-move hover:shadow-sm transition-all group relative"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 rounded-l-lg"></div>
                  <div className="flex items-start gap-2 pl-2">
                    <GripVertical size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 mb-1 break-words">
                        {task.title}
                      </h4>
                      {task.description && task.description !== task.title && (
                        <p className="text-xs text-gray-600 mb-2">{task.description}</p>
                      )}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {task.dueDate && (
                          <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        <span className="text-xs bg-orange-100 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Clock size={10} />
                          Active
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-gray-400 hover:text-red-600 rounded p-1 transition-all opacity-0 group-hover:opacity-100"
                      title="Delete task"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Completed Column */}
        <div
          onDragOver={(e) => handleDragOver(e, 'DONE')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'DONE')}
          className={`bg-white rounded-lg border p-4 min-h-96 transition-all ${
            dragOverColumn === 'DONE' 
              ? 'border-green-500 ring-2 ring-green-200' 
              : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-green-100 rounded-lg p-1.5">
                <CheckCircle2 className="text-green-600" size={16} />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Completed</h3>
            </div>
            <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              {completedTasks.length}
            </span>
          </div>
          
          <div className="space-y-2">
            {completedTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 size={24} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">No completed tasks</p>
              </div>
            ) : (
              completedTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  className="bg-green-50 border border-green-200 rounded-lg p-3 cursor-move hover:shadow-sm transition-all group relative"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-green-500 rounded-l-lg"></div>
                  <div className="flex items-start gap-2 pl-2">
                    <GripVertical size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-500 mb-1 line-through break-words">
                        {task.title}
                      </h4>
                      {task.description && task.description !== task.title && (
                        <p className="text-xs text-gray-400 mb-2 line-through">{task.description}</p>
                      )}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {task.dueDate && (
                          <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        <span className="text-xs bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 size={10} />
                          Done
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-gray-400 hover:text-red-600 rounded p-1 transition-all opacity-0 group-hover:opacity-100"
                      title="Delete task"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 rounded-lg p-2 flex-shrink-0">
            <span className="text-lg">💡</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              How to use the Task Board
            </p>
            <p className="text-sm text-gray-600">
              Drag and drop tasks between columns to update their status. Move tasks from <span className="font-medium text-blue-600">To Do</span> → <span className="font-medium text-amber-600">In Progress</span> → <span className="font-medium text-green-600">Completed</span> as you work on them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}