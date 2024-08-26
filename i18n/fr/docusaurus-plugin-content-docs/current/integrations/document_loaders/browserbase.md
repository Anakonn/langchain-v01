---
translated: true
---

# Browserbase

[Browserbase](https://browserbase.com) est une plateforme sans serveur pour exécuter des navigateurs sans tête, elle offre un débogage avancé, des enregistrements de session, un mode furtif, des proxys intégrés et la résolution de captchas.

## Installation

- Obtenez une clé API sur [browserbase.com](https://browserbase.com) et définissez-la dans les variables d'environnement (`BROWSERBASE_API_KEY`).
- Installez le [SDK Browserbase](http://github.com/browserbase/python-sdk) :

```python
% pip install browserbase
```

## Chargement de documents

Vous pouvez charger des pages Web dans LangChain à l'aide de `BrowserbaseLoader`. Vous pouvez également définir le paramètre `text_content` pour convertir les pages en une représentation en texte seul.

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

## Chargement d'images

Vous pouvez également charger des captures d'écran de pages Web (sous forme d'octets) pour les modèles multimodaux.

Exemple complet utilisant GPT-4V :

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
