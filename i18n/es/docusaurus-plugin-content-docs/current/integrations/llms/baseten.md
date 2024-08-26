---
translated: true
---

# Baseten

[Baseten](https://baseten.co) es un [Proveedor](/docs/integrations/providers/baseten) en el ecosistema LangChain que implementa el componente LLMs.

Este ejemplo demuestra el uso de un LLM - Mistral 7B alojado en Baseten - con LangChain.

# Configuración

Para ejecutar este ejemplo, necesitarás:

* Una [cuenta de Baseten](https://baseten.co)
* Una [clave API](https://docs.baseten.co/observability/api-keys)

Exporta tu clave API a tu entorno como una variable de entorno llamada `BASETEN_API_KEY`.

```sh
export BASETEN_API_KEY="paste_your_api_key_here"
```

# Llamada a un solo modelo

Primero, deberás implementar un modelo en Baseten.

Puedes implementar modelos de fundación como Mistral y Llama 2 con un solo clic desde la [biblioteca de modelos de Baseten](https://app.baseten.co/explore/) o si tienes tu propio modelo, [implementarlo con Truss](https://truss.baseten.co/welcome).

En este ejemplo, trabajaremos con Mistral 7B. [Implementa Mistral 7B aquí](https://app.baseten.co/explore/mistral_7b_instruct) y sigue las instrucciones del tablero del modelo implementado para obtener su ID.

```python
from langchain_community.llms import Baseten
```

```python
# Load the model
mistral = Baseten(model="MODEL_ID", deployment="production")
```

```python
# Prompt the model
mistral("What is the Mistral wind?")
```

# Llamadas encadenadas a modelos

¡Podemos encadenar múltiples llamadas a uno o varios modelos, que es el propósito principal de Langchain!

Por ejemplo, podemos reemplazar GPT con Mistral en esta demostración de emulación de terminal.

```python
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferWindowMemory
from langchain_core.prompts import PromptTemplate

template = """Assistant is a large language model trained by OpenAI.

Assistant is designed to be able to assist with a wide range of tasks, from answering simple questions to providing in-depth explanations and discussions on a wide range of topics. As a language model, Assistant is able to generate human-like text based on the input it receives, allowing it to engage in natural-sounding conversations and provide responses that are coherent and relevant to the topic at hand.

Assistant is constantly learning and improving, and its capabilities are constantly evolving. It is able to process and understand large amounts of text, and can use this knowledge to provide accurate and informative responses to a wide range of questions. Additionally, Assistant is able to generate its own text based on the input it receives, allowing it to engage in discussions and provide explanations and descriptions on a wide range of topics.

Overall, Assistant is a powerful tool that can help with a wide range of tasks and provide valuable insights and information on a wide range of topics. Whether you need help with a specific question or just want to have a conversation about a particular topic, Assistant is here to assist.

{history}
Human: {human_input}
Assistant:"""

prompt = PromptTemplate(input_variables=["history", "human_input"], template=template)


chatgpt_chain = LLMChain(
    llm=mistral,
    llm_kwargs={"max_length": 4096},
    prompt=prompt,
    verbose=True,
    memory=ConversationBufferWindowMemory(k=2),
)

output = chatgpt_chain.predict(
    human_input="I want you to act as a Linux terminal. I will type commands and you will reply with what the terminal should show. I want you to only reply with the terminal output inside one unique code block, and nothing else. Do not write explanations. Do not type commands unless I instruct you to do so. When I need to tell you something in English I will do so by putting text inside curly brackets {like this}. My first command is pwd."
)
print(output)
```

```python
output = chatgpt_chain.predict(human_input="ls ~")
print(output)
```

```python
output = chatgpt_chain.predict(human_input="cd ~")
print(output)
```

```python
output = chatgpt_chain.predict(
    human_input="""echo -e "x=lambda y:y*5+3;print('Result:' + str(x(6)))" > run.py && python3 run.py"""
)
print(output)
```

Como podemos ver en el último ejemplo, que genera un número que puede ser correcto o no, el modelo solo está aproximando la salida probable de la terminal, no ejecutando los comandos proporcionados. Aun así, el ejemplo demuestra la amplia ventana de contexto de Mistral, sus capacidades de generación de código y su capacidad de mantenerse en el tema incluso en secuencias conversacionales.
