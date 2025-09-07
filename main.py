from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from langchain.chat_models import ChatOpenAI
from langchain.chains import ConversationalRetrievalChain
from langchain.vectorstores import FAISS
from langchain.embeddings import OpenAIEmbeddings
from langchain.memory import ConversationBufferMemory
from langchain.document_loaders import TextLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import FAISS
from langchain.docstore.document import Document

import os

# --- CONFIG ---
os.environ["OPENAI_API_KEY"] = "your-openai-key-here"  # Replace this or use dotenv

app = FastAPI()

# Allow frontend access (adjust origin if needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DUMMY VECTORSTORE (replace with real one) ---
docs = [
    Document(page_content="Apple released new AR glasses with advanced tracking."),
    Document(page_content="Google's new AI model Gemini competes with GPT-4."),
    Document(page_content="The stock market dropped 2% due to inflation fears."),
]

splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
split_docs = splitter.split_documents(docs)

embedding = OpenAIEmbeddings()
vectorstore = FAISS.from_documents(split_docs, embedding)

retriever = vectorstore.as_retriever()

# --- MEMORY STORE ---
memory_store = {}

# --- Pydantic Model ---
class ChatRequest(BaseModel):
    chat_id: str
    question: str

# --- Chat Endpoint ---
@app.post("/chat")
def chat(req: ChatRequest):
    # If chat session is new, create memory
    if req.chat_id not in memory_store:
        memory_store[req.chat_id] = ConversationBufferMemory(
            memory_key="chat_history", return_messages=True
        )
    
    memory = memory_store[req.chat_id]

    # Create chain for this session
    llm = ChatOpenAI(temperature=0)
    chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=retriever,
        memory=memory,
    )

    result = chain.run(req.question)
    return {"response": result}
