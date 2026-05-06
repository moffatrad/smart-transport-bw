import psycopg
from pathlib import Path

SQL_FILE = Path(__file__).with_name('database.sql')
CONNECTION_STRING = 'postgresql://neondb_owner:npg_kZcAmI02egYC@ep-wandering-hat-ape43uns-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

if not SQL_FILE.exists():
    raise FileNotFoundError(f'Could not find SQL file: {SQL_FILE}')

with SQL_FILE.open('r', encoding='utf-8') as f:
    sql = f.read()

with psycopg.connect(CONNECTION_STRING) as conn:
    with conn.cursor() as cur:
        cur.execute(sql)
        print('Neon schema applied successfully.')
