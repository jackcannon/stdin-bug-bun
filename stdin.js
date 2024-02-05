import util from 'util';

const IS_DEBUG = false;

const IGNORE_PAUSE = process.argv.includes('--ignore-pause');

const _LOG_DEBUG = (prefix = '') => {
  if (!IS_DEBUG) return;
  console.log(
    prefix,
    util.inspect(
      {
        isRaw: process.stdin.isRaw,
        isPaused: process.stdin.isPaused(),
        encoding: process.stdin.readableEncoding
      },
      { compact: true, colors: true }
    )
  );
};

const basicPrompt = (questionText) =>
  new Promise((resolve) => {
    let result = '';
    let wasOriginalPaused = process.stdin.isPaused();

    const listenFn = (key) => {
      if (key === '\r') {
        return stop();
      }
      result += key;
      process.stdout.write(key);
    };

    const start = () => {
      _LOG_DEBUG('BEFORE - start');

      wasOriginalPaused = process.stdin.isPaused();
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.on('data', listenFn);
      process.stdin.setEncoding('utf8');

      _LOG_DEBUG('AFTER  - start');
    };

    const stop = () => {
      _LOG_DEBUG('\nBEFORE - stop ');

      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdin.off('data', listenFn);
      resolve(result);

      _LOG_DEBUG('AFTER  - stop ');
      console.log();
    };

    start();
    process.stdout.write('\u001b[95m' + questionText + ' › \u001b[39m');
  });

const QUESTION_1 = async () => {
  return await basicPrompt('What is your name - a?');
};

const QUESTION_2 = async () => {
  return await basicPrompt('What is your name - b?');
};

const run = async () => {
  // Exit the process if it takes too long (e.g. it hangs on a prompt)
  const timeout = setTimeout(() => {
    console.log('\n\nTIMEOUT - exiting...');
    process.exit();
  }, 7.5 * 1000);

  const data = {};

  data.a = await QUESTION_1();

  if (IGNORE_PAUSE) {
    console.log('Skipping pause...');
  } else {
    console.log('Pausing for 1 second...');
    await new Promise((resolve) => setTimeout(resolve, 1 * 1000));
  }

  data.b = await QUESTION_2();

  console.log('\nRESULT:', data);
  clearTimeout(timeout);
};
run();
