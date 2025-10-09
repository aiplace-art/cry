"""
Sentiment Analysis for Cryptocurrency using FinBERT
Analyzes social media sentiment from Twitter, Reddit, and news
"""

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import numpy as np
from typing import Dict, List
import logging
import re

logger = logging.getLogger(__name__)


class CryptoSentimentAnalyzer:
    """
    Financial sentiment analysis specialized for cryptocurrency
    """

    def __init__(self, model_name: str = "ProsusAI/finbert", device: str = 'cpu'):
        """
        Initialize sentiment analyzer with FinBERT

        Args:
            model_name: HuggingFace model name
            device: Device to run model on ('cpu' or 'cuda')
        """
        self.device = torch.device(device)

        logger.info(f"Loading sentiment model: {model_name}")
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_name).to(self.device)
        self.model.eval()

        # Sentiment labels: [positive, negative, neutral]
        self.label_mapping = {0: 'positive', 1: 'negative', 2: 'neutral'}

        # Crypto-specific keywords for context boosting
        self.bullish_keywords = [
            'moon', 'bullish', 'pump', 'rally', 'breakthrough', 'adoption',
            'partnership', 'upgrade', 'launch', 'green', 'profit', 'gains'
        ]

        self.bearish_keywords = [
            'crash', 'dump', 'bearish', 'sell', 'scam', 'hack', 'regulation',
            'ban', 'fear', 'loss', 'red', 'decline', 'warning'
        ]

    def preprocess_text(self, text: str) -> str:
        """
        Clean and preprocess text for sentiment analysis

        Args:
            text: Raw text input

        Returns:
            Cleaned text
        """
        # Remove URLs
        text = re.sub(r'http\S+|www.\S+', '', text)

        # Remove mentions and hashtags (but keep the words)
        text = re.sub(r'@\w+', '', text)
        text = re.sub(r'#', '', text)

        # Remove special characters but keep basic punctuation
        text = re.sub(r'[^\w\s.,!?]', '', text)

        # Remove extra whitespace
        text = ' '.join(text.split())

        return text.strip()

    def analyze_sentiment(self, text: str) -> Dict[str, float]:
        """
        Analyze sentiment of a single text

        Args:
            text: Text to analyze

        Returns:
            Dictionary with sentiment scores
        """
        # Preprocess
        cleaned_text = self.preprocess_text(text)

        if not cleaned_text:
            return {
                'sentiment': 'neutral',
                'confidence': 0.33,
                'scores': {'positive': 0.33, 'negative': 0.33, 'neutral': 0.34}
            }

        # Tokenize
        inputs = self.tokenizer(
            cleaned_text,
            return_tensors='pt',
            truncation=True,
            max_length=512,
            padding=True
        ).to(self.device)

        # Get prediction
        with torch.no_grad():
            outputs = self.model(**inputs)
            probabilities = torch.softmax(outputs.logits, dim=1)[0]

        # Convert to dict
        scores = {
            'positive': float(probabilities[0]),
            'negative': float(probabilities[1]),
            'neutral': float(probabilities[2])
        }

        # Get dominant sentiment
        sentiment = max(scores, key=scores.get)
        confidence = scores[sentiment]

        # Apply crypto-specific keyword boosting
        text_lower = cleaned_text.lower()
        boost_factor = 0.0

        for keyword in self.bullish_keywords:
            if keyword in text_lower:
                boost_factor += 0.05

        for keyword in self.bearish_keywords:
            if keyword in text_lower:
                boost_factor -= 0.05

        # Adjust scores with boost
        if boost_factor > 0:
            scores['positive'] = min(1.0, scores['positive'] + boost_factor)
            scores['negative'] = max(0.0, scores['negative'] - boost_factor/2)
        elif boost_factor < 0:
            scores['negative'] = min(1.0, scores['negative'] - boost_factor)
            scores['positive'] = max(0.0, scores['positive'] + boost_factor/2)

        # Renormalize
        total = sum(scores.values())
        scores = {k: v/total for k, v in scores.items()}

        # Recalculate sentiment after boosting
        sentiment = max(scores, key=scores.get)
        confidence = scores[sentiment]

        return {
            'sentiment': sentiment,
            'confidence': confidence,
            'scores': scores,
            'text_length': len(cleaned_text)
        }

    def analyze_batch(self, texts: List[str], batch_size: int = 16) -> List[Dict[str, float]]:
        """
        Analyze sentiment for multiple texts

        Args:
            texts: List of texts to analyze
            batch_size: Number of texts to process at once

        Returns:
            List of sentiment results
        """
        results = []

        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            batch_results = [self.analyze_sentiment(text) for text in batch]
            results.extend(batch_results)

        return results

    def aggregate_sentiment(
        self,
        sentiments: List[Dict[str, float]],
        weights: List[float] = None
    ) -> Dict[str, float]:
        """
        Aggregate multiple sentiment analyses into a single score

        Args:
            sentiments: List of sentiment results
            weights: Optional weights for each sentiment (e.g., by follower count)

        Returns:
            Aggregated sentiment scores
        """
        if not sentiments:
            return {
                'overall_sentiment': 'neutral',
                'sentiment_score': 0.0,
                'confidence': 0.33,
                'positive_ratio': 0.33,
                'negative_ratio': 0.33,
                'neutral_ratio': 0.34,
                'sample_size': 0
            }

        if weights is None:
            weights = [1.0] * len(sentiments)

        # Normalize weights
        total_weight = sum(weights)
        weights = [w / total_weight for w in weights]

        # Weighted aggregation
        weighted_scores = {
            'positive': 0.0,
            'negative': 0.0,
            'neutral': 0.0
        }

        for sentiment, weight in zip(sentiments, weights):
            for key in weighted_scores:
                weighted_scores[key] += sentiment['scores'][key] * weight

        # Calculate sentiment score (-1 to +1)
        sentiment_score = weighted_scores['positive'] - weighted_scores['negative']

        # Determine overall sentiment
        overall_sentiment = max(weighted_scores, key=weighted_scores.get)

        # Count ratios
        positive_count = sum(1 for s in sentiments if s['sentiment'] == 'positive')
        negative_count = sum(1 for s in sentiments if s['sentiment'] == 'negative')
        neutral_count = sum(1 for s in sentiments if s['sentiment'] == 'neutral')
        total_count = len(sentiments)

        return {
            'overall_sentiment': overall_sentiment,
            'sentiment_score': sentiment_score,
            'confidence': weighted_scores[overall_sentiment],
            'positive_ratio': positive_count / total_count,
            'negative_ratio': negative_count / total_count,
            'neutral_ratio': neutral_count / total_count,
            'sample_size': total_count,
            'weighted_scores': weighted_scores
        }

    def analyze_social_feed(
        self,
        tweets: List[str] = None,
        reddit_posts: List[str] = None,
        news_headlines: List[str] = None
    ) -> Dict[str, Dict]:
        """
        Analyze sentiment across multiple social media sources

        Args:
            tweets: List of tweets
            reddit_posts: List of Reddit posts
            news_headlines: List of news headlines

        Returns:
            Comprehensive sentiment analysis by source
        """
        results = {}

        if tweets:
            logger.info(f"Analyzing {len(tweets)} tweets...")
            tweet_sentiments = self.analyze_batch(tweets)
            results['twitter'] = self.aggregate_sentiment(tweet_sentiments)

        if reddit_posts:
            logger.info(f"Analyzing {len(reddit_posts)} Reddit posts...")
            reddit_sentiments = self.analyze_batch(reddit_posts)
            results['reddit'] = self.aggregate_sentiment(reddit_sentiments)

        if news_headlines:
            logger.info(f"Analyzing {len(news_headlines)} news headlines...")
            # News headlines get higher weight
            news_sentiments = self.analyze_batch(news_headlines)
            news_weights = [2.0] * len(news_sentiments)
            results['news'] = self.aggregate_sentiment(news_sentiments, news_weights)

        # Overall aggregated sentiment
        all_sentiments = []
        all_weights = []

        if 'twitter' in results:
            all_sentiments.append(results['twitter'])
            all_weights.append(results['twitter']['sample_size'])

        if 'reddit' in results:
            all_sentiments.append(results['reddit'])
            all_weights.append(results['reddit']['sample_size'] * 1.2)  # Slightly higher weight

        if 'news' in results:
            all_sentiments.append(results['news'])
            all_weights.append(results['news']['sample_size'] * 2.0)  # Highest weight

        if all_sentiments:
            # Aggregate across sources
            total_weight = sum(all_weights)
            overall_score = sum(
                s['sentiment_score'] * w / total_weight
                for s, w in zip(all_sentiments, all_weights)
            )

            results['overall'] = {
                'sentiment_score': overall_score,
                'sentiment': 'positive' if overall_score > 0.15 else 'negative' if overall_score < -0.15 else 'neutral',
                'confidence': sum(s['confidence'] * w / total_weight for s, w in zip(all_sentiments, all_weights)),
                'sources_analyzed': len(all_sentiments)
            }

        return results
