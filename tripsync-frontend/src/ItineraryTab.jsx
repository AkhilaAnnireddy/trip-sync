import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, Calendar, DollarSign } from 'lucide-react';

export default function ItineraryTab({ currentTrip, setCurrentTrip, trips, setTrips }) {
  const [editingRow, setEditingRow] = useState(null);
  const [editingData, setEditingData] = useState({});
  const [showAddRow, setShowAddRow] = useState(false);
  const [newRow, setNewRow] = useState({
    day: '',
    location: '',
    dates: '',
    activities: '',
    budget: ''
  });

  if (!currentTrip.itineraryColumns) {
    currentTrip.itineraryColumns = [
      { id: 'day', name: 'Day', width: 'w-20', editable: false, canDelete: false },
      { id: 'location', name: 'Location / Stay', width: 'w-48', editable: true, canDelete: true },
      { id: 'dates', name: 'Dates', width: 'w-40', editable: true, canDelete: true },
      { id: 'activities', name: 'Activities / Notes', width: 'w-64', editable: true, canDelete: true },
      { id: 'budget', name: 'Budget (USD)', width: 'w-32', editable: true, canDelete: true }
    ];
  }
  const [columns, setColumns] = useState(currentTrip.itineraryColumns);
  
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  // Initialize itinerary table if it doesn't exist
  if (!currentTrip.itineraryTable) {
    currentTrip.itineraryTable = [];
  }

  const updateTrip = (updatedTrip) => {
    setCurrentTrip(updatedTrip);
    setTrips(trips.map(t => t.id === updatedTrip.id ? updatedTrip : t));
  };

  const addRow = () => {
    if (newRow.location || newRow.dates || newRow.activities) {
      const row = {
        id: Date.now(),
        ...newRow
      };
      
      const updatedTrip = {
        ...currentTrip,
        itineraryTable: [...currentTrip.itineraryTable, row]
      };
      updateTrip(updatedTrip);
      setNewRow({
        day: '',
        location: '',
        dates: '',
        activities: '',
        budget: ''
      });
      setShowAddRow(false);
    }
  };

  const deleteRow = (rowId) => {
    const updatedRows = currentTrip.itineraryTable.filter(r => r.id !== rowId);
    
    const updatedTrip = {
      ...currentTrip,
      itineraryTable: updatedRows
    };
    updateTrip(updatedTrip);
  };

  const startEdit = (row) => {
    setEditingRow(row.id);
    setEditingData({ ...row });
  };

  const saveEdit = () => {
    const updatedTrip = {
      ...currentTrip,
      itineraryTable: currentTrip.itineraryTable.map(row =>
        row.id === editingRow ? editingData : row
      )
    };
    updateTrip(updatedTrip);
    setEditingRow(null);
    setEditingData({});
  };

  const cancelEdit = () => {
    setEditingRow(null);
    setEditingData({});
  };

  const addColumn = () => {
    if (newColumnName.trim()) {
      const newCol = {
        id: `custom_${Date.now()}`,
        name: newColumnName,
        width: 'w-40',
        editable: true,
        canDelete: true
      };
      
      const updatedColumns = [...columns, newCol];
      setColumns(updatedColumns);
      
      // Add empty value for new column in all existing rows
      const updatedRows = currentTrip.itineraryTable.map(row => ({
        ...row,
        [newCol.id]: ''
      }));
      
      const updatedTrip = {
        ...currentTrip,
        itineraryTable: updatedRows,
        itineraryColumns: updatedColumns
      };
      updateTrip(updatedTrip);
      
      setNewColumnName('');
      setShowAddColumn(false);
    }
  };

  const deleteColumn = (columnId) => {
    const columnToDelete = columns.find(col => col.id === columnId);
    if (confirm(`Are you sure you want to delete the "${columnToDelete.name}" column? This will remove all data in this column.`)) {
      const updatedColumns = columns.filter(col => col.id !== columnId);
      setColumns(updatedColumns);
      
      // Remove column data from all rows
      const updatedRows = currentTrip.itineraryTable.map(row => {
        const newRow = { ...row };
        delete newRow[columnId];
        return newRow;
      });
      
      const updatedTrip = {
        ...currentTrip,
        itineraryTable: updatedRows,
        itineraryColumns: updatedColumns
      };
      updateTrip(updatedTrip);
    }
  };

  const getTotalBudget = () => {
    return currentTrip.itineraryTable.reduce((sum, row) => {
      const budget = parseFloat(row.budget) || 0;
      return sum + budget;
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Trip Itinerary</h3>
            <p className="text-gray-600 text-sm mt-1">Plan your day-by-day schedule and budget</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddColumn(true)}
              disabled={currentTrip.itineraryTable.length === 0}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-2 font-semibold ${
                currentTrip.itineraryTable.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
              title={currentTrip.itineraryTable.length === 0 ? 'Add your first day before adding columns' : 'Add a custom column'}
            >
              <Plus size={18} />
              Add Column
            </button>
            <button
              onClick={() => setShowAddRow(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 font-semibold"
            >
              <Plus size={18} />
              Add Day
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        {currentTrip.itineraryTable.length > 0 && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">{currentTrip.itineraryTable.length}</p>
              <p className="text-sm text-gray-600">Days Planned</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">${getTotalBudget().toFixed(2)}</p>
              <p className="text-sm text-gray-600">Total Budget</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Column Modal */}
      {showAddColumn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Add New Column</h3>
              <button
                onClick={() => setShowAddColumn(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Column Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Transportation, Meals, Contact Info"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addColumn()}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button
                onClick={addColumn}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Add Column
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Row Modal */}
      {showAddRow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Add New Day</h3>
              <button
                onClick={() => setShowAddRow(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              {columns.filter(col => col.id !== 'day').map(col => (
                <div key={col.id}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {col.name}
                  </label>
                  {col.id === 'dates' ? (
                    <input
                      type="date"
                      value={newRow[col.id] || ''}
                      onChange={(e) => setNewRow({ ...newRow, [col.id]: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : col.id === 'activities' ? (
                    <textarea
                      placeholder={`Enter ${col.name.toLowerCase()}`}
                      value={newRow[col.id] || ''}
                      onChange={(e) => setNewRow({ ...newRow, [col.id]: e.target.value })}
                      rows="3"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder={`Enter ${col.name.toLowerCase()}`}
                      value={newRow[col.id] || ''}
                      onChange={(e) => setNewRow({ ...newRow, [col.id]: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                </div>
              ))}
              <button
                onClick={addRow}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Add Day
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Table */}
      {currentTrip.itineraryTable.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Days Planned Yet</h3>
          <p className="text-gray-600 mb-6">Start by adding your first day to the itinerary</p>
          <button
            onClick={() => setShowAddRow(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
          >
            Add First Day
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  {columns.map(col => (
                    <th key={col.id} className={`${col.width} px-4 py-3 text-left text-sm font-semibold relative group`}>
                      <div className="flex items-center justify-between gap-2">
                        <span>{col.name}</span>
                        {col.canDelete && (
                          <button
                            onClick={() => deleteColumn(col.id)}
                            className="opacity-0 group-hover:opacity-100 text-red-200 hover:text-white hover:bg-red-500 rounded p-1 transition-all"
                            title={`Delete "${col.name}" column`}
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="w-24 px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentTrip.itineraryTable.map((row, index) => (
                  <tr key={row.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {columns.map(col => (
                      <td key={col.id} className="px-4 py-3">
                        {editingRow === row.id && col.editable ? (
                          col.id === 'dates' ? (
                            <input
                              type="date"
                              value={editingData[col.id] || ''}
                              onChange={(e) => setEditingData({ ...editingData, [col.id]: e.target.value })}
                              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            />
                          ) : col.id === 'activities' ? (
                            <textarea
                              value={editingData[col.id] || ''}
                              onChange={(e) => setEditingData({ ...editingData, [col.id]: e.target.value })}
                              rows="2"
                              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            />
                          ) : (
                            <input
                              type="text"
                              value={editingData[col.id] || ''}
                              onChange={(e) => setEditingData({ ...editingData, [col.id]: e.target.value })}
                              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            />
                          )
                        ) : (
                          <div className="text-sm text-gray-800">
                            {col.id === 'day' ? (
                              <span className="inline-flex items-center justify-center w-8 h-8 font-bold text-indigo-700 ">
                                {index + 1}
                              </span>
                            ) : col.id === 'budget' ? (
                              <span className="font-semibold text-green-600">
                                {row[col.id] ? `${parseFloat(row[col.id]).toFixed(2)}` : '-'}
                              </span>
                            ) : col.id === 'dates' ? (
                              <span>{row[col.id] ? new Date(row[col.id]).toLocaleDateString() : '-'}</span>
                            ) : col.id === 'activities' ? (
                              <div className="whitespace-pre-wrap max-w-xs">{row[col.id] || '-'}</div>
                            ) : (
                              <span>{row[col.id] || '-'}</span>
                            )}
                          </div>
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      {editingRow === row.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={saveEdit}
                            className="text-green-600 hover:text-green-800 hover:bg-green-100 transition p-1.5 rounded"
                            title="Save changes"
                          >
                            <Save size={18} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-gray-600 hover:text-gray-800 hover:bg-gray-200 transition p-1.5 rounded"
                            title="Cancel editing"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(row)}
                            className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 transition p-1.5 rounded"
                            title="Edit row"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteRow(row.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-100 transition p-1.5 rounded"
                            title="Delete row"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100">
                <tr>
                  <td colSpan={columns.length - 1} className="px-4 py-3 text-right font-bold text-gray-800">
                    Total Budget:
                  </td>
                  <td className="px-4 py-3 font-bold text-green-600 text-lg">
                    ${getTotalBudget().toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Help Text */}
      {currentTrip.itineraryTable.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">💡 Tips:</span> Click the edit icon (✏️) to modify any row. Click the delete icon (🗑️) to remove a row or column.
            Use "Add Column" to create custom fields like Transportation, Meals, or Contact Info. 
            Hover over column headers to see the delete button for removable columns.
          </p>
        </div>
      )}
    </div>
  );
}