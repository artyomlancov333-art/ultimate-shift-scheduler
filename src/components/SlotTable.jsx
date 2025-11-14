import React from 'react';
import { formatDate, formatTime, groupSlotsByDateTime } from '../firebase';

const SlotTable = ({ slots, isAdmin, currentUserName, onEdit, onDelete }) => {
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
        <p className="text-gray-500 text-center py-8">Нет запланированных слотов</p>
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
    <div className="card overflow-x-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Расписание смен</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Дата</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Время</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Сотрудник</th>
              {(isAdmin || currentUserName) && (
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Действия</th>
              )}
            </tr>
          </thead>
          <tbody>
            {flatSlots.map((slot) => (
              <tr 
                key={slot.id}
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  !slot.isFirstInGroup ? 'bg-gray-50/50' : ''
                }`}
              >
                {slot.isFirstInGroup && (
                  <td 
                    className="py-4 px-4 font-medium text-gray-800 align-top"
                    rowSpan={slot.groupSize}
                  >
                    {formatDate(slot.groupDate)}
                  </td>
                )}
                {slot.isFirstInGroup && (
                  <td 
                    className="py-4 px-4 text-gray-700 align-top"
                    rowSpan={slot.groupSize}
                  >
                    {formatTime(slot.groupStartTime)} – {formatTime(slot.groupEndTime)}
                  </td>
                )}
                <td className="py-4 px-4">
                  <span className="inline-block bg-sber-green/10 text-sber-green px-3 py-1 rounded-full text-sm font-medium">
                    {slot.name}
                  </span>
                </td>
                {(isAdmin || currentUserName) && (
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      {canEditSlot(slot) && (
                        <button
                          onClick={() => onEdit(slot)}
                          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
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
                          className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
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

