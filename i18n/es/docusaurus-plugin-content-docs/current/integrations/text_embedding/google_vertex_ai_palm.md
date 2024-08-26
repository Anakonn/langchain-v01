---
translated: true
---

# Google Vertex AI PaLM

>[Vertex AI PaLM API](https://cloud.google.com/vertex-ai/docs/generative-ai/learn/overview) es un servicio en Google Cloud que expone los modelos de incrustación.

Nota: Esta integración es independiente de la integración de Google PaLM.

De forma predeterminada, Google Cloud [no usa](https://cloud.google.com/vertex-ai/docs/generative-ai/data-governance#foundation_model_development) los datos del cliente para entrenar sus modelos base como parte del Compromiso de privacidad de IA/ML de Google Cloud. Puede encontrar más detalles sobre cómo Google procesa los datos en [el Anexo de procesamiento de datos del cliente (CDPA) de Google](https://cloud.google.com/terms/data-processing-addendum).

Para usar Vertex AI PaLM, debe tener instalado el paquete de Python `langchain-google-vertexai` y:
- Tener las credenciales configuradas para su entorno (gcloud, identidad de carga de trabajo, etc.)
- Almacenar la ruta a un archivo JSON de cuenta de servicio como la variable de entorno GOOGLE_APPLICATION_CREDENTIALS

Este código base usa la biblioteca `google.auth` que primero busca la variable de credenciales de la aplicación mencionada anteriormente y luego busca la autenticación a nivel del sistema.

Para obtener más información, consulte:
- https://cloud.google.com/docs/authentication/application-default-credentials#GAC
- https://googleapis.dev/python/google-auth/latest/reference/google.auth.html#module-google.auth

```python
%pip install --upgrade --quiet langchain langchain-google-vertexai
```

```python
from langchain_google_vertexai import VertexAIEmbeddings
```

```python
embeddings = VertexAIEmbeddings()
```

```python
text = "This is a test document."
```

```python
query_result = embeddings.embed_query(text)
```

```python
doc_result = embeddings.embed_documents([text])
```
