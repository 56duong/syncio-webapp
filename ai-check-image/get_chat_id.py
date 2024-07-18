import requests

# Replace with your bot token
TOKEN = '6478734755:AAHwesjyBmtIVaQsYafxvqGKeWldDbwPrg0'

# Get updates from the bot
url = f'https://api.telegram.org/bot{TOKEN}/getUpdates'
response = requests.get(url)
data = response.json()

# Print the chat ID from the latest message
if data['ok']:
    if len(data['result']) == 0:
        print("No messages found. Make sure you have sent a message to the bot.")
    for result in data['result']:
        print(f"Chat ID: {result['message']['chat']['id']}")
else:
    print("Failed to get updates from the bot")
