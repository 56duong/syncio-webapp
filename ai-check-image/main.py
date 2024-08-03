import logging
import aio_pika
import asyncio
from fastapi import FastAPI, HTTPException
import requests
from PIL import Image
from io import BytesIO
from nudenet import NudeDetector
import os
import json
import uvicorn
from urllib.parse import urlparse, parse_qs
import aiohttp

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
nude_detector = NudeDetector()

# Load config file
with open("config.json", "r") as config_file:
    config = json.load(config_file)

TELEGRAM_TOKEN = config["TELEGRAM_TOKEN"]
CHAT_ID = config["TELEGRAM_CHAT_ID"] 

async def send_telegram_message(message: str):
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    payload = {
        'chat_id': CHAT_ID,
        'text': message,
        'parse_mode': 'HTML'
    }
    async with aiohttp.ClientSession() as session:
        await session.post(url, json=payload)

def run_in_current_loop(coro):
    loop = asyncio.get_event_loop()
    if loop.is_running():
        asyncio.create_task(coro)
    else:
        loop.run_until_complete(coro)

class TelegramHandler(logging.Handler):
    def emit(self, record):
        log_entry = self.format(record)
        run_in_current_loop(send_telegram_message(log_entry))

telegram_handler = TelegramHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
telegram_handler.setFormatter(formatter)
logger.addHandler(telegram_handler)

@app.get("/")
def read_root():
    return {"Hello": "Syncio"}

@app.get("/verify-image/")
async def process_image(image_url: str):
    try:
        image_url = image_url.replace('localhost', 'host.docker.internal')
        if 'firebasestorage' in image_url:
            image_url = image_url.replace('users/','users%2F')
        response = requests.get(image_url)
        response.raise_for_status()
        image = Image.open(BytesIO(response.content))
        logger.info("Image opened successfully")
        image.save("image.jpg")
        sensitive_data = nude_detector.detect("image.jpg")
        logger.info(f"Sensitive data: {sensitive_data}")
        os.remove("image.jpg")
        parsed_url = urlparse(image_url)
        query_params = parse_qs(parsed_url.query)
        post_id = query_params.get('postId', [None])[0]

        nudity_detected = any(
            d['score'] > 0.5 for d in sensitive_data
            if d['class'] in ['EXPLICIT_NUDITY', 'SUGGESTIVE', 'BELLY_EXPOSED', 'FEMALE_BREAST_EXPOSED', 'ARMPITS_EXPOSED']
        )

        logger.info(f"Image processed for URL: {image_url}, nudity detected: {nudity_detected}")
        await send_response_to_spring_boot({"nudity": nudity_detected, "postId": post_id})
        return {"nudity": nudity_detected}

    except requests.RequestException as e:
        logger.error(f"HTTP error while fetching image: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to process the image: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process the image.")

async def send_response_to_spring_boot(result_data):
    connection = await aio_pika.connect_robust(config["rabbitmq_url"])
    async with connection:
        channel = await connection.channel()
        exchange = await channel.declare_exchange(
            config["exchange"], aio_pika.ExchangeType.DIRECT, durable=True
        )

        queue = await channel.declare_queue("image_verification_response_queue_springboot", durable=True)
        await queue.bind(exchange, routing_key="image_verification_response")
        try:
            await exchange.publish(
                aio_pika.Message(
                    body=json.dumps(result_data).encode(),
                    content_type='application/json'
                ),
                routing_key="image_verification_response"
            )
            logger.info(f"Sent image processing result back to SpringBoot: {result_data}")
        except Exception as e:
            logger.error(f"Failed to publish message: {e}")

async def consume():
    attempt = 0
    max_retries = 3
    retry_delay = 30  # in seconds

    while attempt < max_retries:
        try:
            connection = await aio_pika.connect_robust(config["rabbitmq_url"])
            async with connection:
                channel = await connection.channel()
                queue = await channel.declare_queue(config["queu_image_verify"], durable=True)
                logger.info("Connected to RabbitMQ successfully. Waiting for messages...")
                async for message in queue:
                    async with message.process():
                        image_url = message.body.decode().strip().strip('"')
                        logger.info(f"Received image URL for processing: {image_url}")
                        try:
                            result = await process_image(image_url)
                            logger.info(f"Image processed with result: {result}")
                        except HTTPException as e:
                            logger.error(f"Failed to process image: {e.detail}")
            break
        except Exception as e:
            attempt += 1
            logger.error(f"Failed to connect or declare queue in RabbitMQ: {str(e)}")
            if attempt < max_retries:
                logger.info(f"Retrying connection in {retry_delay} seconds... (Attempt {attempt}/{max_retries})")
                await asyncio.sleep(retry_delay)
            else:
                logger.error(f"Max retries reached. Could not connect to RabbitMQ.")
                break

async def main():
    consume_task = asyncio.create_task(consume())
    config = uvicorn.Config("main:app", host="0.0.0.0", port=8111, log_level="info")
    server = uvicorn.Server(config)
    await asyncio.gather(server.serve(), consume_task)

if __name__ == "__main__":
    asyncio.run(main())
