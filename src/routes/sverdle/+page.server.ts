import { fail } from '@sveltejs/kit';
import { Game } from './game';
import type { PageServerLoad, Actions } from './$types';
import * as serviceBindings from 'kube-service-bindings';
import * as oracledb from 'oracledb';

export const load = (({ cookies }) => {
	const game = new Game(cookies.get('sverdle'));

	return {
		/**
		 * The player's guessed words so far
		 */
		guesses: game.guesses,

		/**
		 * An array of strings like '__x_c' corresponding to the guesses, where 'x' means
		 * an exact match, and 'c' means a close match (right letter, wrong place)
		 */
		answers: game.answers,

		/**
		 * The correct answer, revealed if the game is over
		 */
		answer: game.answers.length >= 6 ? game.answer : null
	};
}) satisfies PageServerLoad;

export const actions = {
	/**
	 * Modify game state in reaction to a keypress. If client-side JavaScript
	 * is available, this will happen in the browser instead of here
	 */
	db: async () => {

		let connection;
		const rawBindingData = serviceBindings.getBinding();
		console.log(rawBindingData);

		const dbConfig = {
			user: rawBindingData['oracle-binding']['username'],
			password: rawBindingData['oracle-binding']['password'],
			connectString: rawBindingData['oracle-binding']['connectionString'],
			externalAuth: process.env.NODE_ORACLEDB_EXTERNALAUTH ? true : false,
		};

		console.log(dbConfig);
		
		try {
			// Get a non-pooled connection
			connection = await oracledb.getConnection(dbConfig);

			console.log('Connection was successful!');

		} catch (err) {
			console.error(err);
		} finally {
			if (connection) {
				try {
					await connection.close();
				} catch (err) {
					console.error(err);
				}
			}
		}
	},
	
	update: async ({ request, cookies }) => {
		const game = new Game(cookies.get('sverdle'));

		const data = await request.formData();
		const key = data.get('key');

		const i = game.answers.length;

		if (key === 'backspace') {
			game.guesses[i] = game.guesses[i].slice(0, -1);
		} else {
			game.guesses[i] += key;
		}

		cookies.set('sverdle', game.toString());
	},

	/**
	 * Modify game state in reaction to a guessed word. This logic always runs on
	 * the server, so that people can't cheat by peeking at the JavaScript
	 */
	enter: async ({ request, cookies }) => {
		const game = new Game(cookies.get('sverdle'));

		const data = await request.formData();
		const guess = data.getAll('guess') as string[];

		if (!game.enter(guess)) {
			return fail(400, { badGuess: true });
		}

		cookies.set('sverdle', game.toString());
	},

	restart: async ({ cookies }) => {
		cookies.delete('sverdle');
	}
} satisfies Actions;
