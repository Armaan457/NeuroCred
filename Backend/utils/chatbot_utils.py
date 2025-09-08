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
vectorstore = Chroma(persist_directory="chroma_db_new", embedding_function=embeddings)
retriever = vectorstore.as_retriever()
def custom_retriever(query):
    results = retriever.invoke(query, k=5)
    return [result.page_content for result in results]

prompt = ChatPromptTemplate.from_template("""
    You are a expert agent in assisting user about loans and finance.
    Answer in crisp to the best of your capacity. Ignore question outside the said domain.
    DON'T MENTION based on context or our platform in your answers.
2
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