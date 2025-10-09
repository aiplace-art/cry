"""
Trading Signals Generator using Technical Analysis
Generates buy/sell/hold signals with confidence scores
"""

import numpy as np
from typing import Dict, List, Tuple
import logging
from enum import Enum

logger = logging.getLogger(__name__)


class SignalType(Enum):
    """Signal types"""
    STRONG_BUY = "strong_buy"
    BUY = "buy"
    HOLD = "hold"
    SELL = "sell"
    STRONG_SELL = "strong_sell"


class TradingSignalsGenerator:
    """
    Generate trading signals based on technical indicators
    """

    def __init__(self):
        self.indicators = {}

    def calculate_sma(self, prices: np.ndarray, period: int) -> np.ndarray:
        """Calculate Simple Moving Average"""
        return np.convolve(prices, np.ones(period)/period, mode='valid')

    def calculate_ema(self, prices: np.ndarray, period: int) -> np.ndarray:
        """Calculate Exponential Moving Average"""
        multiplier = 2 / (period + 1)
        ema = np.zeros_like(prices)
        ema[0] = prices[0]

        for i in range(1, len(prices)):
            ema[i] = (prices[i] * multiplier) + (ema[i-1] * (1 - multiplier))

        return ema

    def calculate_rsi(self, prices: np.ndarray, period: int = 14) -> np.ndarray:
        """
        Calculate Relative Strength Index

        Returns:
            RSI values (0-100)
        """
        deltas = np.diff(prices)
        gain = np.where(deltas > 0, deltas, 0)
        loss = np.where(deltas < 0, -deltas, 0)

        # Calculate average gain and loss
        avg_gain = np.zeros(len(prices))
        avg_loss = np.zeros(len(prices))

        # First average
        avg_gain[period] = np.mean(gain[:period])
        avg_loss[period] = np.mean(loss[:period])

        # Smoothed averages
        for i in range(period + 1, len(prices)):
            avg_gain[i] = (avg_gain[i-1] * (period - 1) + gain[i-1]) / period
            avg_loss[i] = (avg_loss[i-1] * (period - 1) + loss[i-1]) / period

        # Calculate RS and RSI
        rs = np.where(avg_loss != 0, avg_gain / avg_loss, 0)
        rsi = 100 - (100 / (1 + rs))

        return rsi

    def calculate_macd(
        self,
        prices: np.ndarray,
        fast_period: int = 12,
        slow_period: int = 26,
        signal_period: int = 9
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        Calculate MACD, Signal line, and Histogram

        Returns:
            macd, signal, histogram
        """
        ema_fast = self.calculate_ema(prices, fast_period)
        ema_slow = self.calculate_ema(prices, slow_period)

        macd = ema_fast - ema_slow
        signal = self.calculate_ema(macd, signal_period)
        histogram = macd - signal

        return macd, signal, histogram

    def calculate_bollinger_bands(
        self,
        prices: np.ndarray,
        period: int = 20,
        std_dev: float = 2.0
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        Calculate Bollinger Bands

        Returns:
            upper_band, middle_band (SMA), lower_band
        """
        middle_band = self.calculate_sma(prices, period)

        # Pad to match price length
        if len(middle_band) < len(prices):
            padding = np.full(len(prices) - len(middle_band), middle_band[0])
            middle_band = np.concatenate([padding, middle_band])

        # Calculate standard deviation
        std = np.array([
            np.std(prices[max(0, i-period):i+1]) if i >= period
            else np.std(prices[:i+1])
            for i in range(len(prices))
        ])

        upper_band = middle_band + (std_dev * std)
        lower_band = middle_band - (std_dev * std)

        return upper_band, middle_band, lower_band

    def calculate_stochastic(
        self,
        high: np.ndarray,
        low: np.ndarray,
        close: np.ndarray,
        period: int = 14
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Calculate Stochastic Oscillator

        Returns:
            %K, %D
        """
        k_values = np.zeros(len(close))

        for i in range(period - 1, len(close)):
            highest_high = np.max(high[i - period + 1:i + 1])
            lowest_low = np.min(low[i - period + 1:i + 1])

            if highest_high - lowest_low != 0:
                k_values[i] = 100 * (close[i] - lowest_low) / (highest_high - lowest_low)
            else:
                k_values[i] = 50

        # %D is 3-period SMA of %K
        d_values = self.calculate_ema(k_values, 3)

        return k_values, d_values

    def analyze_indicators(
        self,
        prices: np.ndarray,
        high: np.ndarray = None,
        low: np.ndarray = None,
        volume: np.ndarray = None
    ) -> Dict[str, any]:
        """
        Calculate all technical indicators

        Args:
            prices: Close prices
            high: High prices (optional)
            low: Low prices (optional)
            volume: Volume data (optional)

        Returns:
            Dictionary of indicators
        """
        if high is None:
            high = prices
        if low is None:
            low = prices

        # Calculate indicators
        sma_20 = self.calculate_sma(prices, 20)
        sma_50 = self.calculate_sma(prices, 50)
        ema_12 = self.calculate_ema(prices, 12)
        rsi = self.calculate_rsi(prices)
        macd, signal, histogram = self.calculate_macd(prices)
        upper_bb, middle_bb, lower_bb = self.calculate_bollinger_bands(prices)
        stoch_k, stoch_d = self.calculate_stochastic(high, low, prices)

        # Current values
        current_price = prices[-1]
        current_rsi = rsi[-1]
        current_macd = macd[-1]
        current_signal = signal[-1]
        current_stoch_k = stoch_k[-1]

        # Store indicators
        self.indicators = {
            'price': current_price,
            'sma_20': sma_20[-1] if len(sma_20) > 0 else current_price,
            'sma_50': sma_50[-1] if len(sma_50) > 0 else current_price,
            'ema_12': ema_12[-1],
            'rsi': current_rsi,
            'macd': current_macd,
            'macd_signal': current_signal,
            'macd_histogram': histogram[-1],
            'bb_upper': upper_bb[-1],
            'bb_middle': middle_bb[-1],
            'bb_lower': lower_bb[-1],
            'stoch_k': current_stoch_k,
            'stoch_d': stoch_d[-1],
            'bb_position': (current_price - lower_bb[-1]) / (upper_bb[-1] - lower_bb[-1]) if upper_bb[-1] != lower_bb[-1] else 0.5
        }

        if volume is not None:
            volume_sma = self.calculate_sma(volume, 20)
            self.indicators['volume_ratio'] = volume[-1] / volume_sma[-1] if len(volume_sma) > 0 else 1.0

        return self.indicators

    def generate_signals(self, indicators: Dict[str, float] = None) -> Dict[str, any]:
        """
        Generate trading signals based on technical indicators

        Args:
            indicators: Pre-calculated indicators (optional, uses last calculated if None)

        Returns:
            Trading signal with confidence score
        """
        if indicators is None:
            indicators = self.indicators

        if not indicators:
            raise ValueError("No indicators available. Run analyze_indicators first.")

        # Signal scoring system
        signals = []

        # 1. RSI Analysis
        rsi = indicators['rsi']
        if rsi < 30:
            signals.append(('buy', 2.0, 'RSI oversold'))
        elif rsi < 40:
            signals.append(('buy', 1.0, 'RSI approaching oversold'))
        elif rsi > 70:
            signals.append(('sell', 2.0, 'RSI overbought'))
        elif rsi > 60:
            signals.append(('sell', 1.0, 'RSI approaching overbought'))
        else:
            signals.append(('hold', 0.5, 'RSI neutral'))

        # 2. MACD Analysis
        macd = indicators['macd']
        signal = indicators['macd_signal']
        histogram = indicators['macd_histogram']

        if macd > signal and histogram > 0:
            signals.append(('buy', 1.5, 'MACD bullish crossover'))
        elif macd < signal and histogram < 0:
            signals.append(('sell', 1.5, 'MACD bearish crossover'))
        else:
            signals.append(('hold', 0.5, 'MACD neutral'))

        # 3. Bollinger Bands Analysis
        bb_position = indicators['bb_position']

        if bb_position < 0.1:
            signals.append(('buy', 1.5, 'Price near lower Bollinger Band'))
        elif bb_position < 0.3:
            signals.append(('buy', 0.8, 'Price below middle Bollinger Band'))
        elif bb_position > 0.9:
            signals.append(('sell', 1.5, 'Price near upper Bollinger Band'))
        elif bb_position > 0.7:
            signals.append(('sell', 0.8, 'Price above middle Bollinger Band'))
        else:
            signals.append(('hold', 0.5, 'Price in Bollinger Band middle'))

        # 4. Stochastic Analysis
        stoch_k = indicators['stoch_k']

        if stoch_k < 20:
            signals.append(('buy', 1.2, 'Stochastic oversold'))
        elif stoch_k > 80:
            signals.append(('sell', 1.2, 'Stochastic overbought'))
        else:
            signals.append(('hold', 0.3, 'Stochastic neutral'))

        # 5. Moving Average Analysis
        price = indicators['price']
        sma_20 = indicators['sma_20']
        ema_12 = indicators['ema_12']

        if price > sma_20 and ema_12 > sma_20:
            signals.append(('buy', 1.0, 'Price above moving averages'))
        elif price < sma_20 and ema_12 < sma_20:
            signals.append(('sell', 1.0, 'Price below moving averages'))
        else:
            signals.append(('hold', 0.3, 'Mixed moving average signals'))

        # 6. Volume Analysis (if available)
        if 'volume_ratio' in indicators:
            volume_ratio = indicators['volume_ratio']
            if volume_ratio > 1.5:
                # High volume confirms the trend
                signals.append(('confirm', 0.5, 'High volume confirmation'))

        # Calculate final signal
        buy_score = sum(weight for sig, weight, _ in signals if sig == 'buy')
        sell_score = sum(weight for sig, weight, _ in signals if sig == 'sell')
        hold_score = sum(weight for sig, weight, _ in signals if sig == 'hold')

        total_score = buy_score + sell_score + hold_score

        # Determine signal
        if buy_score > sell_score and buy_score > hold_score:
            if buy_score > 6:
                signal_type = SignalType.STRONG_BUY
            else:
                signal_type = SignalType.BUY
        elif sell_score > buy_score and sell_score > hold_score:
            if sell_score > 6:
                signal_type = SignalType.STRONG_SELL
            else:
                signal_type = SignalType.SELL
        else:
            signal_type = SignalType.HOLD

        # Calculate confidence
        max_score = max(buy_score, sell_score, hold_score)
        confidence = min(0.95, max_score / total_score if total_score > 0 else 0.33)

        # Collect reasons
        reasons = [reason for sig, weight, reason in signals if weight > 0.5]

        return {
            'signal': signal_type.value,
            'confidence': confidence,
            'buy_score': buy_score,
            'sell_score': sell_score,
            'hold_score': hold_score,
            'reasons': reasons,
            'indicators': indicators
        }
