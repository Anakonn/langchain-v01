---
translated: true
---

# Cohere

>[Cohere](https://cohere.ai/about) es una startup canadiense que proporciona modelos de procesamiento de lenguaje natural que ayudan a las empresas a mejorar las interacciones entre humanos y máquinas.

Dirígete a la [referencia de la API](https://api.python.langchain.com/en/latest/llms/langchain_community.llms.cohere.Cohere.html) para obtener una documentación detallada de todos los atributos y métodos.

## Configuración

La integración se encuentra en el paquete `langchain-community`. También necesitamos instalar el paquete `cohere` en sí. Podemos instalarlos con:

```bash
pip install -U langchain-community langchain-cohere
```

También necesitaremos obtener una [clave de la API de Cohere](https://cohere.com/) y establecer la variable de entorno `COHERE_API_KEY`:

```python
import getpass
import os

os.environ["COHERE_API_KEY"] = getpass.getpass()
```

```output
 ········
```

También es útil (pero no necesario) configurar [LangSmith](https://smith.langchain.com/) para una observabilidad de primera clase.

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## Uso

Cohere admite toda la funcionalidad [LLM](/docs/modules/model_io/llms/):

```python
from langchain_cohere import Cohere
from langchain_core.messages import HumanMessage
```

```python
model = Cohere(model="command", max_tokens=256, temperature=0.75)
```

```python
message = "Knock knock"
model.invoke(message)
```

```output
" Who's there?"
```

```python
await model.ainvoke(message)
```

```output
" Who's there?"
```

```python
for chunk in model.stream(message):
    print(chunk, end="", flush=True)
```

```output
 Who's there?
```

```python
model.batch([message])
```

```output
[" Who's there?"]
```

También puedes combinarlo fácilmente con una plantilla de indicador para una fácil estructuración de la entrada del usuario. Podemos hacer esto usando [LCEL](/docs/expression_language)

```python
from langchain_core.prompts import PromptTemplate

prompt = PromptTemplate.from_template("Tell me a joke about {topic}")
chain = prompt | model
```

```python
chain.invoke({"topic": "bears"})
```

```output
' Why did the teddy bear cross the road?\nBecause he had bear crossings.\n\nWould you like to hear another joke? '
```
