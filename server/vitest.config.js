import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';

const testEnv = dotenv.config({
    path: '.env.test',
    override: true,
    quiet: true,
}).parsed;

export default defineConfig({
    test: {
        env: testEnv,
        fileParallelism: false,
        globalSetup: './tests/global-setup.js',
        setupFiles: ['./tests/setup.js'],
    },
});