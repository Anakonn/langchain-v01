---
sidebar_position: 0
title: Démarrage rapide
translated: true
---

# Démarrage rapide

Les modèles de langage à grande échelle (LLM) sont un composant essentiel de LangChain.
LangChain ne fournit pas ses propres LLM, mais offre plutôt une interface standard pour interagir avec de nombreux LLM différents.

Il existe de nombreux fournisseurs de LLM (OpenAI, Cohere, Hugging Face, etc.) - la classe `LLM` est conçue pour fournir une interface standard pour tous.

Dans ce tutoriel, nous allons travailler avec un wrapper de LLM OpenAI, bien que les fonctionnalités mises en évidence soient génériques pour tous les types de LLM.

### Configuration

Pour cet exemple, nous devrons installer le package Python OpenAI :

```bash
pip install openai
```

L'accès à l'API nécessite une clé API, que vous pouvez obtenir en créant un compte et en vous rendant [ici](https://platform.openai.com/account/api-keys). Une fois que nous avons une clé, nous voudrons la définir en tant que variable d'environnement en exécutant :

```bash
export OPENAI_API_KEY="..."
```

Si vous préférez ne pas définir de variable d'environnement, vous pouvez transmettre la clé directement via le paramètre nommé `api_key` lors de l'initialisation de la classe LLM OpenAI :

```python
from langchain_openai import OpenAI

llm = OpenAI(api_key="...")
```

sinon vous pouvez l'initialiser sans aucun paramètre :

```python
from langchain_openai import OpenAI

llm = OpenAI()
```

## LCEL

Les LLM implémentent l'[interface Runnable](/docs/expression_language/interface), le bloc de construction de base du [LangChain Expression Language (LCEL)](/docs/expression_language/). Cela signifie qu'ils prennent en charge les appels `invoke`, `ainvoke`, `stream`, `astream`, `batch`, `abatch`, `astream_log`.

Les LLM acceptent des **chaînes de caractères** comme entrées, ou des objets qui peuvent être convertis en invites de chaîne, y compris `List[BaseMessage]` et `PromptValue`.

```python
llm.invoke(
    "What are some theories about the relationship between unemployment and inflation?"
)
```

```output
'\n\n1. The Phillips Curve Theory: This suggests that there is an inverse relationship between unemployment and inflation, meaning that when unemployment is low, inflation will be higher, and when unemployment is high, inflation will be lower.\n\n2. The Monetarist Theory: This theory suggests that the relationship between unemployment and inflation is weak, and that changes in the money supply are more important in determining inflation.\n\n3. The Resource Utilization Theory: This suggests that when unemployment is low, firms are able to raise wages and prices in order to take advantage of the increased demand for their products and services. This leads to higher inflation.'
```

```python
for chunk in llm.stream(
    "What are some theories about the relationship between unemployment and inflation?"
):
    print(chunk, end="", flush=True)
```

```output


1. The Phillips Curve Theory: This theory states that there is an inverse relationship between unemployment and inflation. As unemployment decreases, inflation increases and vice versa.

2. The Cost-Push Inflation Theory: This theory suggests that an increase in unemployment leads to a decrease in aggregate demand, which causes prices to go up due to a decrease in supply.

3. The Wage-Push Inflation Theory: This theory states that when unemployment is low, wages tend to increase due to competition for labor, which causes prices to rise.

4. The Monetarist Theory: This theory states that there is no direct relationship between unemployment and inflation, but rather, an increase in the money supply leads to inflation, which can be caused by an increase in unemployment.
```

```python
llm.batch(
    [
        "What are some theories about the relationship between unemployment and inflation?"
    ]
)
```

```output
['\n\n1. The Phillips Curve Theory: This theory suggests that there is an inverse relationship between unemployment and inflation, meaning that when unemployment decreases, inflation rises, and when unemployment increases, inflation decreases. This theory is based on the idea that when the economy is doing well, there is more demand for goods and services, causing prices to increase.\n\n2. The Cost-Push Theory: This theory suggests that when the cost of production increases, it leads to higher prices and lower output. This can lead to higher unemployment and eventually higher inflation.\n\n3. The Demand-Pull Theory: This theory suggests that when demand for goods and services increases, it leads to higher prices and eventually higher inflation. This can lead to higher unemployment as businesses cannot keep up with the higher demand.\n\n4. The Structural Unemployment Theory: This theory suggests that when there is a mismatch between the skills of the unemployed and the skills required in the job market, it leads to higher unemployment and eventually higher inflation.']
```

```python
await llm.ainvoke(
    "What are some theories about the relationship between unemployment and inflation?"
)
```

```output
'\n\n1. Phillips Curve Theory: This theory states that there is an inverse relationship between inflation and unemployment. As unemployment decreases, inflation increases, and vice versa.\n\n2. Cost-Push Theory: This theory suggests that inflation is caused by rising costs, which can be caused by an increase in unemployment. As unemployment rises, businesses are unable to keep up with demand and have to raise prices to compensate.\n\n3. Demand-Pull Theory: This theory suggests that inflation occurs when demand exceeds supply. As unemployment increases, demand for goods and services decreases, leading to a decrease in inflation.\n\n4. Monetary Theory: This theory suggests that the money supply and inflation are related to unemployment. When the money supply increases, prices increase, leading to an increase in inflation. If unemployment is high, then the money supply increases, leading to an increase in inflation.'
```

```python
async for chunk in llm.astream(
    "What are some theories about the relationship between unemployment and inflation?"
):
    print(chunk, end="", flush=True)
```

```output


1. Phillips Curve Theory: This theory suggests that there is an inverse relationship between unemployment and inflation, meaning that when unemployment is low, inflation rises and vice versa.

2. Cost-Push Theory: This theory suggests that inflation is caused by rising costs of production, such as wages, raw materials, and energy. It states that when costs increase, firms must pass these costs onto the consumer, thus raising the price of goods and services and leading to inflation.

3. Demand-Pull Theory: This theory suggests that inflation is caused by an increase in demand for goods and services, leading to a rise in prices. It suggests that when unemployment is low, people have more money to spend and this increased demand pushes up prices.

4. Monetarist Theory: This theory states that inflation is caused by an increase in the money supply. It suggests that when the money supply increases, people have more money to spend, leading to higher prices.
```

```python
await llm.abatch(
    [
        "What are some theories about the relationship between unemployment and inflation?"
    ]
)
```

```output
['\n\n1. The Phillips Curve Theory: This theory states that there is an inverse relationship between unemployment and inflation. When unemployment is low, wages increase, leading to higher prices and overall inflation.\n\n2. The Cost-Push Theory: This theory states that inflation is caused by increases in the costs of production, such as wages, goods, and services. When the cost of production increases, the prices of goods and services must also increase, leading to inflation.\n\n3. The Demand Pull Theory: This theory states that inflation is caused by an increase in aggregate demand for goods and services. When the demand is high, prices must increase in order to meet the demand. This leads to inflation.\n\n4. The Structural Unemployment Theory: This theory states that when unemployment is high, there is an excess supply of labor. This excess supply of labor can result in lower wages, which can cause inflation as people are willing to accept lower wages for the same amount of work.']
```

```python
async for chunk in llm.astream_log(
    "What are some theories about the relationship between unemployment and inflation?"
):
    print(chunk)
```

```output
RunLogPatch({'op': 'replace',
  'path': '',
  'value': {'final_output': None,
            'id': 'baf410ad-618e-44db-93c8-809da4e3ed44',
            'logs': {},
            'streamed_output': []}})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '\n'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '\n'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '1'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '.'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' The'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' Phillips'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' Curve'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ':'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' This'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' theory'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' suggests'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' that'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' there'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' is'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' an'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' inverse'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' relationship'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' between'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' unemployment and'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' inflation'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '.'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' When'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' unemployment'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' is'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' low'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ','})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' inflation'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' tends'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' to'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' be'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' high'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ','})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' and'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' when'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' unemployment'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' is'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' high'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ','})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' inflation'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' tends'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' to'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' be'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' low'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '.'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' '})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '\n'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '\n'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '2'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '.'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' The'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' NA'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'IR'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'U'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' Theory'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ':'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' This'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' theory'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' suggests'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' that there is'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' a'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' natural'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' rate'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' of'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' unemployment'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ','})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' also'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' known'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' as'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' the'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' Non'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '-'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'Ac'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'celer'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'ating'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' In'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'flation'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' Rate'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' of'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' Unemployment'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' ('})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'NA'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'IR'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'U'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ').'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' According'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' to'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' this'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' theory'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ','})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' when'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' unemployment'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' is'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' below'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' the'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' NA'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'IR'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'U'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ','})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' then'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' inflation'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' will'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' increase'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ','})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' and'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' when'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' unemployment'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' is'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' above'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' the'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' NA'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'IR'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'U'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ','})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' then'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' inflation'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' will'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' decrease'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '.'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '\n'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '\n'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '3'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '.'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' The'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' Cost'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '-'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'Push'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' In'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'flation'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' Theory'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ':'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' This'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' theory'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' suggests'})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': ' that high unemployment'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' leads'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' to'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' higher'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' wages'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ','})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' which'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' in'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' turn'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' leads'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' to'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' higher'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' prices'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' and higher inflation'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '.'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ''})
RunLogPatch({'op': 'replace',
  'path': '/final_output',
  'value': {'generations': [[{'generation_info': {'finish_reason': 'stop',
                                                  'logprobs': None},
                              'text': '\n'
                                      '\n'
                                      '1. The Phillips Curve: This theory '
                                      'suggests that there is an inverse '
                                      'relationship between unemployment and '
                                      'inflation. When unemployment is low, '
                                      'inflation tends to be high, and when '
                                      'unemployment is high, inflation tends '
                                      'to be low. \n'
                                      '\n'
                                      '2. The NAIRU Theory: This theory '
                                      'suggests that there is a natural rate '
                                      'of unemployment, also known as the '
                                      'Non-Accelerating Inflation Rate of '
                                      'Unemployment (NAIRU). According to this '
                                      'theory, when unemployment is below the '
                                      'NAIRU, then inflation will increase, '
                                      'and when unemployment is above the '
                                      'NAIRU, then inflation will decrease.\n'
                                      '\n'
                                      '3. The Cost-Push Inflation Theory: This '
                                      'theory suggests that high unemployment '
                                      'leads to higher wages, which in turn '
                                      'leads to higher prices and higher '
                                      'inflation.'}]],
            'llm_output': None,
            'run': None}})
```

## [LangSmith](/docs/langsmith)

Tous les `LLM` sont livrés avec le traçage LangSmith intégré. Il suffit de définir les variables d'environnement suivantes :

```bash
export LANGCHAIN_TRACING_V2="true"
export LANGCHAIN_API_KEY=<your-api-key>
```

et toute invocation de `LLM` (qu'elle soit imbriquée dans une chaîne ou non) sera automatiquement tracée. Une trace inclura les entrées, les sorties, la latence, l'utilisation des jetons, les paramètres d'invocation, les paramètres d'environnement et plus encore. Voir un exemple ici : https://smith.langchain.com/public/7924621a-ff58-4b1c-a2a2-035a354ef434/r.

Dans LangSmith, vous pouvez ensuite fournir des commentaires pour n'importe quelle trace, compiler des jeux de données annotés pour les évaluations, déboguer les performances dans le playground et plus encore.
