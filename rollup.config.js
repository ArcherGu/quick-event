import { version } from './package.json';
import typescript from '@rollup/plugin-typescript';
import dts from "rollup-plugin-dts";
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import * as path from "path";

const banner = `/*!
 * quick-event v${version}
 * https://github.com/ArcherGu/quick-event.git
 * @license MIT
 */`;

const config = [
    {
        input: 'src/index.ts',
        output: [{
            file: 'dist/quick-event.esm.js',
            format: 'es',
            banner
        }, {
            file: 'dist/quick-event.common.js',
            format: 'cjs',
            banner
        }, {
            file: 'dist/quick-event.js',
            format: 'umd',
            name: 'QuickEvent',
            banner
        }],
        plugins: [
            typescript({
                tsconfig: "tsconfig.json",
            }),
            getBabelOutputPlugin({
                configFile: path.resolve(__dirname, 'babel.config.json'),
                allowAllFormats: true
            }),
        ]
    },
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/quick-event.d.ts',
            format: 'es',
            banner
        },
        plugins: [dts()],
    },
];
export default config;
