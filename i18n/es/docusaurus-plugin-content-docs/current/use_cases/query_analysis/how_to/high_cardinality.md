---
sidebar_position: 7
translated: true
---

# Lidiar con categorías de alta cardinalidad

Es posible que desee realizar un análisis de consultas para crear un filtro en una columna categórica. Una de las dificultades aquí es que generalmente necesita especificar el valor categórico EXACTO. El problema es que debe asegurarse de que el LLM genere ese valor categórico exactamente. Esto se puede hacer de manera relativamente sencilla con prompting cuando solo hay unos pocos valores válidos. Cuando hay un gran número de valores válidos, entonces se vuelve más difícil, ya que esos valores pueden no caber en el contexto del LLM, o (si lo hacen) puede haber demasiados para que el LLM los atienda adecuadamente.

En este cuaderno, analizaremos cómo abordar esto.

## Configuración

#### Instalar dependencias

```python
# %pip install -qU langchain langchain-community langchain-openai faker langchain-chroma
```

#### Establecer variables de entorno

Utilizaremos OpenAI en este ejemplo:

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Optional, uncomment to trace runs with LangSmith. Sign up here: https://smith.langchain.com.
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

#### Configurar datos

Generaremos un montón de nombres falsos

```python
from faker import Faker

fake = Faker()

names = [fake.name() for _ in range(10000)]
```

Echemos un vistazo a algunos de los nombres

```python
names[0]
```

```output
'Hayley Gonzalez'
```

```python
names[567]
```

```output
'Jesse Knight'
```

## Análisis de consultas

Ahora podemos establecer un análisis de consultas de referencia

```python
from langchain_core.pydantic_v1 import BaseModel, Field
```

```python
class Search(BaseModel):
    query: str
    author: str
```

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

system = """Generate a relevant search query for a library system"""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
structured_llm = llm.with_structured_output(Search)
query_analyzer = {"question": RunnablePassthrough()} | prompt | structured_llm
```

```output
/Users/harrisonchase/workplace/langchain/libs/core/langchain_core/_api/beta_decorator.py:86: LangChainBetaWarning: The function `with_structured_output` is in beta. It is actively being worked on, so the API may change.
  warn_beta(
```

Podemos ver que si escribimos el nombre exactamente correctamente, sabe cómo manejarlo

```python
query_analyzer.invoke("what are books about aliens by Jesse Knight")
```

```output
Search(query='books about aliens', author='Jesse Knight')
```

El problema es que los valores que desea filtrar pueden NO estar escritos exactamente correctamente

```python
query_analyzer.invoke("what are books about aliens by jess knight")
```

```output
Search(query='books about aliens', author='Jess Knight')
```

### Agregar todos los valores

Una forma de solucionar esto es agregar TODOS los posibles valores al prompt. Eso generalmente guiará la consulta en la dirección correcta

```python
system = """Generate a relevant search query for a library system.

`author` attribute MUST be one of:

{authors}

Do NOT hallucinate author name!"""
base_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
prompt = base_prompt.partial(authors=", ".join(names))
```

```python
query_analyzer_all = {"question": RunnablePassthrough()} | prompt | structured_llm
```

Sin embargo... ¡si la lista de categorías es lo suficientemente larga, puede dar error!

```python
try:
    res = query_analyzer_all.invoke("what are books about aliens by jess knight")
except Exception as e:
    print(e)
```

```output
Error code: 400 - {'error': {'message': "This model's maximum context length is 16385 tokens. However, your messages resulted in 33885 tokens (33855 in the messages, 30 in the functions). Please reduce the length of the messages or functions.", 'type': 'invalid_request_error', 'param': 'messages', 'code': 'context_length_exceeded'}}
```

Podemos intentar usar una ventana de contexto más larga... pero con tanta información allí, no se garantiza que lo capte de manera confiable

```python
llm_long = ChatOpenAI(model="gpt-4-turbo-preview", temperature=0)
structured_llm_long = llm_long.with_structured_output(Search)
query_analyzer_all = {"question": RunnablePassthrough()} | prompt | structured_llm_long
```

```python
query_analyzer_all.invoke("what are books about aliens by jess knight")
```

```output
Search(query='aliens', author='Kevin Knight')
```

### Encontrar y todos los valores relevantes

En su lugar, lo que podemos hacer es crear un índice sobre los valores relevantes y luego consultar ese índice para obtener los N valores más relevantes,

```python
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Chroma.from_texts(names, embeddings, collection_name="author_names")
```

```python
def select_names(question):
    _docs = vectorstore.similarity_search(question, k=10)
    _names = [d.page_content for d in _docs]
    return ", ".join(_names)
```

```python
create_prompt = {
    "question": RunnablePassthrough(),
    "authors": select_names,
} | base_prompt
```

```python
query_analyzer_select = create_prompt | structured_llm
```

```python
create_prompt.invoke("what are books by jess knight")
```

```output
ChatPromptValue(messages=[SystemMessage(content='Generate a relevant search query for a library system.\n\n`author` attribute MUST be one of:\n\nJesse Knight, Kelly Knight, Scott Knight, Richard Knight, Andrew Knight, Katherine Knight, Erica Knight, Ashley Knight, Becky Knight, Kevin Knight\n\nDo NOT hallucinate author name!'), HumanMessage(content='what are books by jess knight')])
```

```python
query_analyzer_select.invoke("what are books about aliens by jess knight")
```

```output
Search(query='books about aliens', author='Jesse Knight')
```

### Reemplazar después de la selección

Otro método es dejar que el LLM rellene cualquier valor, pero luego convertir ese valor a un valor válido.
¡Esto incluso se puede hacer con la propia clase Pydantic!

```python
from langchain_core.pydantic_v1 import validator


class Search(BaseModel):
    query: str
    author: str

    @validator("author")
    def double(cls, v: str) -> str:
        return vectorstore.similarity_search(v, k=1)[0].page_content
```

```python
system = """Generate a relevant search query for a library system"""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
corrective_structure_llm = llm.with_structured_output(Search)
corrective_query_analyzer = (
    {"question": RunnablePassthrough()} | prompt | corrective_structure_llm
)
```

```python
corrective_query_analyzer.invoke("what are books about aliens by jes knight")
```

```output
Search(query='books about aliens', author='Jesse Knight')
```

```python
# TODO: show trigram similarity
```
