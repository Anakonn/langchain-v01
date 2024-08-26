---
translated: true
---

# Argilla

>[Argilla](https://argilla.io/) est une plateforme open-source de curation de données pour les LLM.
> Grâce à Argilla, tout le monde peut construire des modèles de langage robustes en accélérant la curation des données
> en utilisant à la fois les commentaires des humains et des machines. Nous fournissons un support pour chaque étape du cycle MLOps,
> du labellisation des données à la surveillance des modèles.

<a target="_blank" href="https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/integrations/callbacks/argilla.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Ouvrir dans Colab"/>
</a>

Dans ce guide, nous allons montrer comment suivre les entrées et les réponses de votre LLM pour générer un jeu de données dans Argilla, en utilisant le `ArgillaCallbackHandler`.

Il est utile de suivre les entrées et les sorties de vos LLM pour générer des jeux de données pour un futur fine-tuning. Cela est particulièrement utile lorsque vous utilisez un LLM pour générer des données pour une tâche spécifique, comme la réponse aux questions, le résumé ou la traduction.

## Installation et configuration

```python
%pip install --upgrade --quiet  langchain langchain-openai argilla
```

### Obtenir les identifiants de l'API

Pour obtenir les identifiants de l'API Argilla, suivez les étapes suivantes :

1. Allez sur votre interface utilisateur Argilla.
2. Cliquez sur votre photo de profil et allez dans "Mes paramètres".
3. Copiez ensuite la clé API.

Dans Argilla, l'URL de l'API sera la même que l'URL de votre interface utilisateur Argilla.

Pour obtenir les identifiants de l'API OpenAI, veuillez visiter https://platform.openai.com/account/api-keys

```python
import os

os.environ["ARGILLA_API_URL"] = "..."
os.environ["ARGILLA_API_KEY"] = "..."

os.environ["OPENAI_API_KEY"] = "..."
```

### Configuration d'Argilla

Pour utiliser le `ArgillaCallbackHandler`, nous devrons créer un nouveau `FeedbackDataset` dans Argilla pour suivre vos expériences LLM. Pour ce faire, veuillez utiliser le code suivant :

```python
import argilla as rg
```

```python
from packaging.version import parse as parse_version

if parse_version(rg.__version__) < parse_version("1.8.0"):
    raise RuntimeError(
        "`FeedbackDataset` is only available in Argilla v1.8.0 or higher, please "
        "upgrade `argilla` as `pip install argilla --upgrade`."
    )
```

```python
dataset = rg.FeedbackDataset(
    fields=[
        rg.TextField(name="prompt"),
        rg.TextField(name="response"),
    ],
    questions=[
        rg.RatingQuestion(
            name="response-rating",
            description="How would you rate the quality of the response?",
            values=[1, 2, 3, 4, 5],
            required=True,
        ),
        rg.TextQuestion(
            name="response-feedback",
            description="What feedback do you have for the response?",
            required=False,
        ),
    ],
    guidelines="You're asked to rate the quality of the response and provide feedback.",
)

rg.init(
    api_url=os.environ["ARGILLA_API_URL"],
    api_key=os.environ["ARGILLA_API_KEY"],
)

dataset.push_to_argilla("langchain-dataset")
```

> 📌 REMARQUE : pour le moment, seuls les couples prompt-réponse sont pris en charge comme `FeedbackDataset.fields`, donc le `ArgillaCallbackHandler` ne suivra que le prompt, c'est-à-dire l'entrée du LLM, et la réponse, c'est-à-dire la sortie du LLM.

## Suivi

Pour utiliser le `ArgillaCallbackHandler`, vous pouvez soit utiliser le code suivant, soit reproduire l'un des exemples présentés dans les sections suivantes.

```python
from langchain_community.callbacks.argilla_callback import ArgillaCallbackHandler

argilla_callback = ArgillaCallbackHandler(
    dataset_name="langchain-dataset",
    api_url=os.environ["ARGILLA_API_URL"],
    api_key=os.environ["ARGILLA_API_KEY"],
)
```

### Scénario 1 : Suivi d'un LLM

Tout d'abord, exécutons un seul LLM quelques fois et capturons les couples prompt-réponse résultants dans Argilla.

```python
from langchain_core.callbacks.stdout import StdOutCallbackHandler
from langchain_openai import OpenAI

argilla_callback = ArgillaCallbackHandler(
    dataset_name="langchain-dataset",
    api_url=os.environ["ARGILLA_API_URL"],
    api_key=os.environ["ARGILLA_API_KEY"],
)
callbacks = [StdOutCallbackHandler(), argilla_callback]

llm = OpenAI(temperature=0.9, callbacks=callbacks)
llm.generate(["Tell me a joke", "Tell me a poem"] * 3)
```

```output
LLMResult(generations=[[Generation(text='\n\nQ: What did the fish say when he hit the wall? \nA: Dam.', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\nThe Moon \n\nThe moon is high in the midnight sky,\nSparkling like a star above.\nThe night so peaceful, so serene,\nFilling up the air with love.\n\nEver changing and renewing,\nA never-ending light of grace.\nThe moon remains a constant view,\nA reminder of life’s gentle pace.\n\nThrough time and space it guides us on,\nA never-fading beacon of hope.\nThe moon shines down on us all,\nAs it continues to rise and elope.', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\nQ. What did one magnet say to the other magnet?\nA. "I find you very attractive!"', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text="\n\nThe world is charged with the grandeur of God.\nIt will flame out, like shining from shook foil;\nIt gathers to a greatness, like the ooze of oil\nCrushed. Why do men then now not reck his rod?\n\nGenerations have trod, have trod, have trod;\nAnd all is seared with trade; bleared, smeared with toil;\nAnd wears man's smudge and shares man's smell: the soil\nIs bare now, nor can foot feel, being shod.\n\nAnd for all this, nature is never spent;\nThere lives the dearest freshness deep down things;\nAnd though the last lights off the black West went\nOh, morning, at the brown brink eastward, springs —\n\nBecause the Holy Ghost over the bent\nWorld broods with warm breast and with ah! bright wings.\n\n~Gerard Manley Hopkins", generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\nQ: What did one ocean say to the other ocean?\nA: Nothing, they just waved.', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text="\n\nA poem for you\n\nOn a field of green\n\nThe sky so blue\n\nA gentle breeze, the sun above\n\nA beautiful world, for us to love\n\nLife is a journey, full of surprise\n\nFull of joy and full of surprise\n\nBe brave and take small steps\n\nThe future will be revealed with depth\n\nIn the morning, when dawn arrives\n\nA fresh start, no reason to hide\n\nSomewhere down the road, there's a heart that beats\n\nBelieve in yourself, you'll always succeed.", generation_info={'finish_reason': 'stop', 'logprobs': None})]], llm_output={'token_usage': {'completion_tokens': 504, 'total_tokens': 528, 'prompt_tokens': 24}, 'model_name': 'text-davinci-003'})
```

![Interface utilisateur Argilla avec l'entrée-réponse du LangChain LLM](https://docs.argilla.io/en/latest/_images/llm.png)

### Scénario 2 : Suivi d'un LLM dans une chaîne

Ensuite, nous pouvons créer une chaîne en utilisant un modèle de prompt, puis suivre le prompt initial et la réponse finale dans Argilla.

```python
from langchain.chains import LLMChain
from langchain_core.callbacks.stdout import StdOutCallbackHandler
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI

argilla_callback = ArgillaCallbackHandler(
    dataset_name="langchain-dataset",
    api_url=os.environ["ARGILLA_API_URL"],
    api_key=os.environ["ARGILLA_API_KEY"],
)
callbacks = [StdOutCallbackHandler(), argilla_callback]
llm = OpenAI(temperature=0.9, callbacks=callbacks)

template = """You are a playwright. Given the title of play, it is your job to write a synopsis for that title.
Title: {title}
Playwright: This is a synopsis for the above play:"""
prompt_template = PromptTemplate(input_variables=["title"], template=template)
synopsis_chain = LLMChain(llm=llm, prompt=prompt_template, callbacks=callbacks)

test_prompts = [{"title": "Documentary about Bigfoot in Paris"}]
synopsis_chain.apply(test_prompts)
```

```output


[1m> Entering new LLMChain chain...[0m
Prompt after formatting:
[32;1m[1;3mYou are a playwright. Given the title of play, it is your job to write a synopsis for that title.
Title: Documentary about Bigfoot in Paris
Playwright: This is a synopsis for the above play:[0m

[1m> Finished chain.[0m
```

```output
[{'text': "\n\nDocumentary about Bigfoot in Paris focuses on the story of a documentary filmmaker and their search for evidence of the legendary Bigfoot creature in the city of Paris. The play follows the filmmaker as they explore the city, meeting people from all walks of life who have had encounters with the mysterious creature. Through their conversations, the filmmaker unravels the story of Bigfoot and finds out the truth about the creature's presence in Paris. As the story progresses, the filmmaker learns more and more about the mysterious creature, as well as the different perspectives of the people living in the city, and what they think of the creature. In the end, the filmmaker's findings lead them to some surprising and heartwarming conclusions about the creature's existence and the importance it holds in the lives of the people in Paris."}]
```

![Interface utilisateur Argilla avec l'entrée-réponse de la chaîne LangChain](https://docs.argilla.io/en/latest/_images/chain.png)

### Scénario 3 : Utilisation d'un agent avec des outils

Enfin, dans un workflow plus avancé, vous pouvez créer un agent qui utilise quelques outils. Ainsi, le `ArgillaCallbackHandler` suivra l'entrée et la sortie, mais pas les étapes/réflexions intermédiaires, de sorte que pour un prompt donné, nous enregistrons le prompt d'origine et la réponse finale à ce prompt.

> Notez que pour ce scénario, nous utiliserons l'API Google Search (Serp API), vous devrez donc à la fois installer `google-search-results` avec `pip install google-search-results`, et définir la clé API Serp dans `os.environ["SERPAPI_API_KEY"] = "..."` (vous pouvez la trouver sur https://serpapi.com/dashboard), sinon l'exemple ci-dessous ne fonctionnera pas.

```python
from langchain.agents import AgentType, initialize_agent, load_tools
from langchain_core.callbacks.stdout import StdOutCallbackHandler
from langchain_openai import OpenAI

argilla_callback = ArgillaCallbackHandler(
    dataset_name="langchain-dataset",
    api_url=os.environ["ARGILLA_API_URL"],
    api_key=os.environ["ARGILLA_API_KEY"],
)
callbacks = [StdOutCallbackHandler(), argilla_callback]
llm = OpenAI(temperature=0.9, callbacks=callbacks)

tools = load_tools(["serpapi"], llm=llm, callbacks=callbacks)
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    callbacks=callbacks,
)
agent.run("Who was the first president of the United States of America?")
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to answer a historical question
Action: Search
Action Input: "who was the first president of the United States of America" [0m
Observation: [36;1m[1;3mGeorge Washington[0m
Thought:[32;1m[1;3m George Washington was the first president
Final Answer: George Washington was the first president of the United States of America.[0m

[1m> Finished chain.[0m
```

```output
'George Washington was the first president of the United States of America.'
```

![Interface utilisateur Argilla avec l'entrée-réponse de l'agent LangChain](https://docs.argilla.io/en/latest/_images/agent.png)
