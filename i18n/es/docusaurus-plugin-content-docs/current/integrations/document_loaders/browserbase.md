---
translated: true
---

# Browserbase

[Browserbase](https://browserbase.com) es una plataforma sin servidor para ejecutar navegadores sin cabeza, ofrece depuración avanzada, grabaciones de sesiones, modo furtivo, proxies integrados y resolución de captchas.

## Instalación

- Obtén una clave API de [browserbase.com](https://browserbase.com) y configúrala en las variables de entorno (`BROWSERBASE_API_KEY`).
- Instala el [SDK de Browserbase](http://github.com/browserbase/python-sdk):

```python
% pip install browserbase
```

## Carga de documentos

Puedes cargar páginas web en LangChain usando `BrowserbaseLoader`. Opcionalmente, puedes establecer el parámetro `text_content` para convertir las páginas a una representación de solo texto.

```python
from langchain_community.document_loaders import BrowserbaseLoader
```

```python
loader = BrowserbaseLoader(
    urls=[
        "https://example.com",
    ],
    # Text mode
    text_content=False,
)

docs = loader.load()
print(docs[0].page_content[:61])
```

## Carga de imágenes

También puedes cargar capturas de pantalla de páginas web (como bytes) para modelos multimodales.

Ejemplo completo usando GPT-4V:

```python
from browserbase import Browserbase
from browserbase.helpers.gpt4 import GPT4VImage, GPT4VImageDetail
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI

chat = ChatOpenAI(model="gpt-4-vision-preview", max_tokens=256)
browser = Browserbase()

screenshot = browser.screenshot("https://browserbase.com")

result = chat.invoke(
    [
        HumanMessage(
            content=[
                {"type": "text", "text": "What color is the logo?"},
                GPT4VImage(screenshot, GPT4VImageDetail.auto),
            ]
        )
    ]
)

print(result.content)
```
