/**
 * Expo Push Notification helper.
 *
 * Sends push notifications via the Expo Push API (no SDK dependency,
 * just a simple HTTP POST to https://exp.host/--/api/v2/push/send).
 */

interface ExpoPushMessage {
    to: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    sound?: "default" | null;
}

export async function sendExpoPushNotification(
    token: string,
    title: string,
    body: string,
    data?: Record<string, unknown>
): Promise<boolean> {
    if (!token || !token.startsWith("ExponentPushToken[")) {
        return false;
    }

    const message: ExpoPushMessage = {
        to: token,
        title,
        body,
        data,
        sound: "default",
    };

    try {
        const response = await fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify(message),
        });

        const result = (await response.json()) as { data?: { status?: string } };
        return result?.data?.status === "ok";
    } catch (error) {
        console.error("[expo-push] Failed to send notification:", error);
        return false;
    }
}

/**
 * Send the same push notification to multiple tokens at once (batched).
 */
export async function sendExpoPushNotifications(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, unknown>
): Promise<void> {
    const validTokens = tokens.filter(t => t && t.startsWith("ExponentPushToken["));
    if (validTokens.length === 0) return;

    const messages: ExpoPushMessage[] = validTokens.map(to => ({
        to,
        title,
        body,
        data,
        sound: "default",
    }));

    try {
        await fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify(messages),
        });
    } catch (error) {
        console.error("[expo-push] Failed to send batch notifications:", error);
    }
}
