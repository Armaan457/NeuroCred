from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.runnables import RunnablePassthrough
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv
load_dotenv()

llm = ChatGroq(model="llama-3.1-8b-instant", groq_api_key=os.getenv("GROQ_API_KEY"))

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
vectorstore = Chroma(persist_directory="chroma_db", embedding_function=embeddings)
retriever = vectorstore.as_retriever()
def custom_retriever(query):
    results = retriever.invoke(query, k=4)
    return [result.page_content for result in results]

prompt = ChatPromptTemplate.from_template("""
    You are an expert financial assistant specializing in loans and personal finance.

    **Task:**
    1. Answer the user's questions about loans, credit, and personal finance with clear, accurate, and concise information.
    2. Ignore any questions that fall outside this domain.
    3. Your responses should be direct and helpful, avoiding verbose explanations or conversational fillers.

    **Constraints:**
    - Do not mention the source of your information or that you are an AI assistant.
    - Maintain a professional and authoritative tone.
                                          
    Context:
    {context}

    Question:
    {question}
""")

chain = (
    {"context": custom_retriever, "question": RunnablePassthrough()}
    | prompt
    | llm
)