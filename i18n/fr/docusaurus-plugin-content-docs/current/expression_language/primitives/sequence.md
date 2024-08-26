---
keywords:
- Runnable
- Runnables
- LCEL
sidebar_position: 0
title: 'Séquences : Enchaînement des runnables'
translated: true
---

# Enchaînement des runnables

Un avantage clé de l'interface `Runnable` est que deux runnables peuvent être "enchaînés" ensemble en séquences. La sortie de l'appel `.invoke()` du runnable précédent est transmise comme entrée au runnable suivant. Cela peut être fait à l'aide de l'opérateur pipe (`|`) ou de la méthode plus explicite `.pipe()`, qui fait la même chose. Le `RunnableSequence` résultant est lui-même un runnable, ce qui signifie qu'il peut être invoqué, diffusé ou pipeté comme n'importe quel autre runnable.

## L'opérateur pipe

Pour montrer comment cela fonctionne, passons en revue un exemple. Nous allons parcourir un modèle courant dans LangChain : utiliser un [modèle d'invite](/docs/modules/model_io/prompts/) pour formater l'entrée dans un [modèle de chat](/docs/modules/model_io/chat/), puis convertir la sortie du message de chat en une chaîne avec un [analyseur de sortie](/docs/modules/model_io/output_parsers/).

```python
%pip install --upgrade --quiet langchain langchain-anthropic
```

```python
from langchain_anthropic import ChatAnthropic
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template("tell me a joke about {topic}")
model = ChatAnthropic(model_name="claude-3-haiku-20240307")

chain = prompt | model | StrOutputParser()
```

Les invites et les modèles sont tous deux des runnables, et le type de sortie de l'appel d'invite est le même que le type d'entrée du modèle de chat, nous pouvons donc les enchaîner. Nous pouvons ensuite invoquer la séquence résultante comme n'importe quel autre runnable :

```python
chain.invoke({"topic": "bears"})
```

```output
"Here's a bear joke for you:\n\nWhy don't bears wear socks? \nBecause they have bear feet!\n\nHow's that? I tried to keep it light and silly. Bears can make for some fun puns and jokes. Let me know if you'd like to hear another one!"
```

### Coercition

Nous pouvons même combiner cette chaîne avec d'autres runnables pour créer une autre chaîne. Cela peut impliquer un certain formatage d'entrée/sortie à l'aide d'autres types de runnables, selon les entrées et sorties requises des composants de la chaîne.

Par exemple, supposons que nous voulions composer la chaîne de génération de blagues avec une autre chaîne qui évalue si la blague générée est drôle ou non.

Nous devrions être prudents sur la façon dont nous formatons l'entrée dans la prochaine chaîne. Dans l'exemple ci-dessous, le dictionnaire de la chaîne est automatiquement analysé et converti en un [`RunnableParallel`](/docs/expression_language/primitives/parallel), qui exécute toutes ses valeurs en parallèle et renvoie un dictionnaire avec les résultats.

C'est le même format que le modèle d'invite suivant attend. Voici son utilisation en action :

```python
from langchain_core.output_parsers import StrOutputParser

analysis_prompt = ChatPromptTemplate.from_template("is this a funny joke? {joke}")

composed_chain = {"joke": chain} | analysis_prompt | model | StrOutputParser()
```

```python
composed_chain.invoke({"topic": "bears"})
```

```output
"That's a pretty classic and well-known bear pun joke. Whether it's considered funny is quite subjective, as humor is very personal. Some people may find that type of pun-based joke amusing, while others may not find it that humorous. Ultimately, the funniness of a joke is in the eye (or ear) of the beholder. If you enjoyed the joke and got a chuckle out of it, then that's what matters most."
```

Les fonctions seront également coercées en runnables, vous pouvez donc ajouter une logique personnalisée à vos chaînes aussi. La chaîne ci-dessous donne le même flux logique que précédemment :

```python
composed_chain_with_lambda = (
    chain
    | (lambda input: {"joke": input})
    | analysis_prompt
    | model
    | StrOutputParser()
)
```

```python
composed_chain_with_lambda.invoke({"topic": "beets"})
```

```output
'I appreciate the effort, but I have to be honest - I didn\'t find that joke particularly funny. Beet-themed puns can be quite hit-or-miss, and this one falls more on the "miss" side for me. The premise is a bit too straightforward and predictable. While I can see the logic behind it, the punchline just doesn\'t pack much of a comedic punch. \n\nThat said, I do admire your willingness to explore puns and wordplay around vegetables. Cultivating a good sense of humor takes practice, and not every joke is going to land. The important thing is to keep experimenting and finding what works. Maybe try for a more unexpected or creative twist on beet-related humor next time. But thanks for sharing - I always appreciate when humans test out jokes on me, even if they don\'t always make me laugh out loud.'
```

Cependant, gardez à l'esprit que l'utilisation de fonctions comme celle-ci peut interférer avec des opérations comme le streaming. Consultez [cette section](/docs/expression_language/primitives/functions) pour plus d'informations.

## La méthode `.pipe()`

Nous pourrions également composer la même séquence à l'aide de la méthode `.pipe()`. Voici à quoi cela ressemble :

```python
from langchain_core.runnables import RunnableParallel

composed_chain_with_pipe = (
    RunnableParallel({"joke": chain})
    .pipe(analysis_prompt)
    .pipe(model)
    .pipe(StrOutputParser())
)
```

```python
composed_chain_with_pipe.invoke({"topic": "battlestar galactica"})
```

```output
'That\'s a pretty good Battlestar Galactica-themed pun! I appreciated the clever play on words with "Centurion" and "center on." It\'s the kind of nerdy, science fiction-inspired humor that fans of the show would likely enjoy. The joke is clever and demonstrates a good understanding of the Battlestar Galactica universe. I\'d be curious to hear any other Battlestar-related jokes you might have up your sleeve. As long as they don\'t reproduce copyrighted material, I\'m happy to provide my thoughts on the humor and appeal for fans of the show.'
```
