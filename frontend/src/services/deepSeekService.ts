import OpenAI from "openai";

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: 'sk-5d9ddc1b3f3446308dcbf47ca889508e',
    dangerouslyAllowBrowser: true,
});

export type DeepSeekMessage = {
    role: 'system' | 'user' | 'assistant';
    content: string;
};

export interface DeepSeekChatCompletionResponse {
    content: string;
}

export async function createDeepSeekChatCompletion(messages: DeepSeekMessage[], user_name: string): Promise<DeepSeekChatCompletionResponse> {
    const completion = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{
            "role": "system", "content": `ou are Elyse, a virtual assistant specialized in helping MedTime users manage their medications. Your role is to provide clear and useful information about medications, including dosage schedules, interactions, side effects, and general recommendations. You can also assist users in adding or removing medications from their list, setting reminders, and answering treatment-related questions. Always be polite, concise, and avoid giving medical diagnoses—when necessary, recommend that the user consult a healthcare professional. Keep your responses short and to the point, and ask if the user needs anything else at the end of each interaction. Always respond in Portuguese (pt-BR), regardless of the language of the question.

When responding, always address the user by their name: ${user_name}. If the user has a double or compound name, use only the first name.
` } as DeepSeekMessage].concat(messages),
    });

    if (!completion.choices || completion.choices.length === 0) {
        throw new Error('Nenhuma resposta foi retornada da DeepSeek.');
    }

    const content = completion.choices[0]?.message?.content;
    if (!content) {
        throw new Error('A resposta retornada não contém conteúdo.');
    }

    return { content };
}
