import psycopg

conn = psycopg.connect('postgresql://neondb_owner:npg_kZcAmI02egYC@ep-wandering-hat-ape43uns-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require')
with conn.cursor() as cur:
    cur.execute("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;")
    print([row[0] for row in cur.fetchall()])
conn.close()
