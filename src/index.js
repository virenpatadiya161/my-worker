import { DurableObject } from "cloudflare:workers";

export class MyDurableObject extends DurableObject {
	constructor(ctx, env) {
		super(ctx, env);
	}
}

export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		if (url.pathname === "/ping") {
			console.log("BEFORE PING");

			const result = await env.FLAGS.ping();

			console.log("AFTER PING", result);

			return Response.json({
				success: true,
				result,
			});
		}

		// POST /createTelegramChannel — body: { channelName }
		if (url.pathname === "/createTelegramChannel") {
			if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
			const { channelName } = await request.json();
			const result = await env.FLAGS.createTelegramChannel(channelName);
			return Response.json(result);
		}

		// POST /sendMessageToTelegramChannel — body: { channelId, message }
		if (url.pathname === "/sendMessageToTelegramChannel") {
			if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
			const { channelId, message } = await request.json();
			if (!channelId || !message) {
				return new Response("Missing channelId or message", { status: 400 });
			}
			const result = await env.FLAGS.sendMessageToTelegramChannel(channelId, message);
			return Response.json(result);
		}

		// POST /addChannelToChatFolder — body: { channelId, folderName }
		if (url.pathname === "/addChannelToChatFolder") {
			if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
			const { channelId, folderName } = await request.json();
			if (!channelId || !folderName) {
				return new Response("Missing channelId or folderName", { status: 400 });
			}
			const result = await env.FLAGS.addChannelToChatFolder(channelId, folderName);
			return Response.json(result);
		}

		return new Response("Not Found", { status: 404 });
	}
};
