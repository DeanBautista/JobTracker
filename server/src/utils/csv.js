const BOM = '\uFEFF'; // makes Excel read the file as UTF-8
const FORMULA_START = /^[=+\-@\t\r]/;

function cell(value) {
  if (value == null) return '';
  if (typeof value === 'number') return String(value);
  let text = String(value);
  // A cell starting with = + - @ runs as a formula in Excel, so mark it as text.
  if (FORMULA_START.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// columns: [{ header, value(row) }]
function toCsv(columns, rows) {
  const head = columns.map((c) => cell(c.header)).join(',');
  const body = rows.map((row) => columns.map((c) => cell(c.value(row))).join(','));
  return `${BOM}${[head, ...body].join('\r\n')}\r\n`;
}

module.exports = { toCsv };