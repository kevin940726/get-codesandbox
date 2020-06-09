const { getCodeSandbox } = require('./');

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
