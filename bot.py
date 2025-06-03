import requests
import time
import json
import os

# Конфигурация (замените на свои данные)
ARTICLE = "58915839"      # Артикул товара
QUERY = "орех"            # Поисковый запрос
CHAT_ID = "6749042856"   # Ваш ID в Telegram
BOT_TOKEN = "7748386072:AAGKMXMd0geqGp4dvqVPbQBI2eZPe28pZUA"   # Токен вашего Telegram-бота
CHECK_INTERVAL = 300      # Проверка каждые 5 минут (в секундах)

def get_position():
    """Получает текущую позицию товара на Wildberries"""
    page = 1
    while page <= 10:  # Проверяем первые 10 страниц (топ 1000 товаров)
        url = f"https://search.wb.ru/exactmatch/ru/common/v4/search"
        params = {
            "query": QUERY,
            "resultset": "catalog",
            "page": page,
            "appType": 1,
            "dest": -1257786
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            data = response.json()
            products = data["data"]["products"]
            
            for i, product in enumerate(products):
                if str(product["id"]) == ARTICLE:
                    return (page - 1) * 100 + i + 1
                    
            page += 1
            time.sleep(1)  # Пауза между запросами
            
        except Exception as e:
            print(f"Ошибка: {e}")
            return None
    
    return None  # Товар не найден в топе

def send_telegram(message):
    """Отправляет сообщение в Telegram"""
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    data = {
        "chat_id": CHAT_ID,
        "text": message,
        "parse_mode": "HTML"
    }
    try:
        requests.post(url, data=data, timeout=10)
    except Exception as e:
        print(f"Ошибка отправки в Telegram: {e}")

def main():
    # Создаем файл для хранения последней позиции
    if not os.path.exists("last_position.txt"):
        with open("last_position.txt", "w") as f:
            f.write("0")
    
    print(f"🚀 Начато отслеживание артикула {ARTICLE} по запросу '{QUERY}'")
    
    while True:
        current_position = get_position()
        
        if current_position is None:
            print("Товар не найден в поисковой выдаче")
            time.sleep(CHECK_INTERVAL)
            continue
        
        # Читаем предыдущую позицию
        with open("last_position.txt", "r") as f:
            last_position = int(f.read().strip() or "0")
        
        # Если позиция изменилась
        if last_position != current_position:
            change = "🔼 улучшилась" if current_position < last_position else "🔽 ухудшилась"
            message = (
                f"📢 <b>Изменилась позиция!</b>\n\n"
                f"Артикул: {ARTICLE}\n"
                f"Запрос: '{QUERY}'\n"
                f"Была: {last_position}\n"
                f"Стала: <b>{current_position}</b>\n"
                f"Динамика: {change}"
            )
            
            send_telegram(message)
            print(f"Позиция изменилась: {last_position} → {current_position}")
            
            # Сохраняем новую позицию
            with open("last_position.txt", "w") as f:
                f.write(str(current_position))
        
        time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    main()
