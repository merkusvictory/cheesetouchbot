require('dotenv').config();
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



client.once('clientReady', () => {
    console.log(`Ready! Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {

    member = message.member;

    if (message.author.bot) return;

    try {
        if (message.reference) {
            const repliedMessage = await message.fetchReference();
            repliedMember = repliedMessage.member;

            if (repliedMember && repliedMember.roles.cache.has(cheeseTouchRoleID)) {
                await repliedMember.roles.remove(cheeseTouchRoleID);
                await member.roles.add(cheeseTouchRoleID);
                message.reply(`Oh no! **${message.author.username}** has the cheese touch 🧀! \nNobody reply to them!`)
                console.log(`Cheese touch transferred from ${message.author.username} to ${repliedMessage.author.username}`)
            }
        }
        if (message.channel.name == "bot-commands") {
            if (message.content[0] == "!") {
                
            }
        }
    }
    catch (error){
        console.error(error.message)
    }
});

client.login(process.env.DISCORD_TOKEN);