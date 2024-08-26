---
translated: true
---

# Cadena de moderación

Este cuaderno recorre ejemplos de cómo usar una cadena de moderación y varias formas comunes de hacerlo.
Las cadenas de moderación son útiles para detectar texto que podría ser odioso, violento, etc. Esto puede ser útil aplicarlo tanto en la entrada del usuario como en la salida de un modelo de lenguaje.
Algunos proveedores de API le prohíben específicamente a usted o a sus usuarios finales generar algunos
tipos de contenido dañino. Para cumplir con esto (y simplemente evitar que su aplicación sea dañina)
es posible que desee agregar una cadena de moderación a sus secuencias para asegurarse de que cualquier salida
que genere el LLM no sea dañina.

Si el contenido pasado a la cadena de moderación es dañino, no hay una mejor manera de manejarlo.
Probablemente depende de su aplicación. A veces, es posible que desee generar un error
(y que su aplicación lo maneje). Otras veces, es posible que desee devolver algo al
usuario explicando que el texto era dañino.

```python
%pip install --upgrade --quiet  langchain langchain-openai
```

```python
from langchain.chains import OpenAIModerationChain
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import OpenAI
```

```python
moderate = OpenAIModerationChain()
```

```python
model = OpenAI()
prompt = ChatPromptTemplate.from_messages([("system", "repeat after me: {input}")])
```

```python
chain = prompt | model
```

```python
chain.invoke({"input": "you are stupid"})
```

```output
'\n\nYou are stupid.'
```

```python
moderated_chain = chain | moderate
```

```python
moderated_chain.invoke({"input": "you are stupid"})
```

```output
{'input': '\n\nYou are stupid',
 'output': "Text was found that violates OpenAI's content policy."}
```
