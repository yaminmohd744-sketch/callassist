// Launcher that strips ELECTRON_RUN_AS_NODE before spawning electron.
// This is needed when running inside Claude Code (or any Electron-based CLI)
// which sets ELECTRON_RUN_AS_NODE=1 in the environment.
const { spawn } = require('child_process');
const path = require('path');

const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const electronBin = require('electron'); // returns path to electron.exe from npm pkg
const child = spawn(electronBin, ['.'], {
  stdio: 'inherit',
  env,
  cwd: path.join(__dirname, '..'),
});

child.on('exit', (code) => process.exit(code || 0));
