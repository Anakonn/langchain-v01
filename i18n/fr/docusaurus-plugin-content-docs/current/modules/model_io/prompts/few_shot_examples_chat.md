---
sidebar_position: 2
translated: true
---

# Exemples peu nombreux pour les modèles de chat

Ce cahier de notes couvre comment utiliser des exemples peu nombreux dans les modèles de chat. Il ne semble pas y avoir de consensus solide sur la meilleure façon de faire le peu de sollicitation, et la compilation optimale de l'invite variera probablement selon le modèle. En raison de cela, nous fournissons des modèles d'invite peu nombreux comme le [FewShotChatMessagePromptTemplate](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.few_shot.FewShotChatMessagePromptTemplate.html?highlight=fewshot#langchain_core.prompts.few_shot.FewShotChatMessagePromptTemplate) comme point de départ flexible, et vous pouvez les modifier ou les remplacer comme bon vous semble.

L'objectif des modèles d'invite peu nombreux est de sélectionner dynamiquement des exemples en fonction d'une entrée, puis de formater les exemples dans une invite finale pour les fournir au modèle.

**Remarque :** Les exemples de code suivants sont pour les modèles de chat. Pour des exemples similaires d'invite peu nombreux pour les modèles d'achèvement (LLM), consultez le guide des [modèles d'invite peu nombreux](/docs/modules/model_io/prompts/few_shot_examples/).

### Exemples fixes

La technique de peu de sollicitation la plus élémentaire (et la plus courante) consiste à utiliser un exemple d'invite fixe. De cette façon, vous pouvez sélectionner une chaîne, l'évaluer et éviter de vous soucier d'éléments supplémentaires en production.

Les composants de base du modèle sont :
- `examples` : Une liste d'exemples de dictionnaire à inclure dans l'invite finale.
- `example_prompt` : convertit chaque exemple en 1 ou plusieurs messages via sa méthode [`format_messages`](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html?highlight=format_messages#langchain_core.prompts.chat.ChatPromptTemplate.format_messages). Un exemple courant serait de convertir chaque exemple en un message humain et une réponse de message IA, ou un message humain suivi d'un message d'appel de fonction.

Voici une démonstration simple. Tout d'abord, importez les modules pour cet exemple :

```python
from langchain_core.prompts import (
    ChatPromptTemplate,
    FewShotChatMessagePromptTemplate,
)
```

Ensuite, définissez les exemples que vous souhaitez inclure.

```python
examples = [
    {"input": "2+2", "output": "4"},
    {"input": "2+3", "output": "5"},
]
```

Ensuite, assemblez-les dans le modèle d'invite peu nombreux.

```python
# This is a prompt template used to format each individual example.
example_prompt = ChatPromptTemplate.from_messages(
    [
        ("human", "{input}"),
        ("ai", "{output}"),
    ]
)
few_shot_prompt = FewShotChatMessagePromptTemplate(
    example_prompt=example_prompt,
    examples=examples,
)

print(few_shot_prompt.format())
```

```output
Human: 2+2
AI: 4
Human: 2+3
AI: 5
```

Enfin, assemblez votre invite finale et utilisez-la avec un modèle.

```python
final_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a wondrous wizard of math."),
        few_shot_prompt,
        ("human", "{input}"),
    ]
)
```

```python
from langchain_community.chat_models import ChatAnthropic

chain = final_prompt | ChatAnthropic(temperature=0.0)

chain.invoke({"input": "What's the square of a triangle?"})
```

```output
AIMessage(content=' Triangles do not have a "square". A square refers to a shape with 4 equal sides and 4 right angles. Triangles have 3 sides and 3 angles.\n\nThe area of a triangle can be calculated using the formula:\n\nA = 1/2 * b * h\n\nWhere:\n\nA is the area \nb is the base (the length of one of the sides)\nh is the height (the length from the base to the opposite vertex)\n\nSo the area depends on the specific dimensions of the triangle. There is no single "square of a triangle". The area can vary greatly depending on the base and height measurements.', additional_kwargs={}, example=False)
```

## Peu de sollicitation dynamique

Parfois, vous voudrez peut-être conditionner les exemples affichés en fonction de l'entrée. Pour cela, vous pouvez remplacer les `examples` par un `example_selector`. Les autres composants restent les mêmes que ci-dessus ! Pour revoir, le modèle d'invite peu nombreux dynamique ressemblerait à :

- `example_selector` : responsable de la sélection des exemples peu nombreux (et de l'ordre dans lequel ils sont renvoyés) pour une entrée donnée. Ceux-ci implémentent l'interface [BaseExampleSelector](https://api.python.langchain.com/en/latest/example_selectors/langchain_core.example_selectors.base.BaseExampleSelector.html?highlight=baseexampleselector#langchain_core.example_selectors.base.BaseExampleSelector). Un exemple courant est le [SemanticSimilarityExampleSelector](https://api.python.langchain.com/en/latest/example_selectors/langchain_core.example_selectors.semantic_similarity.SemanticSimilarityExampleSelector.html?highlight=semanticsimilarityexampleselector#langchain_core.example_selectors.semantic_similarity.SemanticSimilarityExampleSelector) basé sur le vectorstore.
- `example_prompt` : convertit chaque exemple en 1 ou plusieurs messages via sa méthode [`format_messages`](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html?highlight=chatprompttemplate#langchain_core.prompts.chat.ChatPromptTemplate.format_messages). Un exemple courant serait de convertir chaque exemple en un message humain et une réponse de message IA, ou un message humain suivi d'un message d'appel de fonction.

Ceux-ci peuvent à nouveau être composés avec d'autres messages et modèles de chat pour assembler votre invite finale.

```python
from langchain_chroma import Chroma
from langchain_core.example_selectors import SemanticSimilarityExampleSelector
from langchain_openai import OpenAIEmbeddings
```

Comme nous utilisons un vectorstore pour sélectionner des exemples en fonction de la similarité sémantique, nous voudrons d'abord remplir le magasin.

```python
examples = [
    {"input": "2+2", "output": "4"},
    {"input": "2+3", "output": "5"},
    {"input": "2+4", "output": "6"},
    {"input": "What did the cow say to the moon?", "output": "nothing at all"},
    {
        "input": "Write me a poem about the moon",
        "output": "One for the moon, and one for me, who are we to talk about the moon?",
    },
]

to_vectorize = [" ".join(example.values()) for example in examples]
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_texts(to_vectorize, embeddings, metadatas=examples)
```

#### Créer le `example_selector`

Avec un vectorstore créé, vous pouvez créer le `example_selector`. Ici, nous lui demanderons de ne récupérer que les 2 meilleurs exemples.

```python
example_selector = SemanticSimilarityExampleSelector(
    vectorstore=vectorstore,
    k=2,
)

# The prompt template will load examples by passing the input do the `select_examples` method
example_selector.select_examples({"input": "horse"})
```

```output
[{'input': 'What did the cow say to the moon?', 'output': 'nothing at all'},
 {'input': '2+4', 'output': '6'}]
```

#### Créer un modèle d'invite

Assemblez le modèle d'invite, en utilisant le `example_selector` créé ci-dessus.

```python
from langchain_core.prompts import (
    ChatPromptTemplate,
    FewShotChatMessagePromptTemplate,
)

# Define the few-shot prompt.
few_shot_prompt = FewShotChatMessagePromptTemplate(
    # The input variables select the values to pass to the example_selector
    input_variables=["input"],
    example_selector=example_selector,
    # Define how each example will be formatted.
    # In this case, each example will become 2 messages:
    # 1 human, and 1 AI
    example_prompt=ChatPromptTemplate.from_messages(
        [("human", "{input}"), ("ai", "{output}")]
    ),
)
```

Voici un exemple de la façon dont cela serait assemblé.

```python
print(few_shot_prompt.format(input="What's 3+3?"))
```

```output
Human: 2+3
AI: 5
Human: 2+2
AI: 4
```

Assemblez le modèle d'invite final :

```python
final_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a wondrous wizard of math."),
        few_shot_prompt,
        ("human", "{input}"),
    ]
)
```

```python
print(few_shot_prompt.format(input="What's 3+3?"))
```

```output
Human: 2+3
AI: 5
Human: 2+2
AI: 4
```

#### Utiliser avec un LLM

Maintenant, vous pouvez connecter votre modèle à l'invite peu nombreuse.

```python
from langchain_community.chat_models import ChatAnthropic

chain = final_prompt | ChatAnthropic(temperature=0.0)

chain.invoke({"input": "What's 3+3?"})
```

```output
AIMessage(content=' 3 + 3 = 6', additional_kwargs={}, example=False)
```
