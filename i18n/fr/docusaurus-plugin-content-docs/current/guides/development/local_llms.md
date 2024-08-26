---
translated: true
---

# Exécuter des LLM localement

## Cas d'utilisation

La popularité de projets comme [PrivateGPT](https://github.com/imartinez/privateGPT), [llama.cpp](https://github.com/ggerganov/llama.cpp), [Ollama](https://github.com/ollama/ollama), [GPT4All](https://github.com/nomic-ai/gpt4all), [llamafile](https://github.com/Mozilla-Ocho/llamafile) et d'autres souligne la demande d'exécuter des LLM localement (sur votre propre appareil).

Cela présente au moins deux avantages importants :

1. `Confidentialité` : Vos données ne sont pas envoyées à un tiers et ne sont pas soumises aux conditions d'utilisation d'un service commercial
2. `Coût` : Il n'y a pas de frais d'inférence, ce qui est important pour les applications gourmandes en jetons (par exemple, [simulations de longue durée](https://twitter.com/RLanceMartin/status/1691097659262820352?s=20), résumé)

## Aperçu

L'exécution d'un LLM localement nécessite quelques éléments :

1. `LLM open-source` : Un LLM open-source qui peut être librement modifié et partagé
2. `Inférence` : Capacité d'exécuter ce LLM sur votre appareil avec une latence acceptable

### LLM open-source

Les utilisateurs peuvent maintenant accéder à un ensemble en pleine expansion de [LLM open-source](https://cameronrwolfe.substack.com/p/the-history-of-open-source-llms-better).

Ces LLM peuvent être évalués selon au moins deux dimensions (voir la figure) :

1. `Modèle de base` : Quel est le modèle de base et comment a-t-il été entraîné ?
2. `Approche de fine-tuning` : Le modèle de base a-t-il été affiné et, le cas échéant, quel [ensemble d'instructions](https://cameronrwolfe.substack.com/p/beyond-llama-the-power-of-open-llms#%C2%A7alpaca-an-instruction-following-llama-model) a été utilisé ?

![Image description](../../../../../../static/img/OSS_LLM_overview.png)

Les performances relatives de ces modèles peuvent être évaluées à l'aide de plusieurs classements, notamment :

1. [LmSys](https://chat.lmsys.org/?arena)
2. [GPT4All](https://gpt4all.io/index.html)
3. [HuggingFace](https://huggingface.co/spaces/lmsys/chatbot-arena-leaderboard)

### Inférence

Quelques frameworks pour cela ont émergé pour prendre en charge l'inférence des LLM open-source sur divers appareils :

1. [`llama.cpp`](https://github.com/ggerganov/llama.cpp) : implémentation en C++ du code d'inférence llama avec [optimisation/quantification des poids](https://finbarr.ca/how-is-llama-cpp-possible/)
2. [`gpt4all`](https://docs.gpt4all.io/index.html) : backend C optimisé pour l'inférence
3. [`Ollama`](https://ollama.ai/) : regroupe les poids du modèle et l'environnement dans une application qui s'exécute sur l'appareil et sert le LLM
4. [`llamafile`](https://github.com/Mozilla-Ocho/llamafile) : regroupe les poids du modèle et tout ce qui est nécessaire pour exécuter le modèle dans un seul fichier, vous permettant d'exécuter le LLM localement à partir de ce fichier sans aucune étape d'installation supplémentaire

En général, ces frameworks feront quelques choses :

1. `Quantification` : Réduire l'empreinte mémoire des poids bruts du modèle
2. `Mise en œuvre efficace pour l'inférence` : Prendre en charge l'inférence sur du matériel grand public (par exemple, CPU ou GPU portable)

En particulier, voir [cet excellent article](https://finbarr.ca/how-is-llama-cpp-possible/) sur l'importance de la quantification.

![Image description](../../../../../../static/img/llama-memory-weights.png)

Avec moins de précision, nous diminuons radicalement la mémoire nécessaire pour stocker le LLM en mémoire.

De plus, nous pouvons voir l'importance de la bande passante de la mémoire GPU [feuille](https://docs.google.com/spreadsheets/d/1OehfHHNSn66BP2h3Bxp2NJTVX97icU0GmCXF6pK23H8/edit#gid=0) !

Un Mac M2 Max est 5 à 6 fois plus rapide qu'un M1 pour l'inférence en raison de la plus grande bande passante de la mémoire GPU.

![Image description](../../../../../../static/img/llama_t_put.png)

## Démarrage rapide

[`Ollama`](https://ollama.ai/) est un moyen facile d'exécuter l'inférence sur macOS.

Les instructions [ici](https://github.com/jmorganca/ollama?tab=readme-ov-file#ollama) fournissent des détails, que nous résumons :

* [Téléchargez et exécutez](https://ollama.ai/download) l'application
* Depuis la ligne de commande, récupérez un modèle dans cette [liste d'options](https://github.com/jmorganca/ollama) : par exemple, `ollama pull llama2`
* Lorsque l'application est en cours d'exécution, tous les modèles sont automatiquement servis sur `localhost:11434`

```python
from langchain_community.llms import Ollama

llm = Ollama(model="llama2")
llm.invoke("The first man on the moon was ...")
```

```output
' The first man on the moon was Neil Armstrong, who landed on the moon on July 20, 1969 as part of the Apollo 11 mission. obviously.'
```

Diffuser les jetons au fur et à mesure qu'ils sont générés.

```python
from langchain.callbacks.manager import CallbackManager
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

llm = Ollama(
    model="llama2", callback_manager=CallbackManager([StreamingStdOutCallbackHandler()])
)
llm.invoke("The first man on the moon was ...")
```

```output
 The first man to walk on the moon was Neil Armstrong, an American astronaut who was part of the Apollo 11 mission in 1969. февруари 20, 1969, Armstrong stepped out of the lunar module Eagle and onto the moon's surface, famously declaring "That's one small step for man, one giant leap for mankind" as he took his first steps. He was followed by fellow astronaut Edwin "Buzz" Aldrin, who also walked on the moon during the mission.
```

```output
' The first man to walk on the moon was Neil Armstrong, an American astronaut who was part of the Apollo 11 mission in 1969. февруари 20, 1969, Armstrong stepped out of the lunar module Eagle and onto the moon\'s surface, famously declaring "That\'s one small step for man, one giant leap for mankind" as he took his first steps. He was followed by fellow astronaut Edwin "Buzz" Aldrin, who also walked on the moon during the mission.'
```

## Environnement

La vitesse d'inférence est un défi lors de l'exécution de modèles localement (voir ci-dessus).

Pour minimiser la latence, il est souhaitable d'exécuter les modèles localement sur GPU, qui est livré avec de nombreux ordinateurs portables grand public [par exemple, les appareils Apple](https://www.apple.com/newsroom/2022/06/apple-unveils-m2-with-breakthrough-performance-and-capabilities/).

Et même avec un GPU, la bande passante de la mémoire GPU disponible (comme indiqué ci-dessus) est importante.

### Exécution du GPU Apple silicon

`Ollama` et [`llamafile`](https://github.com/Mozilla-Ocho/llamafile?tab=readme-ov-file#gpu-support) utiliseront automatiquement le GPU sur les appareils Apple.

D'autres frameworks nécessitent que l'utilisateur configure l'environnement pour utiliser le GPU Apple.

Par exemple, les liaisons python `llama.cpp` peuvent être configurées pour utiliser le GPU via [Metal](https://developer.apple.com/metal/).

Metal est une API graphique et de calcul créée par Apple offrant un accès quasi direct au GPU.

Voir la configuration [`llama.cpp`](docs/integrations/llms/llamacpp) [ici](https://github.com/abetlen/llama-cpp-python/blob/main/docs/install/macos.md) pour activer cela.

En particulier, assurez-vous que conda utilise le bon environnement virtuel que vous avez créé (`miniforge3`).

Par exemple, pour moi :

```bash
conda activate /Users/rlm/miniforge3/envs/llama
```

Avec ce qui précède confirmé, alors :

```bash
CMAKE_ARGS="-DLLAMA_METAL=on" FORCE_CMAKE=1 pip install -U llama-cpp-python --no-cache-dir
```

## LLMs

Il existe différentes façons d'accéder aux poids de modèle quantifiés.

1. [`HuggingFace`](https://huggingface.co/TheBloke) - De nombreux modèles quantifiés sont disponibles au téléchargement et peuvent être exécutés avec des frameworks tels que [`llama.cpp`](https://github.com/ggerganov/llama.cpp). Vous pouvez également télécharger des modèles au format [`llamafile`](https://huggingface.co/models?other=llamafile) depuis HuggingFace.
2. [`gpt4all`](https://gpt4all.io/index.html) - L'explorateur de modèles propose un classement des métriques et des modèles quantifiés associés disponibles au téléchargement.
3. [`Ollama`](https://github.com/jmorganca/ollama) - Plusieurs modèles peuvent être accessibles directement via `pull`.

### Ollama

Avec [Ollama](https://github.com/jmorganca/ollama), récupérez un modèle via `ollama pull <model family>:<tag>` :

* Par exemple, pour Llama-7b : `ollama pull llama2` téléchargera la version la plus basique du modèle (par exemple, le plus petit nombre de paramètres et une quantification à 4 bits).
* Nous pouvons également spécifier une version particulière à partir de la [liste des modèles](https://github.com/jmorganca/ollama?tab=readme-ov-file#model-library), par exemple `ollama pull llama2:13b`.
* Consultez l'ensemble complet des paramètres sur la [page de référence de l'API](https://api.python.langchain.com/en/latest/llms/langchain_community.llms.ollama.Ollama.html).

```python
from langchain_community.llms import Ollama

llm = Ollama(model="llama2:13b")
llm.invoke("The first man on the moon was ... think step by step")
```

```output
' Sure! Here\'s the answer, broken down step by step:\n\nThe first man on the moon was... Neil Armstrong.\n\nHere\'s how I arrived at that answer:\n\n1. The first manned mission to land on the moon was Apollo 11.\n2. The mission included three astronauts: Neil Armstrong, Edwin "Buzz" Aldrin, and Michael Collins.\n3. Neil Armstrong was the mission commander and the first person to set foot on the moon.\n4. On July 20, 1969, Armstrong stepped out of the lunar module Eagle and onto the moon\'s surface, famously declaring "That\'s one small step for man, one giant leap for mankind."\n\nSo, the first man on the moon was Neil Armstrong!'
```

### Llama.cpp

Llama.cpp est compatible avec un [large ensemble de modèles](https://github.com/ggerganov/llama.cpp).

Par exemple, ci-dessous, nous exécutons une inférence sur `llama2-13b` avec une quantification à 4 bits téléchargée depuis [HuggingFace](https://huggingface.co/TheBloke/Llama-2-13B-GGML/tree/main).

Comme indiqué ci-dessus, consultez la [référence de l'API](https://api.python.langchain.com/en/latest/llms/langchain.llms.llamacpp.LlamaCpp.html?highlight=llamacpp#langchain.llms.llamacpp.LlamaCpp) pour l'ensemble complet des paramètres.

À partir de la [documentation de l'API llama.cpp](https://api.python.langchain.com/en/latest/llms/langchain_community.llms.llamacpp.LlamaCpp.htm), quelques-uns méritent d'être commentés :

`n_gpu_layers` : nombre de couches à charger dans la mémoire GPU

* Valeur : 1
* Signification : Une seule couche du modèle sera chargée dans la mémoire GPU (1 est souvent suffisant).

`n_batch` : nombre de jetons que le modèle doit traiter en parallèle

* Valeur : n_batch
* Signification : Il est recommandé de choisir une valeur comprise entre 1 et n_ctx (qui dans ce cas est défini à 2048).

`n_ctx` : fenêtre de contexte des jetons

* Valeur : 2048
* Signification : Le modèle prendra en compte une fenêtre de 2048 jetons à la fois.

`f16_kv` : si le modèle doit utiliser la demi-précision pour le cache clé/valeur

* Valeur : True
* Signification : Le modèle utilisera la demi-précision, ce qui peut être plus économe en mémoire ; Metal ne prend en charge que True.

```python
%env CMAKE_ARGS="-DLLAMA_METAL=on"
%env FORCE_CMAKE=1
%pip install --upgrade --quiet  llama-cpp-python --no-cache-dirclear
```

```python
from langchain.callbacks.manager import CallbackManager
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain_community.llms import LlamaCpp

llm = LlamaCpp(
    model_path="/Users/rlm/Desktop/Code/llama.cpp/models/openorca-platypus2-13b.gguf.q4_0.bin",
    n_gpu_layers=1,
    n_batch=512,
    n_ctx=2048,
    f16_kv=True,
    callback_manager=CallbackManager([StreamingStdOutCallbackHandler()]),
    verbose=True,
)
```

Le journal de la console affichera ce qui suit pour indiquer que Metal a été correctement activé à partir des étapes ci-dessus :

```output
ggml_metal_init: allocating
ggml_metal_init: using MPS
```

```python
llm.invoke("The first man on the moon was ... Let's think step by step")
```

```output
Llama.generate: prefix-match hit

 and use logical reasoning to figure out who the first man on the moon was.

Here are some clues:

1. The first man on the moon was an American.
2. He was part of the Apollo 11 mission.
3. He stepped out of the lunar module and became the first person to set foot on the moon's surface.
4. His last name is Armstrong.

Now, let's use our reasoning skills to figure out who the first man on the moon was. Based on clue #1, we know that the first man on the moon was an American. Clue #2 tells us that he was part of the Apollo 11 mission. Clue #3 reveals that he was the first person to set foot on the moon's surface. And finally, clue #4 gives us his last name: Armstrong.
Therefore, the first man on the moon was Neil Armstrong!


llama_print_timings:        load time =  9623.21 ms
llama_print_timings:      sample time =   143.77 ms /   203 runs   (    0.71 ms per token,  1412.01 tokens per second)
llama_print_timings: prompt eval time =   485.94 ms /     7 tokens (   69.42 ms per token,    14.40 tokens per second)
llama_print_timings:        eval time =  6385.16 ms /   202 runs   (   31.61 ms per token,    31.64 tokens per second)
llama_print_timings:       total time =  7279.28 ms
```

```output
" and use logical reasoning to figure out who the first man on the moon was.\n\nHere are some clues:\n\n1. The first man on the moon was an American.\n2. He was part of the Apollo 11 mission.\n3. He stepped out of the lunar module and became the first person to set foot on the moon's surface.\n4. His last name is Armstrong.\n\nNow, let's use our reasoning skills to figure out who the first man on the moon was. Based on clue #1, we know that the first man on the moon was an American. Clue #2 tells us that he was part of the Apollo 11 mission. Clue #3 reveals that he was the first person to set foot on the moon's surface. And finally, clue #4 gives us his last name: Armstrong.\nTherefore, the first man on the moon was Neil Armstrong!"
```

### GPT4All

Nous pouvons utiliser les poids de modèle téléchargés à partir de l'[explorateur de modèles GPT4All](/docs/integrations/llms/gpt4all).

Similaire à ce qui est montré ci-dessus, nous pouvons exécuter une inférence et utiliser [la référence de l'API](https://api.python.langchain.com/en/latest/llms/langchain_community.llms.gpt4all.GPT4All.html) pour définir les paramètres d'intérêt.

```python
%pip install gpt4all
```

```python
from langchain_community.llms import GPT4All

llm = GPT4All(
    model="/Users/rlm/Desktop/Code/gpt4all/models/nous-hermes-13b.ggmlv3.q4_0.bin"
)
```

```python
llm.invoke("The first man on the moon was ... Let's think step by step")
```

```output
".\n1) The United States decides to send a manned mission to the moon.2) They choose their best astronauts and train them for this specific mission.3) They build a spacecraft that can take humans to the moon, called the Lunar Module (LM).4) They also create a larger spacecraft, called the Saturn V rocket, which will launch both the LM and the Command Service Module (CSM), which will carry the astronauts into orbit.5) The mission is planned down to the smallest detail: from the trajectory of the rockets to the exact movements of the astronauts during their moon landing.6) On July 16, 1969, the Saturn V rocket launches from Kennedy Space Center in Florida, carrying the Apollo 11 mission crew into space.7) After one and a half orbits around the Earth, the LM separates from the CSM and begins its descent to the moon's surface.8) On July 20, 1969, at 2:56 pm EDT (GMT-4), Neil Armstrong becomes the first man on the moon. He speaks these"
```

### llamafile

L'une des façons les plus simples d'exécuter un LLM localement est d'utiliser un [llamafile](https://github.com/Mozilla-Ocho/llamafile). Tout ce que vous avez à faire est :

1) Télécharger un llamafile depuis [HuggingFace](https://huggingface.co/models?other=llamafile)
2) Rendre le fichier exécutable
3) Exécuter le fichier

Les llamafiles regroupent les poids du modèle et une version [spécialement compilée](https://github.com/Mozilla-Ocho/llamafile?tab=readme-ov-file#technical-details) de [`llama.cpp`](https://github.com/ggerganov/llama.cpp) dans un seul fichier qui peut s'exécuter sur la plupart des ordinateurs sans dépendances supplémentaires. Ils comprennent également un serveur d'inférence intégré qui fournit une [API](https://github.com/Mozilla-Ocho/llamafile/blob/main/llama.cpp/server/README.md#api-endpoints) pour interagir avec votre modèle.

Voici un simple script bash qui montre les 3 étapes de configuration :

```bash
# Download a llamafile from HuggingFace
wget https://huggingface.co/jartine/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile

# Make the file executable. On Windows, instead just rename the file to end in ".exe".
chmod +x TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile

# Start the model server. Listens at http://localhost:8080 by default.
./TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile --server --nobrowser
```

Après avoir exécuté les étapes de configuration ci-dessus, vous pouvez utiliser LangChain pour interagir avec votre modèle :

```python
from langchain_community.llms.llamafile import Llamafile

llm = Llamafile()

llm.invoke("The first man on the moon was ... Let's think step by step.")
```

```output
"\nFirstly, let's imagine the scene where Neil Armstrong stepped onto the moon. This happened in 1969. The first man on the moon was Neil Armstrong. We already know that.\n2nd, let's take a step back. Neil Armstrong didn't have any special powers. He had to land his spacecraft safely on the moon without injuring anyone or causing any damage. If he failed to do this, he would have been killed along with all those people who were on board the spacecraft.\n3rd, let's imagine that Neil Armstrong successfully landed his spacecraft on the moon and made it back to Earth safely. The next step was for him to be hailed as a hero by his people back home. It took years before Neil Armstrong became an American hero.\n4th, let's take another step back. Let's imagine that Neil Armstrong wasn't hailed as a hero, and instead, he was just forgotten. This happened in the 1970s. Neil Armstrong wasn't recognized for his remarkable achievement on the moon until after he died.\n5th, let's take another step back. Let's imagine that Neil Armstrong didn't die in the 1970s and instead, lived to be a hundred years old. This happened in 2036. In the year 2036, Neil Armstrong would have been a centenarian.\nNow, let's think about the present. Neil Armstrong is still alive. He turned 95 years old on July 20th, 2018. If he were to die now, his achievement of becoming the first human being to set foot on the moon would remain an unforgettable moment in history.\nI hope this helps you understand the significance and importance of Neil Armstrong's achievement on the moon!"
```

## Prompts

Certains LLM bénéficieront de prompts spécifiques.

Par exemple, LLaMA utilisera des [jetons spéciaux](https://twitter.com/RLanceMartin/status/1681879318493003776?s=20).

Nous pouvons utiliser `ConditionalPromptSelector` pour définir le prompt en fonction du type de modèle.

```python
# Set our LLM
llm = LlamaCpp(
    model_path="/Users/rlm/Desktop/Code/llama.cpp/models/openorca-platypus2-13b.gguf.q4_0.bin",
    n_gpu_layers=1,
    n_batch=512,
    n_ctx=2048,
    f16_kv=True,
    callback_manager=CallbackManager([StreamingStdOutCallbackHandler()]),
    verbose=True,
)
```

Définissez le prompt associé en fonction de la version du modèle.

```python
from langchain.chains import LLMChain
from langchain.chains.prompt_selector import ConditionalPromptSelector
from langchain_core.prompts import PromptTemplate

DEFAULT_LLAMA_SEARCH_PROMPT = PromptTemplate(
    input_variables=["question"],
    template="""<<SYS>> \n You are an assistant tasked with improving Google search \
results. \n <</SYS>> \n\n [INST] Generate THREE Google search queries that \
are similar to this question. The output should be a numbered list of questions \
and each should have a question mark at the end: \n\n {question} [/INST]""",
)

DEFAULT_SEARCH_PROMPT = PromptTemplate(
    input_variables=["question"],
    template="""You are an assistant tasked with improving Google search \
results. Generate THREE Google search queries that are similar to \
this question. The output should be a numbered list of questions and each \
should have a question mark at the end: {question}""",
)

QUESTION_PROMPT_SELECTOR = ConditionalPromptSelector(
    default_prompt=DEFAULT_SEARCH_PROMPT,
    conditionals=[(lambda llm: isinstance(llm, LlamaCpp), DEFAULT_LLAMA_SEARCH_PROMPT)],
)

prompt = QUESTION_PROMPT_SELECTOR.get_prompt(llm)
prompt
```

```output
PromptTemplate(input_variables=['question'], output_parser=None, partial_variables={}, template='<<SYS>> \n You are an assistant tasked with improving Google search results. \n <</SYS>> \n\n [INST] Generate THREE Google search queries that are similar to this question. The output should be a numbered list of questions and each should have a question mark at the end: \n\n {question} [/INST]', template_format='f-string', validate_template=True)
```

```python
# Chain
llm_chain = LLMChain(prompt=prompt, llm=llm)
question = "What NFL team won the Super Bowl in the year that Justin Bieber was born?"
llm_chain.run({"question": question})
```

```output
  Sure! Here are three similar search queries with a question mark at the end:

1. Which NBA team did LeBron James lead to a championship in the year he was drafted?
2. Who won the Grammy Awards for Best New Artist and Best Female Pop Vocal Performance in the same year that Lady Gaga was born?
3. What MLB team did Babe Ruth play for when he hit 60 home runs in a single season?


llama_print_timings:        load time = 14943.19 ms
llama_print_timings:      sample time =    72.93 ms /   101 runs   (    0.72 ms per token,  1384.87 tokens per second)
llama_print_timings: prompt eval time = 14942.95 ms /    93 tokens (  160.68 ms per token,     6.22 tokens per second)
llama_print_timings:        eval time =  3430.85 ms /   100 runs   (   34.31 ms per token,    29.15 tokens per second)
llama_print_timings:       total time = 18578.26 ms
```

```output
'  Sure! Here are three similar search queries with a question mark at the end:\n\n1. Which NBA team did LeBron James lead to a championship in the year he was drafted?\n2. Who won the Grammy Awards for Best New Artist and Best Female Pop Vocal Performance in the same year that Lady Gaga was born?\n3. What MLB team did Babe Ruth play for when he hit 60 home runs in a single season?'
```

Nous pouvons également utiliser le Prompt Hub de LangChain pour récupérer et/ou stocker des prompts spécifiques aux modèles.

Cela fonctionnera avec votre [clé API LangSmith](https://docs.smith.langchain.com/).

Par exemple, [voici](https://smith.langchain.com/hub/rlm/rag-prompt-llama) un prompt pour RAG avec des jetons spécifiques à LLaMA.

## Cas d'utilisation

Étant donné un `llm` créé à partir de l'un des modèles ci-dessus, vous pouvez l'utiliser pour de [nombreux cas d'utilisation](/docs/use_cases/).

Par exemple, voici un guide sur [RAG](/docs/use_cases/question_answering/local_retrieval_qa) avec des LLM locaux.

En général, les cas d'utilisation des LLM locaux peuvent être guidés par au moins deux facteurs :

* `Confidentialité` : données privées (par exemple, journaux, etc.) qu'un utilisateur ne souhaite pas partager
* `Coût` : le prétraitement du texte (extraction/étiquetage), la résumé et les simulations d'agents sont des tâches intensives en utilisation de jetons

De plus, [voici](https://blog.langchain.dev/using-langsmith-to-support-fine-tuning-of-open-source-llms/) un aperçu du fine-tuning, qui peut utiliser des LLM open-source.
