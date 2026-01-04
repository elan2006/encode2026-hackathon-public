from google import genai
from google.genai import types
from mcptools import apiserver
from fastmcp import FastMCP
import os
from dotenv import load_dotenv
from tests import HealthConciousUser, IllUser, FitnessFocusedUser, Judge
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from modelmanager import modelfactory

load_dotenv()
# genai.configure(api_key=os.environ["GEMINI_API_KEY"])

import base64

def bytes_to_base64(image_bytes: bytes) -> str:
    return base64.b64encode(image_bytes).decode("utf-8")


mcpclient = apiserver.get_client()
def get_system_prompt():
    filepath="prompts/system_prompt.txt"
    with open(filepath, "r", encoding='utf-8') as f:
        return f.read()

def key_word_extract(model_name, text):
    filepath="prompts/keyword_extract_prompt.txt"
    with open(filepath, "r", encoding='utf-8') as f:
        system_prompt = f.read()
        # print(system_prompt)
        messages = [AIMessage(system_prompt), HumanMessage(text)]
        llm = modelfactory.get_llm(model_name)
        response = llm.invoke(messages)
        return response.content.strip()
    return "None"
        

def test_model_output(text, model_name="gemini-3-flash-preview"):
    print("="*10, "Health Concious User", "="*10)
    evaluator = HealthConciousUser.HealthConciousUser(model_name)
    evaluated_message = evaluator.test(text)
    print(evaluated_message)

    print("="*10, "Obese User", "="*10)
    evaluator = IllUser.Obese(model_name)
    evaluated_message = evaluator.test(text)
    print(evaluated_message)

    print("="*10, "Diabetic User", "="*10)
    evaluator = IllUser.Diabetes(model_name)
    evaluated_message = evaluator.test(text)
    print(evaluated_message)

    print("="*10, "Gym Bro", "="*10)
    evaluator = FitnessFocusedUser.GymBro(model_name)
    evaluated_message = evaluator.test(text)
    print(evaluated_message)

    print("="*10, "Dietitian", "="*10)
    evaluator = HealthConciousUser.Dietitian(model_name)
    evaluated_message = evaluator.test(text)
    print(evaluated_message)

    print("="*10, "Judge", "="*10)
    evaluator = Judge.Judge(model_name)
    evaluated_message = evaluator.test(text)
    print(evaluated_message)

def build_messages(system_prompt, history, input_prompt, image_bytes=None):
    messages = [SystemMessage(content=system_prompt)]

    for msg in history:
        if msg["role"] == "user":
            messages.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "assistant":
            messages.append(AIMessage(content=msg["content"]))
        elif msg["role"] == "system":
            messages.append(SystemMessage(content=msg["content"]))

    if image_bytes:
        human_message = HumanMessage(
            content=[
        {"type": "text", "text": input_prompt},
        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{bytes_to_base64(image_bytes)}"}}
    ]
        )
    else:
        human_message = HumanMessage(content=input_prompt)
    
    messages.append(human_message)
    return messages


def needs_openfoodfacts(text: str) -> bool:
    text = text.lower().strip()

    # Very short = usually branded product
    if len(text.split()) <= 3:
        return True

    # Looks like a brand/product name
    if any(x in text for x in ["®", "™"]):
        return True

    # Capitalized single phrase
    if text.istitle():
        return True

    # Explicit product phrasing
    if any(x in text for x in ["this product", "this drink", "this food"]):
        return True

    return False


def get_response(model_name, input_prompt, image_text=None, image_bytes=None, history=[]):
    client = genai.Client()
    print("model used:" + model_name)
    system_prompt = get_system_prompt()
    background_data = ""
    keywords = key_word_extract(model_name, input_prompt)
    if keywords != "None" and keywords != "nothing":
        print("extracted keywords:", keywords)
        keywords_list = keywords.split(",")
        for keyword in keywords_list:
            keyword = keyword.strip()
            open_facts_info = apiserver.scrape_open_food_facts(keyword)
            print(f"open facts info for keyword {keywords}:\n", open_facts_info)
            background_data += f"{open_facts_info}\n"
    if needs_openfoodfacts(input_prompt):
        open_facts_info = apiserver.scrape_open_food_facts(input_prompt)
        print("open facts info:\n", open_facts_info)
        background_data += f"{open_facts_info}"

    print("given image_text", image_text)
    if image_text:
        input_prompt += f"\nImage OCR Text: {image_text}"
        if needs_openfoodfacts(image_text):
            open_facts_info = apiserver.scrape_open_food_facts(image_text)
            print("open facts info from OCR:\n", open_facts_info)
            background_data += f"\n{open_facts_info}"
            print("="*10)
        keywords = key_word_extract(model_name, image_text)
        if keywords != "None" and keywords != "nothing":
                print("extracted keywords from OCR:", keywords)
                keywords_list = keywords.split(",")
                for keyword in keywords_list:
                    keyword = keyword.strip()
                    open_facts_info = apiserver.scrape_open_food_facts(keyword)
                    print(f"open facts info for keyword {keywords} from OCR:\n", open_facts_info)
                    background_data += f"{open_facts_info}\n"


    if background_data:
        system_prompt += f"\nBackground Data:{background_data}"

    # messages = [
    #     SystemMessage(content=system_prompt),
    #     HumanMessage(content=input_prompt)
    # ]

    print("given history:", history)

    messages = build_messages(
        system_prompt=system_prompt,
        history=history or [],
        input_prompt=input_prompt,
        image_bytes=image_bytes
    )

    llm = modelfactory.get_llm(model_name)

    response = llm.invoke(messages)
    return response


def main():
    model_name = "gemma3:latest"
    # model_name = "gemini-2.5-flash-lite"
    input_prompt = "Should I eat chicken Biriyani or fried rice this morning?"
    response = get_response(model_name, input_prompt)
    print(response.content)
    print("="*10, "tests", "="*10)
    test_model_output(response.content, model_name)
    # print(key_word_extract(model_name, input_prompt))


if __name__ == "__main__":
    main()
