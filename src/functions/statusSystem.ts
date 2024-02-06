import { client, GetChannel, config } from "../index";
import { ActionRowBuilder, ActivityType, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { request } from "undici";
const fs = require("fs");
const QuickChart = require("quickchart-js");

let players: string[] = [];
let joinedPlayers;
let serverstatus: string;
let ip: string;
let refreshed = false;

export async function StatusSystemStart() {
    const channel = CheckChannel();
    const embed = new EmbedBuilder()
    .setTitle(`${config.ServerName} ?/? játékos`)
    .setDescription("Éppen indul a bot")
    .addFields(
        { name: `Állapot :construction_worker:`, value: "Éppen indul a bot", inline: true },
        { name: "Legutoljára frissítve", value: `${time(Date.now(), TimeFormat.LongTime)}`}
    )
    .setColor("Grey")
    .setThumbnail(client.guilds.cache.first()!.iconURL()!)
    .setFooter({text: 'A botot MedveMarci készitette'});
    client.user?.setActivity(`${config.ServerName}`, { type: ActivityType.Watching });
    const lmessage = config;
    channel?.messages.fetch({ limit: 1 }).then(async messages => {
        let lastMessage = messages.first();
        if (lastMessage == null) {
            const message = await channel?.send({ embeds: [ embed ] });
            lastMessage = message;
            const config = readConfigStats();
            config[0].MessageID = message?.id;
            try {
                fs.writeFileSync(`./config.json`, JSON.stringify(config, null, 2));
            } catch (e) {
                console.log(`Hiba a file írásakor `, e);
            }
            await StatusSystem();
        } else
        if (lmessage.MessageID === lastMessage?.id) {
            const statusmessage = await channel?.messages.fetch(lmessage.MessageID);
            await statusmessage?.edit({ embeds: [ embed ] });
            const config = readConfigStats();
            config[0].MessageID = channel?.messages.cache.last()?.id;
            try {
                fs.writeFileSync(`./config.json`, JSON.stringify(config, null, 2));
            } catch (e) {
                console.log(`Hiba a file írásakor `, e);
            }
            await StatusSystem();
        } else {
            const message = await channel?.send({ embeds: [ embed ] });
            const config = JSON.parse(fs.readFileSync(`./config.json`, "utf-8"));
            config.MessageID = message?.id;
            try {
                fs.writeFileSync(`./config.json`, JSON.stringify(config, null, 2));
            } catch (e) {
                console.log(`Hiba a file írásakor `, e);
            }
            await StatusSystem();
        }
    });
}


async function StatusSystem() {
    const now = new Date();
    if (now.getHours() === 0 && config.MostPlayer.Count !== 0 && refreshed === false) {
        refreshed = true;
        const configData = readConfigStats();
        configData[0].MostPlayer.Count = 0;
        await fs.writeFileSync('./config.json', JSON.stringify(configData, null, 2));
    }
    if (now.getHours() !== 0) {
        refreshed = false;
    }
    const lmessage = readConfigStats()[0];
    const channel = CheckChannel();
    if (channel?.id !== lmessage.StatusChannelId) {
        StatusSystemStart();
    }
    const url = `http://${config.ServerIP}:${config.ServerPort}`;
    const row = new ActionRowBuilder<ButtonBuilder>();
    const addButtons = (buttonConfig: any) => {
        if (buttonConfig.Enabled) {
            const button = new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel(buttonConfig.Label)
                .setURL(buttonConfig.URL);
            row.addComponents(button);
        }
    };
    addButtons(config.Buttons.Button);
    addButtons(config.Buttons.Button1);
    addButtons(config.Buttons.Button2);
    addButtons(config.Buttons.Button3);
    addButtons(config.Buttons.Button4);
    try {
        players = [];
        const json = await (await request(`${url}/info.json`, { method: "GET" })).body.json();
        const player = await (await request(`${url}/players.json`, { method: "GET" })).body.json();
        if (player.length === 0) {
            players = [ "Jelenleg nincs játékos a szerveren" ];
        } else {
            player.forEach((name: any) => {
                players.push("`" + `${name.name}` + "`");
            });
        }
        joinedPlayers = players.join(", ");
        if (joinedPlayers.length > 4096) {
            joinedPlayers = joinedPlayers.substring(0, 4093);
        }
        const chart = new QuickChart();
        const stats = readSavedStats().filter(e => {
            const date = new Date(e.time);
            return date.getTime() > Date.now() - 1000 * 60 * 60 * 24;
        });
        const configData = readConfigStats();
        if (player.length > configData[0].MostPlayer.Count) {
            configData[0].MostPlayer.Count = player.length;
            fs.writeFileSync('./config.json', JSON.stringify(configData, null, 2));
        }
        configData[0].MaxPlayers = parseInt(json.vars.sv_maxClients);
        try {
            fs.writeFileSync(`./config.json`, JSON.stringify(configData, null, 2));
        } catch (e) {
            console.log(`Hiba a file írásakor `, e);
        }
        const config = configData[0];
        const currentPlayerCount = parseInt(player.length);
        const now = new Date();
        if (!isNaN(currentPlayerCount) && (stats.length === 0 || new Date(stats[stats.length - 1].time).getUTCHours() !== now.getUTCHours()))
            stats.push({ count: currentPlayerCount, time: now.toISOString() });
        stats.length = Math.min(stats.length, 24);
        try {
            fs.writeFileSync(`./chartData.json`, JSON.stringify(stats));
        } catch (e) {
            console.log(`Hiba a file írásakor `, e);
        }
        const times = stats.map(e => `${new Date(e.time).getHours()}:00`);
        const playersChart = stats.map(e => e.count);
        const maxPlayers = parseInt(json.vars.sv_maxClients);
        if (Math.max(...playersChart) > configData[0].MostPlayer.Count) {
            const cd = readConfigStats();
            cd[0].MostPlayer.Count = Math.max(...playersChart);
            fs.writeFileSync('./config.json', JSON.stringify(cd, null, 2));
        }
        chart.setConfig({
            type: "line",
            data: {
                labels: times,
                datasets: [
                    {
                        backgroundColor: config.Colors.BackgroundColor,
                        borderColor: config.Colors.BorderColor,
                        data: playersChart,
                        label: "Játékosok",
                        fill: "start"
                    }
                ]
            },
            options: {
                title: {
                    text: config.ServerName,
                    display: true
                },
                scales: {
                    xAxes: [
                        {
                            gridLines: {
                                color: "rgba(200, 200, 200, 0.3)"
                            }
                        }
                    ],
                    yAxes: [
                        {
                            ticks: {
                                min: 0,
                                max: maxPlayers,
                                stepSize: 5
                            },
                            gridLines: {
                                color: "rgba(200, 200, 200, 0.3)"
                            }
                        }
                    ]
                }
            }
        }).setBackgroundColor(config.Colors.OnlineBackgroundColor);
        if (config.Whitelist === true) {
            serverstatus = "Whitelist bekapcsolva :lock:";
            ip = "Nem elérhető";
        } else {
            serverstatus = "🟢 Online";
            ip = `${config.ServerIP} :electric_plug:`;
        }
        const averagePlayer = Math.round((playersChart.reduce((a, b) => a + b, 0) / playersChart.filter((e: any) => e !== 0).length) || 0);
        const embed = new EmbedBuilder()
        .setTitle(`${config.ServerName} ${player.length}/${json.vars.sv_maxClients} játékos`)
        .setDescription(`${joinedPlayers}`)
        .addFields(
            { name: `**STÁTUSZ**`, value: `${serverstatus}`, inline: true },
            { name: `**IP** :telescope:`, value: `${ip}`, inline: true }
        )
        .setColor("Green")
        .setImage(`${chart.getUrl()}`)
        .setThumbnail(client.guilds.cache.first()!.iconURL()!)
        .setFooter({text: 'A botot MedveMarci készitette'})
        .setImage(`${chart.getUrl()}`);
        client.user?.setActivity(`${player.length}/${json.vars.sv_maxClients} játékos elérhető.`, { type: ActivityType.Watching });
        if (config.AveragePlayer === true && averagePlayer !== 0) {
            embed.addFields(
                {name: "\u200b", value: "\u200b"},
                { name: 'Átlagos játékosok az elmúlt napban', value: `${averagePlayer}`, inline: true}
                );
        }
        if (config.MostPlayer.Enabled === true && config.MostPlayer.Count !== 0) {
            embed.addFields({name: "Legtöbb játékosok az elmúlt napban", value: `${config.MostPlayer.Count}`, inline: true});
        }
        embed.addFields({name: "Legutoljára frissítve", value: `${time(Date.now(), TimeFormat.LongTime)}`});
        const lastMessage = await channel?.messages.fetch(lmessage.MessageID);
        if (config.Buttons.Button.Enabled || config.Buttons.Button1.Enabled || config.Buttons.Button2.Enabled || config.Buttons.Button3.Enabled || config.Buttons.Button4.Enabled) {
            await lastMessage?.edit({ embeds: [ embed ], components: [ row ] });
        }
        else {
            await lastMessage?.edit({ embeds: [ embed ] });
        }
    } catch (e) {
        console.log(e)
        const chart = new QuickChart();
        const stats = readSavedStats().filter(e => {
            const date = new Date(e.time);
            return date.getTime() > Date.now() - 1000 * 60 * 60 * 24;
        });
        const currentPlayerCount = 0;
        const now = new Date();
        if (!isNaN(currentPlayerCount) && (stats.length === 0 || new Date(stats[stats.length - 1].time).getUTCHours() !== now.getUTCHours()))
            stats.push({ count: currentPlayerCount, time: now.toISOString() });
        stats.length = Math.min(stats.length, 24);
        try {
            fs.writeFileSync(`./chartData.json`, JSON.stringify(stats));
        } catch (e) {
            console.log(`Hiba a file írásakor `, e);
        }
        const times = stats.map(e => `${new Date(e.time).getHours()}:00`);
        const playersChart = stats.map(e => e.count);
        const maxPlayers = parseInt(config.MaxPlayers);
        chart.setConfig({
            type: "line",
            data: {
                labels: times,
                datasets: [
                    {
                        backgroundColor: config.Colors.BackgroundColor,
                        borderColor: config.Colors.BorderColor,
                        data: playersChart,
                        label: "Játékosok",
                        fill: "start"
                    }
                ]
            },
            options: {
                title: {
                    text: config.ServerName,
                    display: true
                },
                scales: {
                    xAxes: [
                        {
                            gridLines: {
                                color: "rgba(200, 200, 200, 0.3)"
                            }
                        }
                    ],
                    yAxes: [
                        {
                            ticks: {
                                min: 0,
                                max: maxPlayers,
                                stepSize: 5
                            },
                            gridLines: {
                                color: "rgba(200, 200, 200, 0.3)"
                            }
                        }
                    ]
                }
            }
        }).setBackgroundColor(config.Colors.OfflineBackgroundColor);
        const mostPlayer = Math.max(...playersChart);
        const averagePlayer = Math.round((playersChart.reduce((a, b) => a + b, 0) / playersChart.filter((e: any) => e !== 0).length) || 0);
        if (config.Whitelist === true) {
            serverstatus = "Whitelist bekapcsolva :lock:";
            ip = "Nem elérhető";
        } else {
            serverstatus = "🔴 Offline";
            ip = `${config.ServerIP} :electric_plug:`;
        }
        client.user?.setActivity(`A szerver offline`, { type: ActivityType.Watching });
        const embed = new EmbedBuilder()
        .setTitle(`${config.ServerName} ?/${maxPlayers} játékos`)
        .addFields(
            { name: `**STÁTUSZ**`, value: `${serverstatus}`, inline: true },
            { name: `**IP** :telescope:`, value: `${ip}`, inline: true }
        )
        .setColor("Red")
        .setImage(`${chart.getUrl()}`)
        .setThumbnail(client.guilds.cache.first()!.iconURL()!)
        .setFooter({text: 'A botot MedveMarci készitette'});
        if (config.AveragePlayer === true && averagePlayer !== 0) {
            embed.addFields(
                {name: "\u200b", value: "\u200b"},
                { name: 'Átlagos játékosok az elmúlt napban', value: `${averagePlayer}`, inline: true}
                );
        }
        if (config.MostPlayer.Enabled === true && mostPlayer !== 0) {
            embed.addFields({name: "Legtöbb játékosok az elmúlt napban", value: `${mostPlayer}`, inline: true});
        }
        embed.addFields({name: "Legutoljára frissítve", value: `${time(Date.now(), TimeFormat.LongTime)}`});

        const lastMessage = await channel?.messages.fetch(lmessage.MessageID);
        if (config.Buttons.Button.Enabled || config.Buttons.Button1.Enabled || config.Buttons.Button2.Enabled || config.Buttons.Button3.Enabled || config.Buttons.Button4.Enabled) {
            await lastMessage?.edit({ embeds: [ embed ], components: [ row ] });
        }
        else {
            await lastMessage?.edit({ embeds: [ embed ], components: [] });
        }
    } finally {
        setTimeout(StatusSystem, 5000);
    }
}

function readSavedStats() {
    try {
        const path = `./chartData.json`;
        const content = fs.existsSync(path) ? fs.readFileSync(path, "utf-8") : "[]";
        const json = JSON.parse(content);
        return Array.isArray(json) ? json : [];
    } catch (e) {
        console.log(`Hiba a file olvasásakor `, e);
        return [];
    }
}

function readConfigStats() {
    try {
        const path = `./config.json`;
        const content = fs.existsSync(path) ? fs.readFileSync(path, "utf-8") : "[]";
        const json = JSON.parse(content);
        return json
    } catch (e) {
        console.log(`Hiba a file olvasásakor `, e);
        return [];
    }
}

function CheckChannel() {
    const config = readConfigStats()[0];
    const channel = GetChannel(config.StatusChannelId!);
    if (channel == null) {
        console.log("A csatorna nem található!");
        return;
    }
    return channel;
}

function now(format: TimeFormat = TimeFormat.ShortDateTime): string {
    return time(Date.now(), format);
}

function time(dateValue: number, format: TimeFormat = TimeFormat.ShortDateTime): string {
    return `<t:${Math.floor(dateValue / 1000)}:${format}>`;
}

enum TimeFormat {
    ShortTime = "t",
    LongTime = "T",
    ShortDate = "d",
    LongDate = "D",
    ShortDateTime = "f",
    LongDateTime = "F",
    Relative = "R"
}