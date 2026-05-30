export async function sendWhatsAppMessage(chatId: string, message: string) {
  const apiUrl = process.env.GREEN_API_URL;
  const idInstance = process.env.GREEN_API_ID_INSTANCE;
  const apiTokenInstance = process.env.GREEN_API_TOKEN_INSTANCE;

  if (!apiUrl || !idInstance || !apiTokenInstance) {
    console.warn("GreenAPI credentials not configured in environment variables.");
    return null;
  }

  // Format URL: https://{{apiUrl}}/waInstance{{idInstance}}/sendMessage/{{apiTokenInstance}}
  const url = `${apiUrl}/waInstance${idInstance}/sendMessage/${apiTokenInstance}`;
  
  const payload = {
    chatId: chatId,
    message: message,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending WhatsApp message via GreenAPI:", error);
    return null;
  }
}
