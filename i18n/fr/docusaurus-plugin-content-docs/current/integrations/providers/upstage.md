---
translated: true
---

# Upstage

[Upstage](https://upstage.ai) est une entreprise de premier plan spécialisée dans l'intelligence artificielle (IA) qui se concentre sur la fourniture de composants LLM (modèles de langage de grande taille) avec des performances supérieures à celles des humains.

## Solar LLM

**Solar Mini Chat** est un modèle de langage de grande taille avancé et puissant, mais rapide, qui se concentre sur l'anglais et le coréen. Il a été spécifiquement affiné pour les objectifs de conversation à plusieurs tours, montrant des performances améliorées dans une large gamme de tâches de traitement du langage naturel, comme la conversation à plusieurs tours ou les tâches nécessitant une compréhension de longs contextes, comme le RAG (génération avec aide de la recherche), par rapport à d'autres modèles de taille similaire. Cet affinage lui confère la capacité de gérer plus efficacement les conversations plus longues, le rendant particulièrement adapté aux applications interactives.

Outre Solar, Upstage propose également des fonctionnalités pour le RAG (génération avec aide de la recherche) dans le monde réel, comme **Groundedness Check** et **Layout Analysis**.

## Installation et configuration

Installez le package `langchain-upstage` :

```bash
pip install -qU langchain-core langchain-upstage
```

Obtenez les [clés API](https://console.upstage.ai) et définissez la variable d'environnement `UPSTAGE_API_KEY`.

## Intégrations LangChain d'Upstage

| API | Description | Import | Exemple d'utilisation |
| --- | --- | --- | --- |
| Chat | Construisez des assistants à l'aide de Solar Mini Chat | `from langchain_upstage import ChatUpstage` | [Aller](../../chat/upstage) |
| Embedding de texte | Incorporer des chaînes de caractères en vecteurs | `from langchain_upstage import UpstageEmbeddings` | [Aller](../../text_embedding/upstage) |
| Groundedness Check | Vérifier la pertinence de la réponse de l'assistant | `from langchain_upstage import UpstageGroundednessCheck` | [Aller](../../tools/upstage_groundedness_check) |
| Analyse de la mise en page | Sérialiser les documents avec des tableaux et des figures | `from langchain_upstage import UpstageLayoutAnalysisLoader` | [Aller](../../document_loaders/upstage) |

Consultez la [documentation](https://developers.upstage.ai/) pour plus de détails sur les fonctionnalités.

## Exemples rapides

### Configuration de l'environnement

```python
import os

os.environ["UPSTAGE_API_KEY"] = "YOUR_API_KEY"
```

### Chat

```python
from langchain_upstage import ChatUpstage

chat = ChatUpstage()
response = chat.invoke("Hello, how are you?")
print(response)
```

### Embedding de texte

```python
from langchain_upstage import UpstageEmbeddings

embeddings = UpstageEmbeddings()
doc_result = embeddings.embed_documents(
    ["Sam is a teacher.", "This is another document"]
)
print(doc_result)

query_result = embeddings.embed_query("What does Sam do?")
print(query_result)
```

### Groundedness Check

```python
from langchain_upstage import UpstageGroundednessCheck

groundedness_check = UpstageGroundednessCheck()

request_input = {
    "context": "Mauna Kea is an inactive volcano on the island of Hawaii. Its peak is 4,207.3 m above sea level, making it the highest point in Hawaii and second-highest peak of an island on Earth.",
    "answer": "Mauna Kea is 5,207.3 meters tall.",
}
response = groundedness_check.invoke(request_input)
print(response)
```

### Analyse de la mise en page

```python
from langchain_upstage import UpstageLayoutAnalysisLoader

file_path = "/PATH/TO/YOUR/FILE.pdf"
layzer = UpstageLayoutAnalysisLoader(file_path, split="page")

# For improved memory efficiency, consider using the lazy_load method to load documents page by page.
docs = layzer.load()  # or layzer.lazy_load()

for doc in docs[:3]:
    print(doc)
```
