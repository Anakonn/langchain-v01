---
translated: true
---

# ChatGPT Data

>[ChatGPT](https://chat.openai.com) est un agent conversationnel d'intelligence artificielle (IA) développé par OpenAI.

Ce notebook couvre comment charger `conversations.json` à partir de votre dossier d'exportation de données `ChatGPT`.

Vous pouvez obtenir votre exportation de données par e-mail en allant sur : https://chat.openai.com/ -> (Profil) - Paramètres -> Exporter les données -> Confirmer l'exportation.

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
