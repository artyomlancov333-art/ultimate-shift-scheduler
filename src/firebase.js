// Firebase configuration
// Замените эти значения на ваши реальные ключи Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, Timestamp, doc, deleteDoc, updateDoc } from 'firebase/firestore';

// TODO: Замените на ваши реальные ключи Firebase
const firebaseConfig = {
  apiKey: "AIzaSyASJIpNOj58QUKOEEsFYYiqrldmff9Bk50",
  authDomain: "ultimate-shift-scheduler.firebaseapp.com",
  projectId: "ultimate-shift-scheduler",
  storageBucket: "ultimate-shift-scheduler.firebasestorage.app",
  messagingSenderId: "930631363666",
  appId: "1:930631363666:web:7e40c51ea33579fcb8038b",
  measurementId: "G-9L577EDB5W"
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
        slots: [], // Сохраняем полные данные слотов
      };
    }
    grouped[key].names.push(slot.name);
    grouped[key].ids.push(slot.id);
    grouped[key].slots.push(slot); // Сохраняем полный объект слота
  });
  
  return Object.values(grouped);
};

/**
 * Удаляет слот из Firestore
 * @param {string} slotId - ID слота для удаления
 * @returns {Promise<void>}
 */
export const deleteSlot = async (slotId) => {
  try {
    await deleteDoc(doc(db, SLOTS_COLLECTION, slotId));
  } catch (error) {
    console.error('Error deleting slot:', error);
    throw error;
  }
};

/**
 * Обновляет слот в Firestore
 * @param {string} slotId - ID слота для обновления
 * @param {Object} updatedData - Обновленные данные { name, date, startTime, endTime }
 * @returns {Promise<void>}
 */
export const updateSlot = async (slotId, updatedData) => {
  try {
    await updateDoc(doc(db, SLOTS_COLLECTION, slotId), {
      ...updatedData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating slot:', error);
    throw error;
  }
};

export { db };

