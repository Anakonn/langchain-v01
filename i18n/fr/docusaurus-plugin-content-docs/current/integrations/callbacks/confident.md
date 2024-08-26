---
translated: true
---

# Confiant

>[DeepEval](https://confident-ai.com) package pour les tests unitaires des LLM.
> Avec Confiant, tout le monde peut construire des modèles de langage robustes grâce à des itérations plus rapides
> en utilisant à la fois les tests unitaires et les tests d'intégration. Nous fournissons un support pour chaque étape de l'itération
> de la création de données synthétiques aux tests.

Dans ce guide, nous allons démontrer comment tester et mesurer les performances des LLM. Nous montrons comment vous pouvez utiliser notre rappel pour mesurer les performances et comment vous pouvez définir votre propre métrique et les enregistrer dans notre tableau de bord.

DeepEval offre également :
- Comment générer des données synthétiques
- Comment mesurer les performances
- Un tableau de bord pour surveiller et examiner les résultats au fil du temps

## Installation et configuration

```python
%pip install --upgrade --quiet  langchain langchain-openai deepeval langchain-chroma
```

### Obtenir les identifiants de l'API

Pour obtenir les identifiants de l'API DeepEval, suivez les étapes suivantes :

1. Allez sur https://app.confident-ai.com
2. Cliquez sur "Organisation"
3. Copiez la clé API.

Lorsque vous vous connectez, on vous demandera également de définir le nom de l'`implementation`. Le nom de l'implémentation est requis pour décrire le type d'implémentation. (Pensez à ce que vous voulez appeler votre projet. Nous vous recommandons de le rendre descriptif.)

```python
!deepeval login
```

### Configurer DeepEval

Vous pouvez, par défaut, utiliser le `DeepEvalCallbackHandler` pour configurer les métriques que vous souhaitez suivre. Cependant, il a un support limité pour les métriques pour le moment (d'autres seront ajoutées bientôt). Il prend actuellement en charge :
- [Pertinence de la réponse](https://docs.confident-ai.com/docs/measuring_llm_performance/answer_relevancy)
- [Biais](https://docs.confident-ai.com/docs/measuring_llm_performance/debias)
- [Toxicité](https://docs.confident-ai.com/docs/measuring_llm_performance/non_toxic)

```python
from deepeval.metrics.answer_relevancy import AnswerRelevancy

# Here we want to make sure the answer is minimally relevant
answer_relevancy_metric = AnswerRelevancy(minimum_score=0.5)
```

## Commencer

Pour utiliser le `DeepEvalCallbackHandler`, nous avons besoin du `nom_de_l'implementation`.

```python
from langchain_community.callbacks.confident_callback import DeepEvalCallbackHandler

deepeval_callback = DeepEvalCallbackHandler(
    implementation_name="langchainQuickstart", metrics=[answer_relevancy_metric]
)
```

### Scénario 1 : Alimenter un LLM

Vous pouvez ensuite l'alimenter dans votre LLM avec OpenAI.

```python
from langchain_openai import OpenAI

llm = OpenAI(
    temperature=0,
    callbacks=[deepeval_callback],
    verbose=True,
    openai_api_key="<YOUR_API_KEY>",
)
output = llm.generate(
    [
        "What is the best evaluation tool out there? (no bias at all)",
    ]
)
```

```output
LLMResult(generations=[[Generation(text='\n\nQ: What did the fish say when he hit the wall? \nA: Dam.', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\nThe Moon \n\nThe moon is high in the midnight sky,\nSparkling like a star above.\nThe night so peaceful, so serene,\nFilling up the air with love.\n\nEver changing and renewing,\nA never-ending light of grace.\nThe moon remains a constant view,\nA reminder of life’s gentle pace.\n\nThrough time and space it guides us on,\nA never-fading beacon of hope.\nThe moon shines down on us all,\nAs it continues to rise and elope.', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\nQ. What did one magnet say to the other magnet?\nA. "I find you very attractive!"', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text="\n\nThe world is charged with the grandeur of God.\nIt will flame out, like shining from shook foil;\nIt gathers to a greatness, like the ooze of oil\nCrushed. Why do men then now not reck his rod?\n\nGenerations have trod, have trod, have trod;\nAnd all is seared with trade; bleared, smeared with toil;\nAnd wears man's smudge and shares man's smell: the soil\nIs bare now, nor can foot feel, being shod.\n\nAnd for all this, nature is never spent;\nThere lives the dearest freshness deep down things;\nAnd though the last lights off the black West went\nOh, morning, at the brown brink eastward, springs —\n\nBecause the Holy Ghost over the bent\nWorld broods with warm breast and with ah! bright wings.\n\n~Gerard Manley Hopkins", generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\nQ: What did one ocean say to the other ocean?\nA: Nothing, they just waved.', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text="\n\nA poem for you\n\nOn a field of green\n\nThe sky so blue\n\nA gentle breeze, the sun above\n\nA beautiful world, for us to love\n\nLife is a journey, full of surprise\n\nFull of joy and full of surprise\n\nBe brave and take small steps\n\nThe future will be revealed with depth\n\nIn the morning, when dawn arrives\n\nA fresh start, no reason to hide\n\nSomewhere down the road, there's a heart that beats\n\nBelieve in yourself, you'll always succeed.", generation_info={'finish_reason': 'stop', 'logprobs': None})]], llm_output={'token_usage': {'completion_tokens': 504, 'total_tokens': 528, 'prompt_tokens': 24}, 'model_name': 'text-davinci-003'})
```

Vous pouvez ensuite vérifier si la métrique a réussi en appelant la méthode `is_successful()`.

```python
answer_relevancy_metric.is_successful()
# returns True/False
```

Une fois que vous aurez exécuté cela, vous devriez pouvoir voir notre tableau de bord ci-dessous.

![Tableau de bord](https://docs.confident-ai.com/assets/images/dashboard-screenshot-b02db73008213a211b1158ff052d969e.png)

### Scénario 2 : Suivre un LLM dans une chaîne sans rappels

Pour suivre un LLM dans une chaîne sans rappels, vous pouvez vous brancher à la fin.

Nous pouvons commencer par définir une chaîne simple comme indiqué ci-dessous.

```python
import requests
from langchain.chains import RetrievalQA
from langchain_chroma import Chroma
from langchain_community.document_loaders import TextLoader
from langchain_openai import OpenAI, OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

text_file_url = "https://raw.githubusercontent.com/hwchase17/chat-your-data/master/state_of_the_union.txt"

openai_api_key = "sk-XXX"

with open("state_of_the_union.txt", "w") as f:
    response = requests.get(text_file_url)
    f.write(response.text)

loader = TextLoader("state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings(openai_api_key=openai_api_key)
docsearch = Chroma.from_documents(texts, embeddings)

qa = RetrievalQA.from_chain_type(
    llm=OpenAI(openai_api_key=openai_api_key),
    chain_type="stuff",
    retriever=docsearch.as_retriever(),
)

# Providing a new question-answering pipeline
query = "Who is the president?"
result = qa.run(query)
```

Après avoir défini une chaîne, vous pouvez ensuite vérifier manuellement la similarité de la réponse.

```python
answer_relevancy_metric.measure(result, query)
answer_relevancy_metric.is_successful()
```

### Que faire ensuite ?

Vous pouvez créer vos propres métriques personnalisées [ici](https://docs.confident-ai.com/docs/quickstart/custom-metrics).

DeepEval offre également d'autres fonctionnalités comme la possibilité de [créer automatiquement des tests unitaires](https://docs.confident-ai.com/docs/quickstart/synthetic-data-creation), [des tests pour les hallucinations](https://docs.confident-ai.com/docs/measuring_llm_performance/factual_consistency).

Si vous êtes intéressé, consultez notre dépôt Github ici [https://github.com/confident-ai/deepeval](https://github.com/confident-ai/deepeval). Nous accueillons avec plaisir toute PR et discussion sur la façon d'améliorer les performances des LLM.
