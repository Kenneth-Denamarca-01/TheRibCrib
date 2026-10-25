// The Rib Crib backend (Google Apps Script). Paste into a Google Sheet's Apps Script editor.
const STAFF_KEY = 'CHANGE-THIS-TO-A-LONG-SECRET';   // staff password for the Kitchen page
const OH = ['Time','Order No','Type','Name / Table','Items','Total','Status'];
const RH = ['Time','Ref','Name','Phone','Date','Time slot','Guests','Notes','Status'];

function tab_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name); sh.appendRow(headers); sh.setFrozenRows(1);
    sh.getRange(1, 1, sh.getMaxRows(), headers.length).setNumberFormat('@');           // keep text as text
    if (name === 'Orders') sh.getRange(2, 6, sh.getMaxRows() - 1, 1).setNumberFormat('0.00');  // Total column
  }
  return sh;
}
function clean_(v) {            // stop spreadsheet formula injection, trim length
  v = String(v == null ? '' : v).slice(0, 300);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}
function fmt_(v) { return v instanceof Date ? Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm') : String(v == null ? '' : v); }
function now_() { return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'); }
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const d = JSON.parse(e.postData.contents);
    if (d.type === 'order') {
      tab_('Orders', OH).appendRow([now_(), clean_(d.no), clean_(d.mode), clean_(d.name), clean_(d.items), Number(d.total) || 0, 'New']);
    } else if (d.type === 'reservation') {
      tab_('Reservations', RH).appendRow([now_(), clean_(d.ref), clean_(d.name), clean_(d.phone), clean_(d.dateText), clean_(d.timeText), clean_(d.guests), clean_(d.notes), 'New']);
    } else { return out_({ ok: false }); }
    return out_({ ok: true });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function doGet(e) {
  const p = e.parameter || {};
  if (p.key !== STAFF_KEY) return out_({ ok: false, error: 'bad key' });
  if (p.action === 'list') {
    const orders = tab_('Orders', OH).getDataRange().getValues().map((r, i) => ({ row: i + 1, r }))
      .filter(x => x.row > 1 && x.r[6] === 'New')
      .map(x => ({ row: x.row, time: fmt_(x.r[0]), no: fmt_(x.r[1]), mode: fmt_(x.r[2]), name: fmt_(x.r[3]), items: fmt_(x.r[4]), total: Number(x.r[5]) || 0 }));
    const reservations = tab_('Reservations', RH).getDataRange().getValues().map((r, i) => ({ row: i + 1, r }))
      .filter(x => x.row > 1 && x.r[8] === 'New')
      .map(x => ({ row: x.row, time: fmt_(x.r[0]), ref: fmt_(x.r[1]), name: fmt_(x.r[2]), phone: fmt_(x.r[3]), date: fmt_(x.r[4]), slot: fmt_(x.r[5]), guests: fmt_(x.r[6]), notes: fmt_(x.r[7]) }));
    return out_({ ok: true, orders: orders, reservations: reservations });
  }
  if (p.action === 'sales') {          // total sales for one day (all orders received that day)
    const day = /^\d{4}-\d{2}-\d{2}$/.test(p.date || '') ? p.date : now_().slice(0, 10);
    const rows = tab_('Orders', OH).getDataRange().getValues().slice(1).filter(r => fmt_(r[0]).slice(0, 10) === day);
    let total = 0; const by = {}, items = {};
    rows.forEach(r => {
      const a = Number(r[5]) || 0; total += a;
      const t = fmt_(r[2]); by[t] = (by[t] || 0) + a;
      fmt_(r[4]).split(' | ').forEach(s => { const m = s.match(/^(\d+) x (.+)$/); if (m) items[m[2]] = (items[m[2]] || 0) + Number(m[1]); });
    });
    return out_({ ok: true, date: day, count: rows.length, total: Math.round(total * 100) / 100, by: by, items: items });
  }
  if (p.action === 'set') {
    const isO = p.sheet === 'Orders', isR = p.sheet === 'Reservations';
    if (!isO && !isR) return out_({ ok: false });
    const sh = tab_(p.sheet, isO ? OH : RH), row = Number(p.row);
    if (!(row > 1) || String(sh.getRange(row, 2).getValue()) !== String(p.id)) return out_({ ok: false, error: 'row mismatch' });
    sh.getRange(row, isO ? 7 : 9).setValue(clean_(p.status));
    return out_({ ok: true });
  }
  return out_({ ok: false });
}
