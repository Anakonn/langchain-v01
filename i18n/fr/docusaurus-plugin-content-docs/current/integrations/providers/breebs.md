---
translated: true
---

# Breebs (Open Knowledge)

>[Breebs](https://www.breebs.com/) est une plateforme de connaissances collaboratives ouverte.
>Tout le monde peut créer un `Breeb`, une capsule de connaissances basée sur des fichiers PDF stockés dans un dossier Google Drive.
>Un `Breeb` peut être utilisé par n'importe quel LLM/chatbot pour améliorer son expertise, réduire les hallucinations et donner accès à des sources.
>En coulisses, `Breebs` met en œuvre plusieurs modèles `Retrieval Augmented Generation (RAG)` pour fournir de manière transparente un contexte utile à chaque itération.

## Retriever

```python
from langchain.retrievers import BreebsRetriever
```

[Voir un exemple d'utilisation (Retrieval & ConversationalRetrievalChain)](/docs/integrations/retrievers/breebs)
