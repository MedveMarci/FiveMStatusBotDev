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
const discord_js_1 = require("discord.js");
const chalk_1 = __importDefault(require("chalk"));
const client = new discord_js_1.Client({ intents: [discord_js_1.GatewayIntentBits.Guilds, discord_js_1.GatewayIntentBits.GuildPresences] });
const config = require("../config.json")[0];
const commands = [
    {
        name: "setchannel",
        description: "Beállítja a státusz csatornát.",
        options: [
            {
                name: "channel",
                description: "A csatorna, amire beállítod a státusz csatornát.",
                type: discord_js_1.ApplicationCommandOptionType.Channel,
                required: true,
            },
        ],
    },
    {
        name: "setrestarts",
        description: "Beállítja a szerver újraindításokat.",
        options: [
            {
                name: "restarts",
                description: "A szerver újraindításainak időpontja.",
                type: discord_js_1.ApplicationCommandOptionType.String,
                required: true,
            },
        ],
    },
    {
        name: "whitelist",
        description: "Whitelist be vagy ki kapcsolása.",
        options: [
            {
                name: "action",
                description: "Whitelist be vagy ki kapcsolása.",
                type: discord_js_1.ApplicationCommandOptionType.Boolean,
                required: true,
            },
        ],
    },
    {
        name: "setstatus",
        description: "A szerver státusz be vagy ki kapcsolása.",
        options: [
            {
                name: "action",
                description: "A szerver státusz be vagy ki kapcsolása.",
                type: discord_js_1.ApplicationCommandOptionType.Boolean,
                required: true,
            },
        ],
    }
];
const rest = new discord_js_1.REST({ version: "10" }).setToken(config.Token);
client.on(discord_js_1.Events.ClientReady, () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log(chalk_1.default.yellow("Elkezdem a parancsok regisztrálását!"));
        try {
            const clientId = ((_a = client.user) === null || _a === void 0 ? void 0 : _a.id) || "";
            yield rest.put(discord_js_1.Routes.applicationCommands(clientId), { body: commands });
        }
        catch (error) {
            console.error(error);
        }
        console.log(chalk_1.default.greenBright("Sikeresen regisztráltam a parancsokat!"));
        process.exit(1);
    }
    catch (e) {
        console.log(e);
        console.log(chalk_1.default.red("Hibát találtam! Konzolban találod a hibakódot"));
    }
}));
client.login(config.Token).then().catch(e => {
    console.log(chalk_1.default.red("Hiba történt a bejelentkezés során!"));
    console.log(e);
});
