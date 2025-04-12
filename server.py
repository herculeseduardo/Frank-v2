from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

def init_db():
    conn = sqlite3.connect('ranking.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS players
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  nickname TEXT UNIQUE,
                  score INTEGER,
                  ip_address TEXT,
                  date TEXT)''')
    conn.commit()
    conn.close()

@app.route('/check-nickname', methods=['POST'])
def check_nickname():
    data = request.json
    nickname = data.get('nickname')
    ip_address = request.remote_addr

    conn = sqlite3.connect('ranking.db')
    c = conn.cursor()
    
    # Verificar se o nickname já existe para este IP
    c.execute('SELECT * FROM players WHERE nickname = ? AND ip_address = ?',
              (nickname, ip_address))
    result = c.fetchone()
    
    conn.close()
    
    return jsonify({'exists': result is not None})

@app.route('/save-score', methods=['POST'])
def save_score():
    data = request.json
    ip_address = request.remote_addr
    
    conn = sqlite3.connect('ranking.db')
    c = conn.cursor()
    
    try:
        c.execute('''INSERT INTO players (nickname, score, ip_address, date)
                     VALUES (?, ?, ?, ?)''',
                  (data['nickname'], data['score'], ip_address, datetime.now().isoformat()))
        conn.commit()
        return jsonify({'success': True})
    except sqlite3.IntegrityError:
        return jsonify({'success': False, 'error': 'Nickname já existe'})
    finally:
        conn.close()

@app.route('/get-ranking', methods=['GET'])
def get_ranking():
    conn = sqlite3.connect('ranking.db')
    c = conn.cursor()
    
    c.execute('''SELECT nickname, score, date 
                 FROM players 
                 ORDER BY score DESC 
                 LIMIT 10''')
    ranking = [{'nickname': row[0], 'score': row[1], 'date': row[2]} 
               for row in c.fetchall()]
    
    conn.close()
    
    return jsonify(ranking)

if __name__ == '__main__':
    init_db()
    app.run(debug=True) 