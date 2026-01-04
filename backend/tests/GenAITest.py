# from google import genai
# from google.genai import types
from modelmanager import modelfactory
from langchain_core.messages import SystemMessage, HumanMessage

class User:

    def __init__(self, model_name="gemini-2.5-flash-lite"):
        # self.client = genai.Client()
        # self.model_name = model_name
        self.llm = modelfactory.get_llm(model_name)

    def test(self, text):
        # response = self.client.models.generate_content(
        #     model=self.model_name,
        #     contents=text,
        #     config=types.GenerateContentConfig(
        #         system_instruction=self.get_system_prompt()
        #     )
        # )

        messages = [
            SystemMessage(content=self.get_system_prompt()),
            HumanMessage(content=text)
        ]

        response = self.llm.invoke(messages)
        return response.content

