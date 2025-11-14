// Firebase configuration
// Замените эти значения на ваши реальные ключи Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';

// TODO: Замените на ваши реальные ключи Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collection name
const SLOTS_COLLECTION = 'slots';

/**
 * Добавляет новый слот в Firestore
 * @param {Object} slotData - Данные слота { name, date, startTime, endTime }
 * @returns {Promise<string>} ID созданного документа
 */
export const addSlot = async (slotData) => {
  try {
    const docRef = await addDoc(collection(db, SLOTS_COLLECTION), {
      ...slotData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding slot:', error);
    throw error;
  }
};

/**
 * Подписывается на изменения слотов в реальном времени
 * @param {Function} callback - Функция обратного вызова, получающая массив слотов
 * @returns {Function} Функция для отписки
 */
export const getSlots = (callback) => {
  const q = query(
    collection(db, SLOTS_COLLECTION),
    orderBy('date', 'asc'),
    orderBy('startTime', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const slots = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(slots);
  }, (error) => {
    console.error('Error getting slots:', error);
    callback([]);
  });
};

/**
 * Форматирует дату для отображения
 * @param {string} dateString - Дата в формате YYYY-MM-DD
 * @returns {string} Отформатированная дата DD.MM.YYYY
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}.${month}.${year}`;
};

/**
 * Форматирует время для отображения
 * @param {string} timeString - Время в формате HH:mm
 * @returns {string} Отформатированное время HH:mm
 */
export const formatTime = (timeString) => {
  if (!timeString) return '';
  return timeString;
};

/**
 * Вычисляет количество часов между двумя временами
 * @param {string} startTime - Время начала в формате HH:mm
 * @param {string} endTime - Время окончания в формате HH:mm
 * @returns {number} Количество часов (может быть дробным)
 */
export const calculateHours = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  
  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;
  
  const diffMinutes = endTotalMinutes - startTotalMinutes;
  return diffMinutes / 60;
};

/**
 * Группирует слоты по дате и времени
 * @param {Array} slots - Массив слотов
 * @returns {Array} Группированные слоты
 */
export const groupSlotsByDateTime = (slots) => {
  const grouped = {};
  
  slots.forEach(slot => {
    const key = `${slot.date}_${slot.startTime}_${slot.endTime}`;
    if (!grouped[key]) {
      grouped[key] = {
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        names: [],
        ids: [],
      };
    }
    grouped[key].names.push(slot.name);
    grouped[key].ids.push(slot.id);
  });
  
  return Object.values(grouped);
};

export { db };

