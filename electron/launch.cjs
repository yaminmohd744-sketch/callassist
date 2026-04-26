// Launcher that strips ELECTRON_RUN_AS_NODE before spawning electron.
// This is needed when running inside Claude Code (or any Electron-based CLI)
// which sets ELECTRON_RUN_AS_NODE=1 in the environment.
const { spawn } = require('child_process');
const path = require('path');

const env = { ...process.env };
// Strip vars set by host Electron process (Claude Code, VS Code, etc.)
delete env.ELECTRON_RUN_AS_NODE;
delete env.ELECTRON_NO_ATTACH_CONSOLE;
delete env.ELECTRON_ENABLE_LOGGING;
delete env.ELECTRON_ENABLE_STACK_DUMPING;
delete env.ELECTRON_DISABLE_SECURITY_WARNINGS;

const electronBin = require('electron'); // returns path to electron.exe from npm pkg
const cwd = path.join(__dirname, '..');

const child = spawn(electronBin, ['.'], {
  // detached so the child gets its own process group and isn't killed when
  // the parent (Claude Code terminal) exits
  detached: true,
  stdio: 'inherit',
  env,
  cwd,
});

child.unref();

// Give it a moment to boot then exit the launcher
setTimeout(() => process.exit(0), 3000);
