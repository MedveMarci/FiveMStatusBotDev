import { ApplicationCommandOptionType, Client, Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import chalk from 'chalk';

const client = new Client({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildPresences ] });
const config = require("../config.json")[0];


const commands = [
	{
		name: 'setchannel',
		description: 'Beállítja a státusz csatornát.',
		options: [
			{
				name: 'channel',
				description: 'A csatorna, amire beállítod a státusz csatornát.',
				type: ApplicationCommandOptionType.Channel,
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
				type: ApplicationCommandOptionType.String,
				required: true,
			},
		],
	},
	{
		name: 'whitelist',
		description: 'Whitelist be vagy ki kapcsolása.',
		options: [
			{
				name: 'action',
				description: 'Whitelist be vagy ki kapcsolása.',
				type: ApplicationCommandOptionType.Boolean,
				required: true,
			},
		],
	},
	{
		name: 'setstatus',
		description: 'A szerver státusz be vagy ki kapcsolása.',
		options: [
			{
				name: 'action',
				description: 'A szerver státusz be vagy ki kapcsolása.',
				type: ApplicationCommandOptionType.Boolean,
				required: true,
			},
		],
	}
];

const rest = new REST({ version: '10' }).setToken(config.Token);

client.on(Events.ClientReady, async () => {
    try {
		console.log(chalk.yellow("Elkezdem a parancsok regisztrálását!"));
		try {
			const clientId = client.user?.id || '';
			await rest.put(Routes.applicationCommands(clientId), { body: commands });
		} catch (error) {
			console.error(error);
		}
		console.log(chalk.greenBright("Sikeresen regisztráltam a parancsokat!"));
		process.exit(0);
    } catch (e) {
        console.log(e);
        console.log(chalk.red("Hibát találtam! Konzolban találod a hibakódot"));
    }
});

client.login(config.Token).then().catch(e => {
    console.log(chalk.red("Hiba történt a bejelentkezés során!"));
    console.log(e);
});