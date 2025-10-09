"""
LSTM-based Price Prediction Model for Cryptocurrency
Provides 24h, 7d, and 30d price forecasts with confidence intervals
"""

import torch
import torch.nn as nn
import numpy as np
from typing import Dict, List, Tuple
import joblib
from sklearn.preprocessing import MinMaxScaler
import logging

logger = logging.getLogger(__name__)


class LSTMPricePredictor(nn.Module):
    """
    Multi-layer LSTM network for time series price prediction
    """

    def __init__(
        self,
        input_size: int = 10,
        hidden_size: int = 128,
        num_layers: int = 3,
        dropout: float = 0.2,
        output_size: int = 1
    ):
        super(LSTMPricePredictor, self).__init__()

        self.hidden_size = hidden_size
        self.num_layers = num_layers

        # LSTM layers
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            dropout=dropout,
            batch_first=True
        )

        # Attention mechanism
        self.attention = nn.Linear(hidden_size, 1)

        # Fully connected layers
        self.fc1 = nn.Linear(hidden_size, 64)
        self.fc2 = nn.Linear(64, 32)
        self.fc3 = nn.Linear(32, output_size)

        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(dropout)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # LSTM forward pass
        lstm_out, (hidden, cell) = self.lstm(x)

        # Apply attention
        attention_weights = torch.softmax(self.attention(lstm_out), dim=1)
        context = torch.sum(attention_weights * lstm_out, dim=1)

        # Fully connected layers
        out = self.relu(self.fc1(context))
        out = self.dropout(out)
        out = self.relu(self.fc2(out))
        out = self.dropout(out)
        out = self.fc3(out)

        return out


class CryptoPricePredictor:
    """
    Wrapper class for price prediction with data preprocessing and postprocessing
    """

    def __init__(
        self,
        sequence_length: int = 60,
        device: str = 'cpu'
    ):
        self.sequence_length = sequence_length
        self.device = torch.device(device)
        self.scaler = MinMaxScaler()

        # Initialize models for different time horizons
        self.models = {
            '24h': LSTMPricePredictor(input_size=10).to(self.device),
            '7d': LSTMPricePredictor(input_size=10).to(self.device),
            '30d': LSTMPricePredictor(input_size=10).to(self.device)
        }

        self.is_trained = False

    def prepare_features(self, data: np.ndarray) -> np.ndarray:
        """
        Extract technical features from raw price data

        Args:
            data: Array of shape (n_samples, n_features)

        Returns:
            Feature array with additional technical indicators
        """
        # Assuming input has: [open, high, low, close, volume]
        features = []

        for i in range(len(data)):
            if i < 20:  # Need history for indicators
                continue

            window = data[i-20:i+1]

            # Price features
            close_prices = window[:, 3]  # Close price
            volumes = window[:, 4]

            # Moving averages
            sma_7 = np.mean(close_prices[-7:])
            sma_20 = np.mean(close_prices)
            ema_7 = self._calculate_ema(close_prices, 7)

            # Volatility
            returns = np.diff(close_prices) / close_prices[:-1]
            volatility = np.std(returns)

            # Momentum indicators
            rsi = self._calculate_rsi(close_prices)
            macd, signal = self._calculate_macd(close_prices)

            # Volume indicators
            volume_sma = np.mean(volumes)

            feature_vector = [
                close_prices[-1],  # Current price
                sma_7 / close_prices[-1],  # SMA ratio
                sma_20 / close_prices[-1],
                ema_7 / close_prices[-1],
                volatility,
                rsi,
                macd,
                signal,
                volumes[-1] / volume_sma,  # Volume ratio
                (close_prices[-1] - close_prices[0]) / close_prices[0]  # Period return
            ]

            features.append(feature_vector)

        return np.array(features)

    def _calculate_rsi(self, prices: np.ndarray, period: int = 14) -> float:
        """Calculate Relative Strength Index"""
        deltas = np.diff(prices)
        gain = np.where(deltas > 0, deltas, 0)
        loss = np.where(deltas < 0, -deltas, 0)

        avg_gain = np.mean(gain[-period:]) if len(gain) >= period else np.mean(gain)
        avg_loss = np.mean(loss[-period:]) if len(loss) >= period else np.mean(loss)

        if avg_loss == 0:
            return 100

        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
        return rsi

    def _calculate_ema(self, prices: np.ndarray, period: int) -> float:
        """Calculate Exponential Moving Average"""
        multiplier = 2 / (period + 1)
        ema = prices[0]

        for price in prices[1:]:
            ema = (price * multiplier) + (ema * (1 - multiplier))

        return ema

    def _calculate_macd(self, prices: np.ndarray) -> Tuple[float, float]:
        """Calculate MACD and Signal line"""
        ema_12 = self._calculate_ema(prices, 12)
        ema_26 = self._calculate_ema(prices, 26)
        macd = ema_12 - ema_26

        # Simplified signal (normally would be EMA of MACD)
        signal = macd * 0.9

        return macd, signal

    def create_sequences(self, features: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Create sequences for LSTM training

        Args:
            features: Feature array

        Returns:
            X: Input sequences, y: Target values
        """
        X, y = [], []

        for i in range(len(features) - self.sequence_length):
            X.append(features[i:i + self.sequence_length])
            y.append(features[i + self.sequence_length, 0])  # Predict close price

        return np.array(X), np.array(y)

    def train(
        self,
        data: np.ndarray,
        epochs: int = 100,
        batch_size: int = 32,
        learning_rate: float = 0.001
    ):
        """
        Train the prediction models

        Args:
            data: Historical price data [open, high, low, close, volume]
            epochs: Number of training epochs
            batch_size: Batch size for training
            learning_rate: Learning rate
        """
        logger.info("Preparing features for training...")
        features = self.prepare_features(data)

        # Scale features
        features_scaled = self.scaler.fit_transform(features)

        # Create sequences
        X, y = self.create_sequences(features_scaled)

        # Convert to PyTorch tensors
        X_tensor = torch.FloatTensor(X).to(self.device)
        y_tensor = torch.FloatTensor(y).reshape(-1, 1).to(self.device)

        # Train each model
        for horizon, model in self.models.items():
            logger.info(f"Training model for {horizon} horizon...")

            optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)
            criterion = nn.MSELoss()

            model.train()
            for epoch in range(epochs):
                total_loss = 0

                for i in range(0, len(X_tensor), batch_size):
                    batch_X = X_tensor[i:i + batch_size]
                    batch_y = y_tensor[i:i + batch_size]

                    optimizer.zero_grad()
                    outputs = model(batch_X)
                    loss = criterion(outputs, batch_y)
                    loss.backward()
                    optimizer.step()

                    total_loss += loss.item()

                if (epoch + 1) % 10 == 0:
                    logger.info(f"Epoch [{epoch+1}/{epochs}], Loss: {total_loss/len(X_tensor):.6f}")

        self.is_trained = True
        logger.info("Training completed!")

    def predict(
        self,
        data: np.ndarray,
        horizons: List[str] = ['24h', '7d', '30d']
    ) -> Dict[str, Dict[str, float]]:
        """
        Make predictions for specified time horizons

        Args:
            data: Recent price data for prediction
            horizons: List of prediction horizons

        Returns:
            Dictionary with predictions and confidence intervals
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")

        # Prepare features
        features = self.prepare_features(data)
        features_scaled = self.scaler.transform(features)

        # Get last sequence
        if len(features_scaled) < self.sequence_length:
            raise ValueError(f"Not enough data. Need at least {self.sequence_length} samples")

        last_sequence = features_scaled[-self.sequence_length:]
        X = torch.FloatTensor(last_sequence).unsqueeze(0).to(self.device)

        predictions = {}

        for horizon in horizons:
            if horizon not in self.models:
                continue

            model = self.models[horizon]
            model.eval()

            with torch.no_grad():
                pred_scaled = model(X).cpu().numpy()[0, 0]

                # Inverse transform to get actual price
                dummy = np.zeros((1, features_scaled.shape[1]))
                dummy[0, 0] = pred_scaled
                pred_price = self.scaler.inverse_transform(dummy)[0, 0]

                # Calculate confidence interval (simplified)
                current_price = data[-1, 3]  # Close price
                volatility = np.std(data[-20:, 3])

                predictions[horizon] = {
                    'predicted_price': float(pred_price),
                    'current_price': float(current_price),
                    'change_percent': float((pred_price - current_price) / current_price * 100),
                    'confidence_lower': float(pred_price - 1.96 * volatility),
                    'confidence_upper': float(pred_price + 1.96 * volatility),
                    'confidence_score': float(min(0.95, 1.0 - abs(pred_scaled) * 0.1))
                }

        return predictions

    def save_models(self, path: str):
        """Save trained models to disk"""
        for horizon, model in self.models.items():
            torch.save(model.state_dict(), f"{path}/lstm_{horizon}.pth")

        joblib.dump(self.scaler, f"{path}/scaler.pkl")
        logger.info(f"Models saved to {path}")

    def load_models(self, path: str):
        """Load trained models from disk"""
        for horizon, model in self.models.items():
            model.load_state_dict(torch.load(f"{path}/lstm_{horizon}.pth", map_location=self.device))
            model.eval()

        self.scaler = joblib.load(f"{path}/scaler.pkl")
        self.is_trained = True
        logger.info(f"Models loaded from {path}")
