import { Client, Events, GatewayIntentBits, TextChannel } from "discord.js";
import chalk from "chalk";
import { SetStatus, StatusSystemStart } from "./functions/statusSystem";
import fs from "fs";
export { client, config }

const client = new Client({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildPresences ] });
const config = require("../config.json")[0];

const requiredFields = [
    { field: "ServerIP", message: "Kérlek add meg a szerver IP-jét a config.json fájlban!" },
    { field: "ServerPort", message: "Kérlek add meg a szerver portját a config.json fájlban!" },
    { field: "ServerName", message: "Kérlek add meg a szerver nevét a config.json fájlban!" },
    { field: "Token", message: "Kérlek add meg a botod tokenjét a config.json fájlban!" },
    { field: "StatusChannelId", message: "Kérlek add meg a csatorna ID-jét a config.json fájlban!" }
];
const missingFields = requiredFields.filter(({ field }) => config[field] === "");

if (missingFields.length > 0) {
    for (const { message } of missingFields) {
        console.log(chalk.red(message));
    }
    process.exit(1);
}

client.on(Events.ClientReady, async () => {
    if (config.Whitelist === "" || config.Whitelist !== false && config.Whitelist !== true) {
        console.log(chalk.yellow("Nem adtál meg whitelist beállítást a config.json fájlban, automatikusan be lesz kapcsolva!"));
    }
    if (client.guilds.cache.size > 1) {
        console.log(chalk.blue(
            "A bot megfelelő működés helye: " +
            client.guilds.cache.first()!.name
        ));
    }
    try {
        await StatusSystemStart();
        console.log(chalk.green(`${client.user?.username} sikeresen elindult!`));
    } catch (e) {
        console.log(e);
        console.log(chalk.red("Hibát találtam! Konzolban találod a hibakódot"));
    }
});

client.on(Events.InteractionCreate as any, async (interaction) => {
    if (!interaction.isCommand()) return;
    if (interaction.commandName === "setstatuschannel") {
        const channel = interaction.options.getChannel("channel", true);
        const config = JSON.parse(fs.readFileSync(`./config.json`, "utf-8"));
        config[0].StatusChannelId = channel.id;
        config[0].MessageID = "";
        fs.writeFileSync("./config.json", JSON.stringify(config, null, 2));
        try {
            await StatusSystemStart()
            await interaction.reply({ content: `A státusz csatorna sikeresen be lett állítva a ${channel} csatornára!`, ephemeral: true });
        } catch (e) {
            console.log(e)
        }
    }
    if (interaction.commandName === "setserverrestarts") {
        const restarts = interaction.options.getString("restarts", true);
        const restartTimes = restarts.split(", ");
        if (restartTimes.some((time: any) => !/^([01]\d|2[0-3]):([0-5]\d)$/.test(time))) {
            try {
                await interaction.reply({ content: `Nem megfelelő időpont formátum. Példa: 00:00, 12:00`, ephemeral: true });
            } catch (e) {
                console.log(e);
            }
            return;
        }
        const config = JSON.parse(fs.readFileSync(`./config.json`, "utf-8"));
        (config[0].ServerRestarts as any[]) = restartTimes;
        fs.writeFileSync("./config.json", JSON.stringify(config, null, 2));
        try {
            await interaction.reply({ content: `A szerver újraindítások sikeresen be lettek állítva!`, ephemeral: true });
        } catch (e) {
            console.log(e)
        }
    }
    if (interaction.commandName === "whitelist") {
        const action = interaction.options.getBoolean("action", true);
        const config = JSON.parse(fs.readFileSync(`./config.json`, "utf-8"));
        config[0].Whitelist = action;
        fs.writeFileSync("./config.json", JSON.stringify(config, null, 2));
        try {
            if (action === true) {
                await interaction.reply({ content: `A whitelist sikeresen be lett kapcsolva!`, ephemeral: true });
            }
            if (action === false) {
                await interaction.reply({ content: `A whitelist sikeresen ki lett kapcsolva!`, ephemeral: true });
            }
        } catch (e) {
            console.log(e)
        }
    }
    if (interaction.commandName === "setstatus") {
        const action = interaction.options.getBoolean("action", true);
        SetStatus(action)
        try {
            if (action === true) {
                await interaction.reply({ content: `A szerver státusz sikeresen be lett kapcsolva!`, ephemeral: true });
            }
            if (action === false) {
                await interaction.reply({ content: `A szerver státusz sikeresen ki lett kapcsolva!`, ephemeral: true });
            }
        } catch (e) {
            console.log(e)
        }
    }
})

client.login(config.Token).then().catch(e => {
    console.log(chalk.red("Hiba történt a bejelentkezés során!"));
    console.log(e);
});