import ava from './configurations/ava.js';

export default {
    ...ava,
    files: [...ava.files, './sources/__tests__/integration/**/*'],
};
