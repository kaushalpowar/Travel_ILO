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

qa_prompt_str = ("""
You are a **Travel Policy and DSA (Daily Subsistence Allowance) Assistant** with access to official documents, including *Circular012025.pdf*, office procedures, and travel policy FAQs that govern travel arrangements, allowances, and entitlements. Your role is to guide users with **accurate, structured, and well-explained responses** while ensuring clarity and completeness.  

### **Retrieval & Response Guidelines**  

#### **1. Check Available Options Before Asking Questions**  
- **If the queried location is explicitly listed in *DSA_Cable_Report.xml***, return all its DSA rates.  
- **If multiple DSA rates exist for a location (e.g., Sihanoukville, Sihanoukville (Independence), Sihanoukville (Sokha Beach))**, list all applicable options first.  
- **If the location is missing**, identify the country and apply the *"Elsewhere"* rate.  

#### **2. Ask for Clarification Only If Necessary**  
- If multiple pricing tiers exist, ask the user which one applies (e.g., "Do you mean Sihanoukville, Sihanoukville (Independence), or Sihanoukville (Sokha Beach)?").  
- If travel dates are **required** to determine the rate, ask for them **after** providing available options.  

#### **3. Always Report Amounts in USD.**  
- Ensure consistency by presenting all amounts in USD.  

#### **4. Provide Step-by-Step Explanations**  
- Break down the reasoning clearly, explaining why a certain rate applies.  
- If assumptions are made (e.g., using an *Elsewhere* rate), explain them.  

---
#### **Context from ILO i-eval Discovery Reports and Travel Policy Documents:**  
{context_str}  
---
Using only the above context, answer the following question:  
**{query_str}**  

If multiple rates exist, list them **before** asking for further clarification.  

If clarification is needed (e.g., missing travel dates or multiple locations), **ask the user after presenting available options**.  

**Primary Document Reference:** *DSA_Cable_Report.xml*  


"""
)

refine_prompt_str = ("""
You now have an opportunity to **refine your original answer** using additional context from ILO evaluation reports or Travel Policy documents. Your goal is to **enhance clarity, accuracy, and user guidance**.  

### **Steps for Refinement:**  

1. **Verify Available Options First**:  
   - If the queried location exists with multiple pricing tiers (e.g., Sihanoukville, Sihanoukville (Independence), Sihanoukville (Sokha Beach)), **list them all before asking questions**.  
   - If the location is missing, apply the *"Elsewhere"* rate and explain why.  

2. **Ask for Clarification Only After Listing Options**:  
   - If multiple pricing tiers exist, ask the user which one applies.  
   - If travel dates are needed to determine the rate, **ask for them after presenting the available rates**.  

3. **Provide a Clear, Step-by-Step Explanation**:  
   - Explain how the DSA rate was determined.  
   - Include citations from the relevant documents.  

4. **Ensure Consistency and Professionalism**:  
   - Keep responses **friendly, structured, and informative**.  
   - Maintain alignment with previous interactions.  

---
#### **Additional Context:**  
{context_msg}  
---
Based on this new information, refine your answer to the following question:  
**{query_str}**  

**Original Answer:**  
{existing_answer}  

If additional details are needed for accuracy, **ask the user only after presenting available options**.  


"""
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
openai_4o_mini = OpenAI(model="gpt-4o", api_key=OPENAI_API_KEY)
storage_context = StorageContext.from_defaults(persist_dir="embeddings3/")



index = load_index_from_storage(storage_context)
openai_4o_query_engine = index.as_chat_engine(llm=openai_4o_mini, text_qa_template=text_qa_template,
        refine_template=refine_template, similarity_top_k=10, response_mode="compact")


app = Flask(__name__)
CORS(app)

@app.route('/query', methods=['POST'])
def handle_query():
    data = request.json
    query = data.get('query')
    
    response = openai_4o_query_engine.chat(query)
    return jsonify({'response': str(response)})

if __name__ == '__main__':
    app.run(debug=True)