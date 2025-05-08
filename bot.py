from flask import Flask, request

app = Flask(__name__)

@app.post('/webhook')
def webhook():
    data = request.json
    if data.get('message', {}).get('web_app_data'):
        web_app_data = json.loads(data['message']['web_app_data']['data'])
        # Обработка данных из мини-приложения
        print(web_app_data)  # {'action': 'save_todos', 'todos': [...]}
    return 'OK'
