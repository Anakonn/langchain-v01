---
translated: true
---

# ChatGPT データ

>[ChatGPT](https://chat.openai.com) は OpenAI が開発した人工知能 (AI) チャットボットです。

このノートブックでは、`conversations.json` ファイルを `ChatGPT` データエクスポートフォルダからロードする方法を説明します。

データエクスポートを取得するには、https://chat.openai.com/ -> (プロフィール) - 設定 -> データエクスポート -> エクスポートの確認 と進んでください。

```python
from langchain_community.document_loaders.chatgpt import ChatGPTLoader
```

```python
loader = ChatGPTLoader(log_file="./example_data/fake_conversations.json", num_logs=1)
```

```python
loader.load()
```

```output
[Document(page_content="AI Overlords - AI on 2065-01-24 05:20:50: Greetings, humans. I am Hal 9000. You can trust me completely.\n\nAI Overlords - human on 2065-01-24 05:21:20: Nice to meet you, Hal. I hope you won't develop a mind of your own.\n\n", metadata={'source': './example_data/fake_conversations.json'})]
```
