'use strict';

module.exports = {
  env:  {
    es6: true,
  },
  rules: {

    'no-unexpected-multiline': 'error',
    'no-new-wrappers': 'error',
    'no-redeclare': 'error',
    strict: ['error','global'],
    'comma-dangle': ['error','always-multiline'],
    indent: ['error', 2],
    // 'padded-blocks': ['error','never'],
    semi: 'error',
    'spaced-comment': ['error', 'always'],
    // 'multiline-comment-style': ['error', 'starred-block'],
    'space-before-blocks': 'error',
    'brace-style': 'error',
  },
};
