'use strict';

const fs = require('fs').promises;
const path = require('path');
const readdir = require('recursive-readdir');
const fetch = require('node-fetch');
const { getParameters } = require('codesandbox/lib/api/define');
const DEFAULT_IGNORE_PATHS = require('./ignore-paths');

async function getSandboxFromFile(directoryPath, ignorePaths) {
  let absDirectoryPath;

  if (path.isAbsolute(directoryPath)) {
    absDirectoryPath = directoryPath;
  } else {
    absDirectoryPath = path.resolve(process.cwd(), directoryPath);
  }

  const filePaths = await readdir(absDirectoryPath, ignorePaths);

  const files = {};

  for (const filePath of filePaths) {
    const relativePath = path.relative(absDirectoryPath, filePath);

    files[relativePath] = {
      content: await fs.readFile(filePath, 'utf8'),
    };
  }

  return {
    files,
  };
}

async function getCodeSandbox(
  sandboxID,
  { ignorePaths = DEFAULT_IGNORE_PATHS } = {}
) {
  if (sandboxID.startsWith('file:')) {
    const directoryPath = sandboxID.slice('file:'.length);

    return getSandboxFromFile(directoryPath, ignorePaths);
  }

  const { data } = await fetch(
    `https://codesandbox.io/api/v1/sandboxes/${sandboxID}`
  ).then((res) => res.json());

  // Construct files/directories mappings
  const mappings = {};

  (data.directories || []).forEach((dir) => {
    mappings[dir.shortid] = dir;
  });
  (data.modules || []).forEach((file) => {
    mappings[file.shortid] = file;
  });

  // Construct files mappings
  const files = {};

  (data.modules || []).forEach((file) => {
    const path = getFilePath(mappings, file.shortid);

    files[path] = { content: file.code };
  });

  return {
    files,
  };
}

function getFilePath(mappings, shortid) {
  const dir = mappings[shortid];

  if (!dir) {
    return null;
  }

  return [getFilePath(mappings, dir.directory_shortid), dir.title]
    .filter(Boolean)
    .join('/');
}

async function uploadSandbox(sandbox) {
  const parameters = getParameters(sandbox);

  const { sandbox_id, error } = await fetch(
    'https://codesandbox.io/api/v1/sandboxes/define',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parameters, json: 1 }),
    }
  ).then((res) => res.json());

  if (error) {
    throw error;
  }

  return sandbox_id;
}

module.exports = exports = getCodeSandbox;
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = getCodeSandbox;
exports.getCodeSandbox = getCodeSandbox;
exports.getSandboxFromFile = getSandboxFromFile;
exports.uploadSandbox = uploadSandbox;
