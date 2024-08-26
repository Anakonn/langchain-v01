---
translated: true
---

# PremAI

>[PremAI](https://app.premai.io) es una plataforma unificada que le permite construir aplicaciones listas para la producción y potentes impulsadas por GenAI con el menor esfuerzo, para que pueda concentrarse más en la experiencia del usuario y el crecimiento general. En esta sección vamos a discutir cómo podemos acceder a diferentes modelos de incrustación utilizando `PremAIEmbeddings`.

## Instalación y configuración

Comenzamos instalando langchain y premai-sdk. Puede escribir el siguiente comando para instalar:

```bash
pip install premai langchain
```

Antes de continuar, asegúrese de haber creado una cuenta en Prem y ya haber iniciado un proyecto. Si no es así, aquí está cómo puede comenzar de forma gratuita:

1. Inicie sesión en [PremAI](https://app.premai.io/accounts/login/), si es la primera vez que viene y cree su clave API [aquí](https://app.premai.io/api_keys/).

2. Vaya a [app.premai.io](https://app.premai.io) y esto lo llevará al panel de control del proyecto.

3. Cree un proyecto y esto generará un ID de proyecto (escrito como ID). Este ID lo ayudará a interactuar con su aplicación implementada.

Felicitaciones por crear su primera aplicación implementada en Prem 🎉 Ahora podemos usar langchain para interactuar con nuestra aplicación.

```python
# Let's start by doing some imports and define our embedding object

from langchain_community.embeddings import PremAIEmbeddings
```

Una vez que hayamos importado los módulos requeridos, configuremos nuestro cliente. Por ahora supongamos que nuestro `project_id` es 8. Pero asegúrese de usar su ID de proyecto, de lo contrario arrojará un error.

```python
import getpass
import os

if os.environ.get("PREMAI_API_KEY") is None:
    os.environ["PREMAI_API_KEY"] = getpass.getpass("PremAI API Key:")
```

```python
model = "text-embedding-3-large"
embedder = PremAIEmbeddings(project_id=8, model=model)
```

Hemos definido nuestro modelo de incrustación. Admitimos muchos modelos de incrustación. Aquí hay una tabla que muestra el número de modelos de incrustación que admitimos.

| Proveedor   | Slug                                     | Tokens de contexto |
|-------------|------------------------------------------|-------------------|
| cohere      | embed-english-v3.0                       | N/A               |
| openai      | text-embedding-3-small                   | 8191              |
| openai      | text-embedding-3-large                   | 8191              |
| openai      | text-embedding-ada-002                   | 8191              |
| replicate   | replicate/all-mpnet-base-v2              | N/A               |
| together    | togethercomputer/Llama-2-7B-32K-Instruct | N/A               |
| mistralai   | mistral-embed                            | 4096              |

Para cambiar el modelo, simplemente necesita copiar el `slug` y acceder a su modelo de incrustación. Ahora comencemos a usar nuestro modelo de incrustación con una sola consulta seguida de múltiples consultas (lo que también se llama documento)

```python
query = "Hello, this is a test query"
query_result = embedder.embed_query(query)

# Let's print the first five elements of the query embedding vector

print(query_result[:5])
```

```output
[-0.02129288576543331, 0.0008162345038726926, -0.004556538071483374, 0.02918623760342598, -0.02547479420900345]
```

Finalmente, incrustemos un documento

```python
documents = ["This is document1", "This is document2", "This is document3"]

doc_result = embedder.embed_documents(documents)

# Similar to previous result, let's print the first five element
# of the first document vector

print(doc_result[0][:5])
```

```output
[-0.0030691148713231087, -0.045334383845329285, -0.0161729846149683, 0.04348714277148247, -0.0036920777056366205]
```
