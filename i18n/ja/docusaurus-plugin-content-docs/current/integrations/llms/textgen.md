---
translated: true
---

# TextGen

[GitHub:oobabooga/text-generation-webui](https://github.com/oobabooga/text-generation-webui) LLaMA、llama.cpp、GPT-J、Pythia、OPT、GALACTICAなどの大規模言語モデルを実行するための Gradio Web UI です。

この例では、LangChainを使用して `text-generation-webui` API統合を介してLLMモデルと対話する方法について説明します。

`text-generation-webui`を構成し、LLMをインストールしていることを確認してください。お使いのOSに適した[ワンクリックインストーラー](https://github.com/oobabooga/text-generation-webui#one-click-installers)を使用することをお勧めします。

`text-generation-webui`がインストールされ、Webインターフェイスで確認できるようになったら、Webモデル構成タブからapi オプションを有効にするか、起動コマンドに `--api` 引数を追加してください。

## model_urlを設定し、例を実行する

```python
model_url = "http://localhost:5000"
```

```python
from langchain.chains import LLMChain
from langchain.globals import set_debug
from langchain_community.llms import TextGen
from langchain_core.prompts import PromptTemplate

set_debug(True)

template = """Question: {question}

Answer: Let's think step by step."""


prompt = PromptTemplate.from_template(template)
llm = TextGen(model_url=model_url)
llm_chain = LLMChain(prompt=prompt, llm=llm)
question = "What NFL team won the Super Bowl in the year Justin Bieber was born?"

llm_chain.run(question)
```

### ストリーミングバージョン

この機能を使用するには、websocket-clientをインストールする必要があります。
`pip install websocket-client`

```python
model_url = "ws://localhost:5005"
```

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.chains import LLMChain
from langchain.globals import set_debug
from langchain_community.llms import TextGen
from langchain_core.prompts import PromptTemplate

set_debug(True)

template = """Question: {question}

Answer: Let's think step by step."""


prompt = PromptTemplate.from_template(template)
llm = TextGen(
    model_url=model_url, streaming=True, callbacks=[StreamingStdOutCallbackHandler()]
)
llm_chain = LLMChain(prompt=prompt, llm=llm)
question = "What NFL team won the Super Bowl in the year Justin Bieber was born?"

llm_chain.run(question)
```

```python
llm = TextGen(model_url=model_url, streaming=True)
for chunk in llm.stream("Ask 'Hi, how are you?' like a pirate:'", stop=["'", "\n"]):
    print(chunk, end="", flush=True)
```
