---
translated: true
---

# Minimax

[Minimax](https://api.minimax.chat)は、企業や個人向けの自然言語処理モデルを提供する中国のスタートアップです。

このサンプルでは、Langchainを使ってMinimaxと対話する方法を示します。

# セットアップ

このノートブックを実行するには、[Minimaxアカウント](https://api.minimax.chat)、[APIキー](https://api.minimax.chat/user-center/basic-information/interface-key)、[グループID](https://api.minimax.chat/user-center/basic-information)が必要です。

# シングルモデルコール

```python
from langchain_community.llms import Minimax
```

```python
# Load the model
minimax = Minimax(minimax_api_key="YOUR_API_KEY", minimax_group_id="YOUR_GROUP_ID")
```

```python
# Prompt the model
minimax("What is the difference between panda and bear?")
```

# チェーンモデルコール

```python
# get api_key and group_id: https://api.minimax.chat/user-center/basic-information
# We need `MINIMAX_API_KEY` and `MINIMAX_GROUP_ID`

import os

os.environ["MINIMAX_API_KEY"] = "YOUR_API_KEY"
os.environ["MINIMAX_GROUP_ID"] = "YOUR_GROUP_ID"
```

```python
from langchain.chains import LLMChain
from langchain_community.llms import Minimax
from langchain_core.prompts import PromptTemplate
```

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

```python
llm = Minimax()
```

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

```python
question = "What NBA team won the Championship in the year Jay Zhou was born?"

llm_chain.run(question)
```
