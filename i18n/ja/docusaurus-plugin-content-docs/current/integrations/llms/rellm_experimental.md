---
translated: true
---

# RELLM

[RELLM](https://github.com/r2d4/rellm)は、構造化デコーディングのためのローカルなHugging Faceパイプラインモデルをラップするライブラリです。

トークンを1つずつ生成することで機能します。各ステップで、提供された部分的な正規表現に準拠しないトークンをマスクします。

**警告 - このモジュールはまだ実験的です**

```python
%pip install --upgrade --quiet  rellm > /dev/null
```

### Hugging Faceのベースライン

まず、構造化デコーディングなしでモデルの出力を確認することで、定性的なベースラインを確立しましょう。

```python
import logging

logging.basicConfig(level=logging.ERROR)
prompt = """Human: "What's the capital of the United States?"
AI Assistant:{
  "action": "Final Answer",
  "action_input": "The capital of the United States is Washington D.C."
}
Human: "What's the capital of Pennsylvania?"
AI Assistant:{
  "action": "Final Answer",
  "action_input": "The capital of Pennsylvania is Harrisburg."
}
Human: "What 2 + 5?"
AI Assistant:{
  "action": "Final Answer",
  "action_input": "2 + 5 = 7."
}
Human: 'What's the capital of Maryland?'
AI Assistant:"""
```

```python
from langchain_community.llms import HuggingFacePipeline
from transformers import pipeline

hf_model = pipeline(
    "text-generation", model="cerebras/Cerebras-GPT-590M", max_new_tokens=200
)

original_model = HuggingFacePipeline(pipeline=hf_model)

generated = original_model.generate([prompt], stop=["Human:"])
print(generated)
```

```output
Setting `pad_token_id` to `eos_token_id`:50256 for open-end generation.

generations=[[Generation(text=' "What\'s the capital of Maryland?"\n', generation_info=None)]] llm_output=None
```

***それほど印象的ではありませんね。質問に答えておらず、JSONフォーマットにも従っていません! 構造化デコーダーを使ってみましょう。***

## RELLM LLMラッパー

JSONの構造化フォーマットに一致するregexを提供して、もう一度試してみましょう。

```python
import regex  # Note this is the regex library NOT python's re stdlib module

# We'll choose a regex that matches to a structured json string that looks like:
# {
#  "action": "Final Answer",
# "action_input": string or dict
# }
pattern = regex.compile(
    r'\{\s*"action":\s*"Final Answer",\s*"action_input":\s*(\{.*\}|"[^"]*")\s*\}\nHuman:'
)
```

```python
from langchain_experimental.llms import RELLM

model = RELLM(pipeline=hf_model, regex=pattern, max_new_tokens=200)

generated = model.predict(prompt, stop=["Human:"])
print(generated)
```

```output
{"action": "Final Answer",
  "action_input": "The capital of Maryland is Baltimore."
}
```

**素晴らしい! パースエラーがありません。**
