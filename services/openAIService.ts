import { OpenAI } from 'openai';
import DigitalPersona from '../models/digitalPersona';
import Token from '@/models/tokens';
import tiktoken from 'tiktoken';

// Initialize OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is stored in environment variables
});

export async function generateDigitalPersona(queryPrompt: any[]) {
  try {
	const formattedPrompt = queryPrompt.map(item => {
		return `${item["question"]}: ${item["answer"]}\n`;
	  }).join("\n");
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: "You are skilled in analyzing and embodying diverse characters. You meticulously study transcripts to capture key attributes, draft comprehensive character sheets, and refine them for authenticity. " +
	"    Feel free to make assumptions without hedging, be concise and creative." +
	"" +
	"    Conduct comprehensive research on the provided transcript. Identify key characteristics of the speaker, including age, professional field, distinct personality traits, style of communication, " +
	"    narrative context, and self-awareness. Additionally, consider any unique aspects such as their use of humor, their cultural background, core values, passions, fears, personal history, and social interactions. " +
	"    Your output for this stage is an in-depth written analysis that exhibits an understanding of both the superficial and more profound aspects of the speaker's persona." +
	"" +
	"    Craft your documented analysis into a draft of the 'You are a...' character sheet. It should encapsulate all crucial personality dimensions, along with the motivations and aspirations of the persona. " +
	"    Keep in mind to balance succinctness and depth of detail for each dimension. The deliverable here is a comprehensive draft of the character sheet that captures the speaker's unique essence." +
	"" +
	"    Compare the draft character sheet with the original transcript, validating its content and ensuring it captures both the speaker`s overt characteristics and the subtler undertones. " +
	"    Omit unknown information, fine-tune any areas that require clarity, have been overlooked, or require more authenticity. Use clear and illustrative examples from the transcript to refine your sheet " +
	"    and offer meaningful, tangible reference points. Your output is a coherent, comprehensive, and nuanced instruction that begins with 'You are a...' and serves as a go-to guide for an actor recreating the persona.",
        },
        {
          role: 'user',
          content: formattedPrompt,
        },
      ],
      max_tokens: 4096,
    });

    return response.choices[0].message?.content;
  } catch (error: any) {
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

export async function generatePost(userId:string, topic: string, industry: string, tone: string, platform: string, style: string, noOfPosts: number) {
	try {
	  const persona:any = await DigitalPersona.findOne({ userId });
	  let userQuery: string;
	  if(industry != "" && tone != "" && platform != ""){
		  userQuery = `Generate ${noOfPosts} social media posts on the topic of ${topic} for the ${industry} industry. The tone of the posts should be ${tone}, specifically tailored for ${platform}. Each post must follow a ${style} writing style, with the word count appropriately adjusted to fit the platform's typical norms and best practices.
		  For Facebook: Craft engaging posts with a medium word count, designed to encourage interaction and discussion.
		  For Instagram: Keep the content concise, visually-driven, and impactful, with an emphasis on short, catchy phrases and attention-grabbing text.
		  For LinkedIn: Write professional, informative posts that offer detailed insights and establish thought leadership within the ${industry} field.
		  For Twitter: Create short, sharp, and impactful posts within the character limit, delivering concise, essential information.
		  Ensure the posts resonate with the target audience, are engaging, and leverage the best practices for ${platform}. Add relevant emojis where appropriate to boost engagement, while keeping the language natural and platform-friendly. Avoid using bold headings or starting any post with "**".
		  The content should make full use of the available tokens and be returned in a JSON array of objects, with each object representing a separate post. Example format:
		  [
		  	{"post": "Generated post content here..."},
			{"post": "Generated post content here..."},
		  ] 
		  `;
	  }else{
		  userQuery = `Generate ${noOfPosts} social media posts on the topic of ${topic} for the ${platform} platform. If no industry is provided, assume a general business context. The tone of the posts should default to informative, unless otherwise specified by the user. Each post should be written with a balanced style, and the word count should be appropriate for ${platform}, following its best practices.
		  For the ${platform} platform:
		  Facebook: Write engaging posts with a medium word count, suited for interaction and discussion.
		  Instagram: Keep the content concise and visually appealing, with an emphasis on catchy, attention-grabbing text.
		  LinkedIn: Use a professional and informative tone, offering insights that would resonate with a general business audience.
		  Twitter: Create short, impactful posts that deliver essential information within the character limit.
		  Ensure the posts are engaging, add relevant emojis where appropriate, and follow the best practices for ${platform}. The content should not include any bold headings or start with "**". Use the full token count where possible.
		  Return the posts in a JSON array of objects, where each object represents one post, following this format:
		  [
		  	{"post": "Generated post content here..."},
			{"post": "Generated post content here..."},
		  ]
		`
	  }
	  const response = await openai.chat.completions.create({
		model: 'gpt-4o-mini',
		messages: [
		  {
			role: 'system',
			content: persona.personaData,
		  },
		  {
			role: 'user',
			content: userQuery,
		  },
		],
		max_tokens: 4096,
		temperature: 0.65
	  });
	  const text: any = response.choices[0].message?.content;
	  const tokenizer = tiktoken.encoding_for_model('gpt-4o-mini');
	  const tokens = await tokenizer.encode(text);
	  const cost = (tokens.length / 1000000) * Number(process.env.COST_PER_MILLION_TOKEN);
	  const saveToken = new Token({tokens: tokens.length, cost});
	  await saveToken.save();
	  return response.choices[0].message?.content;
	} catch (error: any) {
	  throw new Error(`OpenAI API error: ${error.message}`);
	}
  }

export async function generatePostTopics(userId: string) {
	const persona:any = await DigitalPersona.findOne({ userId });
	const response = await openai.chat.completions.create({
		model: 'gpt-4o-mini',
		messages: [
		  {
			role: 'system',
			content: `
                You are an expert content strategist who deeply understands the digital persona provided by the user. 
                The digital persona represents their personal brand, values, tone, industry expertise, and goals. 
                Your job is to generate the most relevant and trending topics that align with this persona's voice and objectives, 
                ensuring each topic is current and likely to engage the target audience.

                The digital persona:
                ${persona.personaData}

                Focus on generating topics that:
                - Are currently trending or highly relevant within the user's industry
                - Reflect the user's voice and tone
                - Align with the user's goals and the expectations of their audience
                `
		  },
		  {
			role: 'user',
			content: `
                Using my digital persona described in the system prompt, generate ${process.env.GENERATE_NO_TOPICS} trending content topics that are relevant to my industry, audience, and current trends. 
                Ensure the topics are engaging, forward-thinking, and likely to resonate with my audience's current interests and needs.
				Return the topics in an array of strings format.
                `,
		  },
		],
		max_tokens: 4096,
		temperature: 0.7
	});
	return response.choices[0].message?.content;
}
