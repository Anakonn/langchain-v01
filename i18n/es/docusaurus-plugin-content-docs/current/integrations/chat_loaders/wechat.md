---
translated: true
---

# WeChat

Todavía no hay una forma sencilla de exportar los mensajes personales de WeChat. Sin embargo, si solo necesitas no más de unos cientos de mensajes para el ajuste fino del modelo o algunos ejemplos de pocos disparos, este cuaderno muestra cómo crear tu propio cargador de chat que funcione en los mensajes de WeChat copiados y pegados a una lista de mensajes de LangChain.

> Muy inspirado en https://python.langchain.com/docs/integrations/chat_loaders/discord

El proceso tiene cinco pasos:
1. Abre tu chat en la aplicación de escritorio de WeChat. Selecciona los mensajes que necesites mediante el arrastrar y soltar del ratón o el clic derecho. Debido a las restricciones, puedes seleccionar hasta 100 mensajes a la vez. `CMD`/`Ctrl` + `C` para copiar.
2. Crea el archivo de chat .txt pegando los mensajes seleccionados en un archivo en tu computadora local.
3. Copia la definición del cargador de chat de abajo a un archivo local.
4. Inicializa el `WeChatChatLoader` con la ruta del archivo apuntando al archivo de texto.
5. Llama a `loader.load()` (o `loader.lazy_load()`) para realizar la conversión.

## 1. Crear volcado de mensajes

Este cargador solo admite archivos .txt con el formato generado al copiar mensajes en la aplicación y pegarlos en un archivo. A continuación se muestra un ejemplo.

```python
%%writefile wechat_chats.txt
女朋友 2023/09/16 2:51 PM
天气有点凉

男朋友 2023/09/16 2:51 PM
珍簟凉风著，瑶琴寄恨生。嵇君懒书札，底物慰秋情。

女朋友 2023/09/16 3:06 PM
忙什么呢

男朋友 2023/09/16 3:06 PM
今天只干成了一件像样的事
那就是想你

女朋友 2023/09/16 3:06 PM
[动画表情]
```

```output
Overwriting wechat_chats.txt
```

## 2. Definir el cargador de chat

LangChain actualmente no admite

```python
import logging
import re
from typing import Iterator, List

from langchain_community.chat_loaders import base as chat_loaders
from langchain_core.messages import BaseMessage, HumanMessage

logger = logging.getLogger()


class WeChatChatLoader(chat_loaders.BaseChatLoader):
    def __init__(self, path: str):
        """
        Initialize the Discord chat loader.

        Args:
            path: Path to the exported Discord chat text file.
        """
        self.path = path
        self._message_line_regex = re.compile(
            r"(?P<sender>.+?) (?P<timestamp>\d{4}/\d{2}/\d{2} \d{1,2}:\d{2} (?:AM|PM))",  # noqa
            # flags=re.DOTALL,
        )

    def _append_message_to_results(
        self,
        results: List,
        current_sender: str,
        current_timestamp: str,
        current_content: List[str],
    ):
        content = "\n".join(current_content).strip()
        # skip non-text messages like stickers, images, etc.
        if not re.match(r"\[.*\]", content):
            results.append(
                HumanMessage(
                    content=content,
                    additional_kwargs={
                        "sender": current_sender,
                        "events": [{"message_time": current_timestamp}],
                    },
                )
            )
        return results

    def _load_single_chat_session_from_txt(
        self, file_path: str
    ) -> chat_loaders.ChatSession:
        """
        Load a single chat session from a text file.

        Args:
            file_path: Path to the text file containing the chat messages.

        Returns:
            A `ChatSession` object containing the loaded chat messages.
        """
        with open(file_path, "r", encoding="utf-8") as file:
            lines = file.readlines()

        results: List[BaseMessage] = []
        current_sender = None
        current_timestamp = None
        current_content = []
        for line in lines:
            if re.match(self._message_line_regex, line):
                if current_sender and current_content:
                    results = self._append_message_to_results(
                        results, current_sender, current_timestamp, current_content
                    )
                current_sender, current_timestamp = re.match(
                    self._message_line_regex, line
                ).groups()
                current_content = []
            else:
                current_content.append(line.strip())

        if current_sender and current_content:
            results = self._append_message_to_results(
                results, current_sender, current_timestamp, current_content
            )

        return chat_loaders.ChatSession(messages=results)

    def lazy_load(self) -> Iterator[chat_loaders.ChatSession]:
        """
        Lazy load the messages from the chat file and yield them in the required format.

        Yields:
            A `ChatSession` object containing the loaded chat messages.
        """
        yield self._load_single_chat_session_from_txt(self.path)
```

## 2. Crear el cargador

Apuntaremos al archivo que acabamos de escribir en el disco.

```python
loader = WeChatChatLoader(
    path="./wechat_chats.txt",
)
```

## 3. Cargar mensajes

Suponiendo que el formato es correcto, el cargador convertirá los chats a mensajes de langchain.

```python
from typing import List

from langchain_community.chat_loaders.utils import (
    map_ai_messages,
    merge_chat_runs,
)
from langchain_core.chat_sessions import ChatSession

raw_messages = loader.lazy_load()
# Merge consecutive messages from the same sender into a single message
merged_messages = merge_chat_runs(raw_messages)
# Convert messages from "男朋友" to AI messages
messages: List[ChatSession] = list(map_ai_messages(merged_messages, sender="男朋友"))
```

```python
messages
```

```output
[{'messages': [HumanMessage(content='天气有点凉', additional_kwargs={'sender': '女朋友', 'events': [{'message_time': '2023/09/16 2:51 PM'}]}, example=False),
   AIMessage(content='珍簟凉风著，瑶琴寄恨生。嵇君懒书札，底物慰秋情。', additional_kwargs={'sender': '男朋友', 'events': [{'message_time': '2023/09/16 2:51 PM'}]}, example=False),
   HumanMessage(content='忙什么呢', additional_kwargs={'sender': '女朋友', 'events': [{'message_time': '2023/09/16 3:06 PM'}]}, example=False),
   AIMessage(content='今天只干成了一件像样的事\n那就是想你', additional_kwargs={'sender': '男朋友', 'events': [{'message_time': '2023/09/16 3:06 PM'}]}, example=False)]}]
```

### Próximos pasos

Puedes usar estos mensajes como mejor te convenga, como ajustar un modelo, seleccionar ejemplos de pocos disparos o hacer predicciones directamente para el siguiente mensaje.

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI()

for chunk in llm.stream(messages[0]["messages"]):
    print(chunk.content, end="", flush=True)
```
