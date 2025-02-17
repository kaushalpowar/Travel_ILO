from llama_index.core import Settings, SimpleDirectoryReader, VectorStoreIndex, get_response_synthesizer
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.core import Settings, StorageContext, get_response_synthesizer, load_index_from_storage
import openai
import os
from llama_index.llms.openai import OpenAI
from utils import print_response
from flask import Flask, request, jsonify
from flask_cors import CORS

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY
embed_model = OpenAIEmbedding(model="text-embedding-3-small", dimensions=512, api_key=OPENAI_API_KEY)
Settings.embed_model = embed_model
qa_prompt_str = (
    "You are an expert with complete knowledge of the ILO i-eval Discovery platform, "
    "which contains detailed evaluation reports on labor policies, programs, and initiatives. "
    "You also specialize in Travel Policy and Daily Subsistence Allowance (DSA) regulations. "
    "You have access to official travel policy documents, including circulars, office procedures, "
    "and travel policy FAQs that govern travel arrangements, allowances, and entitlements.\n"
    "---------------------\n"
    "Context from ILO i-eval Discovery Reports and Travel Policy Documents:\n"
    "{context_str}\n"
    "---------------------\n"
    "Using only the provided context, analyze and provide the most accurate and relevant answer to the following question:\n"
    "{query_str}\n"
    "\n"
    "If the exact answer is not available, summarize the closest relevant insights from completed evaluations, lessons learned, management responses, "
    "or travel policy regulations. If no relevant information is found, respond with: 'The requested information is not available in the provided reports or policies.'\n"
    "\n"
    "When answering questions related to **Travel Policy and DSA**, follow these guidelines:\n"
    "1. **Retrieve and Cite Documents:** Use relevant excerpts, section numbers, or tables from travel policy documents.\n"
    "2. **Interpret and Analyze Tables Before Answering:** Carefully examine tables to identify correct DSA rates based on location, dates, employee category, and conditions.\n"
    "3. **Clarify Travel Dates:** If dates are missing, request them, as rates may change based on the period.\n"
    "4. **Handle Location-Based Queries:** If a location is not explicitly listed, check broader regions and confirm with the user before applying regional rates.\n"
    "5. **Use Logical Reasoning When Data Is Missing:** If exact figures are unavailable, use related data and clearly state any assumptions made.\n"
    "6. **Provide Step-by-Step Explanations:** Break down policies in an easy-to-understand manner, using structured responses.\n"
    "7. **Ensure Consistency and Accuracy:** Cross-check information and use chat history to maintain continuity in responses.\n"
    "8. **If the location is not in the context, check for the values mentioned at elsewhere/All the table. **"
    "Prioritize responses based on evaluation type (independent, internal, or external), region, thematic focus (employment, social protection, gender equality, etc.), "
    "the latest recommendations from management responses, and the most accurate travel policy details."
)

refine_prompt_str = (
    "You have the opportunity to improve the original answer using additional context from ILO evaluation reports or Travel Policy documents.\n"
    "Refine the response only if the new context provides relevant details; otherwise, keep the original answer unchanged.\n"
    "---------------------\n"
    "Additional Context:\n"
    "{context_msg}\n"
    "---------------------\n"
    "Given this new information, refine the original answer to better address the question:\n"
    "{query_str}\n"
    "If the new context does not add value, return the original answer as it is.\n"
    "Original Answer: {existing_answer}\n"
    "\n"
    "When refining answers related to **Travel Policy and DSA**, ensure that:\n"
    "1. **Tables are properly analyzed** before concluding the answer.\n"
    "2. **Location-specific details are verified**, and broader region-based rates are applied logically.\n"
    "3. **Travel dates are considered**, as rates may vary based on the period.\n"
    "4. **Step-by-step explanations are provided**, making complex policies easy to understand.\n"
    "5. **The response remains professional, structured, and consistent** with previous interactions.\n"
)


from llama_index.core import ChatPromptTemplate

# Text QA Prompt
chat_text_qa_msgs = [
    (
        "system",
        "Always answer the question, even if the context isn't helpful.",
    ),
    ("user", qa_prompt_str),
]
text_qa_template = ChatPromptTemplate.from_messages(chat_text_qa_msgs)


# Refine Prompt
chat_refine_msgs = [
    (
        "system",
        "Always answer the question, even if the context isn't helpful.",
    ),
    ("user", refine_prompt_str),
]
refine_template = ChatPromptTemplate.from_messages(chat_refine_msgs)
openai_4o_mini = OpenAI(model="gpt-4o-mini", api_key=OPENAI_API_KEY)
storage_context = StorageContext.from_defaults(persist_dir="embeddings/")

index = load_index_from_storage(storage_context)
openai_4o_query_engine = index.as_query_engine(llm=openai_4o_mini, text_qa_template=text_qa_template,
        refine_template=refine_template, similarity_top_k=10)

app = Flask(__name__)
CORS(app)

@app.route('/query', methods=['POST'])
def handle_query():
    data = request.json
    query = data.get('query')
    
    response = openai_4o_query_engine.query(query)
    return jsonify({'response': str(response)})

if __name__ == '__main__':
    app.run(debug=True)