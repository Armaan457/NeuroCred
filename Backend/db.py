from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

users_collection = db["users"]
refresh_tokens_collection = db["refresh_tokens"]


async def store_refresh_token(user_id: str, token: str):
    await refresh_tokens_collection.update_one(
        {"user_id": user_id},
        {"$set": {"token": token}},
        upsert=True
    )


async def get_refresh_token(user_id: str):
    doc = await refresh_tokens_collection.find_one({"user_id": user_id})
    return doc["token"] if doc else None


async def delete_refresh_token(user_id: str):
    await refresh_tokens_collection.delete_one({"user_id": user_id})
