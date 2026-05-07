import psycopg2
import json

# Railway Database Connection
railway_config = {
    'host': 'trolley.proxy.rlwy.net',
    'port': 51992,
    'database': 'railway',
    'user': 'postgres',
    'password': 'PpMzsPoLgBPpxFqHLfkcRxUSDXqQEqId'
}

try:
    conn = psycopg2.connect(**railway_config)
    cursor = conn.cursor()
    cursor.execute("SELECT version();")
    db_version = cursor.fetchone()
    
    result = {
        'status': 'success',
        'message': 'Successfully connected to Railway PostgreSQL database',
        'database': 'railway',
        'host': 'trolley.proxy.rlwy.net:51992',
        'version': db_version[0] if db_version else 'Unknown'
    }
    print(json.dumps(result, indent=2))
    
    cursor.close()
    conn.close()
    
except Exception as e:
    result = {
        'status': 'error',
        'message': str(e),
        'connection_config': railway_config
    }
    print(json.dumps(result, indent=2))
