'use strict';

const fs = require('fs');
const path = require('path');
const readdir = require('recursive-readdir');
const fetch = require('node-fetch');
const { getParameters } = require('codesandbox/lib/api/define');
const {
  getMainFile,
  getTemplate,
} = require('codesandbox-import-utils/lib/create-sandbox/templates');
const { isBinaryFile } = require('isbinaryfile');
const FormData = require('form-data');
const DEFAULT_IGNORE_PATHS = require('./ignore-paths');

async function getSandboxFromFile(
  directoryPath,
  { ignorePaths, skipUploadingBinaryFiles, basePath }
) {
  let absDirectoryPath;

  if (path.isAbsolute(directoryPath)) {
    absDirectoryPath = directoryPath;
  } else {
    absDirectoryPath = path.resolve(basePath, directoryPath);
  }

  const filePaths = await readdir(absDirectoryPath, ignorePaths);

  const files = {};

  for (const filePath of filePaths) {
    const relativePath = path.relative(absDirectoryPath, filePath);

    const isBinary = await isBinaryFile(filePath);

    if (isBinary && skipUploadingBinaryFiles) {
      continue;
    }

    files[relativePath] = isBinary
      ? {
          content: await uploadFileToFileIO(filePath),
          isBinary: true,
        }
      : { content: await fs.promises.readFile(filePath, 'utf8') };
  }

  const packageJSON = JSON.parse(files['package.json'].content);

  const templateName = getTemplate(packageJSON, files);
  const entry = getMainFile(templateName);

  return {
    files,
    entry,
  };
}

async function uploadFileToFileIO(filePath) {
  const form = new FormData();

  form.append('file', fs.createReadStream(filePath));

  const { success, link, message, error } = await fetch('https://file.io', {
    method: 'POST',
    headers: form.getHeaders(),
    body: form,
  }).then((res) => res.json());

  if (!success) {
    throw message || error;
  }

  return link;
}

async function getCodeSandbox(
  sandboxID,
  {
    ignorePaths = DEFAULT_IGNORE_PATHS,
    skipUploadingBinaryFiles = false,
    basePath = process.cwd(),
  } = {}
) {
  if (sandboxID.startsWith('file:')) {
    const directoryPath = sandboxID.slice('file:'.length);

    return getSandboxFromFile(directoryPath, {
      ignorePaths,
      skipUploadingBinaryFiles,
      basePath,
    });
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
    ...data,
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
