"""
Anomaly Detection for Cryptocurrency Markets
Detects unusual price movements, whale transactions, and volume spikes
"""

import numpy as np
from typing import Dict, List, Tuple
from scipy import stats
from sklearn.ensemble import IsolationForest
import logging

logger = logging.getLogger(__name__)


class AnomalyDetector:
    """
    Detect market anomalies using statistical and ML methods
    """

    def __init__(
        self,
        contamination: float = 0.05,
        sensitivity: float = 0.95
    ):
        """
        Initialize anomaly detector

        Args:
            contamination: Expected proportion of anomalies
            sensitivity: Detection sensitivity (0-1)
        """
        self.contamination = contamination
        self.sensitivity = sensitivity

        # Initialize Isolation Forest
        self.isolation_forest = IsolationForest(
            contamination=contamination,
            random_state=42
        )

        self.is_fitted = False

    def calculate_price_volatility(
        self,
        prices: np.ndarray,
        window: int = 20
    ) -> np.ndarray:
        """Calculate rolling volatility"""
        returns = np.diff(prices) / prices[:-1]

        volatility = np.zeros(len(prices))
        for i in range(window, len(prices)):
            volatility[i] = np.std(returns[i-window:i])

        return volatility

    def detect_price_anomalies(
        self,
        prices: np.ndarray,
        threshold: float = 3.0
    ) -> Dict[str, any]:
        """
        Detect unusual price movements using statistical methods

        Args:
            prices: Price data
            threshold: Z-score threshold for anomaly detection

        Returns:
            Dictionary with anomaly information
        """
        # Calculate returns
        returns = np.diff(prices) / prices[:-1]

        # Calculate z-scores
        mean_return = np.mean(returns)
        std_return = np.std(returns)

        if std_return == 0:
            return {
                'has_anomaly': False,
                'anomalies': [],
                'current_z_score': 0.0
            }

        z_scores = (returns - mean_return) / std_return

        # Detect anomalies
        anomaly_indices = np.where(np.abs(z_scores) > threshold)[0]

        # Current z-score
        current_z_score = z_scores[-1] if len(z_scores) > 0 else 0.0

        # Classify anomalies
        anomalies = []
        for idx in anomaly_indices:
            anomaly_type = 'spike' if z_scores[idx] > 0 else 'drop'
            magnitude = abs(z_scores[idx])

            anomalies.append({
                'index': int(idx),
                'type': anomaly_type,
                'magnitude': float(magnitude),
                'return': float(returns[idx] * 100),
                'price': float(prices[idx + 1])
            })

        # Check if current price is anomalous
        has_current_anomaly = abs(current_z_score) > threshold * self.sensitivity

        return {
            'has_anomaly': has_current_anomaly,
            'current_z_score': float(current_z_score),
            'anomaly_count': len(anomalies),
            'anomalies': anomalies[-5:],  # Last 5 anomalies
            'severity': 'high' if abs(current_z_score) > threshold * 1.5 else 'medium' if abs(current_z_score) > threshold else 'low'
        }

    def detect_volume_anomalies(
        self,
        volumes: np.ndarray,
        threshold: float = 2.5
    ) -> Dict[str, any]:
        """
        Detect unusual volume spikes

        Args:
            volumes: Volume data
            threshold: Z-score threshold

        Returns:
            Dictionary with volume anomaly information
        """
        # Calculate z-scores for volume
        mean_volume = np.mean(volumes)
        std_volume = np.std(volumes)

        if std_volume == 0:
            return {
                'has_spike': False,
                'current_ratio': 1.0
            }

        z_scores = (volumes - mean_volume) / std_volume

        # Current volume analysis
        current_volume = volumes[-1]
        current_z_score = z_scores[-1]
        volume_ratio = current_volume / mean_volume

        # Detect spikes
        spike_indices = np.where(z_scores > threshold)[0]

        spikes = []
        for idx in spike_indices:
            spikes.append({
                'index': int(idx),
                'volume': float(volumes[idx]),
                'ratio': float(volumes[idx] / mean_volume),
                'z_score': float(z_scores[idx])
            })

        has_current_spike = current_z_score > threshold * self.sensitivity

        return {
            'has_spike': has_current_spike,
            'current_ratio': float(volume_ratio),
            'current_z_score': float(current_z_score),
            'spike_count': len(spikes),
            'recent_spikes': spikes[-3:],
            'severity': 'extreme' if volume_ratio > 5 else 'high' if volume_ratio > 3 else 'medium' if volume_ratio > 2 else 'normal'
        }

    def detect_whale_activity(
        self,
        transaction_sizes: np.ndarray,
        whale_threshold: float = 0.95
    ) -> Dict[str, any]:
        """
        Detect large transactions (whale activity)

        Args:
            transaction_sizes: Array of transaction sizes
            whale_threshold: Percentile threshold for whale detection

        Returns:
            Dictionary with whale activity information
        """
        if len(transaction_sizes) == 0:
            return {
                'whale_detected': False,
                'whale_count': 0
            }

        # Calculate threshold for whale transactions
        whale_size = np.percentile(transaction_sizes, whale_threshold * 100)

        # Detect whale transactions
        whale_transactions = transaction_sizes[transaction_sizes > whale_size]

        # Calculate statistics
        total_value = np.sum(transaction_sizes)
        whale_value = np.sum(whale_transactions)
        whale_percentage = (whale_value / total_value * 100) if total_value > 0 else 0

        # Recent whale activity (last 10%)
        recent_window = max(1, len(transaction_sizes) // 10)
        recent_transactions = transaction_sizes[-recent_window:]
        recent_whale_count = np.sum(recent_transactions > whale_size)

        return {
            'whale_detected': recent_whale_count > 0,
            'whale_count': int(len(whale_transactions)),
            'recent_whale_count': int(recent_whale_count),
            'whale_threshold': float(whale_size),
            'whale_percentage': float(whale_percentage),
            'average_whale_size': float(np.mean(whale_transactions)) if len(whale_transactions) > 0 else 0.0,
            'largest_transaction': float(np.max(transaction_sizes)),
            'alert_level': 'critical' if recent_whale_count > 5 else 'high' if recent_whale_count > 2 else 'medium' if recent_whale_count > 0 else 'normal'
        }

    def train_isolation_forest(
        self,
        features: np.ndarray
    ):
        """
        Train Isolation Forest on historical data

        Args:
            features: Feature matrix (n_samples, n_features)
        """
        logger.info("Training Isolation Forest for anomaly detection...")
        self.isolation_forest.fit(features)
        self.is_fitted = True
        logger.info("Isolation Forest training completed")

    def detect_multivariate_anomalies(
        self,
        features: np.ndarray
    ) -> Dict[str, any]:
        """
        Detect anomalies using Isolation Forest

        Args:
            features: Current feature values

        Returns:
            Dictionary with anomaly detection results
        """
        if not self.is_fitted:
            return {
                'is_anomaly': False,
                'anomaly_score': 0.0,
                'message': 'Model not trained'
            }

        # Predict anomaly
        prediction = self.isolation_forest.predict(features.reshape(1, -1))
        anomaly_score = self.isolation_forest.score_samples(features.reshape(1, -1))

        is_anomaly = prediction[0] == -1

        return {
            'is_anomaly': bool(is_anomaly),
            'anomaly_score': float(anomaly_score[0]),
            'confidence': float(1.0 - abs(anomaly_score[0]))
        }

    def comprehensive_analysis(
        self,
        prices: np.ndarray,
        volumes: np.ndarray,
        transaction_sizes: np.ndarray = None
    ) -> Dict[str, any]:
        """
        Run comprehensive anomaly detection analysis

        Args:
            prices: Price data
            volumes: Volume data
            transaction_sizes: Transaction sizes (optional)

        Returns:
            Comprehensive anomaly report
        """
        logger.info("Running comprehensive anomaly detection...")

        # Detect price anomalies
        price_anomalies = self.detect_price_anomalies(prices)

        # Detect volume anomalies
        volume_anomalies = self.detect_volume_anomalies(volumes)

        # Detect whale activity
        whale_activity = {}
        if transaction_sizes is not None and len(transaction_sizes) > 0:
            whale_activity = self.detect_whale_activity(transaction_sizes)

        # Calculate overall risk score
        risk_factors = []

        if price_anomalies['has_anomaly']:
            risk_factors.append(abs(price_anomalies['current_z_score']) / 3.0)

        if volume_anomalies['has_spike']:
            risk_factors.append(min(1.0, volume_anomalies['current_ratio'] / 5.0))

        if whale_activity.get('whale_detected', False):
            risk_factors.append(whale_activity['recent_whale_count'] / 10.0)

        overall_risk = np.mean(risk_factors) if risk_factors else 0.0

        # Determine alert level
        if overall_risk > 0.7:
            alert_level = 'critical'
        elif overall_risk > 0.5:
            alert_level = 'high'
        elif overall_risk > 0.3:
            alert_level = 'medium'
        else:
            alert_level = 'normal'

        # Compile report
        report = {
            'timestamp': 'current',
            'alert_level': alert_level,
            'overall_risk_score': float(overall_risk),
            'price_anomalies': price_anomalies,
            'volume_anomalies': volume_anomalies,
            'whale_activity': whale_activity,
            'recommendations': self._generate_recommendations(
                price_anomalies,
                volume_anomalies,
                whale_activity,
                overall_risk
            )
        }

        logger.info(f"Anomaly detection completed. Alert level: {alert_level}")

        return report

    def _generate_recommendations(
        self,
        price_anomalies: Dict,
        volume_anomalies: Dict,
        whale_activity: Dict,
        risk_score: float
    ) -> List[str]:
        """Generate actionable recommendations based on anomalies"""
        recommendations = []

        if price_anomalies['has_anomaly']:
            if price_anomalies['current_z_score'] > 0:
                recommendations.append("⚠️ Unusual upward price movement detected. Consider taking profits.")
            else:
                recommendations.append("⚠️ Unusual downward price movement detected. Monitor closely for entry points.")

        if volume_anomalies['has_spike']:
            recommendations.append(f"📊 Volume spike detected ({volume_anomalies['current_ratio']:.1f}x average). Significant market interest.")

        if whale_activity.get('whale_detected', False):
            recommendations.append(f"🐋 Whale activity detected ({whale_activity['recent_whale_count']} large transactions). Market may be volatile.")

        if risk_score > 0.7:
            recommendations.append("🚨 CRITICAL: Multiple anomalies detected. Consider reducing position size or exiting.")
        elif risk_score > 0.5:
            recommendations.append("⚡ HIGH RISK: Significant market anomalies. Trade with caution.")
        elif risk_score > 0.3:
            recommendations.append("ℹ️ MEDIUM RISK: Some unusual activity. Monitor position closely.")

        if not recommendations:
            recommendations.append("✅ Market conditions appear normal. No significant anomalies detected.")

        return recommendations
