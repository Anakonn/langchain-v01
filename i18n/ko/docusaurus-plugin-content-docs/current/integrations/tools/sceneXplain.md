---
translated: true
---

# SceneXplain

[SceneXplain](https://scenex.jina.ai/)은 SceneXplain Tool을 통해 접근할 수 있는 ImageCaptioning 서비스입니다.

이 도구를 사용하려면 계정을 만들고 [웹사이트](https://scenex.jina.ai/api)에서 API 토큰을 가져와야 합니다. 그런 다음 도구를 인스턴스화할 수 있습니다.

```python
import os

os.environ["SCENEX_API_KEY"] = "<YOUR_API_KEY>"
```

```python
from langchain.agents import load_tools

tools = load_tools(["sceneXplain"])
```

또는 도구를 직접 인스턴스화할 수 있습니다.

```python
from langchain_community.tools import SceneXplainTool

tool = SceneXplainTool()
```

## Agent에서의 사용

이 도구는 다음과 같이 LangChain agent에서 사용할 수 있습니다:

```python
from langchain.agents import initialize_agent
from langchain.memory import ConversationBufferMemory
from langchain_openai import OpenAI

llm = OpenAI(temperature=0)
memory = ConversationBufferMemory(memory_key="chat_history")
agent = initialize_agent(
    tools, llm, memory=memory, agent="conversational-react-description", verbose=True
)
output = agent.run(
    input=(
        "What is in this image https://storage.googleapis.com/causal-diffusion.appspot.com/imagePrompts%2F0rw369i5h9t%2Foriginal.png. "
        "Is it movie or a game? If it is a movie, what is the name of the movie?"
    )
)

print(output)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Thought: Do I need to use a tool? Yes
Action: Image Explainer
Action Input: https://storage.googleapis.com/causal-diffusion.appspot.com/imagePrompts%2F0rw369i5h9t%2Foriginal.png[0m
Observation: [36;1m[1;3mIn a charmingly whimsical scene, a young girl is seen braving the rain alongside her furry companion, the lovable Totoro. The two are depicted standing on a bustling street corner, where they are sheltered from the rain by a bright yellow umbrella. The girl, dressed in a cheerful yellow frock, holds onto the umbrella with both hands while gazing up at Totoro with an expression of wonder and delight.

Totoro, meanwhile, stands tall and proud beside his young friend, holding his own umbrella aloft to protect them both from the downpour. His furry body is rendered in rich shades of grey and white, while his large ears and wide eyes lend him an endearing charm.

In the background of the scene, a street sign can be seen jutting out from the pavement amidst a flurry of raindrops. A sign with Chinese characters adorns its surface, adding to the sense of cultural diversity and intrigue. Despite the dreary weather, there is an undeniable sense of joy and camaraderie in this heartwarming image.[0m
Thought:[32;1m[1;3m Do I need to use a tool? No
AI: This image appears to be a still from the 1988 Japanese animated fantasy film My Neighbor Totoro. The film follows two young girls, Satsuki and Mei, as they explore the countryside and befriend the magical forest spirits, including the titular character Totoro.[0m

[1m> Finished chain.[0m
This image appears to be a still from the 1988 Japanese animated fantasy film My Neighbor Totoro. The film follows two young girls, Satsuki and Mei, as they explore the countryside and befriend the magical forest spirits, including the titular character Totoro.
```
