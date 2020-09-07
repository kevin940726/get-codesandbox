# get-codesandbox

Given a CodeSandbox id, GitHub path, or file system path, returns the contents of the sandbox.

## Installation

Yarn:

```sh
yarn add get-codesandbox
```

NPM:

```sh
npm install get-codesandbox
```

## Usage

```js
const { getCodeSandbox } = require('get-codesandbox');

const { files, entry } = await getCodeSandbox('new'); // Official sandboxes
const { files, entry } = await getCodeSandbox('rjk9n4zj7m'); // Sandbox ID
const { files, entry } = await getCodeSandbox(
  'github/codesandbox-app/static-template'
); // Github path
const { files, entry } = await getCodeSandbox('file:./examples/console'); // File path

console.log(files, entry);
```

You can choose which files to be ignored when using _file path_ with the `ignorePaths` options. **Note that providing this option will override the [default paths](./ignore-paths.js).**

```js
const { files } = await getCodeSandbox('file:./examples/console', {
  ignorePaths: ['node_modules'],
});
```

There's also an utility function `uploadSandbox` to upload the `files` of the sandbox to CodeSandbox.io and get the sandbox ID.

```js
const { getCodeSandbox, uploadSandbox } = require('get-codesandbox');

const { files } = await getCodeSandbox('file:./examples/console');

const sandboxID = await uploadSandbox(files);
```
