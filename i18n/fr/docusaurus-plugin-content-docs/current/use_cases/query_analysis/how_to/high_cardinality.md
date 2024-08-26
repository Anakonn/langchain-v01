---
sidebar_position: 7
translated: true
---

# Gérer les catégorielles à haute cardinalité

Il est possible que vous souhaitiez effectuer une analyse des requêtes pour créer un filtre sur une colonne catégorielle. L'une des difficultés ici est que vous devez généralement spécifier la valeur catégorielle EXACTE. Le problème est que vous devez vous assurer que le LLM génère cette valeur catégorielle exactement. Cela peut être fait relativement facilement avec un prompt lorsqu'il n'y a que quelques valeurs valides. Lorsqu'il y a un grand nombre de valeurs valides, cela devient plus difficile, car ces valeurs peuvent ne pas tenir dans le contexte du LLM, ou (si elles le font) il peut y en avoir trop pour que le LLM y prête correctement attention.

Dans ce notebook, nous allons examiner comment aborder ce problème.

## Configuration

#### Installer les dépendances

```python
# %pip install -qU langchain langchain-community langchain-openai faker langchain-chroma
```

#### Définir les variables d'environnement

Nous utiliserons OpenAI dans cet exemple :

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Optional, uncomment to trace runs with LangSmith. Sign up here: https://smith.langchain.com.
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

#### Configurer les données

Nous allons générer un tas de faux noms

```python
from faker import Faker

fake = Faker()

names = [fake.name() for _ in range(10000)]
```

Regardons quelques-uns des noms

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

## Analyse des requêtes

Nous pouvons maintenant configurer une analyse de requête de base

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

Nous pouvons voir que si nous épelons le nom exactement correctement, il sait comment le gérer

```python
query_analyzer.invoke("what are books about aliens by Jesse Knight")
```

```output
Search(query='books about aliens', author='Jesse Knight')
```

Le problème est que les valeurs sur lesquelles vous voulez filtrer peuvent NE PAS être épelées exactement correctement

```python
query_analyzer.invoke("what are books about aliens by jess knight")
```

```output
Search(query='books about aliens', author='Jess Knight')
```

### Ajouter toutes les valeurs

Une solution à ce problème est d'ajouter TOUTES les valeurs possibles au prompt. Cela guidera généralement la requête dans la bonne direction

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

Cependant... si la liste des catégorielles est assez longue, elle peut générer une erreur !

```python
try:
    res = query_analyzer_all.invoke("what are books about aliens by jess knight")
except Exception as e:
    print(e)
```

```output
Error code: 400 - {'error': {'message': "This model's maximum context length is 16385 tokens. However, your messages resulted in 33885 tokens (33855 in the messages, 30 in the functions). Please reduce the length of the messages or functions.", 'type': 'invalid_request_error', 'param': 'messages', 'code': 'context_length_exceeded'}}
```

Nous pouvons essayer d'utiliser une fenêtre de contexte plus longue... mais avec autant d'informations, il n'est pas garanti qu'elle le capte de manière fiable

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

### Trouver et toutes les valeurs pertinentes

Au lieu de cela, ce que nous pouvons faire est de créer un index sur les valeurs pertinentes, puis de le requêter pour obtenir les N valeurs les plus pertinentes,

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

### Remplacer après la sélection

Une autre méthode consiste à laisser le LLM remplir n'importe quelle valeur, puis à convertir cette valeur en une valeur valide.
Cela peut en fait être fait avec la classe Pydantic elle-même !

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
