import { terser } from 'rollup-plugin-terser'
import babel from 'rollup-plugin-babel'
import pkg from './package.json'

export default {
    input: 'src/index.js',
    output: [
        {
            file: pkg.module,
            format: 'es',
        },
        {
            file: pkg.main,
            format: 'cjs',
        },
        {
            file: pkg.browser,
            name: 'VueXApiUtil',
            format: 'umd',
            globals: {
                vue: 'Vue',
            },
        },
        {
            file: pkg.browser_min,
            name: 'VueXApiUtil',
            format: 'umd',
            globals: {
                vue: 'Vue',
            },
            plugins: [terser()],
        },
    ],
    external: [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
    ],
    plugins: [babel()],
}
