import * as core from '@actions/core';
import * as exec from '@actions/exec';
import { promisify } from 'util';

export async function listChangedTopLevelDirectories(dir: string, baseBranch: string): Promise<string[]> {
  try {
    process.chdir(dir);

    await exec.exec('git', ['fetch', 'origin', baseBranch]);

    let stdout = '';
    let stderr = '';

    const options: any = {};
    options.listeners = {
      stdout: (data: Buffer) => {
        stdout += data.toString();
      },
      stderr: (data: Buffer) => {
        stderr += data.toString();
      }
    };

    await exec.exec(`git`,  [`diff`, `--name-only`, `origin/${baseBranch}...HEAD`], options);

    // Filter for top level directories
    const topLevelDirs = new Set();
    stdout.split('\n').forEach(file => {
      const topLevelDir = file.split('/')[0];
      if (topLevelDir) {
        topLevelDirs.add(topLevelDir);
      }
    });

    return Array.from(topLevelDirs) as string[];
  } catch (error) {
    console.error("Error:", error.message);
    core.setFailed(`Failed to list changed directories: ${error.message}`);
    return [];
  }
}

async function run() {
  const changedDirs = await listChangedTopLevelDirectories(".", "main");

  console.log(changedDirs);
}

run();
