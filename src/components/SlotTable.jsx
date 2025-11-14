import React, { useState } from 'react';
import { formatDate, formatTime, groupSlotsByDateTime, updateSlot } from '../firebase';

const SlotTable = ({ slots, isAdmin, currentUserName, onEdit, onDelete }) => {
  const [editingComment, setEditingComment] = useState(null);
  const [commentValue, setCommentValue] = useState('');
  const groupedSlots = groupSlotsByDateTime(slots);
  
  // Сортировка по дате и времени
  groupedSlots.sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    if (a.startTime !== b.startTime) {
      return a.startTime.localeCompare(b.startTime);
    }
    return a.endTime.localeCompare(b.endTime);
  });

  if (groupedSlots.length === 0) {
    return (
      <div className="card">
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">Нет запланированных слотов</p>
      </div>
    );
  }

  const canDeleteSlot = (slot) => {
    // Администратор может удалять любые слоты
    if (isAdmin) return true;
    // Обычный пользователь может удалять только свои слоты
    return slot.name === currentUserName;
  };

  const canEditSlot = (slot) => {
    // Администратор может редактировать любые слоты
    if (isAdmin) return true;
    // Обычный пользователь может редактировать только свои слоты
    return slot.name === currentUserName;
  };

  const handleCommentSave = async (slotId) => {
    try {
      await updateSlot(slotId, { comment: commentValue });
      setEditingComment(null);
      setCommentValue('');
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleCommentEdit = (slot) => {
    setEditingComment(slot.id);
    setCommentValue(slot.comment || '');
  };

  // Преобразуем группированные слоты в плоский список для отображения
  const flatSlots = [];
  groupedSlots.forEach((group) => {
    group.slots.forEach((slot, slotIndex) => {
      flatSlots.push({
        ...slot,
        groupDate: group.date,
        groupStartTime: group.startTime,
        groupEndTime: group.endTime,
        groupSize: group.slots.length,
        isFirstInGroup: slotIndex === 0,
      });
    });
  });

  return (
    <div className="card">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 sm:mb-6">Расписание смен</h2>
      <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b-2 border-gray-200 dark:border-gray-600">
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">Дата</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">Время</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">Сотрудник</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">Комментарий</th>
              {(isAdmin || currentUserName) && (
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">Действия</th>
              )}
            </tr>
          </thead>
          <tbody>
            {flatSlots.map((slot) => (
              <tr 
                key={slot.id}
                className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                  !slot.isFirstInGroup ? 'bg-gray-50/50 dark:bg-gray-800/30' : ''
                }`}
              >
                {slot.isFirstInGroup && (
                  <td 
                    className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 align-top whitespace-nowrap"
                    rowSpan={slot.groupSize}
                  >
                    {formatDate(slot.groupDate)}
                  </td>
                )}
                {slot.isFirstInGroup && (
                  <td 
                    className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-gray-700 dark:text-gray-100 dark:font-semibold align-top whitespace-nowrap"
                    rowSpan={slot.groupSize}
                  >
                    {formatTime(slot.groupStartTime)} – {formatTime(slot.groupEndTime)}
                  </td>
                )}
                <td className="py-2 sm:py-4 px-2 sm:px-4">
                  <span className="inline-block bg-sber-green/10 dark:bg-sber-green/40 text-sber-green dark:text-green-300 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border border-sber-green/20 dark:border-sber-green/60 dark:shadow-sm whitespace-nowrap">
                    {slot.name}
                  </span>
                </td>
                <td className="py-2 sm:py-4 px-2 sm:px-4 max-w-[200px] sm:max-w-none">
                  {editingComment === slot.id ? (
                    <div className="flex gap-1 sm:gap-2 items-center">
                      <input
                        type="text"
                        value={commentValue}
                        onChange={(e) => setCommentValue(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleCommentSave(slot.id);
                          }
                          if (e.key === 'Escape') {
                            setEditingComment(null);
                            setCommentValue('');
                          }
                        }}
                        className="flex-1 min-w-0 px-2 py-1 text-xs sm:text-sm border border-gray-300 dark:border-gray-500 dark:bg-gray-700 dark:text-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-sber-green"
                        autoFocus
                        placeholder="Комментарий..."
                      />
                      <button
                        onClick={() => handleCommentSave(slot.id)}
                        className="px-2 py-1 bg-green-500 dark:bg-green-600 text-white text-xs rounded hover:bg-green-600 dark:hover:bg-green-500 transition-colors flex-shrink-0"
                        title="Сохранить"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => {
                          setEditingComment(null);
                          setCommentValue('');
                        }}
                        className="px-2 py-1 bg-gray-500 dark:bg-gray-600 text-white text-xs rounded hover:bg-gray-600 dark:hover:bg-gray-500 transition-colors flex-shrink-0"
                        title="Отмена"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start gap-1 sm:gap-2">
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 break-words min-w-0 flex-1">
                        {slot.comment || <span className="text-gray-400 dark:text-gray-500 italic">—</span>}
                      </span>
                      <button
                        onClick={() => handleCommentEdit(slot)}
                        className="px-1 sm:px-2 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors flex-shrink-0"
                        title="Редактировать комментарий"
                      >
                        ✏️
                      </button>
                    </div>
                  )}
                </td>
                {(isAdmin || currentUserName) && (
                  <td className="py-2 sm:py-4 px-2 sm:px-4 whitespace-nowrap">
                    <div className="flex gap-1 sm:gap-2">
                      {canEditSlot(slot) && (
                        <button
                          onClick={() => onEdit(slot)}
                          className="px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-500 dark:bg-blue-600 text-white text-xs rounded hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors shadow-sm dark:shadow-md font-medium"
                          title="Редактировать"
                        >
                          ✏️
                        </button>
                      )}
                      {canDeleteSlot(slot) && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Удалить смену для ${slot.name}?`)) {
                              onDelete(slot.id);
                            }
                          }}
                          className="px-2 sm:px-3 py-1 sm:py-1.5 bg-red-500 dark:bg-red-600 text-white text-xs rounded hover:bg-red-600 dark:hover:bg-red-500 transition-colors shadow-sm dark:shadow-md font-medium"
                          title="Удалить"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SlotTable;

