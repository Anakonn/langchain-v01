---
traducido: falso
translated: true
---

# IBM watsonx.ai

>WatsonxEmbeddings es un wrapper para los modelos de fundación [watsonx.ai](https://www.ibm.com/products/watsonx-ai) de IBM.

Este ejemplo muestra cómo comunicarse con los modelos `watsonx.ai` usando `LangChain`.

## Configuración

Instala el paquete `langchain-ibm`.

```python
!pip install -qU langchain-ibm
```

Esta celda define las credenciales de WML necesarias para trabajar con Watsonx Embeddings.

**Acción:** Proporciona la clave de API de usuario de IBM Cloud. Para más detalles, consulta la [documentación](https://cloud.ibm.com/docs/account?topic=account-userapikey&interface=ui).

```python
import os
from getpass import getpass

watsonx_api_key = getpass()
os.environ["WATSONX_APIKEY"] = watsonx_api_key
```

Adicionalmente, puedes pasar secretos adicionales como una variable de entorno.

```python
import os

os.environ["WATSONX_URL"] = "your service instance url"
os.environ["WATSONX_TOKEN"] = "your token for accessing the CPD cluster"
os.environ["WATSONX_PASSWORD"] = "your password for accessing the CPD cluster"
os.environ["WATSONX_USERNAME"] = "your username for accessing the CPD cluster"
os.environ["WATSONX_INSTANCE_ID"] = "your instance_id for accessing the CPD cluster"
```

## Cargar el modelo

Es posible que necesites ajustar los `parámetros` del modelo para diferentes modelos.

```python
from ibm_watsonx_ai.metanames import EmbedTextParamsMetaNames

embed_params = {
    EmbedTextParamsMetaNames.TRUNCATE_INPUT_TOKENS: 3,
    EmbedTextParamsMetaNames.RETURN_OPTIONS: {"input_text": True},
}
```

Inicializa la clase `WatsonxEmbeddings` con los parámetros establecidos anteriormente.

**Nota**:

- Para proporcionar contexto a la llamada a la API, debes agregar `project_id` o `space_id`. Para más información, consulta la [documentación](https://www.ibm.com/docs/en/watsonx-as-a-service?topic=projects).
- Dependiendo de la región de tu instancia de servicio aprovisionada, usa una de las URLs descritas [aquí](https://ibm.github.io/watsonx-ai-python-sdk/setup_cloud.html#authentication).

En este ejemplo, usaremos el `project_id` y la URL de Dallas.

Debes especificar el `model_id` que se utilizará para la inferencia.

```python
from langchain_ibm import WatsonxEmbeddings

watsonx_embedding = WatsonxEmbeddings(
    model_id="ibm/slate-125m-english-rtrvr",
    url="https://us-south.ml.cloud.ibm.com",
    project_id="PASTE YOUR PROJECT_ID HERE",
    params=embed_params,
)
```

Alternativamente, puedes usar las credenciales de Cloud Pak for Data. Para más detalles, consulta la [documentación](https://ibm.github.io/watsonx-ai-python-sdk/setup_cpd.html).

```python
watsonx_embedding = WatsonxEmbeddings(
    model_id="ibm/slate-125m-english-rtrvr",
    url="PASTE YOUR URL HERE",
    username="PASTE YOUR USERNAME HERE",
    password="PASTE YOUR PASSWORD HERE",
    instance_id="openshift",
    version="5.0",
    project_id="PASTE YOUR PROJECT_ID HERE",
    params=embed_params,
)
```

## Uso

### Incrustar consulta

```python
text = "This is a test document."

query_result = watsonx_embedding.embed_query(text)
query_result[:5]
```

```output
[0.0094472, -0.024981909, -0.026013248, -0.040483925, -0.057804465]
```

### Incrustar documentos

```python
texts = ["This is a content of the document", "This is another document"]

doc_result = watsonx_embedding.embed_documents(texts)
doc_result[0][:5]
```

```output
[0.009447193, -0.024981918, -0.026013244, -0.040483937, -0.057804447]
```
