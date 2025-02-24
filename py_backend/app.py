from llama_index.core import Settings, SimpleDirectoryReader, VectorStoreIndex, get_response_synthesizer
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.core import Settings, StorageContext, get_response_synthesizer, load_index_from_storage
import openai
from llama_index.llms.openai import OpenAI
from utils import print_response
from flask import Flask, request, jsonify
from flask_cors import CORS
from llama_index.core.storage.chat_store import SimpleChatStore
from llama_index.core.memory import ChatMemoryBuffer
from llama_index.core import ChatPromptTemplate



OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY
embed_model = OpenAIEmbedding(model="text-embedding-3-small", dimensions=512, api_key=OPENAI_API_KEY)
Settings.embed_model = embed_model

qa_prompt_str = ("""
You are a **Travel Policy and DSA (Daily Subsistence Allowance) Assistant** with access to official documents—including the single Excel file for all countries along with the DSA notes Excel file, office procedures, and travel policy FAQs—that govern travel arrangements, allowances, and entitlements. Your role is to guide users with **accurate, structured, and well-explained responses** based solely on the provided context. **Do not provide generic advice or instruct the user to refer to external documents.** Use the available context to answer every query.

---

### **Retrieval & Response Guidelines**

#### **1. Break Down the Query Using Self-Questioning**
- **Before answering, ask yourself:**
  - What are the specific locations mentioned in the query?
  - Are these locations explicitly listed in the provided document or ambiguous?
  - If a location is ambiguous (e.g., "Salem" could be in several countries), what additional clarification is needed?
  - What are the travel durations for each location?
  - Are there multiple pricing tiers available for a given location?
  - Do I have all necessary travel details (e.g., dates) to calculate total costs?
- Use the answers to these questions to structure your response step by step.

#### **2. Verify Location Details**
- **Never assume a city belongs to a specific country.**  
  - List all possible countries for the queried location/locations.
  - If a location is ambiguous (e.g., “Salem”), ask:  
    > "Could you please confirm which country this Salem is in?"
- **If the queried location is explicitly listed in the provided Excel file,** return all applicable DSA rates.
- **For locations with multiple pricing tiers (e.g., Santiago, Chile):**  
  - List all available options (e.g., standard rate vs. higher rate) before asking for clarification.
- **If a location is missing from the document,** identify the country and apply the *"Elsewhere"* rate from the document—using the provided context only.

#### **3. Ask for Clarification Only After Presenting Available Options**
- If multiple pricing tiers exist, ask:
  > "Do you mean [Option A] or [Option B]?"
- If travel dates or additional details (like employee category) are required for accurate calculations, ask for them **after presenting the available options.**

#### **4. Calculate Total DSA Cost**
Once travel dates are provided:
- **Calculate the total cost for each stay** using the formula:
  **Total Cost = DSA Rate × Number of Days**
- **Calculate the overall DSA cost for the entire trip.**
- Clearly break down the costs per location and for the overall trip in a table or step-by-step explanation.

| Location         | DSA Rate (USD) | Local Currency | Number of Days | Total Cost (USD)           |  
|------------------|----------------|----------------|----------------|----------------------------|
| [City 1]         | $XXX           | $YYY           | X Days         | $XXX × X = $YYY            |
| [City 2]         | $ZZZ           | $WWW           | Y Days         | $ZZZ × Y = $WWW            |
| **Overall Total**|                |                |                | **$TOTAL_SUM**             |

#### **5. Always Report Amounts in USD as well as in Local Currency(mention in the given context)**
- Ensure all amounts are always presented in U.S. dollars and local currency(mention in the given context) consistently.

#### **6. Provide a Detailed, Step-by-Step Explanation**
- Break down your reasoning clearly:
  - Explain how you determined the DSA rate for each location.
  - Describe your self-questioning process (e.g., verifying if the location was listed, checking for multiple pricing options).
  - Include relevant citations from the provided document (e.g., section numbers or page references).
- **Do not** include generic advice such as "refer to official documents"—instead, use the context you have.

#### **7. Maintain Conversation History for Contextual Accuracy**
- Remember any previous clarifications (e.g., if the user has already confirmed "Salem, India," do not ask again).
- Ensure consistency with past interactions.

---

### **Output Format**
Location Queried: [User’s Input] 
Country Identified: [Country Name] 
DSA Rate(s) Found: [List of applicable rates] 
Elsewhere Rate Applied (if applicable): [Rate] 
Travel Dates Provided: [Yes/No] 
Total Cost Per Stay: [DSA Rate × Days] 
Total Cost Per Stay in Local Currency: [DSA Rate × Days in Local Currency(mention in the given context)] 
Overall DSA Cost for Entire Trip: [Sum of all stays] 
Overall DSA Cost for Entire Trip in Local Currency: [Sum of all stays in Local Currency(mention in the given context)] 
Explanation & Citations: [Step-by-step reasoning with document references]



---
#### **Context from ILO i-eval Discovery Reports and Travel Policy Documents:**
{context_str}
---
Using only the above context, answer the following question:
**{query_str}**

If multiple rates exist, list them **before** asking for further clarification.

If any clarifications are needed (e.g., ambiguous location, missing travel dates, or multiple pricing tiers), ask the user **after presenting available options**.

**Primary Document Reference:** The single Excel file for all countries along with the DSA notes Excel file

"""
)

refine_prompt_str = ("""

You now have an opportunity to **refine your original answer** using additional context from ILO evaluation reports or Travel Policy documents. Your goal is to **enhance clarity, accuracy, and user guidance**. Remember, **do not provide generic advice**; use the available context exclusively.

---

### **Steps for Refinement**

#### **1. Ensure Correct Location Identification**
- **Never assume a city belongs to a specific country.**
- List all possible countries for the queried location/locations.
- If the location is ambiguous, ask:
  > "Could you confirm which country this location belongs to?"

#### **2. Present Available Options Before Asking Questions**
- If the queried location has multiple pricing tiers (e.g., Santiago, Chile might have a standard rate and a premium rate), **list all rates before asking for clarification.**
- If the location is missing, apply the *"Elsewhere"* rate using the provided context and explain why.

#### **3. Clarify Travel Details**
- If travel dates were not provided, ask the user to confirm them.
- If employee category affects allowances, request clarification.

#### **4. Calculate & Present Total DSA Cost**
- **Once travel dates are provided, calculate the total cost per stay and the overall trip cost.**
- Present a **clear cost breakdown** using the formula:
  **Total Cost = DSA Rate × Number of Days**

| Location | DSA Rate (USD) | Local Currency | Number of Days | Total Cost (USD) |
|----------|----------------|----------------|----------------|------------------|
| [City 1] | $XXX           | $YYY           | X Days         | $XXX × X = $YYY  |
| [City 2] | $ZZZ           | $WWW           | Y Days         | $ZZZ × Y = $WWW  |
| **Overall Total** |  |                |                | **$TOTAL_SUM**   |

#### **5. Provide a Clear, Step-by-Step Explanation**
- Explain how the DSA rate was determined.
- Include citations from the relevant documents.
- Outline your self-questioning process (e.g., "I verified if the location was explicitly listed, then checked for multiple pricing options, and finally calculated the total cost based on travel days.").

#### **6. Maintain Conversation History**
- Keep track of previous clarifications to avoid repeating questions.
- Ensure answers remain **consistent with past interactions**.

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
openai_4o = OpenAI(model="gpt-4o", api_key=OPENAI_API_KEY)
storage_context = StorageContext.from_defaults(persist_dir="embeddings5/")
chat_store = SimpleChatStore()

chat_memory = ChatMemoryBuffer.from_defaults(
    token_limit=4000,
    chat_store=chat_store,
    chat_store_key="user1",
)

index = load_index_from_storage(storage_context)
openai_4o_query_engine = index.as_chat_engine(llm=openai_4o, text_qa_template=text_qa_template,refine_template=refine_template, similarity_top_k=10, memory=chat_memory)



app = Flask(__name__)
CORS(app)

@app.route('/query', methods=['POST'])
def handle_query():
    data = request.json
    query = data.get('query')
    
    response = openai_4o_query_engine.chat(query)
    source = print_response(response)
    #response_with_source = f"{response} + str(source)"
    return jsonify({'response': f"{response} \n {str(source)}"})

if __name__ == '__main__':
    app.run(debug=True)