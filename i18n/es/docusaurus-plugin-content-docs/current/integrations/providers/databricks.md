---
translated: true
---

Databricks
==========

La [Plataforma Lakehouse de Databricks](https://www.databricks.com/) unifica datos, análisis y IA en una sola plataforma.

Databricks adopta el ecosistema de LangChain de varias maneras:

1. Conector de Databricks para la Cadena SQLDatabase: SQLDatabase.from_databricks() proporciona una forma sencilla de consultar sus datos en Databricks a través de LangChain
2. Databricks MLflow se integra con LangChain: Seguimiento y servicio de aplicaciones LangChain con menos pasos
3. Databricks como proveedor de LLM: Implementa tus LLM refinados en Databricks a través de puntos finales de servicio o aplicaciones proxy de controlador de clúster, y consúltalos como langchain.llms.Databricks
4. Databricks Dolly: Databricks open-sourced Dolly que permite el uso comercial, y se puede acceder a través del Hugging Face Hub

Conector de Databricks para la Cadena SQLDatabase
-------------------------------------------------
Puede conectarse a [entornos de ejecución de Databricks](https://docs.databricks.com/runtime/index.html) y [Databricks SQL](https://www.databricks.com/product/databricks-sql) utilizando el contenedor SQLDatabase de LangChain.

Databricks MLflow se integra con LangChain
------------------------------------------

MLflow es una plataforma de código abierto para gestionar el ciclo de vida de ML, incluida la experimentación, la reproducibilidad, la implementación y un registro central de modelos. Consulte el cuaderno [Controlador de devolución de llamada de MLflow](/docs/integrations/providers/mlflow_tracking) para obtener detalles sobre la integración de MLflow con LangChain.

Databricks proporciona una versión totalmente administrada y alojada de MLflow integrada con funciones de seguridad empresarial, alta disponibilidad y otras funciones del espacio de trabajo de Databricks, como la gestión de experimentos y ejecuciones y la captura de revisiones de cuadernos. MLflow en Databricks ofrece una experiencia integrada para el seguimiento y la seguridad de las ejecuciones de entrenamiento de modelos de aprendizaje automático y la ejecución de proyectos de aprendizaje automático. Consulte la [guía de MLflow](https://docs.databricks.com/mlflow/index.html) para obtener más detalles.

Databricks MLflow facilita el desarrollo de aplicaciones LangChain en Databricks. Para el seguimiento de MLflow, no necesita establecer el URI de seguimiento. Para el servicio de modelos de MLflow, puede guardar las cadenas de LangChain en el sabor de langchain de MLflow y luego registrar y servir la cadena con unos pocos clics en Databricks, con las credenciales administradas de forma segura por el servicio de modelos de MLflow.

Modelos externos de Databricks
-----------------------------

[Modelos externos de Databricks](https://docs.databricks.com/generative-ai/external-models/index.html) es un servicio diseñado para simplificar el uso y la gestión de varios proveedores de modelos de lenguaje grande (LLM), como OpenAI y Anthropic, dentro de una organización. Ofrece una interfaz de alto nivel que simplifica la interacción con estos servicios al proporcionar un punto final unificado para manejar solicitudes específicas relacionadas con LLM. El siguiente ejemplo crea un punto final que sirve al modelo GPT-4 de OpenAI y genera una respuesta de chat a partir de él:

```python
<!--IMPORTS:[{"imported": "ChatDatabricks", "source": "langchain_community.chat_models", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_community.chat_models.databricks.ChatDatabricks.html", "title": "-> content='Hello! How can I assist you today?'"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.human.HumanMessage.html", "title": "-> content='Hello! How can I assist you today?'"}]-->
from langchain_community.chat_models import ChatDatabricks
from langchain_core.messages import HumanMessage
from mlflow.deployments import get_deploy_client


client = get_deploy_client("databricks")
name = f"chat"
client.create_endpoint(
    name=name,
    config={
        "served_entities": [
            {
                "name": "test",
                "external_model": {
                    "name": "gpt-4",
                    "provider": "openai",
                    "task": "llm/v1/chat",
                    "openai_config": {
                        "openai_api_key": "{{secrets/<scope>/<key>}}",
                    },
                },
            }
        ],
    },
)
chat = ChatDatabricks(endpoint=name, temperature=0.1)
print(chat([HumanMessage(content="hello")]))
# -> content='Hello! How can I assist you today?'
```

API de modelos base de Databricks
--------------------------------

[API de modelos base de Databricks](https://docs.databricks.com/machine-learning/foundation-models/index.html) le permiten acceder y consultar modelos de vanguardia de código abierto desde puntos finales de servicio dedicados. Con las API de modelos base, los desarrolladores pueden crear aplicaciones que aprovechen un modelo de IA generativa de alta calidad sin mantener su propio despliegue de modelos. El siguiente ejemplo utiliza el punto final `databricks-bge-large-en` para generar incrustaciones a partir de texto:

```python
<!--IMPORTS:[{"imported": "DatabricksEmbeddings", "source": "langchain_community.embeddings", "docs": "https://api.python.langchain.com/en/latest/embeddings/langchain_community.embeddings.databricks.DatabricksEmbeddings.html", "title": "-> content='Hello! How can I assist you today?'"}]-->
from langchain_community.embeddings import DatabricksEmbeddings


embeddings = DatabricksEmbeddings(endpoint="databricks-bge-large-en")
print(embeddings.embed_query("hello")[:3])
# -> [0.051055908203125, 0.007221221923828125, 0.003879547119140625, ...]
```

Databricks como proveedor de LLM
-------------------------------

El cuaderno [Envolver los puntos finales de Databricks como LLM](/docs/integrations/llms/databricks#wrapping-a-serving-endpoint-custom-model) demuestra cómo servir un modelo personalizado que se ha registrado mediante MLflow como un punto final de Databricks.
Admite dos tipos de puntos finales: el punto final de servicio, que se recomienda tanto para producción como para desarrollo, y la aplicación proxy del controlador de clúster, que se recomienda para el desarrollo interactivo.

Búsqueda vectorial de Databricks
--------------------------------

Databricks Vector Search es un motor de búsqueda de similitud sin servidor que le permite almacenar una representación vectorial de sus datos, incluidos los metadatos, en una base de datos vectorial. Con Vector Search, puede crear índices de búsqueda vectorial que se actualizan automáticamente a partir de tablas Delta administradas por Unity Catalog y consultarlos con una API sencilla para devolver los vectores más similares. Consulte el cuaderno [Databricks Vector Search](/docs/integrations/vectorstores/databricks_vector_search) para obtener instrucciones sobre cómo utilizarlo con LangChain.
