import js from '@eslint/js';
import globals from 'globals';
import ts from 'typescript-eslint';

export default ts.config({ ignores: ['.wrangler/'] }, js.configs.recommended, ...ts.configs.recommended, {
  languageOptions: { globals: { ...globals.serviceworker, ...globals.node } },
});
