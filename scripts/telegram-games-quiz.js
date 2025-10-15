/**
 * 🎮 HypeAI Telegram Games & Quiz Module
 *
 * Интерактивные игры и квизы для увеличения engagement в сообществе
 *
 * Возможности:
 * - 🎯 Crypto Quiz (викторина о криптовалютах)
 * - 🎲 Price Prediction Game (угадай цену)
 * - 🏆 Trivia Contest (общие знания)
 * - 💰 Daily Challenges (ежедневные челленджи)
 * - 🎁 Rewards System (система наград)
 *
 * @author HypeAI Team
 * @version 1.0.0
 */

const TelegramBot = require('node-telegram-bot-api');

// ============================================
// КОНФИГУРАЦИЯ ИГР
// ============================================

const GAMES_CONFIG = {
  // Crypto Quiz
  quiz: {
    enabled: true,
    questionsPerRound: 5,
    timePerQuestion: 30, // секунд
    rewardPerCorrect: 10, // HYPE токенов
    rewardForWinner: 100, // HYPE токенов за победу
    cooldown: 3600000, // 1 час между раундами
  },

  // Price Prediction
  prediction: {
    enabled: true,
    duration: 3600000, // 1 час до результата
    rewardPool: 500, // HYPE токенов в пуле
    minParticipants: 5,
    cooldown: 7200000, // 2 часа между играми
  },

  // Daily Challenge
  dailyChallenge: {
    enabled: true,
    resetTime: '00:00', // UTC время сброса
    reward: 50, // HYPE токенов
    types: ['referral', 'engagement', 'trading', 'learning'],
  },

  // Trivia Contest
  trivia: {
    enabled: true,
    categories: ['crypto', 'blockchain', 'defi', 'nft', 'general'],
    difficultyLevels: ['easy', 'medium', 'hard'],
    rewardMultiplier: {
      easy: 1,
      medium: 2,
      hard: 3,
    },
  },
};

// ============================================
// БАЗА ВОПРОСОВ
// ============================================

const QUIZ_QUESTIONS = {
  crypto: [
    {
      question: '📊 Что такое DeFi?',
      options: [
        'Децентрализованные финансы',
        'Цифровой файл',
        'Биржа криптовалют',
        'Новый токен',
      ],
      correctAnswer: 0,
      difficulty: 'easy',
      reward: 10,
    },
    {
      question: '🔐 Что такое смарт-контракт?',
      options: [
        'Юридический договор',
        'Самоисполняющийся код на блокчейне',
        'Тип криптовалюты',
        'Метод шифрования',
      ],
      correctAnswer: 1,
      difficulty: 'medium',
      reward: 20,
    },
    {
      question: '💰 Кто создал Bitcoin?',
      options: [
        'Виталик Бутерин',
        'Сатоши Накамото',
        'Илон Маск',
        'Чанпэн Чжао',
      ],
      correctAnswer: 1,
      difficulty: 'easy',
      reward: 10,
    },
    {
      question: '⛓️ Что такое блокчейн?',
      options: [
        'Цифровой кошелек',
        'Распределенная база данных',
        'Криптовалюта',
        'Протокол шифрования',
      ],
      correctAnswer: 1,
      difficulty: 'easy',
      reward: 10,
    },
    {
      question: '🚀 Что означает HODL?',
      options: [
        'Hold On for Dear Life',
        'High Order Digital Ledger',
        'Hash Of Data Link',
        'Hybrid Online Decentralized Ledger',
      ],
      correctAnswer: 0,
      difficulty: 'medium',
      reward: 20,
    },
    {
      question: '🔥 Что такое Gas Fee в Ethereum?',
      options: [
        'Стоимость электричества',
        'Комиссия за транзакцию',
        'Налог на криптовалюту',
        'Стоимость создания токена',
      ],
      correctAnswer: 1,
      difficulty: 'medium',
      reward: 20,
    },
    {
      question: '🎯 Что такое Staking?',
      options: [
        'Покупка криптовалюты',
        'Блокировка токенов для получения вознаграждения',
        'Продажа токенов',
        'Обмен криптовалют',
      ],
      correctAnswer: 1,
      difficulty: 'medium',
      reward: 20,
    },
    {
      question: '🌐 Какой консенсус использует Bitcoin?',
      options: [
        'Proof of Stake',
        'Proof of Work',
        'Delegated Proof of Stake',
        'Proof of Authority',
      ],
      correctAnswer: 1,
      difficulty: 'hard',
      reward: 30,
    },
    {
      question: '💎 Что такое NFT?',
      options: [
        'Non-Fungible Token (невзаимозаменяемый токен)',
        'New Finance Technology',
        'Network Fee Transaction',
        'Node Failure Test',
      ],
      correctAnswer: 0,
      difficulty: 'easy',
      reward: 10,
    },
    {
      question: '📈 Что означает ATH?',
      options: [
        'Average Trading Hour',
        'All Time High (максимум за все время)',
        'Automated Trading Hub',
        'Asset Transfer Hash',
      ],
      correctAnswer: 1,
      difficulty: 'easy',
      reward: 10,
    },
  ],

  blockchain: [
    {
      question: '⛓️ Сколько блоков в час генерируется в Bitcoin?',
      options: ['1', '6', '12', '60'],
      correctAnswer: 1,
      difficulty: 'hard',
      reward: 30,
    },
    {
      question: '🔐 Что такое приватный ключ?',
      options: [
        'Пароль от биржи',
        'Секретный код для доступа к криптовалюте',
        'Номер кошелька',
        'Email адрес',
      ],
      correctAnswer: 1,
      difficulty: 'medium',
      reward: 20,
    },
    {
      question: '🌍 Какой блокчейн самый первый?',
      options: ['Ethereum', 'Bitcoin', 'Litecoin', 'Ripple'],
      correctAnswer: 1,
      difficulty: 'easy',
      reward: 10,
    },
  ],

  defi: [
    {
      question: '💱 Что такое DEX?',
      options: [
        'Централизованная биржа',
        'Децентрализованная биржа',
        'Цифровая валюта',
        'Протокол стейкинга',
      ],
      correctAnswer: 1,
      difficulty: 'medium',
      reward: 20,
    },
    {
      question: '📊 Что такое Liquidity Pool?',
      options: [
        'Группа инвесторов',
        'Пул ликвидности для торговли',
        'Тип кошелька',
        'Биржевой ордер',
      ],
      correctAnswer: 1,
      difficulty: 'medium',
      reward: 20,
    },
    {
      question: '🔄 Что такое Yield Farming?',
      options: [
        'Майнинг криптовалюты',
        'Получение дохода от предоставления ликвидности',
        'Трейдинг токенов',
        'Покупка NFT',
      ],
      correctAnswer: 1,
      difficulty: 'hard',
      reward: 30,
    },
  ],
};

// ============================================
// КЛАСС УПРАВЛЕНИЯ ИГРАМИ
// ============================================

class TelegramGamesManager {
  constructor(bot, database) {
    this.bot = bot;
    this.db = database;
    this.activeQuizzes = new Map();
    this.activePredictions = new Map();
    this.dailyChallenges = new Map();

    this.setupCommands();
  }

  /**
   * Настройка команд игр
   */
  setupCommands() {
    // Quiz команды
    this.bot.onText(/\/quiz/, (msg) => this.handleQuizCommand(msg));
    this.bot.onText(/\/quiz_leaderboard/, (msg) =>
      this.handleQuizLeaderboard(msg)
    );

    // Price Prediction команды
    this.bot.onText(/\/predict/, (msg) => this.handlePredictCommand(msg));
    this.bot.onText(/\/prediction_results/, (msg) =>
      this.handlePredictionResults(msg)
    );

    // Daily Challenge команды
    this.bot.onText(/\/daily/, (msg) => this.handleDailyChallenge(msg));
    this.bot.onText(/\/challenges/, (msg) => this.handleChallengesList(msg));

    // Trivia команды
    this.bot.onText(/\/trivia (.+)/, (msg, match) =>
      this.handleTriviaCommand(msg, match[1])
    );

    // Общие команды
    this.bot.onText(/\/games/, (msg) => this.handleGamesMenu(msg));
    this.bot.onText(/\/rewards/, (msg) => this.handleRewardsInfo(msg));
  }

  /**
   * 🎮 МЕНЮ ИГР
   */
  async handleGamesMenu(msg) {
    const chatId = msg.chat.id;

    const menuText = `
🎮 **HypeAI Games & Quizzes**

Выбери игру и зарабатывай HYPE токены!

**Доступные игры:**

🎯 **/quiz** - Crypto Quiz
Ответь на вопросы о криптовалютах
Награда: 10-30 HYPE за вопрос

🎲 **/predict** - Price Prediction
Угадай цену HYPE через 1 час
Награда: 500 HYPE пул

💪 **/daily** - Daily Challenge
Ежедневное задание
Награда: 50 HYPE

🏆 **/trivia <category>** - Trivia Contest
Викторина по категориям
Награда: 10-90 HYPE

**Leaderboards:**
📊 /quiz_leaderboard - Топ игроков Quiz
🎯 /prediction_results - Результаты Prediction

**Инфо:**
💰 /rewards - Твои награды
📈 /challenges - Все челленджи

Удачи! 🍀
    `;

    await this.bot.sendMessage(chatId, menuText, {
      parse_mode: 'Markdown',
    });
  }

  /**
   * 🎯 CRYPTO QUIZ
   */
  async handleQuizCommand(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Проверка cooldown
    const lastQuiz = await this.db.getLastQuizTime(userId);
    if (
      lastQuiz &&
      Date.now() - lastQuiz < GAMES_CONFIG.quiz.cooldown
    ) {
      const waitTime = Math.ceil(
        (GAMES_CONFIG.quiz.cooldown - (Date.now() - lastQuiz)) / 60000
      );
      await this.bot.sendMessage(
        chatId,
        `⏰ Подожди ${waitTime} минут до следующего квиза!`
      );
      return;
    }

    // Начать квиз
    await this.startQuiz(chatId, userId);
  }

  async startQuiz(chatId, userId) {
    const questions = this.getRandomQuestions(
      GAMES_CONFIG.quiz.questionsPerRound
    );

    const quizSession = {
      userId,
      chatId,
      questions,
      currentQuestion: 0,
      score: 0,
      answers: [],
      startTime: Date.now(),
    };

    this.activeQuizzes.set(userId, quizSession);

    await this.bot.sendMessage(
      chatId,
      `🎯 **Crypto Quiz начался!**\n\nВопросов: ${questions.length}\nВремя на вопрос: ${GAMES_CONFIG.quiz.timePerQuestion}с\n\nУдачи! 🍀`,
      { parse_mode: 'Markdown' }
    );

    await this.askNextQuestion(userId);
  }

  async askNextQuestion(userId) {
    const session = this.activeQuizzes.get(userId);
    if (!session) return;

    const question = session.questions[session.currentQuestion];
    const questionNumber = session.currentQuestion + 1;
    const totalQuestions = session.questions.length;

    const keyboard = {
      inline_keyboard: question.options.map((option, index) => [
        {
          text: option,
          callback_data: `quiz_answer_${userId}_${index}`,
        },
      ]),
    };

    const questionText = `
❓ **Вопрос ${questionNumber}/${totalQuestions}**

${question.question}

🏆 Награда: ${question.reward} HYPE
⏱️ Время: ${GAMES_CONFIG.quiz.timePerQuestion}с
    `;

    await this.bot.sendMessage(session.chatId, questionText, {
      parse_mode: 'Markdown',
      reply_markup: keyboard,
    });

    // Установить таймер
    setTimeout(() => {
      this.handleQuizTimeout(userId);
    }, GAMES_CONFIG.quiz.timePerQuestion * 1000);
  }

  async handleQuizAnswer(userId, answerIndex) {
    const session = this.activeQuizzes.get(userId);
    if (!session) return;

    const question = session.questions[session.currentQuestion];
    const isCorrect = answerIndex === question.correctAnswer;

    session.answers.push({
      questionIndex: session.currentQuestion,
      userAnswer: answerIndex,
      correct: isCorrect,
      reward: isCorrect ? question.reward : 0,
    });

    if (isCorrect) {
      session.score += question.reward;
      await this.bot.sendMessage(
        session.chatId,
        `✅ Правильно! +${question.reward} HYPE\n\nТекущий счет: ${session.score} HYPE`
      );
    } else {
      await this.bot.sendMessage(
        session.chatId,
        `❌ Неправильно!\n\nПравильный ответ: ${question.options[question.correctAnswer]}`
      );
    }

    // Следующий вопрос или завершение
    session.currentQuestion++;
    if (session.currentQuestion < session.questions.length) {
      setTimeout(() => this.askNextQuestion(userId), 2000);
    } else {
      await this.finishQuiz(userId);
    }
  }

  async handleQuizTimeout(userId) {
    const session = this.activeQuizzes.get(userId);
    if (!session) return;

    await this.bot.sendMessage(
      session.chatId,
      '⏰ Время вышло!\n\nПропускаем вопрос...'
    );

    session.currentQuestion++;
    if (session.currentQuestion < session.questions.length) {
      setTimeout(() => this.askNextQuestion(userId), 2000);
    } else {
      await this.finishQuiz(userId);
    }
  }

  async finishQuiz(userId) {
    const session = this.activeQuizzes.get(userId);
    if (!session) return;

    const correctAnswers = session.answers.filter((a) => a.correct).length;
    const totalQuestions = session.questions.length;
    const accuracy = ((correctAnswers / totalQuestions) * 100).toFixed(1);

    // Бонус за идеальный результат
    if (correctAnswers === totalQuestions) {
      session.score += GAMES_CONFIG.quiz.rewardForWinner;
    }

    // Сохранить в БД
    await this.db.saveQuizResult({
      userId,
      score: session.score,
      correctAnswers,
      totalQuestions,
      accuracy,
      timestamp: Date.now(),
    });

    const resultText = `
🏁 **Quiz завершен!**

📊 Результаты:
✅ Правильно: ${correctAnswers}/${totalQuestions}
🎯 Точность: ${accuracy}%
💰 Заработано: ${session.score} HYPE

${correctAnswers === totalQuestions ? '🎉 Идеальный результат! Бонус +100 HYPE!' : ''}

Попробуй еще раз через 1 час!

📊 /quiz_leaderboard - Топ игроков
    `;

    await this.bot.sendMessage(session.chatId, resultText, {
      parse_mode: 'Markdown',
    });

    this.activeQuizzes.delete(userId);
  }

  /**
   * 🎲 PRICE PREDICTION GAME
   */
  async handlePredictCommand(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Проверить активную игру
    if (this.activePredictions.has('current')) {
      const game = this.activePredictions.get('current');
      const timeLeft = Math.ceil((game.endTime - Date.now()) / 60000);

      await this.bot.sendMessage(
        chatId,
        `🎲 Игра уже идет!\n\nОсталось: ${timeLeft} минут\nУчастников: ${game.participants.size}\n\nУкажи свой прогноз цены HYPE!`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '📈 Выше', callback_data: 'predict_higher' },
                { text: '📉 Ниже', callback_data: 'predict_lower' },
              ],
              [
                { text: '🎯 Точная цена', callback_data: 'predict_exact' },
              ],
            ],
          },
        }
      );
      return;
    }

    // Начать новую игру
    await this.startPredictionGame(chatId);
  }

  async startPredictionGame(chatId) {
    const currentPrice = await this.getCurrentPrice();
    const endTime = Date.now() + GAMES_CONFIG.prediction.duration;

    const game = {
      startPrice: currentPrice,
      startTime: Date.now(),
      endTime,
      participants: new Map(),
      rewardPool: GAMES_CONFIG.prediction.rewardPool,
    };

    this.activePredictions.set('current', game);

    const gameText = `
🎲 **Price Prediction Game началась!**

💰 Текущая цена HYPE: $${currentPrice}
⏱️ Длительность: 1 час
🎁 Пул наград: ${game.rewardPool} HYPE

**Как играть:**
1. Предскажи направление цены (выше/ниже)
2. Или укажи точную цену
3. Через 1 час - результаты!

**Награды:**
🥇 Точный прогноз: 50% пула
🥈 Близкий прогноз: 30% пула
🥉 Правильное направление: 20% пула

Сделай свой прогноз! 🎯
    `;

    await this.bot.sendMessage(chatId, gameText, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📈 Выше', callback_data: 'predict_higher' },
            { text: '📉 Ниже', callback_data: 'predict_lower' },
          ],
          [{ text: '🎯 Точная цена', callback_data: 'predict_exact' }],
        ],
      },
    });

    // Установить таймер завершения
    setTimeout(() => {
      this.finishPredictionGame();
    }, GAMES_CONFIG.prediction.duration);
  }

  async finishPredictionGame() {
    const game = this.activePredictions.get('current');
    if (!game) return;

    const finalPrice = await this.getCurrentPrice();
    const priceChange =
      ((finalPrice - game.startPrice) / game.startPrice) * 100;

    // Определить победителей
    const winners = this.calculatePredictionWinners(
      game,
      finalPrice,
      priceChange
    );

    // Распределить награды
    for (const [userId, reward] of winners) {
      await this.db.addReward(userId, reward, 'prediction_game');
    }

    // Отправить результаты
    const resultsText = this.formatPredictionResults(
      game,
      finalPrice,
      priceChange,
      winners
    );

    await this.bot.sendMessage(game.chatId, resultsText, {
      parse_mode: 'Markdown',
    });

    this.activePredictions.delete('current');
  }

  /**
   * 💪 DAILY CHALLENGES
   */
  async handleDailyChallenge(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    const today = new Date().toISOString().split('T')[0];
    const completedToday = await this.db.getDailyChallengeStatus(
      userId,
      today
    );

    if (completedToday) {
      await this.bot.sendMessage(
        chatId,
        '✅ Ты уже выполнил сегодняшний челлендж!\n\nПриходи завтра за новым заданием! 😊'
      );
      return;
    }

    const challenge = this.getDailyChallenge(today);

    const challengeText = `
💪 **Daily Challenge**

📅 ${today}

${challenge.emoji} **${challenge.title}**

${challenge.description}

🏆 Награда: ${challenge.reward} HYPE

**Прогресс:**
${await this.getChallengeProgress(userId, challenge)}

${challenge.completed ? '✅ Выполнено!' : '⏳ В процессе...'}
    `;

    await this.bot.sendMessage(chatId, challengeText, {
      parse_mode: 'Markdown',
    });
  }

  getDailyChallenge(date) {
    const challenges = [
      {
        type: 'referral',
        emoji: '🔗',
        title: 'Пригласи друга',
        description: 'Пригласи 1 нового участника в комьюнити',
        reward: 50,
        check: async (userId) => {
          const referrals = await this.db.getTodayReferrals(userId);
          return referrals >= 1;
        },
      },
      {
        type: 'engagement',
        emoji: '💬',
        title: 'Будь активным',
        description: 'Отправь 10 сообщений в чат',
        reward: 50,
        check: async (userId) => {
          const messages = await this.db.getTodayMessages(userId);
          return messages >= 10;
        },
      },
      {
        type: 'trading',
        emoji: '📊',
        title: 'Трейдинг',
        description: 'Посети trading страницу и изучи графики',
        reward: 50,
        check: async (userId) => {
          return await this.db.hasVisitedTrading(userId);
        },
      },
      {
        type: 'learning',
        emoji: '📚',
        title: 'Обучение',
        description: 'Пройди quiz и набери 80%+ точности',
        reward: 50,
        check: async (userId) => {
          const quiz = await this.db.getTodayQuizResult(userId);
          return quiz && quiz.accuracy >= 80;
        },
      },
    ];

    // Выбрать челлендж на основе даты (ротация)
    const dayOfYear = Math.floor(
      (new Date(date) - new Date(new Date().getFullYear(), 0, 0)) /
        86400000
    );
    return challenges[dayOfYear % challenges.length];
  }

  /**
   * 🏆 TRIVIA CONTEST
   */
  async handleTriviaCommand(msg, category) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    const validCategories = ['crypto', 'blockchain', 'defi', 'nft', 'general'];

    if (!validCategories.includes(category)) {
      await this.bot.sendMessage(
        chatId,
        `🏆 **Trivia Contest**\n\nВыбери категорию:\n\n${validCategories.map((c) => `• /trivia ${c}`).join('\n')}`
      );
      return;
    }

    const questions = QUIZ_QUESTIONS[category] || QUIZ_QUESTIONS.crypto;
    const randomQuestion =
      questions[Math.floor(Math.random() * questions.length)];

    const keyboard = {
      inline_keyboard: randomQuestion.options.map((option, index) => [
        {
          text: option,
          callback_data: `trivia_answer_${userId}_${index}_${randomQuestion.correctAnswer}_${randomQuestion.reward}`,
        },
      ]),
    };

    const triviaText = `
🏆 **Trivia: ${category.toUpperCase()}**

${randomQuestion.question}

💰 Награда: ${randomQuestion.reward} HYPE
📊 Сложность: ${randomQuestion.difficulty}
    `;

    await this.bot.sendMessage(chatId, triviaText, {
      parse_mode: 'Markdown',
      reply_markup: keyboard,
    });
  }

  /**
   * 🎁 ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
   */

  getRandomQuestions(count) {
    const allQuestions = Object.values(QUIZ_QUESTIONS).flat();
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  async getCurrentPrice() {
    // Имитация получения цены (в реальности - API запрос)
    return (Math.random() * 0.01).toFixed(6);
  }

  calculatePredictionWinners(game, finalPrice, priceChange) {
    const winners = new Map();

    // Логика определения победителей
    // (упрощенная версия для примера)

    return winners;
  }

  formatPredictionResults(game, finalPrice, priceChange, winners) {
    return `
🏁 **Price Prediction - Результаты**

📊 Начальная цена: $${game.startPrice}
📊 Финальная цена: $${finalPrice}
📈 Изменение: ${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)}%

🏆 **Победители:**
${Array.from(winners.entries())
  .map(([userId, reward]) => `• User ${userId}: ${reward} HYPE`)
  .join('\n')}

Следующая игра через 2 часа!
    `;
  }

  async getChallengeProgress(userId, challenge) {
    const completed = await challenge.check(userId);
    return completed ? '✅ 100%' : '⏳ 0%';
  }

  async handleQuizLeaderboard(msg) {
    const chatId = msg.chat.id;
    const leaderboard = await this.db.getQuizLeaderboard(10);

    const leaderboardText = `
📊 **Quiz Leaderboard**

Топ-10 игроков:

${leaderboard
  .map(
    (user, index) =>
      `${index + 1}. @${user.username || 'User' + user.id}\n   💰 ${user.totalScore} HYPE | 🎯 ${user.accuracy}%`
  )
  .join('\n\n')}

Играй больше, чтобы попасть в топ! 🏆
    `;

    await this.bot.sendMessage(chatId, leaderboardText, {
      parse_mode: 'Markdown',
    });
  }

  async handlePredictionResults(msg) {
    const chatId = msg.chat.id;
    const results = await this.db.getRecentPredictions(5);

    const resultsText = `
🎲 **Recent Prediction Results**

${results.map((r) => `📊 ${r.date}: ${r.winner} won ${r.reward} HYPE`).join('\n')}
    `;

    await this.bot.sendMessage(chatId, resultsText);
  }

  async handleChallengesList(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    const challenges = await this.db.getUserChallenges(userId);

    const listText = `
💪 **Your Challenges**

${challenges
  .map(
    (c) =>
      `${c.completed ? '✅' : '⏳'} ${c.title} - ${c.reward} HYPE`
  )
  .join('\n')}
    `;

    await this.bot.sendMessage(chatId, listText);
  }

  async handleRewardsInfo(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    const rewards = await this.db.getUserRewards(userId);

    const rewardsText = `
💰 **Your Rewards**

🎯 Quiz: ${rewards.quiz || 0} HYPE
🎲 Predictions: ${rewards.predictions || 0} HYPE
💪 Challenges: ${rewards.challenges || 0} HYPE
🏆 Trivia: ${rewards.trivia || 0} HYPE

💎 **Total: ${rewards.total || 0} HYPE**
    `;

    await this.bot.sendMessage(chatId, rewardsText, {
      parse_mode: 'Markdown',
    });
  }
}

// ============================================
// ЭКСПОРТ
// ============================================

module.exports = {
  TelegramGamesManager,
  GAMES_CONFIG,
  QUIZ_QUESTIONS,
};

/**
 * ИСПОЛЬЗОВАНИЕ:
 *
 * const { TelegramGamesManager } = require('./telegram-games-quiz');
 *
 * // В основном боте:
 * const gamesManager = new TelegramGamesManager(bot, database);
 *
 * // Игры запускаются автоматически при вводе команд:
 * // /quiz - Crypto Quiz
 * // /predict - Price Prediction
 * // /daily - Daily Challenge
 * // /trivia crypto - Trivia Contest
 * // /games - Меню игр
 */
