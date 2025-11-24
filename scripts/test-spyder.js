(async () => {
  try {
    const { createSpyderServer } = require('@funeste38/spyder');
    console.log('createSpyderServer:', typeof createSpyderServer);
    const srv = createSpyderServer({ port: 4501, sendToA11: async () => new Uint8Array() });
    await srv.start();
    console.log('Started SPYDER server on port 4501');
    await srv.stop();
    console.log('Stopped SPYDER server');
  } catch (e) {
    console.error('Error while testing @funeste38/spyder:', e);
    process.exit(1);
  }
})();
