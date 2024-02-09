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
exports.registerCommands = void 0;
const discord_js_1 = require("discord.js");
const config_json_1 = __importDefault(require("../config.json"));
const _1 = require(".");
const chalk_1 = __importDefault(require("chalk"));
const commands = [
    {
        name: 'setchannel',
        description: 'Beállítja a státusz csatornát.',
        options: [
            {
                name: 'channel',
                description: 'A csatorna, amire beállítod a státusz csatornát.',
                type: discord_js_1.ApplicationCommandOptionType.Channel,
                required: true,
            },
        ],
    },
    {
        name: 'setrestarts',
        description: 'Beállítja a szerver újraindításokat.',
        options: [
            {
                name: 'restarts',
                description: 'A szerver újraindításainak időpontja. PL: 00:00, 06:00, 12:00, 18:00',
                type: discord_js_1.ApplicationCommandOptionType.String,
                required: true,
            },
        ],
    }
];
const rest = new discord_js_1.REST({ version: '10' }).setToken(config_json_1.default[0].Token);
function registerCommands() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(chalk_1.default.blue('Elkezdem a parancsok regisztrálását!'));
            const clientId = ((_a = _1.client.user) === null || _a === void 0 ? void 0 : _a.id) || '';
            yield rest.put(discord_js_1.Routes.applicationCommands(clientId), { body: commands });
            console.log(chalk_1.default.green('Sikeresen regisztráltam a parancsokat!'));
        }
        catch (error) {
            console.error(error);
        }
    });
}
exports.registerCommands = registerCommands;
