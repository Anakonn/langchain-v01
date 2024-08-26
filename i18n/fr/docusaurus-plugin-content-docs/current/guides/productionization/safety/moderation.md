---
translated: true
---

# Chaîne de modération

Ce carnet d'exercices présente des exemples sur l'utilisation d'une chaîne de modération, ainsi que plusieurs façons courantes de le faire.
Les chaînes de modération sont utiles pour détecter les textes qui pourraient être haineux, violents, etc. Cela peut être utile à appliquer à la fois sur les entrées des utilisateurs, mais aussi sur la sortie d'un modèle de langage.
Certains fournisseurs d'API vous interdisent spécifiquement, ou interdisent à vos utilisateurs finaux, de générer certains types de contenus nuisibles. Pour vous conformer à cela (et pour simplement empêcher votre application d'être nuisible) vous pouvez vouloir ajouter une chaîne de modération à vos séquences afin de vous assurer que toute sortie générée par le modèle de langage n'est pas nuisible.

Si le contenu passé dans la chaîne de modération est nuisible, il n'y a pas de meilleure façon de le gérer.
Cela dépend probablement de votre application. Parfois, vous voudrez peut-être lever une erreur
(et faire en sorte que votre application la gère). D'autres fois, vous voudrez peut-être renvoyer quelque chose à
l'utilisateur expliquant que le texte était nuisible.

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
