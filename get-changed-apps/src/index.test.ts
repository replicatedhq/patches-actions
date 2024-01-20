import { listChangedTopLevelDirectories } from '.';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import { ExecOptions } from '@actions/exec/lib/interfaces';

jest.mock('@actions/core');
jest.mock('@actions/exec');

describe('listChangedTopLevelDirectories', () => {
  const originalChdir = process.chdir;
  let chdirMock: jest.Mock;

  beforeEach(() => {
    chdirMock = jest.fn();
    process.chdir = chdirMock;

    jest.clearAllMocks();

    exec.exec.mockImplementation((command, args, options: any = {}) => {
      if (command === 'git' && args.includes('fetch')) {
        // Handle 'git fetch'
        if (options.listeners && options.listeners.stdout) {
          options.listeners.stdout(Buffer.from(''));
        }
        if (options.listeners && options.listeners.stderr) {
          options.listeners.stderr(Buffer.from(''));
        }
        return Promise.resolve(0);
      } else if (command === 'git' && args.includes('diff')) {
        // Handle 'git diff'
        if (options.listeners && options.listeners.stdout) {
          options.listeners.stdout(Buffer.from('dir1/file1.js\ndir2/file2.js'));
        }
        if (options.listeners && options.listeners.stderr) {
          options.listeners.stderr(Buffer.from(''));
        }
        return Promise.resolve(0);
      }
      return Promise.reject(new Error('Command not recognized'));
    });
  });

  afterEach(() => {
    process.chdir = originalChdir;
  });

  it('fetches the base branch and returns the list of top-level directories with changes', async () => {
    const changedDirs = await listChangedTopLevelDirectories('/fake/path/to/repo', 'main');

    expect(chdirMock).toHaveBeenCalledWith('/fake/path/to/repo');
    expect(exec.exec).toHaveBeenNthCalledWith(1, 'git', ['fetch', 'origin', 'main']);
    expect(exec.exec).toHaveBeenNthCalledWith(2, 'git', ['diff', '--name-only', `origin/main...HEAD`], expect.anything());
    expect(changedDirs).toEqual(['dir1', 'dir2']);
  });


});
