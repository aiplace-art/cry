/* ===================================
   HypeAI Dashboard - Chart.js Visualizations
   Follower Growth, Engagement, Distribution, Performance
   =================================== */

// Chart.js Global Configuration
Chart.defaults.color = '#9ca3af';
Chart.defaults.borderColor = 'rgba(139, 92, 246, 0.2)';
Chart.defaults.font.family = "'Roboto', sans-serif";
Chart.defaults.plugins.legend.display = false;
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(24, 24, 36, 0.95)';
Chart.defaults.plugins.tooltip.borderColor = 'rgba(139, 92, 246, 0.5)';
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.tooltip.padding = 12;
Chart.defaults.plugins.tooltip.cornerRadius = 8;
Chart.defaults.plugins.tooltip.titleColor = '#f9fafb';
Chart.defaults.plugins.tooltip.bodyColor = '#e5e7eb';

// Generate sample data
function generateTimeSeriesData(days, baseValue, variance) {
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const value = baseValue + (Math.random() - 0.5) * variance + (days - i) * (variance / days);
        data.push({
            x: date.toISOString().split('T')[0],
            y: Math.max(0, value),
        });
    }

    return data;
}

// Follower Growth Chart
function initFollowerChart() {
    const ctx = document.getElementById('followerChart');
    if (!ctx) return;

    const data = generateTimeSeriesData(30, 80, 20);

    new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Followers',
                data: data,
                borderColor: '#00d4ff',
                backgroundColor: 'rgba(0, 212, 255, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#00d4ff',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index',
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'MMM d',
                        },
                    },
                    grid: {
                        display: false,
                    },
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(139, 92, 246, 0.1)',
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(0);
                        },
                    },
                },
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Followers: ${context.parsed.y.toFixed(0)}`;
                        },
                    },
                },
            },
        },
    });
}

// Engagement Rate Chart
function initEngagementChart() {
    const ctx = document.getElementById('engagementChart');
    if (!ctx) return;

    const data = generateTimeSeriesData(30, 3.5, 1.5);

    new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Engagement Rate',
                data: data,
                borderColor: '#8e32e9',
                backgroundColor: 'rgba(142, 50, 233, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#8e32e9',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index',
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'MMM d',
                        },
                    },
                    grid: {
                        display: false,
                    },
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(139, 92, 246, 0.1)',
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(1) + '%';
                        },
                    },
                },
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Engagement: ${context.parsed.y.toFixed(1)}%`;
                        },
                    },
                },
            },
        },
    });
}

// Tweet Distribution Chart (Donut)
function initTweetChart() {
    const ctx = document.getElementById('tweetChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Published', 'Scheduled', 'Draft', 'Review'],
            datasets: [{
                data: [23, 32, 15, 8],
                backgroundColor: [
                    '#00ff88',
                    '#00d4ff',
                    '#8e32e9',
                    '#ffde73',
                ],
                borderColor: 'rgba(24, 24, 36, 0.8)',
                borderWidth: 2,
                hoverOffset: 8,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: '#e5e7eb',
                        padding: 15,
                        font: {
                            size: 12,
                        },
                        usePointStyle: true,
                        pointStyle: 'circle',
                    },
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        },
                    },
                },
            },
        },
    });
}

// System Performance Chart (Bar)
function initPerformanceChart() {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Content', 'Analytics', 'Scheduler', 'Marketing', 'Moderator'],
            datasets: [{
                label: 'Performance Score',
                data: [94, 100, 85, 88, 96],
                backgroundColor: [
                    'rgba(0, 212, 255, 0.8)',
                    'rgba(142, 50, 233, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(0, 255, 136, 0.8)',
                ],
                borderColor: [
                    '#00d4ff',
                    '#8e32e9',
                    '#f59e0b',
                    '#ec4899',
                    '#00ff88',
                ],
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: {
                        display: false,
                    },
                },
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(139, 92, 246, 0.1)',
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        },
                    },
                },
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Performance: ${context.parsed.y}%`;
                        },
                    },
                },
            },
        },
    });
}

// Initialize all charts
function initCharts() {
    console.log('📊 Initializing charts...');

    try {
        initFollowerChart();
        initEngagementChart();
        initTweetChart();
        initPerformanceChart();
        console.log('✅ All charts initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing charts:', error);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCharts);
} else {
    initCharts();
}

// Export for use in other modules
window.HypeAICharts = {
    initCharts,
};
