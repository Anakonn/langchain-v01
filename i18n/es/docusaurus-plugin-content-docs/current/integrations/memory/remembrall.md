---
translated: true
---

# Remembrall

Esta página cubre cómo usar el ecosistema [Remembrall](https://remembrall.dev) dentro de LangChain.

## ¿Qué es Remembrall?

Remembrall le da a tu modelo de lenguaje memoria a largo plazo, generación aumentada por recuperación y observabilidad completa con solo unas pocas líneas de código.

![Captura de pantalla del panel de Remembrall que muestra las estadísticas de solicitud y las interacciones del modelo.](/img/RemembrallDashboard.png "Interfaz del panel de Remembrall")

Funciona como un proxy ligero encima de tus llamadas a OpenAI y simplemente aumenta el contexto de las llamadas de chat en tiempo de ejecución con los hechos relevantes que se han recopilado.

## Configuración

Para comenzar, [inicia sesión con Github en la plataforma Remembrall](https://remembrall.dev/login) y copia tu [clave API de la página de configuración](https://remembrall.dev/dashboard/settings).

Cualquier solicitud que envíes con el `openai_api_base` modificado (ver a continuación) y la clave API de Remembrall se rastreará automáticamente en el panel de Remembrall. **Nunca** tienes que compartir tu clave OpenAI con nuestra plataforma y esta información **nunca** es almacenada por los sistemas de Remembrall.

Para hacer esto, necesitamos instalar las siguientes dependencias:

```bash
pip install -U langchain-openai
```

### Habilitar la memoria a largo plazo

Además de establecer `openai_api_base` y la clave API de Remembrall a través de `x-gp-api-key`, debes especificar un UID para mantener la memoria. Esto generalmente será un identificador de usuario único (como el correo electrónico).

```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Remembrall"}]-->
from langchain_openai import ChatOpenAI
chat_model = ChatOpenAI(openai_api_base="https://remembrall.dev/api/openai/v1",
                        model_kwargs={
                            "headers":{
                                "x-gp-api-key": "remembrall-api-key-here",
                                "x-gp-remember": "user@email.com",
                            }
                        })

chat_model.predict("My favorite color is blue.")
import time; time.sleep(5)  # wait for system to save fact via auto save
print(chat_model.predict("What is my favorite color?"))
```

### Habilitar la generación aumentada por recuperación

Primero, crea un contexto de documento en el [panel de Remembrall](https://remembrall.dev/dashboard/spells). Pega los textos de los documentos o carga documentos como PDF para que se procesen. Guarda el ID del contexto del documento e insértalo como se muestra a continuación.

```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Remembrall"}]-->
from langchain_openai import ChatOpenAI
chat_model = ChatOpenAI(openai_api_base="https://remembrall.dev/api/openai/v1",
                        model_kwargs={
                            "headers":{
                                "x-gp-api-key": "remembrall-api-key-here",
                                "x-gp-context": "document-context-id-goes-here",
                            }
                        })

print(chat_model.predict("This is a question that can be answered with my document."))
```
