---
translated: true
---

# Datos de ChatGPT

>[ChatGPT](https://chat.openai.com) es un chatbot de inteligencia artificial (IA) desarrollado por OpenAI.

Este cuaderno cubre cómo cargar `conversations.json` desde tu carpeta de exportación de datos de `ChatGPT`.

Puedes obtener tu exportación de datos por correo electrónico yendo a: https://chat.openai.com/ -> (Perfil) - Configuración -> Exportar datos -> Confirmar exportación.

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
