/** @type { import('@storybook/html').StorybookConfig } */
const config = {
  stories: ['../stories/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/html',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
};

export default config;
