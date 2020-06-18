const fetch = require('node-fetch');
const fs = require('fs');
const { getCodeSandbox, uploadSandbox } = require('./');

// Some E2E test needs more time
jest.setTimeout(10000);

test('Official sandboxes', async () => {
  const sandbox = await getCodeSandbox('vanilla');

  expect(sandbox).toMatchSnapshot();
});

test('Sandbox ID', async () => {
  const sandbox = await getCodeSandbox('rjk9n4zj7m'); // Static

  expect(sandbox).toMatchSnapshot();
});

test('Github path', async () => {
  const sandbox = await getCodeSandbox(
    'github/codesandbox-app/static-template'
  );

  expect(sandbox).toMatchSnapshot();
});

test('File path', async () => {
  const sandbox = await getCodeSandbox('file:./examples/console');

  expect(sandbox).toMatchSnapshot();
});

test('Upload binary files', async () => {
  const sandbox = await getCodeSandbox('file:./examples/binary');
  const sandboxID = await uploadSandbox(sandbox);

  const received = await fetch(
    `https://${sandboxID}.csb.app/src/cat.png`
  ).then((res) => res.buffer());

  const expected = await fs.promises.readFile('examples/binary/src/cat.png');

  expect(received.equals(expected)).toBe(true);
});
