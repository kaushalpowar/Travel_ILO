from llama_index.core import Settings, SimpleDirectoryReader, VectorStoreIndex, get_response_synthesizer
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.embeddings.huggingface import HuggingFaceEmbedding


#embed_model = OpenAIEmbedding(model="text-embedding-3-small", dimensions=512, api_key=OPENAI_API_KEY)

embed_model = HuggingFaceEmbedding(
            model_name="sentence-transformers/all-MiniLM-L6-v2", 
        )
Settings.embed_model = embed_model

Settings.chunk_size = 512
Settings.chunk_overlap = 64
reader = SimpleDirectoryReader(input_dir= "/Users/kaushal/Documents/Travel-AI/backend/static/docs")
documents = reader.load_data(show_progress=True, )
print(f"Chunking completed with {len(documents)} chunks")
index = VectorStoreIndex.from_documents(
    documents,
    embed_model = embed_model,

)

index.storage_context.persist(persist_dir="embeddings6/")
print("Embeddings saved")

