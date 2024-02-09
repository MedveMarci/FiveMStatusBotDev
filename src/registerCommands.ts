import { ApplicationCommandOptionType, REST, Routes } from 'discord.js';
import config from '../config.json';
import { client } from '.';
import chalk from 'chalk';

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
	}
];

const rest = new REST({ version: '10' }).setToken(config[0].Token);

export async function registerCommands() {
	try {
		console.log(chalk.blue('Elkezdem a parancsok regisztrálását!'));

		const clientId = client.user?.id || '';
		await rest.put(Routes.applicationCommands(clientId), { body: commands });
		console.log(chalk.green('Sikeresen regisztráltam a parancsokat!'));
	} catch (error) {
		console.error(error);
	}
}