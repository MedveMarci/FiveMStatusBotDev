"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetStatus = exports.GetChannel = exports.StatusSystemStart = void 0;
const chalk_1 = __importDefault(require("chalk"));
const index_1 = require("./index");
const discord_js_1 = require("discord.js");
const undici_1 = require("undici");
const fs = require("fs");
const QuickChart = require("quickchart-js");
let status = true;
let players = [];
let joinedPlayers;
let serverstatus;
let ip;
let refreshed = false;
function StatusSystemStart() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const channel = CheckChannel();
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle(`${index_1.config.ServerName} ?/? játékos`)
                .setDescription("Éppen indul a bot")
                .addFields({ name: `Állapot :construction_worker:`, value: "Éppen indul a bot", inline: true }, { name: "Legutoljára frissítve", value: `${time(Date.now(), TimeFormat.LongTime)}` })
                .setColor("Grey")
                .setThumbnail(index_1.client.guilds.cache.first().iconURL())
                .setFooter({ text: 'A botot MedveMarci készitette' });
            (_a = index_1.client.user) === null || _a === void 0 ? void 0 : _a.setActivity(`${index_1.config.ServerName}`, { type: discord_js_1.ActivityType.Watching });
            const lmessage = index_1.config;
            channel === null || channel === void 0 ? void 0 : channel.messages.fetch({ limit: 1 }).then((messages) => __awaiter(this, void 0, void 0, function* () {
                var _b, _c;
                let lastMessage = messages.first();
                if (lastMessage == null) {
                    const message = yield (channel === null || channel === void 0 ? void 0 : channel.send({ embeds: [embed] }));
                    lastMessage = message;
                    const config = readConfigStats();
                    config[0].MessageID = message === null || message === void 0 ? void 0 : message.id;
                    try {
                        fs.writeFileSync(`./config.json`, JSON.stringify(config, null, 2));
                    }
                    catch (e) {
                        console.log(`Hiba a file írásakor `, e);
                    }
                    yield StatusSystem();
                }
                else if (lmessage.MessageID === (lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.id)) {
                    const statusmessage = yield (channel === null || channel === void 0 ? void 0 : channel.messages.fetch(lmessage.MessageID));
                    yield (statusmessage === null || statusmessage === void 0 ? void 0 : statusmessage.edit({ embeds: [embed] }));
                    const config = readConfigStats();
                    config[0].MessageID = (_b = channel === null || channel === void 0 ? void 0 : channel.messages.cache.last()) === null || _b === void 0 ? void 0 : _b.id;
                    try {
                        fs.writeFileSync(`./config.json`, JSON.stringify(config, null, 2));
                    }
                    catch (e) {
                        console.log(`Hiba a file írásakor `, e);
                    }
                    yield StatusSystem();
                }
                if (lastMessage.author.id === ((_c = index_1.client.user) === null || _c === void 0 ? void 0 : _c.id)) {
                    const config = JSON.parse(fs.readFileSync(`./config.json`, "utf-8"));
                    config[0].MessageID = lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.id;
                    try {
                        fs.writeFileSync(`./config.json`, JSON.stringify(config, null, 2));
                    }
                    catch (e) {
                        console.log(`Hiba a file írásakor `, e);
                    }
                    yield StatusSystem();
                }
                else {
                    const message = yield (channel === null || channel === void 0 ? void 0 : channel.send({ embeds: [embed] }));
                    const config = readConfigStats();
                    config[0].MessageID = message === null || message === void 0 ? void 0 : message.id;
                    try {
                        fs.writeFileSync(`./config.json`, JSON.stringify(config, null, 2));
                    }
                    catch (e) {
                        console.log(`Hiba a file írásakor `, e);
                    }
                    yield StatusSystem();
                }
            }));
        }
        catch (e) {
            console.log(e);
            const now = new Date();
            if (now.getHours() === 0 && index_1.config.MostPlayer.Count !== 0 && refreshed === false) {
                refreshed = true;
                const configData = readConfigStats();
                configData[0].MostPlayer.Count = 0;
                yield fs.writeFileSync('./config.json', JSON.stringify(configData, null, 2));
            }
            if (now.getHours() !== 0) {
                refreshed = false;
            }
            const lmessage = readConfigStats()[0];
            const channel = CheckChannel();
            if ((channel === null || channel === void 0 ? void 0 : channel.id) !== lmessage.StatusChannelId) {
                StatusSystemStart();
            }
            const row = new discord_js_1.ActionRowBuilder();
            const addButtons = (buttonConfig) => {
                if (buttonConfig.Enabled) {
                    const button = new discord_js_1.ButtonBuilder()
                        .setStyle(discord_js_1.ButtonStyle.Link)
                        .setLabel(buttonConfig.Label)
                        .setURL(buttonConfig.URL);
                    row.addComponents(button);
                }
            };
            addButtons(index_1.config.Buttons.Button);
            addButtons(index_1.config.Buttons.Button1);
            addButtons(index_1.config.Buttons.Button2);
            addButtons(index_1.config.Buttons.Button3);
            addButtons(index_1.config.Buttons.Button4);
        }
    });
}
exports.StatusSystemStart = StatusSystemStart;
function StatusSystem() {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const now = new Date();
        if (now.getHours() === 0 && index_1.config.MostPlayer.Count !== 0 && refreshed === false) {
            refreshed = true;
            const configData = readConfigStats();
            configData[0].MostPlayer.Count = 0;
            yield fs.writeFileSync('./config.json', JSON.stringify(configData, null, 2));
        }
        if (now.getHours() !== 0) {
            refreshed = false;
        }
        const lmessage = readConfigStats()[0];
        const channel = CheckChannel();
        if ((channel === null || channel === void 0 ? void 0 : channel.id) !== lmessage.StatusChannelId) {
            StatusSystemStart();
        }
        const url = `http://${index_1.config.ServerIP}:${index_1.config.ServerPort}`;
        const row = new discord_js_1.ActionRowBuilder();
        const addButtons = (buttonConfig) => {
            if (buttonConfig.Enabled) {
                const button = new discord_js_1.ButtonBuilder()
                    .setStyle(discord_js_1.ButtonStyle.Link)
                    .setLabel(buttonConfig.Label)
                    .setURL(buttonConfig.URL);
                row.addComponents(button);
            }
        };
        addButtons(index_1.config.Buttons.Button);
        addButtons(index_1.config.Buttons.Button1);
        addButtons(index_1.config.Buttons.Button2);
        addButtons(index_1.config.Buttons.Button3);
        addButtons(index_1.config.Buttons.Button4);
        if (status === true) {
            try {
                players = [];
                const json = yield (yield (0, undici_1.request)(`${url}/info.json`, { method: "GET" })).body.json();
                const player = yield (yield (0, undici_1.request)(`${url}/players.json`, { method: "GET" })).body.json();
                if (player.length === 0) {
                    players = ["Jelenleg nincs játékos a szerveren"];
                }
                else {
                    player.forEach((name) => {
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
                }
                catch (e) {
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
                }
                catch (e) {
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
                }
                else {
                    serverstatus = "🟢 Online";
                    ip = `${config.ServerIP} :electric_plug:`;
                }
                const averagePlayer = Math.round(playersChart.reduce((a, b) => a + b, 0) / playersChart.filter((e) => e !== 0).length || 0);
                const embed = new discord_js_1.EmbedBuilder()
                    .setTitle(`${config.ServerName} ${player.length}/${json.vars.sv_maxClients} játékos`)
                    .setDescription(`${joinedPlayers}`)
                    .addFields({ name: `**STÁTUSZ**`, value: `${serverstatus}`, inline: true }, { name: `**IP** :telescope:`, value: `${ip}`, inline: true }, { name: "\u200b", value: "\u200b" })
                    .setColor("Green")
                    .setImage(`${chart.getUrl()}`)
                    .setThumbnail(index_1.client.guilds.cache.first().iconURL())
                    .setFooter({ text: 'A botot MedveMarci készitette' })
                    .setImage(`${chart.getUrl()}`);
                (_a = index_1.client.user) === null || _a === void 0 ? void 0 : _a.setActivity(`${player.length}/${json.vars.sv_maxClients} játékos elérhető.`, { type: discord_js_1.ActivityType.Watching });
                if (config.AveragePlayer === true && averagePlayer !== 0) {
                    embed.addFields({ name: 'Átlagos játékosok az elmúlt napban', value: `${averagePlayer}`, inline: true });
                }
                if (config.MostPlayer.Enabled === true && config.MostPlayer.Count !== 0) {
                    embed.addFields({ name: "Legtöbb játékosok az elmúlt napban", value: `${config.MostPlayer.Count}`, inline: true });
                }
                if (GetRestarts().length > 0) {
                    embed.addFields({ name: "\u200b", value: "\u200b" }, { name: "Szerver újraindítások:", value: GetRestarts().join("\n"), inline: true });
                }
                embed.addFields({ name: "Legutoljára frissítve", value: `${time(Date.now(), TimeFormat.LongTime)}`, inline: true });
                const lastMessage = yield (channel === null || channel === void 0 ? void 0 : channel.messages.fetch(lmessage.MessageID));
                if (config.Buttons.Button.Enabled || config.Buttons.Button1.Enabled || config.Buttons.Button2.Enabled || config.Buttons.Button3.Enabled || config.Buttons.Button4.Enabled) {
                    yield (lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.edit({ embeds: [embed], components: [row] }));
                }
                else {
                    yield (lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.edit({ embeds: [embed] }));
                }
            }
            catch (e) {
                console.log(e);
                const chart = new QuickChart();
                const stats = readSavedStats().filter(e => {
                    const date = new Date(e.time);
                    return date.getTime() > Date.now() - 1000 * 60 * 60 * 24;
                });
                const serverRestarts = index_1.config.ServerRestarts.map((restart) => {
                    const [hours, minutes] = restart.split(":").map(Number);
                    const restartDate = new Date();
                    restartDate.setHours(hours, minutes, 0, 0);
                    if (restartDate > new Date()) {
                        return time(restartDate.getTime(), TimeFormat.Relative);
                    }
                    else {
                        restartDate.setDate(restartDate.getDate() + 1);
                        return time(restartDate.getTime(), TimeFormat.ShortTime);
                    }
                });
                const currentPlayerCount = 0;
                const now = new Date();
                if (!isNaN(currentPlayerCount) && (stats.length === 0 || new Date(stats[stats.length - 1].time).getUTCHours() !== now.getUTCHours()))
                    stats.push({ count: currentPlayerCount, time: now.toISOString() });
                stats.length = Math.min(stats.length, 24);
                try {
                    fs.writeFileSync(`./chartData.json`, JSON.stringify(stats));
                }
                catch (e) {
                    console.log(`Hiba a file írásakor `, e);
                }
                const times = stats.map(e => `${new Date(e.time).getHours()}:00`);
                const playersChart = stats.map(e => e.count);
                const maxPlayers = parseInt(index_1.config.MaxPlayers);
                chart.setConfig({
                    type: "line",
                    data: {
                        labels: times,
                        datasets: [
                            {
                                backgroundColor: index_1.config.Colors.BackgroundColor,
                                borderColor: index_1.config.Colors.BorderColor,
                                data: playersChart,
                                label: "Játékosok",
                                fill: "start"
                            }
                        ]
                    },
                    options: {
                        title: {
                            text: index_1.config.ServerName,
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
                }).setBackgroundColor(index_1.config.Colors.OfflineBackgroundColor);
                const mostPlayer = Math.max(...playersChart);
                const averagePlayer = Math.round(playersChart.reduce((a, b) => a + b, 0) / playersChart.filter((e) => e !== 0).length || 0);
                if (index_1.config.Whitelist === true) {
                    serverstatus = "Whitelist bekapcsolva :lock:";
                    ip = "Nem elérhető";
                }
                else {
                    serverstatus = "🔴 Offline";
                    ip = `${index_1.config.ServerIP} :electric_plug:`;
                }
                (_b = index_1.client.user) === null || _b === void 0 ? void 0 : _b.setActivity(`A szerver offline`, { type: discord_js_1.ActivityType.Watching });
                const embed = new discord_js_1.EmbedBuilder()
                    .setTitle(`${index_1.config.ServerName} ?/${maxPlayers} játékos`)
                    .addFields({ name: `**STÁTUSZ**`, value: `${serverstatus}`, inline: true }, { name: `**IP** :telescope:`, value: `${ip}`, inline: true })
                    .setColor("Red")
                    .setImage(`${chart.getUrl()}`)
                    .setThumbnail(index_1.client.guilds.cache.first().iconURL())
                    .setFooter({ text: 'A botot MedveMarci készitette' });
                if (index_1.config.AveragePlayer === true && averagePlayer !== 0) {
                    embed.addFields({ name: "\u200b", value: "\u200b" }, { name: 'Átlagos játékosok az elmúlt napban', value: `${averagePlayer}`, inline: true });
                }
                if (index_1.config.MostPlayer.Enabled === true && mostPlayer !== 0) {
                    embed.addFields({ name: "Legtöbb játékosok az elmúlt napban", value: `${mostPlayer}`, inline: true });
                }
                if (serverRestarts.length > 0) {
                    embed.addFields({ name: "Szerver újraindítások:", value: serverRestarts.join("\n"), inline: true });
                }
                embed.addFields({ name: "Legutoljára frissítve", value: `${time(Date.now(), TimeFormat.LongTime)}` });
                const lastMessage = yield (channel === null || channel === void 0 ? void 0 : channel.messages.fetch(lmessage.MessageID));
                if (index_1.config.Buttons.Button.Enabled || index_1.config.Buttons.Button1.Enabled || index_1.config.Buttons.Button2.Enabled || index_1.config.Buttons.Button3.Enabled || index_1.config.Buttons.Button4.Enabled) {
                    yield (lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.edit({ embeds: [embed], components: [row] }));
                }
                else {
                    yield (lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.edit({ embeds: [embed], components: [] }));
                }
            }
            finally {
                setTimeout(StatusSystem, 5000);
            }
        }
        else {
            try {
                const embed = new discord_js_1.EmbedBuilder()
                    .setTitle(`${index_1.config.ServerName} ?/? játékos`)
                    .setDescription("A státusz ki lett kapcsolva.")
                    .addFields({ name: `Állapot :construction_worker:`, value: "A státusz ki lett kapcsolva.", inline: true }, { name: "Legutoljára frissítve", value: `${time(Date.now(), TimeFormat.LongTime)}` })
                    .setColor("Grey")
                    .setThumbnail(index_1.client.guilds.cache.first().iconURL())
                    .setFooter({ text: 'A botot MedveMarci készitette' });
                (_c = index_1.client.user) === null || _c === void 0 ? void 0 : _c.setActivity(`${index_1.config.ServerName}`, { type: discord_js_1.ActivityType.Watching });
                const lastMessage = yield (channel === null || channel === void 0 ? void 0 : channel.messages.fetch(lmessage.MessageID));
                yield (lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.edit({ embeds: [embed], components: [] }));
            }
            catch (error) {
                console.log(chalk_1.default.redBright("Hiba a státusz frissítésekor!"), error);
            }
            finally {
                setTimeout(StatusSystem, 5000);
            }
        }
    });
}
function readSavedStats() {
    try {
        const path = `./chartData.json`;
        const content = fs.existsSync(path) ? fs.readFileSync(path, "utf-8") : "[]";
        const json = JSON.parse(content);
        return Array.isArray(json) ? json : [];
    }
    catch (e) {
        console.log(`Hiba a file olvasásakor `, e);
        return [];
    }
}
function readConfigStats() {
    try {
        const path = `./config.json`;
        const content = fs.existsSync(path) ? fs.readFileSync(path, "utf-8") : "[]";
        const json = JSON.parse(content);
        return json;
    }
    catch (e) {
        console.log(`Hiba a file olvasásakor `, e);
        return [];
    }
}
function CheckChannel() {
    const config = readConfigStats()[0];
    const channel = GetChannel(config.StatusChannelId);
    if (channel == null) {
        console.log("A csatorna nem található!");
        return;
    }
    return channel;
}
function time(dateValue, format = TimeFormat.ShortDateTime) {
    return `<t:${Math.floor(dateValue / 1000)}:${format}>`;
}
function GetChannel(id) {
    const guild = index_1.client.guilds.cache.first();
    const channel = guild === null || guild === void 0 ? void 0 : guild.channels.cache.get(`${id}`);
    return channel;
}
exports.GetChannel = GetChannel;
function SetStatus(status1) {
    status = status1;
}
exports.SetStatus = SetStatus;
function GetRestarts() {
    const config = readConfigStats()[0];
    const serverRestarts = config.ServerRestarts.map((restart) => {
        const [hours, minutes] = restart.split(":").map(Number);
        const restartDate = new Date();
        restartDate.setHours(hours, minutes, 0, 0);
        if (restartDate < new Date()) {
            restartDate.setDate(restartDate.getDate() + 1);
        }
        return restartDate.getTime();
    });
    serverRestarts.sort((a, b) => Math.abs(a - Date.now()) - Math.abs(b - Date.now()));
    const restartTimes = serverRestarts.map((restart) => time(restart, TimeFormat.Relative));
    return restartTimes;
}
var TimeFormat;
(function (TimeFormat) {
    TimeFormat["ShortTime"] = "t";
    TimeFormat["LongTime"] = "T";
    TimeFormat["ShortDate"] = "d";
    TimeFormat["LongDate"] = "D";
    TimeFormat["ShortDateTime"] = "f";
    TimeFormat["LongDateTime"] = "F";
    TimeFormat["Relative"] = "R";
})(TimeFormat || (TimeFormat = {}));
