from langchain_google_genai import ChatGoogleGenerativeAI
# from langchain_community.chat_models import ChatOllama
from langchain_ollama import ChatOllama

def get_llm(model_name, **kwargs):
    if "gemini" in model_name.lower():
        return ChatGoogleGenerativeAI(
            model=model_name,
            **kwargs
        )

    return ChatOllama(
        model=model_name,
        **kwargs
    )
