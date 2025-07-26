# Whatsappbot

This is a WhatsApp bot integrated with the **Digiflazz API** that allows users to check their balance, view the pricelist, and perform transactions directly through WhatsApp. This bot is designed to make transactions smoother and more accessible for users who need to access Digiflazz services directly from WhatsApp.

## Features

- Get your current balance on Digiflazz.
- View the available products and their prices.
- Perform transactions services provided by Digiflazz.
- Support for multiple Digiflazz accounts, each linked to different WhatsApp groups.
- Each group can have its own benefits and discount rates, depending on the account linked to it.

## Prerequisites

- A WhatsApp account that can be used for the bot.
- An active Digiflazz account to use the API.
- Node.js and npm installed on your system.
- A stable internet connection.

## Installation

1. **Clone this repository to your system:**
```bash
git clone https://github.com/jswikarta/whatsappbot.git
cd whatsappbot
```

2. **Install the required dependencies:**
```bash
npm install
```

3. **Run the WhatsApp Bot:**
```bash
node index.js
```

## Connection & List Command

After run whatsappbot open your phone and scan whatsapp qr-code to connect whatsappbot. Here some command to use:

- Config Group : register whatsapp group
- Config add digiuser : register your digiflazz username
- Config add digikey : register your digiflazz production key

## License

This project is licensed under the MIT License.
