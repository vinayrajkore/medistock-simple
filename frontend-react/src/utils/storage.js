/**
 * storage.js — LocalStorage Data Layer
 * Replaces the backend API completely.
 * All data lives in the browser's localStorage.
 */

// ─── Keys ────────────────────────────────────────────────────────────────────
const K = {
  USERS:     'medi_users',
  SESSION:   'medi_session',
  MEDS:      (uid) => `medi_medicines_${uid}`,
  BILLS:     (uid) => `medi_bills_${uid}`,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function read(key)       { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } }
function write(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
function uid()           { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function numId()         { return Date.now() + Math.floor(Math.random() * 1000); }

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export function registerUser({ name, email, password, phone = '', pharmacy = '' }) {
  const users = read(K.USERS) || [];
  if (users.find(u => u.email === email)) {
    throw new Error('Email already registered');
  }
  const user = { id: numId(), name, email, password, phone, pharmacy, created: new Date().toISOString() };
  users.push(user);
  write(K.USERS, users);
  return { ok: true, user };
}

export function loginUser(email, password) {
  const users = read(K.USERS) || [];
  const user  = users.find(u => u.email === email && u.password === password);
  if (!user) throw new Error('Invalid email or password');
  // Save session
  const session = { id: user.id, name: user.name, email: user.email, pharmacy: user.pharmacy, phone: user.phone };
  write(K.SESSION, session);
  return session;
}

export function getSession()  { return read(K.SESSION); }
export function clearSession(){ localStorage.removeItem(K.SESSION); }

export function updateProfile(userId, data) {
  const users = read(K.USERS) || [];
  const idx   = users.findIndex(u => u.id === userId);
  if (idx === -1) throw new Error('User not found');
  users[idx] = { ...users[idx], ...data };
  write(K.USERS, users);
  // Update session too
  const session = read(K.SESSION);
  if (session) write(K.SESSION, { ...session, ...data });
  return users[idx];
}

// ─── MEDICINES ────────────────────────────────────────────────────────────────
export function getMedicines(userId) {
  return read(K.MEDS(userId)) || [];
}

export function addMedicine(userId, med) {
  const list = getMedicines(userId);
  const item = { ...med, id: numId(), created: new Date().toISOString() };
  list.push(item);
  write(K.MEDS(userId), list);
  return item;
}

export function updateMedicine(userId, id, data) {
  const list = getMedicines(userId);
  const idx  = list.findIndex(m => String(m.id) === String(id));
  if (idx === -1) throw new Error('Medicine not found');
  list[idx] = { ...list[idx], ...data };
  write(K.MEDS(userId), list);
  return list[idx];
}

export function deleteMedicine(userId, id) {
  const list = getMedicines(userId).filter(m => String(m.id) !== String(id));
  write(K.MEDS(userId), list);
}

// ─── BILLS ────────────────────────────────────────────────────────────────────
export function getBills(userId) {
  return read(K.BILLS(userId)) || [];
}

export function addBill(userId, { customerName, items }) {
  const bills = getBills(userId);
  const total = items.reduce((sum, it) => sum + (Number(it.price) * Number(it.quantity)), 0);
  const bill  = {
    id:           numId(),
    customerName,
    items,
    total,
    date:         new Date().toISOString(),
    invoiceNo:    'INV-' + String(numId()).slice(-6),
  };
  bills.push(bill);
  write(K.BILLS(userId), bills);

  // Deduct medicine stock
  const meds = getMedicines(userId);
  items.forEach(it => {
    const idx = meds.findIndex(m => String(m.id) === String(it.medicineId));
    if (idx !== -1) {
      meds[idx].quantity = Math.max(0, Number(meds[idx].quantity) - Number(it.quantity));
    }
  });
  write(K.MEDS(userId), meds);

  return bill;
}

// ─── DASHBOARD STATS ─────────────────────────────────────────────────────────
export function getDashboardStats(userId) {
  const meds  = getMedicines(userId);
  const bills = getBills(userId);
  const today = new Date();
  const in30  = new Date(); in30.setDate(today.getDate() + 30);

  const totalMedicines  = meds.length;
  const lowStock        = meds.filter(m => Number(m.quantity) <= 10).length;
  const expiringSoon    = meds.filter(m => m.expiry && new Date(m.expiry) <= in30 && new Date(m.expiry) >= today).length;
  const totalBills      = bills.length;
  const totalRevenue    = bills.reduce((s, b) => s + Number(b.total), 0);
  const recentMeds      = [...meds].sort((a, b) => b.id - a.id).slice(0, 5);
  const recentBills     = [...bills].sort((a, b) => b.id - a.id).slice(0, 5);

  return { totalMedicines, lowStock, expiringSoon, totalBills, totalRevenue, recentMeds, recentBills };
}

// ─── CHATBOT ─────────────────────────────────────────────────────────────────
export function chatbotReply(userId, message) {
  const msg   = message.toLowerCase().trim();
  const meds  = getMedicines(userId);
  const bills = getBills(userId);
  const stats = getDashboardStats(userId);

  if (/how many medicine|total medicine|medicine count/.test(msg))
    return `You have ${stats.totalMedicines} medicine(s) in stock.`;

  if (/low stock|running out|low quantity/.test(msg))
    return stats.lowStock > 0
      ? `⚠️ ${stats.lowStock} medicine(s) are low on stock (≤10 units).`
      : '✅ All medicines have sufficient stock!';

  if (/expir/.test(msg))
    return stats.expiringSoon > 0
      ? `⚠️ ${stats.expiringSoon} medicine(s) are expiring within 30 days.`
      : '✅ No medicines expiring in the next 30 days.';

  if (/total bill|how many bill|bill count/.test(msg))
    return `You have ${stats.totalBills} invoice(s) generated so far.`;

  if (/revenue|total sale|earning/.test(msg))
    return `💰 Total revenue: ₹${stats.totalRevenue.toFixed(2)}`;

  if (/add medicine|how to add/.test(msg))
    return 'Go to the Medicines page and click "+ Add Medicine" to add a new medicine.';

  if (/bill|invoice|generate/.test(msg))
    return 'Go to the Billing page to generate a new invoice for a customer.';

  if (/help|what can you do/.test(msg))
    return 'I can help you with: stock counts, low stock alerts, expiry checks, revenue reports, and navigation tips!';

  return `I'm not sure about that. Try asking: "how many medicines?", "low stock", "expiring soon", or "total revenue".`;
}
