---
translated: true
---

# NASA

このノートブックでは、NASAツールキットとやり取りするためのエージェントの使用方法を示します。このツールキットは、NASAイメージ&ビデオライブラリAPIへのアクセスを提供し、将来的には他のアクセス可能なNASA APIを含めることができます。

**注意: NASAイメージ&ビデオライブラリの検索クエリは、必要なメディア結果の数が指定されていない場合、大きな応答を生成する可能性があります。LLMトークンクレジットを使用する前にこれを考慮してください。**

## 使用例:

---

### エージェントの初期化

```python
from langchain.agents import AgentType, initialize_agent
from langchain_community.agent_toolkits.nasa.toolkit import NasaToolkit
from langchain_community.utilities.nasa import NasaAPIWrapper
from langchain_openai import OpenAI

llm = OpenAI(temperature=0, openai_api_key="")
nasa = NasaAPIWrapper()
toolkit = NasaToolkit.from_nasa_api_wrapper(nasa)
agent = initialize_agent(
    toolkit.get_tools(), llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)
```

### メディアアセットの検索

```python
agent.run(
    "Can you find three pictures of the moon published between the years 2014 and 2020?"
)
```

### メディアアセットの詳細の検索

```python
output = agent.run(
    "I've just queried an image of the moon with the NASA id NHQ_2019_0311_Go Forward to the Moon."
    " Where can I find the metadata manifest for this asset?"
)
```
