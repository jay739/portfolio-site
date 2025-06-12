import lockfile from 'proper-lockfile';
import { promises as fs } from 'fs';
import path from 'path';

export async function createLock(lockPath: string) {
  const dir = path.dirname(lockPath);
  
  // Ensure directory exists
  await fs.mkdir(dir, { recursive: true });
  
  // Create lock file if it doesn't exist
  try {
    await fs.access(lockPath);
  } catch {
    await fs.writeFile(lockPath, '', { mode: 0o600 });
  }

  const release = await lockfile.lock(lockPath, {
    retries: {
      retries: 5,
      factor: 3,
      minTimeout: 100,
      maxTimeout: 1000,
      randomize: true,
    },
    stale: 30000, // Lock is considered stale after 30 seconds
  });

  return {
    release: async () => {
      try {
        await release();
      } catch (error) {
        console.error('Error releasing lock:', error);
      }
    },
  };
} 