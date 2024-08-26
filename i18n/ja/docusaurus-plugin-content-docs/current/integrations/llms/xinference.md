---
translated: true
---

# Xorbits Inference (Xinference)

[Xinference](https://github.com/xorbitsai/inference)は、ラップトップでも使えるように設計された、強力で汎用性の高いライブラリです。LLM、音声認識モデル、マルチモーダルモデルをサポートしています。GGML互換のモデル、例えばchatglm、baichuan、whisper、vicuna、orcaなどに対応しています。このノートブックでは、LangChainでXinferenceを使う方法を示します。

## インストール

PyPIを通じて`Xinference`をインストールします:

```python
%pip install --upgrade --quiet  "xinference[all]"
```

## Xinferenceをローカルまたは分散クラスターにデプロイする

ローカルデプロイの場合は`xinference`を実行します。

クラスターにデプロイする場合は、まず`xinference-supervisor`を使ってXinference supervisorを起動します。ポートを指定するには-pオプション、ホストを指定するには-Hオプションを使います。デフォルトのポートは9997です。

次に、`xinference-worker`を使ってXinference workerを各サーバーで起動します。

詳細は[Xinference](https://github.com/xorbitsai/inference)のREADMEファイルを参照してください。

## ラッパー

LangChainでXinferenceを使うには、まずモデルを起動する必要があります。CLIを使って行います:

```python
!xinference launch -n vicuna-v1.3 -f ggmlv3 -q q4_0
```

```output
Model uid: 7167b2b0-2a04-11ee-83f0-d29396a3f064
```

モデルのUIDが返されるので、これを使ってLangChainでXinferenceを使えます:

```python
from langchain_community.llms import Xinference

llm = Xinference(
    server_url="http://0.0.0.0:9997", model_uid="7167b2b0-2a04-11ee-83f0-d29396a3f064"
)

llm(
    prompt="Q: where can we visit in the capital of France? A:",
    generate_config={"max_tokens": 1024, "stream": True},
)
```

```output
' You can visit the Eiffel Tower, Notre-Dame Cathedral, the Louvre Museum, and many other historical sites in Paris, the capital of France.'
```

### LLMChainに統合する

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate

template = "Where can we visit in the capital of {country}?"

prompt = PromptTemplate.from_template(template)

llm_chain = LLMChain(prompt=prompt, llm=llm)

generated = llm_chain.run(country="France")
print(generated)
```

```output

A: You can visit many places in Paris, such as the Eiffel Tower, the Louvre Museum, Notre-Dame Cathedral, the Champs-Elysées, Montmartre, Sacré-Cœur, and the Palace of Versailles.
```

最後に、使い終わったらモデルを終了します:

```python
!xinference terminate --model-uid "7167b2b0-2a04-11ee-83f0-d29396a3f064"
```
