import type { AnalyzeRequest, AnalyzeResponse, Message } from "@/types";
/**
 * Backend base URL
 * Make sure FastAPI is running on this address
 */
const API_BASE_URL = "http://127.0.0.1:53300";

/**
 * Call backend to analyze product
 */
export async function analyzeProduct(
  request: AnalyzeRequest,
): Promise<AnalyzeResponse> {
  const formData = new FormData();

  // Backend-required fields
  formData.append("model", "gemini-2.5-flash-lite");
  formData.append("prompt", request.barcode || request.message || "");

  // Add conversation history if available
  if (request.history && request.history.length > 0) {
    const historyFormatted = request.history.map((msg: Message) => ({
      role: msg.role,
      content: msg.content,
    }));
    formData.append("history", JSON.stringify(historyFormatted));
  }

  // Image (base64 → Blob)
  if (request.image) {
    try {
      const blob = await fetch(request.image).then((res) => res.blob());
      formData.append("image_file", blob, "image.png");
    } catch (error) {
      throw new Error("Failed to process image");
    }
  }

  try {
    console.log("Making request to backend...");
    const response = await fetch(`${API_BASE_URL}/api/getresponse/`, {
      method: "POST",
      body: formData,
    });

    console.log("Response received:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error("Backend error:", errorText);
      throw new Error(`Backend error (${response.status}): ${errorText}`);
    }

    // Backend returns a JSON-encoded string, so we need to parse it
    const data = await response.json();
    console.log("Backend data received:", data);

    return {
      conversationId: request.conversationId || crypto.randomUUID(),
      artifactMarkdown: data, // data is already the markdown string from backend
      raw: data,
    };
  } catch (error) {
    console.error("API error:", error);

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Cannot connect to backend. Please ensure your backend server is running on port 53300 and CORS is properly configured.`,
      );
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Unknown error occurred during API request");
  }
}
