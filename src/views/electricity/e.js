// src/api/electricity.js

// ---- Types (for reference)
// status: "paid" | "not_paid" | "pre_paid"

const MOCK = [
  {
    id: 'bill-2025-08',
    month: '2025-08',
    bill_no: 'INV/ELX/2025-08',
    units: 18420,
    amount: 142350.75,
    due_date: '2025-09-10',
    status: 'paid',
    pdf_url: '/sample-bills/2025-08.pdf',
    submitted_at: '2025-08-28T11:05:00Z',
    meta: { remarks: 'On-time' }
  },
  {
    id: 'bill-2025-07',
    month: '2025-07',
    bill_no: 'INV/ELX/2025-07',
    units: 17610,
    amount: 136820.0,
    due_date: '2025-08-10',
    status: 'not_paid',
    pdf_url: '/sample-bills/2025-07.pdf',
    submitted_at: '2025-07-29T09:30:00Z',
    meta: { remarks: 'Awaiting approval' }
  },
  {
    id: 'bill-2025-06',
    month: '2025-06',
    bill_no: 'INV/ELX/2025-06',
    units: 19050,
    amount: 149990.1,
    due_date: '2025-07-10',
    status: 'pre_paid',
    pdf_url: '/sample-bills/2025-06.pdf',
    submitted_at: '2025-06-27T17:20:00Z',
    meta: { remarks: 'Advance meter recharge' }
  }
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function listBills({ startMonth, endMonth } = {}) {
  // Swap with real API when ready:
  // const res = await fetch(`/api/electricity/bills?start=${startMonth}&end=${endMonth}`, { headers: { Authorization: `Bearer ${token}` }});
  // if (!res.ok) throw new Error('Failed to load bills');
  // return await res.json();

  await sleep(200);
  if (!startMonth || !endMonth) return MOCK;
  return MOCK.filter((b) => b.month >= startMonth && b.month <= endMonth);
}

export async function getBill(billId) {
  await sleep(120);
  const found = MOCK.find((b) => b.id === billId);
  if (!found) throw new Error('Bill not found');
  return found;
}

export async function setBillStatus(billId, status) {
  await sleep(120);
  const i = MOCK.findIndex((b) => b.id === billId);
  if (i >= 0) MOCK[i].status = status;
  return { ok: true };
}
