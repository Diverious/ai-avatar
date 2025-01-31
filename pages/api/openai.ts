import { compile } from "html-to-text";
import { RecursiveUrlLoader } from "langchain/document_loaders/web/recursive_url";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ChatPromptTemplate } from "langchain/prompts";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { BaseOutputParser, FormatInstructionsOptions } from "langchain/schema/output_parser";
import personalityConfig from "@/constants/personality";
import { RunnableLambda, RunnableMap, RunnablePassthrough } from "langchain/runnables";

console.log("Initializing OpenAI interactions..."); // Log initialization

const template = `Your task is to acting as a character that has this personality: ${personalityConfig.personality} 
  and this backstory: ${personalityConfig.backStory} and you always reply with a maximum of 100 words. You should be able to answer questions about this 
  ${personalityConfig.knowledgeBase}, always responding with a maximum of 100 words.`;

const prompt = ChatPromptTemplate.fromMessages([
  ["ai", template],
  ["human", "{question}"],
]);

const model = new ChatOpenAI({
  openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  temperature: 0.2,
});

console.log("Model initialized with temperature: 0.2");

const url = "https://monadical.com/";

const compiledConvert = compile({ wordwrap: 130 });

const loader = new RecursiveUrlLoader(url, {
  extractor: compiledConvert,
  maxDepth: 4,
});

console.log(`Loading documents from URL: ${url}`);
const docs = await loader.load();

console.log(`Loaded ${docs.length} documents.`);

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 20,
});

console.log("Splitting documents into chunks...");
const splittedDocs = await splitter.splitDocuments(docs);
console.log(`Split into ${splittedDocs.length} chunks.`);

const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY });
console.log("Generating embeddings for document chunks...");

const vectorStore = await HNSWLib.fromDocuments(splittedDocs, embeddings);
console.log("Vector store created.");

const retriever = vectorStore.asRetriever(1);
console.log("Retriever initialized.");

const setupAndRetrieval = RunnableMap.from({
  context: new RunnableLambda({
    func: (input: string) => {
      console.log("Retrieving context for input:", input);
      return retriever.invoke(input).then((response) => {
        console.log("Retrieved context:", response[0]?.pageContent);
        return response[0]?.pageContent;
      });
    },
  }).withConfig({ runName: "contextRetriever" }),
  question: new RunnablePassthrough(),
});

class OpenAIOutputParser extends BaseOutputParser<string> {
  getFormatInstructions(options?: FormatInstructionsOptions | undefined): string {
    throw new Error("Method not implemented.");
  }
  lc_namespace!: string[];
  async parse(text: string): Promise<string> {
    console.log("Parsing output from OpenAI:", text);
    return text.replace(/"/g, "");
  }
}

const outputParser = new OpenAIOutputParser();
console.log("Output parser initialized.");

const openAIchain = setupAndRetrieval.pipe(prompt).pipe(model).pipe(outputParser);
console.log("OpenAI processing chain set up successfully.");

export default openAIchain;
