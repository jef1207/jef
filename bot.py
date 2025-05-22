import logging
import random
import asyncio
from datetime import datetime, timedelta
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Updater, CommandHandler, CallbackQueryHandler, MessageHandler, filters, ContextTypes
)

# Настройка логгирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO
)
logger = logging.getLogger(__name__)

# Хранилища данных
user_data = {}  # {chat_id: {stats}}
top_scores = {}  # {chat_id: {name, score}}
shop_items = {
    1: {"name": "Утяжелители", "price": 100, "effect": {"xp_boost": 1.2}},
    2: {"name": "Золотой мяч", "price": 300, "effect": {"chance_boost": 10}}
}
weather_conditions = ['sunny', 'rain', 'windy']

# ========================
# Основные функции бота
# ========================

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработка команды /start"""
    user = update.effective_user
    await update.message.reply_text(
        f"🏀 Привет, {user.first_name}!\n"
        "Я продвинутый баскетбольный бот!\n"
        "Команды:\n"
        "/play - Начать игру\n"
        "/shop - Магазин\n"
        "/leaderboard - Таблица рекордов"
    )

async def play(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Начало новой игры"""
    keyboard = [
        [InlineKeyboardButton("🏀 Легкий", callback_data='easy'),
         InlineKeyboardButton("🔥 Средний", callback_data='medium')],
        [InlineKeyboardButton("💀 Сложный", callback_data='hard'),
         InlineKeyboardButton("🌟 Звездный матч", callback_data='star')]
    ]
    await update.message.reply_text(
        "🎮 Выбери режим игры:",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )

# ========================
# Игровая механика
# ========================

def generate_throw_animation(success: bool) -> str:
    """Генерация анимации броска"""
    frames = [
        "     ╭───────╮\n     │       │\n 🏀 ░░░░░░░\n     ╰───────╯",
        "     ╭───────╮\n 🏀 │       │\n   ░░░░░░░\n     ╰───────╯",
        "     ╭───────╮\n     │   🎯  │\n   ░░░░░░░\n     ╰───────╯" if success 
        else "     ╭───────╮\n     │   🌪️  │\n   ░░░░░░░\n     ╰───────╯"
    ]
    return "\n".join(frames)

def calculate_chance(game_data: dict) -> int:
    """Расчет шанса попадания"""
    base_chance = {
        'easy': 70, 'medium': 50, 'hard': 30, 'star': 40
    }[game_data['mode']]
    
    # Модификаторы
    chance = base_chance
    chance += game_data['skills']['accuracy'] * 2
    chance += game_data['weather']['effect']
    chance += game_data.get('bonus_chance', 0)
    
    return max(10, min(90, chance))

# ========================
# Обработчики кнопок
# ========================

async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    chat_id = update.effective_chat.id
    
    # Выбор режима игры
    if query.data in ['easy', 'medium', 'hard', 'star']:
        user_data[chat_id] = {
            'score': 0,
            'attempts': 0,
            'mode': query.data,
            'skills': {'accuracy': 1},
            'weather': get_current_weather(),
            'combo': 0,
            'bonuses': {}
        }
        await start_game_session(chat_id, context.bot)
    
    # Обработка броска
    elif query.data == 'throw':
        await process_throw(chat_id, context.bot)

async def start_game_session(chat_id, bot):
    """Запуск игровой сессии"""
    game_data = user_data[chat_id]
    await bot.send_message(
        chat_id,
        f"🌤️ Погода: {game_data['weather']['emoji']}\n"
        f"🏆 Начало игры! Сейчас: {game_data['score']} очков",
        reply_markup=game_keyboard()
    )

def game_keyboard():
    """Клавиатура во время игры"""
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("🏀 Бросить мяч", callback_data='throw')],
        [InlineKeyboardButton("🛒 Магазин", callback_data='shop'),
         InlineKeyboardButton("📊 Статистика", callback_data='stats')]
    ])

# ========================
# Основная игровая логика
# ========================

async def process_throw(chat_id, bot):
    game_data = user_data[chat_id]
    game_data['attempts'] += 1
    
    # Анимация броска
    msg = await bot.send_message(chat_id, "⏳ Бросок...")
    for frame in generate_throw_animation(False).split("\n"):
        await bot.edit_message_text(
            f"```\n{frame}\n```",
            chat_id=chat_id,
            message_id=msg.message_id,
            parse_mode='MarkdownV2'
        )
        await asyncio.sleep(0.3)
    
    # Расчет результата
    success = random.randint(1, 100) <= calculate_chance(game_data)
    
    # Обновление счета
    if success:
        game_data['score'] += 3 if game_data['mode'] == 'star' else 2
        game_data['combo'] += 1
        game_data['skills']['accuracy'] += 0.1
    else:
        game_data['combo'] = 0
    
    # Отправка результата
    result_text = (
        f"✨ {'Супер удар! +3 очка!' if game_data['mode'] == 'star' else 'Попадание! +2 очка!'}"
        if success else "❌ Промах!"
    )
    
    await bot.edit_message_text(
        f"{result_text}\n"
        f"🏆 Очки: {game_data['score']}\n"
        f"🎯 Попыток: {game_data['attempts']}/10\n"
        f"🔥 Комбо: x{game_data['combo']}",
        chat_id=chat_id,
        message_id=msg.message_id,
        reply_markup=game_keyboard()
    )
    
    # Проверка конца игры
    if game_data['attempts'] >= 10:
        await end_game(chat_id, bot)

# ========================
# Дополнительные системы
# ========================

async def shop(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Магазин предметов"""
    keyboard = [
        [InlineKeyboardButton(f"{item['name']} - {item['price']} монет", callback_data=f"buy_{id}")]
        for id, item in shop_items.items()
    ]
    await update.message.reply_text(
        "🛒 Магазин улучшений:",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )

async def leaderboard(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Таблица рекордов"""
    sorted_scores = sorted(top_scores.items(), key=lambda x: x[1]['score'], reverse=True)[:10]
    board = "\n".join(
        [f"{i+1}. {data['name']}: {data['score']}" for i, (_, data) in enumerate(sorted_scores)]
    )
    await update.message.reply_text(f"🏆 Топ игроков:\n{board}")

async def end_game(chat_id, bot):
    """Завершение игры"""
    game_data = user_data[chat_id]
    # Обновление рекордов
    if chat_id not in top_scores or game_data['score'] > top_scores[chat_id]['score']:
        top_scores[chat_id] = {
            'name': (await bot.get_chat(chat_id)).first_name,
            'score': game_data['score']
        }
    
    await bot.send_message(
        chat_id,
        f"🎉 Игра окончена! Ваш счет: {game_data['score']}\n"
        f"💡 Уровень точности: {round(game_data['skills']['accuracy'], 1)}"
    )
    del user_data[chat_id]

def get_current_weather():
    """Генерация текущей погоды"""
    weather = random.choice(weather_conditions)
    effects = {
        'sunny': {"emoji": "☀️", "effect": 0},
        'rain': {"emoji": "🌧️", "effect": -15},
        'windy': {"emoji": "🌪️", "effect": random.randint(-20, 5)}
    }
    return effects[weather]

# ========================
# Запуск бота
# ========================

def main() -> None:
    """Запуск приложения"""
    application = Updater("7658440066:AAHL2HunIJVqwnOzj70-gCBvKKUIphvAMRU").application
    
    # Регистрация обработчиков
    application.add_handler(CommandHandler('start', start))
    application.add_handler(CommandHandler('play', play))
    application.add_handler(CommandHandler('shop', shop))
    application.add_handler(CommandHandler('leaderboard', leaderboard))
    application.add_handler(CallbackQueryHandler(button_handler))
    
    # Запуск
    application.run_polling()

if __name__ == '__main__':
    main()