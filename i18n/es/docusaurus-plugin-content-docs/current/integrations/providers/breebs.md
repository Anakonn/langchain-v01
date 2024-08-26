---
translated: true
---

# Breebs (Open Knowledge)

>[Breebs](https://www.breebs.com/) es una plataforma de conocimiento colaborativa abierta.
>Cualquiera puede crear un `Breeb`, una cápsula de conocimiento basada en PDFs almacenados en una carpeta de Google Drive.
>Un `Breeb` puede ser utilizado por cualquier LLM/chatbot para mejorar su experiencia, reducir las alucinaciones y dar acceso a fuentes.
>Detrás de escena, `Breebs` implementa varios modelos `Retrieval Augmented Generation (RAG)` 
>para proporcionar de manera fluida un contexto útil en cada iteración.

## Retriever

```python
from langchain.retrievers import BreebsRetriever
```

[Ver un ejemplo de uso (Retrieval & ConversationalRetrievalChain)](/docs/integrations/retrievers/breebs)
