const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');
const { getCodeSandbox, uploadSandbox } = require('./');

// Some E2E tests need more time
jest.setTimeout(10000);

test('Official sandboxes', async () => {
  const { files, entry } = await getCodeSandbox('vanilla');

  expect({
    files,
    entry,
  }).toMatchSnapshot();
});

test('Sandbox ID', async () => {
  const { files, entry } = await getCodeSandbox('rjk9n4zj7m'); // Static

  expect({
    files,
    entry,
  }).toMatchSnapshot();
});

test('Github path', async () => {
  const { files, entry } = await getCodeSandbox(
    'github/codesandbox-app/static-template'
  );

  expect({
    files,
    entry,
  }).toMatchSnapshot();
});

test('File path', async () => {
  const { files, entry } = await getCodeSandbox('file:./examples/console');

  expect({ files, entry }).toMatchSnapshot();
});

test('File path with base path', async () => {
  const { files, entry } = await getCodeSandbox('file:./console', {
    basePath: path.resolve(__dirname, 'examples'),
  });

  expect({ files, entry }).toMatchSnapshot();
});

test('Upload binary files', async () => {
  const { files } = await getCodeSandbox('file:./examples/binary');
  const sandboxID = await uploadSandbox({ files });

  const received = await fetch(
    `https://${sandboxID}.csb.app/src/cat.png`
  ).then((res) => res.buffer());

  const expected = await fs.promises.readFile('examples/binary/src/cat.png');

  expect(received.equals(expected)).toBe(true);
});
