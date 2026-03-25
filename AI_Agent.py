from langchain.chat_models import ChatOpenAI
from langchain.chains import ConversationalRetrievalChain
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings

llm = ChatOpenAI(api_key="YOUR_API_KEY")

vector_db = Chroma(
    persist_directory="db",
    embedding_function=OpenAIEmbeddings()
)

qa_chain = ConversationalRetrievalChain.from_llm(
    llm,
    vector_db.as_retriever()
)

query = "What services do you offer?"
response = qa_chain.run(query)

print(response)

import streamlit as st

st.title("AI Customer Support")

user_input = st.text_input("Ask question")

if user_input:
    answer = qa_chain.run(user_input)
    st.write(answer)