/**
 * Interactive Investment Calculator
 * Calculates potential returns based on three scenarios
 * @version 1.0.0
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    MIN_INVESTMENT: 100,
    MAX_INVESTMENT: 100000,
    MULTIPLIERS: {
      conservative: 3.5,
      moderate: 100,
      optimistic: 1000
    },
    DEBOUNCE_DELAY: 50 // ms for slider updates
  };

  // DOM Elements
  let elements = {};

  // State
  let currentInvestment = 1000; // Default value
  let debounceTimer = null;

  /**
   * Initialize the calculator
   */
  function init() {
    // Cache DOM elements
    cacheElements();

    // Verify all required elements exist
    if (!validateElements()) {
      console.error('Calculator: Required DOM elements not found');
      return;
    }

    // Set up event listeners
    attachEventListeners();

    // Initial calculation
    updateCalculator(currentInvestment);

    console.log('Calculator initialized successfully');
  }

  /**
   * Cache DOM elements for better performance
   */
  function cacheElements() {
    elements = {
      slider: document.getElementById('investment-slider'),
      input: document.getElementById('investment-input'),
      calculateBtn: document.getElementById('calculate-btn'),
      conservativeResult: document.getElementById('conservative-result'),
      moderateResult: document.getElementById('moderate-result'),
      optimisticResult: document.getElementById('optimistic-result'),
      errorMessage: document.getElementById('error-message')
    };
  }

  /**
   * Validate that all required DOM elements exist
   * @returns {boolean} True if all elements exist
   */
  function validateElements() {
    return Object.values(elements).every(el => el !== null);
  }

  /**
   * Attach event listeners to interactive elements
   */
  function attachEventListeners() {
    // Slider input - debounced for performance
    elements.slider.addEventListener('input', handleSliderInput);

    // Text input - real-time validation
    elements.input.addEventListener('input', handleTextInput);

    // Calculate button
    elements.calculateBtn.addEventListener('click', handleCalculateClick);

    // Allow Enter key in input field
    elements.input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        handleCalculateClick();
      }
    });
  }

  /**
   * Handle slider input with debouncing
   * @param {Event} event
   */
  function handleSliderInput(event) {
    const value = parseInt(event.target.value, 10);

    // Update input field immediately for responsiveness
    elements.input.value = formatNumberWithCommas(value);

    // Debounce the calculation
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      updateCalculator(value);
    }, CONFIG.DEBOUNCE_DELAY);
  }

  /**
   * Handle text input with validation
   * @param {Event} event
   */
  function handleTextInput(event) {
    // Remove non-numeric characters except commas
    let value = event.target.value.replace(/[^\d,]/g, '');

    // Remove commas for parsing
    const numericValue = parseInt(value.replace(/,/g, ''), 10) || 0;

    // Update slider
    elements.slider.value = numericValue;

    // Validate and update
    if (validateInvestment(numericValue)) {
      updateCalculator(numericValue);
    } else {
      showError();
    }
  }

  /**
   * Handle calculate button click
   */
  function handleCalculateClick() {
    const value = parseInt(elements.slider.value, 10);

    if (validateInvestment(value)) {
      updateCalculator(value, true);

      // Smooth scroll to results
      const resultsSection = document.querySelector('.calculator-results');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } else {
      showError();
    }
  }

  /**
   * Validate investment amount
   * @param {number} value - Investment amount
   * @returns {boolean} True if valid
   */
  function validateInvestment(value) {
    return value >= CONFIG.MIN_INVESTMENT && value <= CONFIG.MAX_INVESTMENT;
  }

  /**
   * Update calculator with new investment value
   * @param {number} investment - Investment amount
   * @param {boolean} animate - Whether to animate the update
   */
  function updateCalculator(investment, animate = false) {
    currentInvestment = investment;

    // Clear any error messages
    hideError();

    // Enable calculate button
    elements.calculateBtn.disabled = false;
    elements.calculateBtn.classList.remove('disabled');

    // Calculate results
    const results = calculateReturns(investment);

    // Update display
    if (animate) {
      animateResults(results);
    } else {
      displayResults(results);
    }
  }

  /**
   * Calculate returns for all scenarios
   * @param {number} investment - Investment amount
   * @returns {Object} Results for each scenario
   */
  function calculateReturns(investment) {
    return {
      conservative: investment * CONFIG.MULTIPLIERS.conservative,
      moderate: investment * CONFIG.MULTIPLIERS.moderate,
      optimistic: investment * CONFIG.MULTIPLIERS.optimistic
    };
  }

  /**
   * Display results without animation
   * @param {Object} results - Calculated results
   */
  function displayResults(results) {
    elements.conservativeResult.textContent = formatCurrency(results.conservative);
    elements.moderateResult.textContent = formatCurrency(results.moderate);
    elements.optimisticResult.textContent = formatCurrency(results.optimistic);
  }

  /**
   * Display results with smooth animation
   * @param {Object} results - Calculated results
   */
  function animateResults(results) {
    const duration = 1000; // Animation duration in ms
    const steps = 60; // Number of animation steps
    const interval = duration / steps;

    // Get current values
    const current = {
      conservative: parseFloat(elements.conservativeResult.textContent.replace(/[$,]/g, '')) || 0,
      moderate: parseFloat(elements.moderateResult.textContent.replace(/[$,]/g, '')) || 0,
      optimistic: parseFloat(elements.optimisticResult.textContent.replace(/[$,]/g, '')) || 0
    };

    // Calculate increments
    const increments = {
      conservative: (results.conservative - current.conservative) / steps,
      moderate: (results.moderate - current.moderate) / steps,
      optimistic: (results.optimistic - current.optimistic) / steps
    };

    let step = 0;

    const timer = setInterval(() => {
      step++;

      // Update each result
      Object.keys(results).forEach(scenario => {
        const newValue = current[scenario] + (increments[scenario] * step);
        const element = elements[`${scenario}Result`];
        element.textContent = formatCurrency(newValue);

        // Add pulse animation class
        element.classList.add('updating');
      });

      // Complete animation
      if (step >= steps) {
        clearInterval(timer);

        // Set final values
        displayResults(results);

        // Remove animation classes
        setTimeout(() => {
          Object.keys(results).forEach(scenario => {
            elements[`${scenario}Result`].classList.remove('updating');
          });
        }, 100);
      }
    }, interval);
  }

  /**
   * Show error message
   */
  function showError() {
    if (elements.errorMessage) {
      elements.errorMessage.textContent = `Please enter an amount between $${formatNumberWithCommas(CONFIG.MIN_INVESTMENT)} and $${formatNumberWithCommas(CONFIG.MAX_INVESTMENT)}`;
      elements.errorMessage.style.display = 'block';
      elements.errorMessage.setAttribute('role', 'alert');
    }

    // Disable calculate button
    elements.calculateBtn.disabled = true;
    elements.calculateBtn.classList.add('disabled');
  }

  /**
   * Hide error message
   */
  function hideError() {
    if (elements.errorMessage) {
      elements.errorMessage.style.display = 'none';
      elements.errorMessage.removeAttribute('role');
    }
  }

  /**
   * Format number with commas (e.g., 1000 -> 1,000)
   * @param {number} num - Number to format
   * @returns {string} Formatted number
   */
  function formatNumberWithCommas(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /**
   * Format number as currency (e.g., 1000 -> $1,000.00)
   * @param {number} num - Number to format
   * @returns {string} Formatted currency
   */
  function formatCurrency(num) {
    return '$' + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /**
   * Public API for external access if needed
   */
  window.InvestmentCalculator = {
    init: init,
    calculate: function(amount) {
      if (validateInvestment(amount)) {
        updateCalculator(amount, true);
        return calculateReturns(amount);
      }
      return null;
    },
    getMultipliers: function() {
      return { ...CONFIG.MULTIPLIERS };
    }
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
