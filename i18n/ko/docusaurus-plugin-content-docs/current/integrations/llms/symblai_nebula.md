---
translated: true
---

# Nebula (Symbl.ai)

[Nebula](https://symbl.ai/nebula/)는 [Symbl.ai](https://symbl.ai)에서 개발한 대규모 언어 모델(LLM)입니다. 대화에 대한 생성 작업을 수행하도록 훈련되었습니다. Nebula는 대화의 미묘한 세부 사항을 모델링하고 대화에 대한 작업을 수행하는 데 뛰어납니다.

Nebula 문서: https://docs.symbl.ai/docs/nebula-llm

이 예제에서는 LangChain을 사용하여 [Nebula 플랫폼](https://docs.symbl.ai/docs/nebula-llm)과 상호 작용하는 방법을 설명합니다.

API 키가 있어야 합니다. 없는 경우 [요청](https://info.symbl.ai/Nebula_Private_Beta.html)하시기 바랍니다.

```python
from langchain_community.llms.symblai_nebula import Nebula

llm = Nebula(nebula_api_key="<your_api_key>")
```

대화 transcript와 지침을 사용하여 프롬프트를 구성합니다.

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate

conversation = """Sam: Good morning, team! Let's keep this standup concise. We'll go in the usual order: what you did yesterday, what you plan to do today, and any blockers. Alex, kick us off.
Alex: Morning! Yesterday, I wrapped up the UI for the user dashboard. The new charts and widgets are now responsive. I also had a sync with the design team to ensure the final touchups are in line with the brand guidelines. Today, I'll start integrating the frontend with the new API endpoints Rhea was working on. The only blocker is waiting for some final API documentation, but I guess Rhea can update on that.
Rhea: Hey, all! Yep, about the API documentation - I completed the majority of the backend work for user data retrieval yesterday. The endpoints are mostly set up, but I need to do a bit more testing today. I'll finalize the API documentation by noon, so that should unblock Alex. After that, I’ll be working on optimizing the database queries for faster data fetching. No other blockers on my end.
Sam: Great, thanks Rhea. Do reach out if you need any testing assistance or if there are any hitches with the database. Now, my update: Yesterday, I coordinated with the client to get clarity on some feature requirements. Today, I'll be updating our project roadmap and timelines based on their feedback. Additionally, I'll be sitting with the QA team in the afternoon for preliminary testing. Blocker: I might need both of you to be available for a quick call in case the client wants to discuss the changes live.
Alex: Sounds good, Sam. Just let us know a little in advance for the call.
Rhea: Agreed. We can make time for that.
Sam: Perfect! Let's keep the momentum going. Reach out if there are any sudden issues or support needed. Have a productive day!
Alex: You too.
Rhea: Thanks, bye!"""

instruction = "Identify the main objectives mentioned in this conversation."

prompt = PromptTemplate.from_template("{instruction}\n{conversation}")

llm_chain = LLMChain(prompt=prompt, llm=llm)

llm_chain.run(instruction=instruction, conversation=conversation)
```
