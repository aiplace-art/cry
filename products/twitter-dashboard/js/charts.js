/**
 * HypeAI Twitter Dashboard - Charts Module
 * Built by AI Agents for HypeAI
 *
 * Chart.js configuration and data visualization
 */

// Chart instances
let followerChart = null;
let engagementChart = null;

// Initialize charts when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initFollowerChart();
    initEngagementChart();
    startChartUpdates();
});

/**
 * Follower Growth Chart
 */
function initFollowerChart() {
    const ctx = document.getElementById('followerChart');
    if (!ctx) return;

    // Generate demo data for last 30 days
    const labels = [];
    const data = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

        // Simulate growth curve
        const baseGrowth = 50 + (29 - i) * 8;
        const variance = Math.random() * 20 - 10;
        data.push(Math.max(0, Math.floor(baseGrowth + variance)));
    }

    followerChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Followers',
                data: data,
                borderColor: 'rgb(102, 126, 234)',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: 'rgb(102, 126, 234)',
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 15, 30, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#a0aec0',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return 'Followers: ' + context.parsed.y;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#718096',
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: '#718096',
                        font: {
                            size: 11
                        },
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });

    // Set canvas height
    ctx.style.height = '300px';
}

/**
 * Engagement Metrics Chart
 */
function initEngagementChart() {
    const ctx = document.getElementById('engagementChart');
    if (!ctx) return;

    // Generate demo data for last 7 days
    const labels = [];
    const likesData = [];
    const retweetsData = [];
    const repliesData = [];

    const now = new Date();

    for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));

        // Simulate engagement metrics
        likesData.push(Math.floor(Math.random() * 50) + 100);
        retweetsData.push(Math.floor(Math.random() * 20) + 30);
        repliesData.push(Math.floor(Math.random() * 15) + 20);
    }

    engagementChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Likes',
                    data: likesData,
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: 'rgb(102, 126, 234)',
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false
                },
                {
                    label: 'Retweets',
                    data: retweetsData,
                    backgroundColor: 'rgba(72, 187, 120, 0.8)',
                    borderColor: 'rgb(72, 187, 120)',
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false
                },
                {
                    label: 'Replies',
                    data: repliesData,
                    backgroundColor: 'rgba(66, 153, 225, 0.8)',
                    borderColor: 'rgb(66, 153, 225)',
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#a0aec0',
                        padding: 15,
                        font: {
                            size: 12
                        },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 15, 30, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#a0aec0',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    stacked: false,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#718096',
                        font: {
                            size: 11
                        }
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: '#718096',
                        font: {
                            size: 11
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });

    // Set canvas height
    ctx.style.height = '300px';
}

/**
 * Update charts with real-time data
 */
function startChartUpdates() {
    setInterval(() => {
        updateFollowerChart();
        updateEngagementChart();
    }, 10000); // Update every 10 seconds
}

function updateFollowerChart() {
    if (!followerChart) return;

    // Add new data point
    const lastValue = followerChart.data.datasets[0].data[followerChart.data.datasets[0].data.length - 1];
    const newValue = lastValue + Math.floor(Math.random() * 3);

    followerChart.data.datasets[0].data.push(newValue);
    followerChart.data.labels.push('Now');

    // Keep only last 30 points
    if (followerChart.data.datasets[0].data.length > 30) {
        followerChart.data.datasets[0].data.shift();
        followerChart.data.labels.shift();
    }

    followerChart.update('none'); // Update without animation for smoothness
}

function updateEngagementChart() {
    if (!engagementChart) return;

    // Occasionally update the last bar
    if (Math.random() > 0.7) {
        const lastIndex = engagementChart.data.datasets[0].data.length - 1;
        engagementChart.data.datasets.forEach(dataset => {
            dataset.data[lastIndex] += Math.floor(Math.random() * 3);
        });

        engagementChart.update('none');
    }
}

/**
 * Refresh charts with new data
 */
function refreshCharts() {
    if (followerChart) {
        followerChart.destroy();
        initFollowerChart();
    }
    if (engagementChart) {
        engagementChart.destroy();
        initEngagementChart();
    }
}

// Export for use in other modules
window.refreshCharts = refreshCharts;
