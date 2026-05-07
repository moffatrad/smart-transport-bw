import psycopg2
from pathlib import Path

SQL_FILE = Path(__file__).with_name('database.sql')
CONNECTION_STRING = 'postgresql://postgres:PpMzsPoLgBPpxFqHLfkcRxUSDXqQEqId@trolley.proxy.rlwy.net:51992/railway'

if not SQL_FILE.exists():
    raise FileNotFoundError(f'Could not find SQL file: {SQL_FILE}')

with SQL_FILE.open('r', encoding='utf-8') as f:
    sql = f.read()

conn = psycopg2.connect(CONNECTION_STRING)
conn.autocommit = True
cur = conn.cursor()
cur.execute(sql)
cur.close()
conn.close()

print('Railway schema applied successfully.')
