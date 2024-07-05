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
# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
nude_detector = NudeDetector()

# Load config file
with open("config.json", "r") as config_file:
    config = json.load(config_file)

@app.get("/")
def read_root():
    return {"Hello": "Syncio"}

@app.get("/verify-image/")
async def process_image(image_url: str):
    try:
        response = requests.get(image_url)
        response.raise_for_status() 
        image = Image.open(BytesIO(response.content))
        print("image opened successfully",image)
        image.save("image.jpg")
        sensitive_data = nude_detector.detect("image.jpg")
        print("sensitive_data",sensitive_data)
        os.remove("image.jpg")
        parsed_url = urlparse(image_url)
        query_params = parse_qs(parsed_url.query)
        post_id = query_params.get('postId', [None])[0]
        # return {"status": "success", "data": sensitive_data}

        nudity_detected = any(
            d['score'] > 0.5 for d in sensitive_data 
            if d['class'] in ['EXPLICIT_NUDITY', 'SUGGESTIVE','BELLY_EXPOSED' ,'FEMALE_BREAST_EXPOSED', 'ARMPITS_EXPOSED']
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
        await exchange.publish(
            aio_pika.Message(
                body=json.dumps(result_data).encode(),
                content_type='application/json'
            ),
            routing_key="image_verification_response_queue_spring"
        )
        logger.info(f"Sent image processing result back to SpringBoot: {result_data}")
async def consume():
    try:
        connection = await aio_pika.connect_robust(config["rabbitmq_url"])
        async with connection:
            channel = await connection.channel()
            queue = await channel.declare_queue(config["queu_image_verify"], durable=False)
            print("channel",queue)
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
    except Exception as e:
        logger.error(f"Failed to connect or declare queue in RabbitMQ: {str(e)}")

if __name__ == "__main__":
    try:
        # Create a new event loop and set it as the current loop
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        uvicorn.run("main:app", host="0.0.0.0", port=8111)
        # Create tasks on the new loop
        loop.create_task(consume())
        
        # Configure and run uvicorn with the new event loop
        uvicorn_config = uvicorn.Config(app=app, host=config["host"], port=int(config["port"]), loop="asyncio")
        server = uvicorn.Server(config=uvicorn_config)
        loop.run_until_complete(server.serve())
    finally:
        loop.close()
        logger.info("Server shut down and loop closed.")
