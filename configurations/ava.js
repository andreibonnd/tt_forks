const ignore = (folder) => `!./sources/__tests__/**/${folder}/**/*`;

export default {
    cache: false,
    concurrency: 3,
    // debug: true,
    extensions: ['js'],
    failFast: false,
    failWithoutAssertions: true,
    files: [ignore('__helpers__'), ignore('__fixture__'), ignore('__todo__')],
    serial: false,
    verbose: false,
    timeout: '10s',
};
