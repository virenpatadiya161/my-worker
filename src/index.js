import { DurableObject } from "cloudflare:workers";

export class MyDurableObject extends DurableObject {
	constructor(ctx, env) {
		super(ctx, env);
	}
}

function errorResponse(message, status = 400) {
	return Response.json(
		{ success: false, message },
		{ status }
	);
}

export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		try {
			if (url.pathname === "/ping") {
				const result = await env.FLAGS.ping();

				return Response.json({
					success: true,
					data: result,
				});
			}

			// POST /createTelegramChannel — body: { channelName }
			if (url.pathname === "/createTelegramChannel") {
				if (request.method !== "POST") return errorResponse("Method not allowed", 405);

				let body;
				try {
					body = await request.json();
				} catch {
					return errorResponse("Invalid JSON body");
				}

				const { channelName } = body;
				if (!channelName?.trim()) {
					return errorResponse("channelName is required");
				}

				const result = await env.FLAGS.createTelegramChannel(channelName);
				return Response.json(result);
			}

			// POST /sendMessageToTelegramChannel — body: { channelId, message }
			if (url.pathname === "/sendMessageToTelegramChannel") {
				if (request.method !== "POST") return errorResponse("Method not allowed", 405);

				let body;
				try {
					body = await request.json();
				} catch {
					return errorResponse("Invalid JSON body");
				}

				const { channelId, message } = body;
				if (!channelId?.trim()) {
					return errorResponse("channelId is required");
				}
				if (!message?.trim()) {
					return errorResponse("message is required");
				}
				const result = await env.FLAGS.sendMessageToTelegramChannel(channelId, message);
				return Response.json(result);
			}

			// POST /addChannelToChatFolder — body: { channelId, folderName }
			if (url.pathname === "/addChannelToChatFolder") {
				if (request.method !== "POST") return errorResponse("Method not allowed", 405);

				let body;
				try {
					body = await request.json();
				} catch {
					return errorResponse("Invalid JSON body");
				}

				const { channelId, folderName } = body;
				if (!channelId?.trim()) {
					return errorResponse("channelId is required");
				}
				if (!folderName?.trim()) {
					return errorResponse("folderName is required");
				}
				const result = await env.FLAGS.addChannelToChatFolder(channelId, folderName);
				return Response.json(result);
			}

			return errorResponse("Route not found", 404);
		} catch (error) {
			console.error("[API ERROR]", error);
			return Response.json(
				{
					success: false,
					message: error?.message || "Internal server error",
				},
				{ status: 500 }
			);
		}
	},
};