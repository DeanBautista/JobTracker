const { toCsv } = require('../utils/csv');
const { jobsToCsv } = require('../utils/jobsCsv');

const cols = [{ header: 'A', value: (r) => r.a }, { header: 'B', value: (r) => r.b }];

describe('toCsv', () => {
  test('starts with a BOM and uses CRLF line endings', () => {
    const csv = toCsv(cols, [{ a: 1, b: 'x' }]);

    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toBe('\uFEFFA,B\r\n1,x\r\n');
  });

  test('turns null and undefined into empty cells', () => {
    expect(toCsv(cols, [{ a: null }])).toBe('\uFEFFA,B\r\n,\r\n');
  });

  test.each([
    ['a comma', 'a,b', '"a,b"'],
    ['a double quote', 'say "hi"', '"say ""hi"""'],
    ['a newline', 'a\nb', '"a\nb"'],
  ])('quotes a value with %s', (_label, value, expected) => {
    expect(toCsv(cols, [{ a: value, b: '' }])).toBe(`\uFEFFA,B\r\n${expected},\r\n`);
  });

  test.each(['=SUM(A1)', '+1', '-1', '@cmd'])('marks %s so a spreadsheet will not run it', (value) => {
    expect(toCsv(cols, [{ a: value, b: '' }])).toContain(`'${value}`);
  });

  test('leaves numbers, including negatives, alone', () => {
    expect(toCsv(cols, [{ a: -5, b: 0 }])).toBe('\uFEFFA,B\r\n-5,0\r\n');
  });
});

describe('jobsToCsv', () => {
  const row = {
    title: 'Dev', company: 'Northwind', status: 'rejected', priority: 'low', work_mode: 'hybrid',
    employment_type: 'internship', salary_min: '50000.00', salary_max: '60000.00', salary_period: 'month',
    closed_reason: 'no_response', days_in_stage: '12', archived: 1,
  };

  test('maps database values to readable labels and plain numbers', () => {
    const [header, line] = jobsToCsv([row]).replace('\uFEFF', '').split('\r\n');

    expect(header.split(',')[0]).toBe('Title');
    const cells = line.split(',');
    expect(cells.slice(0, 6)).toEqual(['Dev', 'Northwind', 'Rejected', 'Low', 'Hybrid', 'Internship']);
    expect(line).toContain('50000,60000');
    expect(line).toContain('Per month');
    expect(line).toContain('No response');
    expect(line).toContain('Yes'); // archived
  });

  test('keeps an unknown value as is instead of dropping it', () => {
    expect(jobsToCsv([{ ...row, status: 'mystery' }])).toContain('mystery');
  });
});