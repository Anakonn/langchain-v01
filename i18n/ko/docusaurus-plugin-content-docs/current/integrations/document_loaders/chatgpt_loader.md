---
translated: true
---

# ChatGPT 데이터

>[ChatGPT](https://chat.openai.com)는 OpenAI가 개발한 인공지능(AI) 채팅봇입니다.

이 노트북에서는 `conversations.json` 파일을 `ChatGPT` 데이터 내보내기 폴더에서 로드하는 방법을 다룹니다.

데이터 내보내기를 받으려면 https://chat.openai.com/ -> (프로필) - 설정 -> 데이터 내보내기 -> 내보내기 확인을 통해 이메일로 받을 수 있습니다.

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
