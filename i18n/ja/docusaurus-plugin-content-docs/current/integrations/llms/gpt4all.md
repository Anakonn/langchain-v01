---
translated: true
---

# GPT4All

[GitHub:nomic-ai/gpt4all](https://github.com/nomic-ai/gpt4all) は、コード、ストーリー、対話などの大量のクリーンなアシスタントデータに基づいて訓練された、オープンソースのチャットボットのエコシステムです。

この例では、LangChainを使って `GPT4All` モデルとやり取りする方法を説明します。

```python
%pip install --upgrade --quiet  gpt4all > /dev/null
```

```output
Note: you may need to restart the kernel to use updated packages.
```

### GPT4Allのインポート

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.chains import LLMChain
from langchain_community.llms import GPT4All
from langchain_core.prompts import PromptTemplate
```

### 質問の設定

LLMに渡す質問を設定します。

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

### モデルの指定

ローカルで実行するには、互換性のある ggml 形式のモデルをダウンロードする必要があります。

[gpt4allのページ](https://gpt4all.io/index.html)には便利な `Model Explorer` セクションがあります:

* 興味のあるモデルを選択
* UIを使ってダウンロードし、`.bin`ファイルを `local_path` (下記参照)に移動します

詳細については、https://github.com/nomic-ai/gpt4allをご覧ください。

---

```python
local_path = (
    "./models/ggml-gpt4all-l13b-snoozy.bin"  # replace with your desired local file path
)
```

```python
# Callbacks support token-wise streaming
callbacks = [StreamingStdOutCallbackHandler()]

# Verbose is required to pass to the callback manager
llm = GPT4All(model=local_path, callbacks=callbacks, verbose=True)

# If you want to use a custom model add the backend parameter
# Check https://docs.gpt4all.io/gpt4all_python.html for supported backends
llm = GPT4All(model=local_path, backend="gptj", callbacks=callbacks, verbose=True)
```

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

```python
question = "What NFL team won the Super Bowl in the year Justin Bieber was born?"

llm_chain.run(question)
```

ジャスティン・ビーバーは1994年3月1日に生まれました。1994年にはカウボーイズがスーパーボウルXXVIIIを制しました。
