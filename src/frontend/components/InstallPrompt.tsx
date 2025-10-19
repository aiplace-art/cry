import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share } from 'lucide-react';
import { canInstall, showInstallPrompt, isIOS, isStandalone } from '../utils/pwa';

/**
 * Install prompt component for PWA
 * Shows a banner prompting users to install the app
 */
export function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [iosInstructions, setIosInstructions] = useState(false);

  useEffect(() => {
    // Don't show if already installed
    if (isStandalone()) {
      return;
    }

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem('install-prompt-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return; // Don't show for 7 days after dismissal
      }
    }

    // Show prompt after 30 seconds
    const timer = setTimeout(() => {
      if (isIOS()) {
        setShow(true);
      } else if (canInstall()) {
        setShow(true);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  const handleInstall = async () => {
    if (isIOS()) {
      setIosInstructions(true);
    } else {
      const installed = await showInstallPrompt();
      if (installed) {
        setShow(false);
      }
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('install-prompt-dismissed', Date.now().toString());
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
      >
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border-2 border-primary-600">
          {iosInstructions ? (
            <IOSInstructions onClose={() => setIosInstructions(false)} />
          ) : (
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center">
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Install HYPE App
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Quick access & offline support
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDismiss}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors touch-manipulation no-tap-highlight"
                  style={{ minWidth: '44px', minHeight: '44px' }}
                  aria-label="Dismiss"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleInstall}
                  className="w-full py-3 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold rounded-xl transition-all touch-manipulation no-tap-highlight"
                  style={{ minHeight: '48px' }}
                >
                  Install Now
                </button>

                <button
                  onClick={handleDismiss}
                  className="w-full py-3 text-gray-600 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-white transition-colors touch-manipulation no-tap-highlight"
                  style={{ minHeight: '48px' }}
                >
                  Maybe Later
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function IOSInstructions({ onClose }: { onClose: () => void }) {
  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-bold text-gray-900 dark:text-white text-lg">
          Install on iOS
        </h3>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-primary-600 dark:text-primary-400 font-bold">1</span>
          </div>
          <div>
            <p className="text-gray-900 dark:text-white font-medium">
              Tap the Share button
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Look for <Share className="w-4 h-4 inline" /> in Safari's toolbar
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-primary-600 dark:text-primary-400 font-bold">2</span>
          </div>
          <div>
            <p className="text-gray-900 dark:text-white font-medium">
              Add to Home Screen
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Scroll down and tap "Add to Home Screen"
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-primary-600 dark:text-primary-400 font-bold">3</span>
          </div>
          <div>
            <p className="text-gray-900 dark:text-white font-medium">
              Confirm
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tap "Add" in the top right corner
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full mt-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        Got it!
      </button>
    </div>
  );
}
