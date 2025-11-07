

import { GoogleGenAI } from '@google/genai';

const getAiClient = () => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};


export const summarizeTextStream = async (text: string, onChunk: (chunk: string) => void): Promise<void> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: `Buatin ringkasan singkat dari teks ini pake bahasa gaul Indonesia. Singkat, padat, dan to the point aja ya:\n\n---\n\n${text}`,
    });
    for await (const chunk of response) {
      onChunk(chunk.text);
    }
  } catch (error) {
    console.error("Error summarizing text:", error);
    throw error;
  }
};

export const getAiResponseStream = async (prompt: string, onChunk: (chunk: string) => void): Promise<void> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: `Jawab pertanyaan ini secepat kilat pake bahasa gaul Indonesia. Gak usah formal, langsung ke intinya aja:\n\n${prompt}`,
    });
     for await (const chunk of response) {
      onChunk(chunk.text);
    }
  } catch (error) {
    console.error("Error getting AI response:", error);
    throw error;
  }
};

export const describeImageStream = async (base64ImageData: string, prompt: string, onChunk: (chunk: string) => void): Promise<void> => {
    try {
        const ai = getAiClient();
        const imagePart = {
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64ImageData,
            },
        };
        const textPart = {
            text: `Jelasin gambar ini pake bahasa gaul Indonesia. Pertanyaannya: "${prompt}"`,
        };

        const response = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        for await (const chunk of response) {
            onChunk(chunk.text);
        }
    } catch (error) {
        console.error("Error describing image:", error);
        throw error;
    }
};

export const summarizeAudioStream = async (audioBase64: string, mimeType: string, onChunk: (chunk: string) => void): Promise<void> => {
    try {
        const ai = getAiClient();
        const audioPart = {
            inlineData: {
                data: audioBase64,
                mimeType,
            },
        };
        const textPart = {
            text: "Dengerin voice note ini, terus buatin ringkasan singkatnya pake bahasa gaul Indonesia. Gak usah panjang-panjang.",
        };

        const response = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: { parts: [audioPart, textPart] },
        });

        for await (const chunk of response) {
            onChunk(chunk.text);
        }
    } catch (error) {
        console.error("Error summarizing audio:", error);
        throw error;
    }
};

export const generateImage = async (prompt: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
            },
        });
        
        const base64ImageBytes = response.generatedImages[0]?.image?.imageBytes;

        if (base64ImageBytes) {
            return base64ImageBytes;
        }

        throw new Error("Gak ada gambar yang dibuat.");

    } catch (error) {
        console.error("Error generating image:", error);
        throw error;
    }
};