---
sidebar_position: 4
translated: true
---

# Récupération par utilisateur

Lors de la construction d'une application de récupération, vous devez souvent la construire en gardant à l'esprit plusieurs utilisateurs. Cela signifie que vous pouvez stocker des données non seulement pour un utilisateur, mais pour de nombreux utilisateurs différents, et ils ne doivent pas pouvoir voir les données des autres. Cela signifie que vous devez pouvoir configurer votre chaîne de récupération pour ne récupérer que certaines informations. Cela implique généralement deux étapes.

**Étape 1 : Assurez-vous que le récupérateur que vous utilisez prend en charge plusieurs utilisateurs**

À l'heure actuelle, il n'y a pas de drapeau ou de filtre unifié pour cela dans LangChain. Au lieu de cela, chaque vectorstore et récupérateur peut avoir le sien, et peut être appelé différemment (espaces de noms, multi-locataires, etc.). Pour les vectorstores, cela est généralement exposé comme un argument de mot-clé qui est passé lors de `similarity_search`. En lisant la documentation ou le code source, découvrez si le récupérateur que vous utilisez prend en charge plusieurs utilisateurs et, le cas échéant, comment l'utiliser.

Remarque : ajouter de la documentation et/ou du support pour plusieurs utilisateurs pour les récupérateurs qui ne le prennent pas en charge (ou ne le documentent pas) est un excellent moyen de contribuer à LangChain

**Étape 2 : Ajoutez ce paramètre comme un champ configurable pour la chaîne**

Cela vous permettra d'appeler facilement la chaîne et de configurer tous les drapeaux pertinents au moment de l'exécution. Voir [cette documentation](/docs/expression_language/primitives/configure) pour plus d'informations sur la configuration.

**Étape 3 : Appelez la chaîne avec ce champ configurable**

Maintenant, au moment de l'exécution, vous pouvez appeler cette chaîne avec le champ configurable.

## Exemple de code

Voyons un exemple concret de ce à quoi cela ressemble dans le code. Nous utiliserons Pinecone pour cet exemple.

Pour configurer Pinecone, définissez la variable d'environnement suivante :

- `PINECONE_API_KEY` : Votre clé API Pinecone

```python
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
```

```python
embeddings = OpenAIEmbeddings()
vectorstore = PineconeVectorStore(index_name="test-example", embedding=embeddings)

vectorstore.add_texts(["i worked at kensho"], namespace="harrison")
vectorstore.add_texts(["i worked at facebook"], namespace="ankush")
```

```output
['ce15571e-4e2f-44c9-98df-7e83f6f63095']
```

L'argument `namespace` de Pinecone peut être utilisé pour séparer les documents

```python
# This will only get documents for Ankush
vectorstore.as_retriever(search_kwargs={"namespace": "ankush"}).invoke(
    "where did i work?"
)
```

```output
[Document(page_content='i worked at facebook')]
```

```python
# This will only get documents for Harrison
vectorstore.as_retriever(search_kwargs={"namespace": "harrison"}).invoke(
    "where did i work?"
)
```

```output
[Document(page_content='i worked at kensho')]
```

Nous pouvons maintenant créer la chaîne que nous utiliserons pour faire de la question-réponse

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import (
    ConfigurableField,
    RunnableBinding,
    RunnableLambda,
    RunnablePassthrough,
)
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
```

Il s'agit d'une chaîne de question-réponse de base.

```python
template = """Answer the question based only on the following context:
{context}
Question: {question}
"""
prompt = ChatPromptTemplate.from_template(template)

model = ChatOpenAI()

retriever = vectorstore.as_retriever()
```

Ici, nous marquons le récupérateur comme ayant un champ configurable. Tous les récupérateurs de vectorstore ont `search_kwargs` comme champ. Il s'agit simplement d'un dictionnaire, avec des champs spécifiques au vectorstore.

```python
configurable_retriever = retriever.configurable_fields(
    search_kwargs=ConfigurableField(
        id="search_kwargs",
        name="Search Kwargs",
        description="The search kwargs to use",
    )
)
```

Nous pouvons maintenant créer la chaîne en utilisant notre récupérateur configurable

```python
chain = (
    {"context": configurable_retriever, "question": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)
```

Nous pouvons maintenant invoquer la chaîne avec des options configurables. `search_kwargs` est l'identifiant du champ configurable. La valeur est les paramètres de recherche à utiliser pour Pinecone.

```python
chain.invoke(
    "where did the user work?",
    config={"configurable": {"search_kwargs": {"namespace": "harrison"}}},
)
```

```output
'The user worked at Kensho.'
```

```python
chain.invoke(
    "where did the user work?",
    config={"configurable": {"search_kwargs": {"namespace": "ankush"}}},
)
```

```output
'The user worked at Facebook.'
```

Pour plus d'implémentations de vectorstore pour le multi-utilisateur, veuillez vous référer aux pages spécifiques, comme [Milvus](/docs/integrations/vectorstores/milvus).
