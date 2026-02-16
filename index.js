require('dotenv').config();
const fs = require('fs').promises;

const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

//const cheeseTouchRoleID = '1470487754809807034';
const cheeseTouchRoleID = '1472731714882244771';

async function saveData(data) {
    await fs.writeFile('./stats.json', JSON.stringify(data, null, 4));
}

async function getData() {
    const rawData = await fs.readFile('./stats.json', 'utf8');
    return JSON.parse(rawData);
}

client.once('clientReady', () => {
    console.log(`Ready! Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {

    member = message.member;
    const userId = message.author.id;


    if (message.author.bot) return;

    try {
        if (message.reference) {
            const repliedMessage = await message.fetchReference();
            repliedMember = repliedMessage.member;

            if (repliedMember && repliedMember.roles.cache.has(cheeseTouchRoleID)) {
                let stats = await getData();

                await repliedMember.roles.remove(cheeseTouchRoleID);
                await member.roles.add(cheeseTouchRoleID);

                if (!stats[userId]) {
                    stats[userId] = { username: message.author.username, touches: 0 };
                }

                stats[userId].touches += 1;
                await saveData(stats);

                message.reply(`Oh no! **${message.author.username}** has the cheese touch 🧀! \nNobody reply to them!`)
                console.log(`Cheese touch transferred from ${message.author.username} to ${repliedMessage.author.username}`)
            }
        }
        if (message.channel.name == "bot-commands") {
            if (message.content[0] == "!") {
                const command = message.content.slice(1);
                if (command === "cheeseboard") {
                    let stats = await getData();

                    const leaderboard = Object.entries(stats)
                        .sort(([, a], [, b]) => b.touches - a.touches)
                        .slice(0, 10);

                    if (leaderboard.length === 0) {
                        return message.reply("The cheeseboard is empty... for now. 🧀");
                    }

                    let response = "## 🧀 **THE CHEESEBOARD** 🧀\n";

                    leaderboard.forEach(([userId, data], index) => {
                        const name = data.username || "Unknown User";
                        response += `${index + 1}. **${name}** - ${data.touches} touches\n`;
                    });

                    message.channel.send(response);
                }
            }
        }
    }
    catch (error) {
        console.error(error.message)
    }
});

client.login(process.env.DISCORD_TOKEN);