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

const cheeseTouchRoleID = '1470487754809807034';
// const cheeseTouchRoleID = '1472731714882244771'; 

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

    let repliedMember = null;

    if (message.reference) {
        try {
            const repliedMessage = await message.fetchReference();
            repliedMember = repliedMessage.member;
        } catch (e) { console.log("Reference not found"); }
    } else if (message.mentions.members.size > 0) {
        repliedMember = message.mentions.members.first();
    }

    if (repliedMember && repliedMember.id !== message.author.id) {
        if (repliedMember.roles.cache.has(cheeseTouchRoleID)) {
            try {
                let stats = await getData();

                await repliedMember.roles.remove(cheeseTouchRoleID);
                await member.roles.add(cheeseTouchRoleID);

                if (!stats[userId]) {
                    stats[userId] = { username: message.author.username, touches: 0 };
                }

                stats[userId].touches += 1;
                await saveData(stats);

                message.reply(`Oh no! **${message.author.username}** has the cheese touch 🧀! \nNobody reply to them!`);
                console.log(`Cheese touch transferred from ${repliedMember.user.username} to ${message.author.username}`);

            } catch (e) {
                console.error(e.message);
            }
        }
    }
    if (message.channel.name == "bot-commands") {
        try {
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
        } catch (e) {
            console.log(error.message);
        }
    }
}
);

client.login(process.env.DISCORD_TOKEN);