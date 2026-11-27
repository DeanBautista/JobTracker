const knex = require('../db/knex');
const storage = require('../utils/storage');
// The real helper: jest.setup.js mocks it for every other test.
const { cleanupRemovedFiles } = jest.requireActual('../utils/fileCleanup');

// A stand-in transaction: the search returns `rows`, and deletes are recorded.
function fakeDatabase(rows) {
  const del = jest.fn().mockResolvedValue(rows.length);
  const query = {};
  for (const method of ['whereNotNull', 'whereNotExists', 'whereRaw', 'where', 'forUpdate']) {
    query[method] = jest.fn(() => query);
  }
  query.select = jest.fn().mockResolvedValue(rows);
  query.whereIn = jest.fn(() => ({ del }));
  knex.transaction = jest.fn((work) => work(() => query));
  return { query, del };
}

describe('cleanupRemovedFiles', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    storage.remove.mockResolvedValue();
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test("deletes the user's unused rows and their stored files", async () => {
    const { query, del } = fakeDatabase([
      { id: 1, storageKey: 'a.pdf' },
      { id: 2, storageKey: 'b.pdf' },
    ]);

    await cleanupRemovedFiles(147);

    expect(query.where).toHaveBeenCalledWith('user_id', 147);
    expect(query.whereIn).toHaveBeenCalledWith('id', [1, 2]);
    expect(del).toHaveBeenCalled();
    expect(storage.remove.mock.calls).toEqual([['a.pdf'], ['b.pdf']]);
  });

  test('covers every user when no id is given (purge script)', async () => {
    const { query } = fakeDatabase([]);

    await cleanupRemovedFiles();

    expect(query.where).not.toHaveBeenCalled();
  });

  test('does nothing when there are no unused files', async () => {
    const { del } = fakeDatabase([]);

    await cleanupRemovedFiles(147);

    expect(del).not.toHaveBeenCalled();
    expect(storage.remove).not.toHaveBeenCalled();
  });

  test('keeps going when one stored file cannot be deleted', async () => {
    fakeDatabase([
      { id: 1, storageKey: 'a.pdf' },
      { id: 2, storageKey: 'b.pdf' },
    ]);
    storage.remove.mockRejectedValueOnce(new Error('down'));

    await expect(cleanupRemovedFiles(147)).resolves.toBeUndefined();

    expect(storage.remove).toHaveBeenCalledTimes(2);
  });

  test('does not throw when the database fails', async () => {
    knex.transaction = jest.fn().mockRejectedValue(new Error('db down'));

    await expect(cleanupRemovedFiles(147)).resolves.toBeUndefined();

    expect(storage.remove).not.toHaveBeenCalled();
  });
});