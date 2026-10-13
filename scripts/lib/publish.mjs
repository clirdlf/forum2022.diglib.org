import {lstat, mkdir, rename, rm} from 'node:fs/promises';
import {dirname} from 'node:path';
import {randomUUID} from 'node:crypto';

// Filesystem rename is atomic per destination. Roll back the complete set if a
// rename fails, retaining backups if restoration itself fails.
export async function publishStaged(entries) {
  const transaction = randomUUID();
  const state = [];
  for (const entry of entries) {
    const staged = await lstat(entry.staged);
    let existing;
    try { existing = await lstat(entry.target); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (existing && (existing.isSymbolicLink() || existing.isDirectory() !== staged.isDirectory())) {
      throw Error(`Unexpected destination type: ${entry.target}`);
    }
    await mkdir(dirname(entry.target), {recursive: true});
    state.push({...entry, existed: !!existing, backup: entry.target + '.backup-' + transaction});
  }
  try {
    for (const entry of state) {
      if (entry.existed) { await rename(entry.target, entry.backup); entry.backedUp = true; }
      await rename(entry.staged, entry.target);
      entry.installed = true;
    }
  } catch (error) {
    const failures = [];
    for (const entry of [...state].reverse()) {
      try {
        if (entry.installed) await rm(entry.target, {recursive: true, force: true});
        if (entry.backedUp) await rename(entry.backup, entry.target);
      } catch (failure) { failures.push(failure); }
    }
    if (failures.length) throw new AggregateError([error, ...failures], 'Import rollback incomplete; retain .backup files for recovery');
    throw error;
  }
  for (const entry of state) if (entry.backedUp) await rm(entry.backup, {recursive: true, force: true});
}
