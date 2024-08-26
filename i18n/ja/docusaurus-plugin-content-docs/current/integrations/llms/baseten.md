---
translated: true
---

# Baseten

[Baseten](https://baseten.co)は、LangChain生態系におけるLLMsコンポーネントを実装する[Provider](/docs/integrations/providers/baseten)です。

この例では、LangChainを使ってBaseten上のMistral 7Bという言語モデルを使う方法を示します。

# セットアップ

このサンプルを実行するには、以下が必要です:

* [Baseten アカウント](https://baseten.co)
* [API キー](https://docs.baseten.co/observability/api-keys)

API キーを `BASETEN_API_KEY` という環境変数として設定してください。

```sh
export BASETEN_API_KEY="paste_your_api_key_here"
```

# 単一モデルの呼び出し

まず、Baseten上にモデルをデプロイする必要があります。

[Baseten モデルライブラリ](https://app.baseten.co/explore/)からMistralやLlama 2などの基盤モデルを1クリックでデプロイできます。または、独自のモデルを[Trassでデプロイ](https://truss.baseten.co/welcome)することもできます。

この例では、Mistral 7Bを使います。[ここでMistral 7Bをデプロイ](https://app.baseten.co/explore/mistral_7b_instruct)し、モデルダッシュボードのモデルIDに従ってください。

```python
from langchain_community.llms import Baseten
```

```python
# Load the model
mistral = Baseten(model="MODEL_ID", deployment="production")
```

```python
# Prompt the model
mistral("What is the Mistral wind?")
```

# 連鎖モデル呼び出し

LangChainの本来の目的である、1つまたは複数のモデルを連鎖して呼び出すことができます。

例えば、ターミナルエミュレーションのデモでGPTをMistralに置き換えることができます。

```python
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferWindowMemory
from langchain_core.prompts import PromptTemplate

template = """Assistant is a large language model trained by OpenAI.

Assistant is designed to be able to assist with a wide range of tasks, from answering simple questions to providing in-depth explanations and discussions on a wide range of topics. As a language model, Assistant is able to generate human-like text based on the input it receives, allowing it to engage in natural-sounding conversations and provide responses that are coherent and relevant to the topic at hand.

Assistant is constantly learning and improving, and its capabilities are constantly evolving. It is able to process and understand large amounts of text, and can use this knowledge to provide accurate and informative responses to a wide range of questions. Additionally, Assistant is able to generate its own text based on the input it receives, allowing it to engage in discussions and provide explanations and descriptions on a wide range of topics.

Overall, Assistant is a powerful tool that can help with a wide range of tasks and provide valuable insights and information on a wide range of topics. Whether you need help with a specific question or just want to have a conversation about a particular topic, Assistant is here to assist.

{history}
Human: {human_input}
Assistant:"""

prompt = PromptTemplate(input_variables=["history", "human_input"], template=template)


chatgpt_chain = LLMChain(
    llm=mistral,
    llm_kwargs={"max_length": 4096},
    prompt=prompt,
    verbose=True,
    memory=ConversationBufferWindowMemory(k=2),
)

output = chatgpt_chain.predict(
    human_input="I want you to act as a Linux terminal. I will type commands and you will reply with what the terminal should show. I want you to only reply with the terminal output inside one unique code block, and nothing else. Do not write explanations. Do not type commands unless I instruct you to do so. When I need to tell you something in English I will do so by putting text inside curly brackets {like this}. My first command is pwd."
)
print(output)
```

```python
output = chatgpt_chain.predict(human_input="ls ~")
print(output)
```

```python
output = chatgpt_chain.predict(human_input="cd ~")
print(output)
```

```python
output = chatgpt_chain.predict(
    human_input="""echo -e "x=lambda y:y*5+3;print('Result:' + str(x(6)))" > run.py && python3 run.py"""
)
print(output)
```

最後の例のように、出力された数値が正しいかどうかわからないことから分かるように、モデルは提供されたコマンドを実行しているわけではなく、ターミナル出力を推定しているに過ぎません。しかし、この例は、Mistralの豊富なコンテキストウィンドウ、コード生成機能、会話シーケンスでもトピックを維持する能力を示しています。
