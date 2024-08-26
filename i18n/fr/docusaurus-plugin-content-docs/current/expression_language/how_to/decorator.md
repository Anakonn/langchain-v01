---
translated: true
---

# Créer un exécutable avec le décorateur @chain

Vous pouvez également transformer une fonction arbitraire en une chaîne en ajoutant un décorateur `@chain`. Cela est fonctionnellement équivalent à l'envelopper dans un [`RunnableLambda`](/docs/expression_language/primitives/functions).

Cela aura l'avantage d'une meilleure observabilité en traçant correctement votre chaîne. Tous les appels aux exécutables à l'intérieur de cette fonction seront tracés en tant qu'enfants imbriqués.

Cela vous permettra également de l'utiliser comme n'importe quel autre exécutable, de le composer dans une chaîne, etc.

Examinons cela en action !

```python
%pip install --upgrade --quiet  langchain langchain-openai
```

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import chain
from langchain_openai import ChatOpenAI
```

```python
prompt1 = ChatPromptTemplate.from_template("Tell me a joke about {topic}")
prompt2 = ChatPromptTemplate.from_template("What is the subject of this joke: {joke}")
```

```python
@chain
def custom_chain(text):
    prompt_val1 = prompt1.invoke({"topic": text})
    output1 = ChatOpenAI().invoke(prompt_val1)
    parsed_output1 = StrOutputParser().invoke(output1)
    chain2 = prompt2 | ChatOpenAI() | StrOutputParser()
    return chain2.invoke({"joke": parsed_output1})
```

`custom_chain` est maintenant un exécutable, ce qui signifie que vous devrez utiliser `invoke`

```python
custom_chain.invoke("bears")
```

```output
'The subject of this joke is bears.'
```

Si vous consultez vos traces LangSmith, vous devriez voir une trace `custom_chain` avec les appels à OpenAI imbriqués en dessous.
