---
translated: true
---

# Dria

>[Dria](https://dria.co/) es un centro de modelos RAG públicos para que los desarrolladores contribuyan y utilicen un lago de incrustaciones compartido. Este cuaderno demuestra cómo usar la `API de Dria` para tareas de recuperación de datos.

# Instalación

Asegúrese de tener instalado el paquete `dria`. Puede instalarlo usando pip:

```python
%pip install --upgrade --quiet dria
```

# Configurar la clave API

Configura tu clave API de Dria para acceder.

```python
import os

os.environ["DRIA_API_KEY"] = "DRIA_API_KEY"
```

# Inicializar el Recuperador de Dria

Crea una instancia de `DriaRetriever`.

```python
from langchain.retrievers import DriaRetriever

api_key = os.getenv("DRIA_API_KEY")
retriever = DriaRetriever(api_key=api_key)
```

# **Crear Base de Conocimiento**

Crea un conocimiento en [Dria's Knowledge Hub](https://dria.co/knowledge)

```python
contract_id = retriever.create_knowledge_base(
    name="France's AI Development",
    embedding=DriaRetriever.models.jina_embeddings_v2_base_en.value,
    category="Artificial Intelligence",
    description="Explore the growth and contributions of France in the field of Artificial Intelligence.",
)
```

# Agregar Datos

Carga datos en tu base de conocimiento de Dria.

```python
texts = [
    "The first text to add to Dria.",
    "Another piece of information to store.",
    "More data to include in the Dria knowledge base.",
]

ids = retriever.add_texts(texts)
print("Data added with IDs:", ids)
```

# Recuperar Datos

Usa el recuperador para encontrar documentos relevantes dados una consulta.

```python
query = "Find information about Dria."
result = retriever.invoke(query)
for doc in result:
    print(doc)
```
