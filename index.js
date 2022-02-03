// Programmed by Matthew Mui, Oct 2021

require('dotenv').config();
const { Client, Intents} = require('discord.js');
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});
const fetch = require("node-fetch");

const TOKEN = process.env.TOKEN; // Your Discord bot's token
const RIOT_API = process.env.RIOT_API; // Your Riot Games Developer API
const PREFIX = "$l" // Desired prefix


client.on('ready', () => {
    console.info(`Logged in as ${client.user.tag}!`);
})

// When a message is sent
client.on("message", msg =>{
    // Check for bot prefix
    if (msg.content.startsWith(`${PREFIX}`)) {
        
        // Identify name as text after the parameter
        let name = msg.content.substring(PREFIX.length)
        findSummoner(name, msg);
    }
})

// Search for summoner ID based on username, then calls summonerStats
async function findSummoner(name, msg){
    let link = `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${name}?api_key=${RIOT_API}`; // generate search link
    let siteContent = await fetch(link); // Fetches content from link
    let summonerData = await siteContent.json(); // Converts data to json

    console.info(summonerData);

    // If the page has data, reply with data.
    if (typeof summonerData.id != "undefined") {
        let botMessage = "Username: " + summonerData.name + "\n";
        botMessage += await summonerStats(summonerData.id, ); // Call summonerStats function to find more important stats
        msg.reply(botMessage);
    }
    else {
        msg.reply("Error! Most likely invalid username"); 
    }

    return;
}

// Searches for solo/duo stats of summoner and returns string of basic stats
async function summonerStats(id)
{
    let link = `https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/${id}?api_key=${RIOT_API}`;
    let siteContent = await fetch(link);
    let summonerData = await siteContent.json();
    let rankedInfo = "";
    
    if(summonerData.length == 0) { // If player has no ranked data
        rankedInfo += "Player does not have solo/duo ranked data from this season.";
    }

    else if (summonerData[0].queueType == "RANKED_SOLO_5x5") {
        rankedInfo += "Rank (Solo/Duo): " + summonerData[0].tier + " " + summonerData[0].rank + "\nWin/Loss: " + summonerData[0].wins + " - " + summonerData[0].losses 
        + " | " + Math.round(parseInt(summonerData[0].wins) / (parseInt(summonerData[0].wins) + parseInt(summonerData[0].losses)) * 1000) / 10 + "%";
    }

    else if (summonerData.length == 1) { // To prevent from searching an empty part of the json. length 1 means we've already searched the only possible data.
        rankedInfo += "Player does not have solo/duo ranked data.";
    }

    else if (summonerData[1].queueType == "RANKED_SOLO_5x5"){
        rankedInfo += "Rank (Solo/Duo): " + summonerData[1].tier + " " + summonerData[1].rank + "\nWin/Loss: " + summonerData[1].wins + " - " + summonerData[1].losses
        + " | " + Math.round(parseInt(summonerData[1].wins) / (parseInt(summonerData[1].wins) + parseInt(summonerData[1].losses)) * 1000) / 10 + "%";
    }

    else {
        rankedInfo += "Error finding player ranked information.";
    }
    
    return rankedInfo;
}

client.login(TOKEN);