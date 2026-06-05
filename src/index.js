import { DurableObject } from "cloudflare:workers";

/**
 * Welcome to Cloudflare Workers! This is your first Durable Objects application.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your Durable Object in action
 * - Run `npm run deploy` to publish your application
 *
 * Learn more at https://developers.cloudflare.com/durable-objects
 */

/**
 * Env provides a mechanism to reference bindings declared in wrangler.jsonc within JavaScript
 *
 * @typedef {Object} Env
 * @property {DurableObjectNamespace} MY_DURABLE_OBJECT - The Durable Object namespace binding
 * @property {any} FLAGS - Service binding for the wa-dashboard-flags worker
 */

/** A Durable Object's behavior is defined in an exported Javascript class */
export class MyDurableObject extends DurableObject {
	/**
	 * The constructor is invoked once upon creation of the Durable Object, i.e. the first call to
	 * 	`DurableObjectStub::get` for a given identifier (no-op constructors can be omitted)
	 *
	 * @param {DurableObjectState} ctx - The interface for interacting with Durable Object state
	 * @param {Env} env - The interface to reference bindings declared in wrangler.jsonc
	 */
	constructor(ctx, env) {
		super(ctx, env);
	}

	/**
	 * The Durable Object exposes an RPC method sayHello which will be invoked when a Durable
	 *  Object instance receives a request from a Worker via the same method invocation on the stub
	 *
	 * @param {string} name - The name provided to a Durable Object instance from a Worker
	 * @returns {Promise<string>} The greeting to be sent back to the Worker
	 */
	async sayHello(name) {
		return `Hello, ${name}!`;
	}
}

export default {
	/**
	 * This is the standard fetch handler for a Cloudflare Worker
	 *
	 * @param {Request} request - The request submitted to the Worker from the client
	 * @param {Env} env - The interface to reference bindings declared in wrangler.jsonc
	 * @param {ExecutionContext} ctx - The execution context of the Worker
	 * @returns {Promise<Response>} The response to be sent back to the client
	 */
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		const flagsService = env.FLAGS;

		// POST /createTelegramChannel
		// body: { channelName: string }
		if (url.pathname === "/createTelegramChannel") {
			if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
			const body = await request.json();
			return flagsService.fetch(
				new Request("https://flags/eventPush", {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						type: "createTelegramChannel",
						payload: { channelName: body.channelName },
					}),
				})
			);
		}

		// POST /sendMessageToTelegramChannel
		// body: { channelId: string, message: string }
		if (url.pathname === "/sendMessageToTelegramChannel") {
			if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
			const body = await request.json();
			if (!body.channelId || !body.message) {
				return new Response("Missing channelId or message", { status: 400 });
			}
			return flagsService.fetch(
				new Request("https://flags/eventPush", {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						type: "sendMessageToTelegramChannel",
						payload: { channelId: body.channelId, message: body.message },
					}),
				})
			);
		}

		// POST /addChannelToChatFolder
		// body: { channelId: string, folderName: string }
		if (url.pathname === "/addChannelToChatFolder") {
			if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
			const body = await request.json();
			if (!body.channelId || !body.folderName) {
				return new Response("Missing channelId or folderName", { status: 400 });
			}
			return flagsService.fetch(
				new Request("https://flags/eventPush", {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						type: "addChannelToChatFolder",
						payload: { channelId: body.channelId, folderName: body.folderName },
					}),
				})
			);
		}

		const stub = env.MY_DURABLE_OBJECT.getByName("foo");

		// Call the `sayHello()` RPC method on the stub to invoke the method on
		// the remote Durable Object instance.
		const greeting = await stub.sayHello("world");

		return new Response(greeting);
	}
};
