import { version } from './package.json';
import typescript from '@rollup/plugin-typescript';

const banner = `/*!
 * quick-event v${version}
 * https://github.com/ArcherGu/quick-event.git
 * @license MIT
 */`;

export default {
    input: 'src/index.ts',
    output: [{
        file: 'lib/quick-event.esm.js',
        format: 'es',
        banner
    }, {
        file: 'lib/quick-event.common.js',
        format: 'cjs',
        banner
    }, {
        file: 'lib/quick-event.js',
        format: 'umd',
        name: 'quick-event',
        banner
    }],
    plugins: [typescript({
        tsconfig: "tsconfig.json",
    })]
};
