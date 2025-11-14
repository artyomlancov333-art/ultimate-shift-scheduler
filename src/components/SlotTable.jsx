import { formatDate, formatTime, groupSlotsByDateTime } from '../firebase';

const SlotTable = ({ slots }) => {
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

  return (
    <div className="card overflow-x-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Расписание смен</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Дата</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Время</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Сотрудники</th>
            </tr>
          </thead>
          <tbody>
            {groupedSlots.map((slot, index) => (
              <tr 
                key={`${slot.date}-${slot.startTime}-${slot.endTime}-${index}`}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-4 px-4 font-medium text-gray-800">
                  {formatDate(slot.date)}
                </td>
                <td className="py-4 px-4 text-gray-700">
                  {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-wrap gap-2">
                    {slot.names.map((name, nameIndex) => (
                      <span
                        key={nameIndex}
                        className="inline-block bg-sber-green/10 text-sber-green px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SlotTable;

