/**
 * AI Assistant Component Stories
 * Visual regression testing with Storybook
 */

export default {
  title: 'Components/AI Assistant',
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    open: { control: 'boolean' },
    theme: {
      control: 'select',
      options: ['light', 'dark'],
    },
  },
};

const createWidget = ({ open = true, theme = 'dark' }) => {
  const widget = document.createElement('div');
  widget.id = 'ai-assistant-widget';
  widget.className = `ai-widget ${theme}-theme ${open ? 'open' : 'closed'}`;
  widget.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 400px;
    height: 600px;
    background: ${theme === 'dark' ? '#1a1a2e' : '#ffffff'};
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    display: ${open ? 'flex' : 'none'};
    flex-direction: column;
    overflow: hidden;
  `;

  // Header
  const header = document.createElement('div');
  header.className = 'ai-header';
  header.style.cssText = `
    padding: 16px;
    background: linear-gradient(135deg, #00E5FF, #0077FF);
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;
  header.innerHTML = `
    <h3 style="margin: 0; font-size: 18px;">HYPEAI Assistant</h3>
    <button style="background: none; border: none; color: white; font-size: 24px; cursor: pointer;">×</button>
  `;

  // Messages container
  const messages = document.createElement('div');
  messages.className = 'ai-messages';
  messages.style.cssText = `
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    color: ${theme === 'dark' ? '#ffffff' : '#000000'};
  `;
  messages.innerHTML = `
    <div style="margin-bottom: 12px; text-align: left;">
      <div style="display: inline-block; padding: 12px; background: rgba(0, 229, 255, 0.1); border-radius: 12px; max-width: 80%;">
        Hello! How can I help you today?
      </div>
    </div>
    <div style="margin-bottom: 12px; text-align: right;">
      <div style="display: inline-block; padding: 12px; background: rgba(0, 119, 255, 0.2); border-radius: 12px; max-width: 80%;">
        Tell me about HYPEAI
      </div>
    </div>
  `;

  // Input container
  const inputContainer = document.createElement('div');
  inputContainer.className = 'ai-input';
  inputContainer.style.cssText = `
    padding: 16px;
    border-top: 1px solid ${theme === 'dark' ? '#333' : '#ddd'};
    display: flex;
    gap: 8px;
  `;
  inputContainer.innerHTML = `
    <textarea
      placeholder="Type your message..."
      style="flex: 1; padding: 12px; border: 1px solid ${theme === 'dark' ? '#333' : '#ddd'}; border-radius: 8px; background: ${theme === 'dark' ? '#2a2a3e' : '#f5f5f5'}; color: ${theme === 'dark' ? '#fff' : '#000'}; resize: none; font-family: inherit;"
      rows="2"
    ></textarea>
    <button style="padding: 12px 20px; background: linear-gradient(135deg, #00E5FF, #0077FF); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">Send</button>
  `;

  widget.appendChild(header);
  widget.appendChild(messages);
  widget.appendChild(inputContainer);

  return widget;
};

export const Default = {
  render: (args) => createWidget(args),
  args: {
    open: true,
    theme: 'dark',
  },
};

export const LightTheme = {
  render: (args) => createWidget(args),
  args: {
    open: true,
    theme: 'light',
  },
};

export const Closed = {
  render: (args) => createWidget(args),
  args: {
    open: false,
    theme: 'dark',
  },
};

export const WithLongConversation = {
  render: () => {
    const widget = createWidget({ open: true, theme: 'dark' });
    const messages = widget.querySelector('.ai-messages');

    messages.innerHTML = Array.from({ length: 10 }, (_, i) => `
      <div style="margin-bottom: 12px; text-align: ${i % 2 === 0 ? 'left' : 'right'};">
        <div style="display: inline-block; padding: 12px; background: rgba(0, ${i % 2 === 0 ? '229' : '119'}, 255, 0.${i % 2 === 0 ? '1' : '2'}); border-radius: 12px; max-width: 80%;">
          Message ${i + 1}: This is a test message
        </div>
      </div>
    `).join('');

    return widget;
  },
};

export const Mobile = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  render: () => {
    const widget = createWidget({ open: true, theme: 'dark' });
    widget.style.width = '100%';
    widget.style.height = '100vh';
    widget.style.bottom = '0';
    widget.style.right = '0';
    widget.style.borderRadius = '0';
    return widget;
  },
};
