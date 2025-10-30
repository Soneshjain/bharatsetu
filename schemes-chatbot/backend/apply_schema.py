import os, asyncio, asyncpg
from dotenv import load_dotenv

def get_database_url() -> str:
    load_dotenv()
    url = os.getenv("DATABASE_URL")
    if not url:
        raise SystemExit("DATABASE_URL not set in .env")
    return url

async def main():
    url = get_database_url()
    sql_path = os.path.join(os.path.dirname(__file__), "database_schema.sql")
    sql = open(sql_path, "r", encoding="utf-8").read()
    conn = await asyncpg.connect(url)
    try:
        await conn.execute(sql)
        print("Schema applied successfully")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(main())