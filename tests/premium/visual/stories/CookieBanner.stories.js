/**
 * Cookie Consent Banner Stories
 * Visual regression testing for GDPR compliance
 */

export default {
  title: 'Components/Cookie Banner',
  parameters: {
    layout: 'fullscreen',
  },
};

const createBanner = ({ position = 'bottom' }) => {
  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.style.cssText = `
    position: fixed;
    ${position}: 0;
    left: 0;
    right: 0;
    background: rgba(26, 26, 46, 0.98);
    backdrop-filter: blur(10px);
    padding: 24px;
    color: white;
    z-index: 10000;
    border-${position === 'bottom' ? 'top' : 'bottom'}: 2px solid rgba(0, 229, 255, 0.3);
  `;

  banner.innerHTML = `
    <div style="max-width: 1200px; margin: 0 auto; display: flex; gap: 24px; align-items: center; flex-wrap: wrap;">
      <div style="flex: 1; min-width: 300px;">
        <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #00E5FF;">🍪 Cookie Consent</h3>
        <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.8);">
          We use cookies to enhance your experience, analyze traffic, and personalize content.
          By clicking "Accept All", you consent to our use of cookies.
          <a href="/cookies.html" style="color: #00E5FF; text-decoration: underline;">Learn more</a>
        </p>
      </div>
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <button style="padding: 12px 24px; background: linear-gradient(135deg, #00E5FF, #0077FF); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; white-space: nowrap;">
          Accept All
        </button>
        <button style="padding: 12px 24px; background: transparent; color: white; border: 2px solid rgba(255, 255, 255, 0.3); border-radius: 8px; cursor: pointer; white-space: nowrap;">
          Reject All
        </button>
        <button style="padding: 12px 24px; background: transparent; color: #00E5FF; border: 2px solid #00E5FF; border-radius: 8px; cursor: pointer; white-space: nowrap;">
          Customize
        </button>
      </div>
    </div>
  `;

  return banner;
};

export const BottomBanner = {
  render: () => createBanner({ position: 'bottom' }),
};

export const TopBanner = {
  render: () => createBanner({ position: 'top' }),
};

export const Mobile = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  render: () => {
    const banner = createBanner({ position: 'bottom' });
    banner.querySelector('div').style.flexDirection = 'column';
    banner.querySelector('div').style.textAlign = 'center';
    return banner;
  },
};

export const SettingsModal = {
  render: () => {
    const container = document.createElement('div');

    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      z-index: 9999;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #1a1a2e;
      padding: 32px;
      border-radius: 16px;
      max-width: 600px;
      width: 90%;
      color: white;
      z-index: 10000;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    `;

    modal.innerHTML = `
      <h2 style="margin: 0 0 24px 0; color: #00E5FF;">Cookie Settings</h2>

      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <h3 style="margin: 0; font-size: 16px;">Necessary Cookies</h3>
          <span style="color: rgba(255, 255, 255, 0.5);">Always Active</span>
        </div>
        <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.7);">
          Required for basic site functionality
        </p>
      </div>

      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <h3 style="margin: 0; font-size: 16px;">Analytics Cookies</h3>
          <label style="position: relative; display: inline-block; width: 52px; height: 28px;">
            <input type="checkbox" style="opacity: 0; width: 0; height: 0;">
            <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: #333; border-radius: 28px; transition: 0.3s;"></span>
          </label>
        </div>
        <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.7);">
          Help us improve our services
        </p>
      </div>

      <div style="margin-bottom: 32px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <h3 style="margin: 0; font-size: 16px;">Marketing Cookies</h3>
          <label style="position: relative; display: inline-block; width: 52px; height: 28px;">
            <input type="checkbox" style="opacity: 0; width: 0; height: 0;">
            <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: #333; border-radius: 28px; transition: 0.3s;"></span>
          </label>
        </div>
        <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.7);">
          Personalized advertising
        </p>
      </div>

      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button style="padding: 12px 24px; background: transparent; color: white; border: 2px solid rgba(255, 255, 255, 0.3); border-radius: 8px; cursor: pointer;">
          Cancel
        </button>
        <button style="padding: 12px 24px; background: linear-gradient(135deg, #00E5FF, #0077FF); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
          Save Preferences
        </button>
      </div>
    `;

    container.appendChild(backdrop);
    container.appendChild(modal);

    return container;
  },
};
