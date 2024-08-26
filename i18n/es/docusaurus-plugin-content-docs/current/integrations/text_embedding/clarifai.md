---
translated: true
---

# Clarifai

>[Clarifai](https://www.clarifai.com/) es una plataforma de IA que proporciona el ciclo de vida completo de la IA, que va desde la exploración de datos, el etiquetado de datos, el entrenamiento de modelos, la evaluación y la inferencia.

Este ejemplo explica cómo usar LangChain para interactuar con los [modelos](https://clarifai.com/explore/models) de `Clarifai`. Los modelos de incrustación de texto en particular se pueden encontrar [aquí](https://clarifai.com/explore/models?page=1&perPage=24&filterData=%5B%7B%22field%22%3A%22model_type_id%22%2C%22value%22%3A%5B%22text-embedder%22%5D%7D%5D).

Para usar Clarifai, debe tener una cuenta y una clave de Token de acceso personal (PAT).
[Consulte aquí](https://clarifai.com/settings/security) para obtener o crear un PAT.

# Dependencias

```python
# Install required dependencies
%pip install --upgrade --quiet  clarifai
```

# Importaciones

Aquí estableceremos el token de acceso personal. Puede encontrar su PAT en [configuración/seguridad](https://clarifai.com/settings/security) en su cuenta de Clarifai.

```python
# Please login and get your API key from  https://clarifai.com/settings/security
from getpass import getpass

CLARIFAI_PAT = getpass()
```

```python
# Import the required modules
from langchain.chains import LLMChain
from langchain_community.embeddings import ClarifaiEmbeddings
from langchain_core.prompts import PromptTemplate
```

# Entrada

Crea una plantilla de solicitud que se utilizará con la cadena LLM:

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

# Configuración

Establezca el ID de usuario y el ID de aplicación en la aplicación en la que reside el modelo. Puede encontrar una lista de modelos públicos en https://clarifai.com/explore/models

También tendrá que inicializar el ID del modelo y, si es necesario, el ID de la versión del modelo. Algunos modelos tienen muchas versiones, puede elegir la más apropiada para su tarea.

```python
USER_ID = "clarifai"
APP_ID = "main"
MODEL_ID = "BAAI-bge-base-en-v15"
MODEL_URL = "https://clarifai.com/clarifai/main/models/BAAI-bge-base-en-v15"

# Further you can also provide a specific model version as the model_version_id arg.
# MODEL_VERSION_ID = "MODEL_VERSION_ID"
```

```python
# Initialize a Clarifai embedding model
embeddings = ClarifaiEmbeddings(user_id=USER_ID, app_id=APP_ID, model_id=MODEL_ID)

# Initialize a clarifai embedding model using model URL
embeddings = ClarifaiEmbeddings(model_url=MODEL_URL)

# Alternatively you can initialize clarifai class with pat argument.
```

```python
text = "roses are red violets are blue."
text2 = "Make hay while the sun shines."
```

¡Puede incrustar una sola línea de su texto usando la función embed_query!

```python
query_result = embeddings.embed_query(text)
```

Además, para incrustar una lista de textos/documentos, use la función embed_documents.

```python
doc_result = embeddings.embed_documents([text, text2])
```
