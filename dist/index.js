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
exports.GetChannel = exports.config = exports.client = void 0;
const discord_js_1 = require("discord.js");
const chalk_1 = __importDefault(require("chalk"));
const statusSystem_1 = require("./functions/statusSystem");
const config = require("../config.json")[0];
exports.config = config;
const fs_1 = __importDefault(require("fs"));
const client = new discord_js_1.Client({ intents: [discord_js_1.GatewayIntentBits.Guilds, discord_js_1.GatewayIntentBits.GuildPresences] });
exports.client = client;
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
        console.log(chalk_1.default.red(message));
    }
    process.exit(1);
}
client.on(discord_js_1.Events.ClientReady, () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (config.Whitelist === "" || config.Whitelist !== false && config.Whitelist !== true) {
        console.log(chalk_1.default.yellow("Nem adtál meg whitelist beállítást a config.json fájlban, automatikusan be lesz kapcsolva!"));
    }
    if (client.guilds.cache.size > 1) {
        console.log(chalk_1.default.blue("A bot megfelelő működés helye: " +
            client.guilds.cache.first().name));
    }
    try {
        yield (0, statusSystem_1.StatusSystemStart)();
        console.log(chalk_1.default.green(`${(_a = client.user) === null || _a === void 0 ? void 0 : _a.username} sikeresen elindult!`));
    }
    catch (e) {
        console.log(e);
        console.log(chalk_1.default.red("Hibát találtam! Konzolban találod a hibakódot"));
    }
}));
client.on(discord_js_1.Events.InteractionCreate, (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    if (!interaction.isCommand())
        return;
    if (interaction.commandName === "setstatuschannel") {
        const channel = interaction.options.getChannel("channel", true);
        const config = JSON.parse(fs_1.default.readFileSync(`./config.json`, "utf-8"));
        config[0].StatusChannelId = channel.id;
        config[0].MessageID = "";
        fs_1.default.writeFileSync("./config.json", JSON.stringify(config, null, 2));
        try {
            yield (0, statusSystem_1.StatusSystemStart)();
            yield interaction.reply({ content: `A státusz csatorna sikeresen be lett állítva a ${channel} csatornára!`, ephemeral: true });
        }
        catch (e) {
            console.log(e);
        }
    }
}));
function GetChannel(id) {
    const guild = client.guilds.cache.first();
    const channel = guild === null || guild === void 0 ? void 0 : guild.channels.cache.get(`${id}`);
    return channel;
}
exports.GetChannel = GetChannel;
client.login(config.Token).then(() => {
    console.log(chalk_1.default.green("Sikeresen bejelentkeztem!"));
}).catch(e => {
    console.log(chalk_1.default.red("Hiba történt a bejelentkezés során!"));
    console.log(e);
});
