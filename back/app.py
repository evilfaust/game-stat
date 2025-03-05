# import logging
# import os
# import uuid
# import datetime
# from flask import Flask, request, jsonify
# from werkzeug.utils import secure_filename
# from flask_cors import CORS
# from awpy import Demo
# from awpy.stats import adr, kast, rating, impact
# from dotenv import load_dotenv

# load_dotenv()

# app = Flask(__name__)
# CORS(app)  # Разрешаем запросы со всех доменов

# # Конфигурация через переменные окружения
# UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "uploads")
# MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH", 500 * 1024 * 1024))
# DEBUG = os.getenv("DEBUG", "True").lower() in ["true", "1"]
# PORT = int(os.getenv("PORT", 5005))

# app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
# app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# if not os.path.exists(UPLOAD_FOLDER):
#     os.makedirs(UPLOAD_FOLDER)

# ALLOWED_EXTENSIONS = {'dem'}

# def allowed_file(filename):
#     return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# def get_current_time_formatted():
#     return datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")

# def generate_unique_filename(filename):
#     ext = filename.rsplit('.', 1)[1]
#     return f"{uuid.uuid4().hex}_{get_current_time_formatted()}.{ext}"

# def load_demo(file_path):
#     return Demo(file_path, verbose=False, ticks=True)

# def filter_stats(stats_df, team_name="all"):
#     return stats_df[stats_df["team_name"] == team_name]

# def aggregate_player_stats(stats_dfs):
#     player_stats = {}
#     for stats_df in stats_dfs:
#         for _, row in stats_df.iterrows():
#             player_name = row["name"]
#             if player_name not in player_stats:
#                 player_stats[player_name] = {
#                     "name": player_name,
#                     "steamid": row["steamid"],
#                     "n_rounds": row.get("n_rounds", 0),
#                     "dmg": row.get("dmg", 0),
#                     "adr": row.get("adr", 0),
#                     "kast_rounds": row.get("kast_rounds", 0),
#                     "kast": row.get("kast", 0),
#                     "impact": row.get("impact", 0),
#                     "rating": row.get("rating", 0)
#                 }
#             else:
#                 player_stats[player_name]["n_rounds"] = row.get("n_rounds", player_stats[player_name]["n_rounds"])
#                 player_stats[player_name]["dmg"] += row.get("dmg", 0)
#                 player_stats[player_name]["adr"] = row.get("adr", player_stats[player_name]["adr"])
#                 player_stats[player_name]["kast_rounds"] += row.get("kast_rounds", 0)
#                 player_stats[player_name]["kast"] = row.get("kast", player_stats[player_name]["kast"])
#                 player_stats[player_name]["impact"] = row.get("impact", player_stats[player_name]["impact"])
#                 player_stats[player_name]["rating"] = row.get("rating", player_stats[player_name]["rating"])
#     return list(player_stats.values())

# @app.before_request
# def log_request_info():
#     app.logger.info(f"Получен запрос: {request.method} {request.url} от {request.remote_addr}")

# @app.after_request
# def log_response_info(response):
#     app.logger.info(f"Отправлен ответ с кодом: {response.status_code}")
#     return response

# @app.errorhandler(413)
# def request_entity_too_large(error):
#     return jsonify({"error": "Файл слишком большой. Максимальный размер — 500 МБ."}), 413

# @app.route('/parse-demo', methods=['POST'])
# def parse_demo():
#     if 'demo' not in request.files:
#         return jsonify({"error": "No file part"}), 400

#     file = request.files['demo']
#     if file.filename == '':
#         return jsonify({"error": "No selected file"}), 400

#     if not allowed_file(file.filename):
#         return jsonify({"error": "Недопустимый тип файла"}), 400

#     filename = secure_filename(file.filename)
#     unique_filename = generate_unique_filename(filename)
#     file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
#     file.save(file_path)

#     try:
#         dem = load_demo(file_path)
#         adr_stats = adr(dem)
#         kast_stats = kast(dem)
#         rating_stats = rating(dem)
#         impact_stats = impact(dem)

#         adr_all = filter_stats(adr_stats)
#         kast_all = filter_stats(kast_stats)
#         rating_all = filter_stats(rating_stats)
#         impact_all = filter_stats(impact_stats)

#         final_data = aggregate_player_stats([adr_all, kast_all, rating_all, impact_all])
#         return jsonify(final_data)
#     except Exception as e:
#         app.logger.exception("Ошибка при обработке файла:")
#         return jsonify({"error": str(e)}), 500
#     finally:
#         if os.path.exists(file_path):
#             os.remove(file_path)

# @app.route('/health', methods=['GET'])
# def health():
#     return jsonify({"status": "ok"}), 200

# if __name__ == '__main__':
#     logging.basicConfig(level=logging.INFO)
#     app.logger.info(f"Server is running on http://0.0.0.0:{PORT}")
#     app.run(host='0.0.0.0', port=PORT, debug=DEBUG)

import logging
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
import json
from awpy import Demo
from awpy.stats import adr, kast, rating, impact
import datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Разрешаем запросы со всех доменов

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500 МБ

def get_current_time_formatted():
    """Возвращает текущее время в формате 'Год-Месяц-День_Часы-Минуты-Секунды'."""
    return datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")

def load_demo(file_path):
    """Загружает демо-файл."""
    return Demo(file_path, verbose=False, ticks=True)

def filter_stats(stats_df, team_name="all"):
    """Фильтрует статистику, оставляя только указанную команду."""
    return stats_df[stats_df["team_name"] == team_name]

def aggregate_player_stats(stats_dfs):
    """Агрегирует статистику по каждому игроку."""
    player_stats = {}
    for stats_df in stats_dfs:
        for _, row in stats_df.iterrows():
            player_name = row["name"]
            if player_name not in player_stats:
                player_stats[player_name] = {
                    "name": player_name,
                    "steamid": row["steamid"],
                    "n_rounds": row.get("n_rounds", 0),
                    "dmg": row.get("dmg", 0),
                    "adr": row.get("adr", 0),
                    "kast_rounds": row.get("kast_rounds", 0),
                    "kast": row.get("kast", 0),
                    "impact": row.get("impact", 0),
                    "rating": row.get("rating", 0)
                }
            else:
                # Агрегируем значения, если они существуют
                player_stats[player_name]["n_rounds"] = row.get("n_rounds", player_stats[player_name]["n_rounds"])
                player_stats[player_name]["dmg"] += row.get("dmg", 0)
                player_stats[player_name]["adr"] = row.get("adr", player_stats[player_name]["adr"])
                player_stats[player_name]["kast_rounds"] += row.get("kast_rounds", 0)
                player_stats[player_name]["kast"] = row.get("kast", player_stats[player_name]["kast"])
                player_stats[player_name]["impact"] = row.get("impact", player_stats[player_name]["impact"])
                player_stats[player_name]["rating"] = row.get("rating", player_stats[player_name]["rating"])
    return list(player_stats.values())

@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({"error": "Файл слишком большой. Максимальный размер — 500 МБ."}), 413

@app.route('/parse-demo', methods=['POST'])
def parse_demo():
    if 'demo' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['demo']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)

    try:
        # Загружаем демо-файл
        dem = load_demo(file_path)

        # Получаем статистику
        adr_stats = adr(dem)
        kast_stats = kast(dem)
        rating_stats = rating(dem)
        impact_stats = impact(dem)

        # Фильтруем данные, оставляя только team_name == "all"
        adr_all = filter_stats(adr_stats)
        kast_all = filter_stats(kast_stats)
        rating_all = filter_stats(rating_stats)
        impact_all = filter_stats(impact_stats)

        # Агрегируем статистику по игрокам
        final_data = aggregate_player_stats([adr_all, kast_all, rating_all, impact_all])

        return jsonify(final_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as remove_error:
            app.logger.error(f"Ошибка при удалении файла {file_path}: {remove_error}")


if __name__ == '__main__':
    logging.info("Server is running on http://0.0.0.0:5005")
    app.run(host='0.0.0.0', port=5005, debug=True)
