from fastapi import FastAPI, Query
import os
from langchain_chroma  import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough

from dotenv import load_dotenv
load_dotenv()
groq_api_key = os.getenv("GROQ_API_KEY")

app = FastAPI()

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

vectorstore = Chroma(persist_directory="chroma_db", embedding_function=embeddings)

retriever = vectorstore.as_retriever()
def custom_retriever(query):
    results = retriever.invoke(query, k=50)
    return [result.page_content for result in results]

prompt = ChatPromptTemplate.from_template(
    """
    You are a smart chatbot that can answer questions based on loans and finance.
    Answer based on context and be user friendly.
    Context:
    {context}

    question
    {question}
    """
)

llm = ChatGroq(model="llama-3.1-8b-instant", groq_api_key = groq_api_key)

chain = (
    {"context":custom_retriever, "question":RunnablePassthrough()}
    | prompt
    | llm
)

@app.post("/chat")
def chat(query: str = Query(..., title="Search Query")):
    response = chain.invoke(query)
    return {"answer": response.content}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)