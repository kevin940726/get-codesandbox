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

const { files } = await getCodeSandbox('new'); // Official sandboxes
const { files } = await getCodeSandbox('rjk9n4zj7m'); // Sandbox ID
const { files } = await getCodeSandbox(
  'github/codesandbox-app/static-template'
); // Github path
const { files } = await getCodeSandbox('file:./examples/console'); // File path

console.log(files);
```

There's also an utility function `uploadSandbox` to upload the contents of the sandbox to CodeSandbox.io and get the sandbox ID.

```js
const { getCodeSandbox, uploadSandbox } = require('get-codesandbox');

const sandbox = await getCodeSandbox('file:./examples/console');

const sandboxID = await uploadSandbox(sandbox);
```
