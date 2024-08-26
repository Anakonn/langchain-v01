---
translated: true
---

# Llama.cpp

[llama-cpp-python](https://github.com/abetlen/llama-cpp-python) est une liaison Python pour [llama.cpp](https://github.com/ggerganov/llama.cpp).

Il prend en charge l'inférence pour [de nombreux modèles LLM](https://github.com/ggerganov/llama.cpp#description), qui peuvent être accessibles sur [Hugging Face](https://huggingface.co/TheBloke).

Ce notebook explique comment exécuter `llama-cpp-python` dans LangChain.

**Remarque : les nouvelles versions de `llama-cpp-python` utilisent des fichiers de modèle GGUF (voir [ici](https://github.com/abetlen/llama-cpp-python/pull/633))).**

Il s'agit d'un changement cassant.

Pour convertir les modèles GGML existants en GGUF, vous pouvez exécuter ce qui suit dans [llama.cpp](https://github.com/ggerganov/llama.cpp) :

```bash
python ./convert-llama-ggmlv3-to-gguf.py --eps 1e-5 --input models/openorca-platypus2-13b.ggmlv3.q4_0.bin --output models/openorca-platypus2-13b.gguf.q4_0.bin
```

## Installation

Il existe différentes options pour installer le package llama-cpp :
- Utilisation du CPU
- CPU + GPU (en utilisant l'un des nombreux backends BLAS)
- GPU Metal (MacOS avec puce Apple Silicon)

### Installation uniquement sur CPU

```python
%pip install --upgrade --quiet  llama-cpp-python
```

### Installation avec OpenBLAS / cuBLAS / CLBlast

`llama.cpp` prend en charge plusieurs backends BLAS pour un traitement plus rapide. Utilisez la variable d'environnement `FORCE_CMAKE=1` pour forcer l'utilisation de cmake et installez le package pip pour le backend BLAS souhaité ([source](https://github.com/abetlen/llama-cpp-python#installation-with-openblas--cublas--clblast))).

Exemple d'installation avec le backend cuBLAS :

```python
!CMAKE_ARGS="-DLLAMA_CUBLAS=on" FORCE_CMAKE=1 pip install llama-cpp-python
```

**IMPORTANT** : Si vous avez déjà installé la version uniquement CPU du package, vous devez le réinstaller complètement. Envisagez la commande suivante :

```python
!CMAKE_ARGS="-DLLAMA_CUBLAS=on" FORCE_CMAKE=1 pip install --upgrade --force-reinstall llama-cpp-python --no-cache-dir
```

### Installation avec Metal

`llama.cpp` prend en charge les puces Apple silicon en tant que citoyen de première classe - optimisé via ARM NEON, Accelerate et les frameworks Metal. Utilisez la variable d'environnement `FORCE_CMAKE=1` pour forcer l'utilisation de cmake et installez le package pip pour la prise en charge de Metal ([source](https://github.com/abetlen/llama-cpp-python/blob/main/docs/install/macos.md))).

Exemple d'installation avec le support Metal :

```python
!CMAKE_ARGS="-DLLAMA_METAL=on" FORCE_CMAKE=1 pip install llama-cpp-python
```

**IMPORTANT** : Si vous avez déjà installé une version uniquement CPU du package, vous devez le réinstaller complètement : envisagez la commande suivante :

```python
!CMAKE_ARGS="-DLLAMA_METAL=on" FORCE_CMAKE=1 pip install --upgrade --force-reinstall llama-cpp-python --no-cache-dir
```

### Installation sur Windows

Il est stable d'installer la bibliothèque `llama-cpp-python` en la compilant à partir de la source. Vous pouvez suivre la plupart des instructions du dépôt lui-même, mais il existe quelques instructions spécifiques à Windows qui peuvent être utiles.

Conditions requises pour installer `llama-cpp-python`,

- git
- python
- cmake
- Visual Studio Community (assurez-vous d'installer cela avec les paramètres suivants)
    - Développement de bureau avec C++
    - Développement Python
    - Développement embarqué Linux avec C++

1. Clonez le dépôt git de manière récursive pour obtenir le sous-module `llama.cpp` également

```bash
git clone --recursive -j8 https://github.com/abetlen/llama-cpp-python.git
```

2. Ouvrez une invite de commande et définissez les variables d'environnement suivantes.

```bash
set FORCE_CMAKE=1
set CMAKE_ARGS=-DLLAMA_CUBLAS=OFF
```

Si vous avez un GPU NVIDIA, assurez-vous que `DLLAMA_CUBLAS` est défini sur `ON`

#### Compilation et installation

Maintenant, vous pouvez `cd` dans le répertoire `llama-cpp-python` et installer le package

```bash
python -m pip install -e .
```

**IMPORTANT** : Si vous avez déjà installé une version uniquement CPU du package, vous devez le réinstaller complètement : envisagez la commande suivante :

```python
!python -m pip install -e . --force-reinstall --no-cache-dir
```

## Utilisation

Assurez-vous de suivre toutes les instructions pour [installer tous les fichiers de modèle nécessaires](https://github.com/ggerganov/llama.cpp).

Vous n'avez pas besoin d'un `API_TOKEN` car vous exécuterez le LLM localement.

Il vaut la peine de comprendre quels modèles conviennent à la machine souhaitée.

Les modèles Hugging Face de [TheBloke](https://huggingface.co/TheBloke) ont une section `Provided files` qui expose la RAM requise pour exécuter des modèles de différentes tailles et méthodes de quantification (par exemple : [Llama2-7B-Chat-GGUF](https://huggingface.co/TheBloke/Llama-2-7b-Chat-GGUF#provided-files))).

Ce [problème GitHub](https://github.com/facebookresearch/llama/issues/425) est également pertinent pour trouver le bon modèle pour votre machine.

```python
from langchain_community.llms import LlamaCpp
from langchain_core.callbacks import CallbackManager, StreamingStdOutCallbackHandler
from langchain_core.prompts import PromptTemplate
```

**Envisagez d'utiliser un modèle qui convient à votre modèle ! Consultez la page des modèles sur Hugging Face, etc. pour obtenir un modèle de requête correct.**

```python
template = """Question: {question}

Answer: Let's work this out in a step by step way to be sure we have the right answer."""

prompt = PromptTemplate.from_template(template)
```

```python
# Callbacks support token-wise streaming
callback_manager = CallbackManager([StreamingStdOutCallbackHandler()])
```

### CPU

Exemple utilisant un modèle LLaMA 2 7B

```python
# Make sure the model path is correct for your system!
llm = LlamaCpp(
    model_path="/Users/rlm/Desktop/Code/llama.cpp/models/openorca-platypus2-13b.gguf.q4_0.bin",
    temperature=0.75,
    max_tokens=2000,
    top_p=1,
    callback_manager=callback_manager,
    verbose=True,  # Verbose is required to pass to the callback manager
)
```

```python
question = """
Question: A rap battle between Stephen Colbert and John Oliver
"""
llm.invoke(question)
```

```output

Stephen Colbert:
Yo, John, I heard you've been talkin' smack about me on your show.
Let me tell you somethin', pal, I'm the king of late-night TV
My satire is sharp as a razor, it cuts deeper than a knife
While you're just a british bloke tryin' to be funny with your accent and your wit.
John Oliver:
Oh Stephen, don't be ridiculous, you may have the ratings but I got the real talk.
My show is the one that people actually watch and listen to, not just for the laughs but for the facts.
While you're busy talkin' trash, I'm out here bringing the truth to light.
Stephen Colbert:
Truth? Ha! You think your show is about truth? Please, it's all just a joke to you.
You're just a fancy-pants british guy tryin' to be funny with your news and your jokes.
While I'm the one who's really makin' a difference, with my sat


llama_print_timings:        load time =   358.60 ms
llama_print_timings:      sample time =   172.55 ms /   256 runs   (    0.67 ms per token,  1483.59 tokens per second)
llama_print_timings: prompt eval time =   613.36 ms /    16 tokens (   38.33 ms per token,    26.09 tokens per second)
llama_print_timings:        eval time = 10151.17 ms /   255 runs   (   39.81 ms per token,    25.12 tokens per second)
llama_print_timings:       total time = 11332.41 ms
```

```output
"\nStephen Colbert:\nYo, John, I heard you've been talkin' smack about me on your show.\nLet me tell you somethin', pal, I'm the king of late-night TV\nMy satire is sharp as a razor, it cuts deeper than a knife\nWhile you're just a british bloke tryin' to be funny with your accent and your wit.\nJohn Oliver:\nOh Stephen, don't be ridiculous, you may have the ratings but I got the real talk.\nMy show is the one that people actually watch and listen to, not just for the laughs but for the facts.\nWhile you're busy talkin' trash, I'm out here bringing the truth to light.\nStephen Colbert:\nTruth? Ha! You think your show is about truth? Please, it's all just a joke to you.\nYou're just a fancy-pants british guy tryin' to be funny with your news and your jokes.\nWhile I'm the one who's really makin' a difference, with my sat"
```

Exemple utilisant un modèle LLaMA v1

```python
# Make sure the model path is correct for your system!
llm = LlamaCpp(
    model_path="./ggml-model-q4_0.bin", callback_manager=callback_manager, verbose=True
)
```

```python
llm_chain = prompt | llm
```

```python
question = "What NFL team won the Super Bowl in the year Justin Bieber was born?"
llm_chain.invoke({"question": question})
```

```output


1. First, find out when Justin Bieber was born.
2. We know that Justin Bieber was born on March 1, 1994.
3. Next, we need to look up when the Super Bowl was played in that year.
4. The Super Bowl was played on January 28, 1995.
5. Finally, we can use this information to answer the question. The NFL team that won the Super Bowl in the year Justin Bieber was born is the San Francisco 49ers.


llama_print_timings:        load time =   434.15 ms
llama_print_timings:      sample time =    41.81 ms /   121 runs   (    0.35 ms per token)
llama_print_timings: prompt eval time =  2523.78 ms /    48 tokens (   52.58 ms per token)
llama_print_timings:        eval time = 23971.57 ms /   121 runs   (  198.11 ms per token)
llama_print_timings:       total time = 28945.95 ms
```

```output
'\n\n1. First, find out when Justin Bieber was born.\n2. We know that Justin Bieber was born on March 1, 1994.\n3. Next, we need to look up when the Super Bowl was played in that year.\n4. The Super Bowl was played on January 28, 1995.\n5. Finally, we can use this information to answer the question. The NFL team that won the Super Bowl in the year Justin Bieber was born is the San Francisco 49ers.'
```

### GPU

Si l'installation avec le backend BLAS a été correcte, vous verrez un indicateur `BLAS = 1` dans les propriétés du modèle.

Deux des paramètres les plus importants pour une utilisation avec GPU sont :

- `n_gpu_layers` - détermine combien de couches du modèle sont déchargées sur votre GPU.
- `n_batch` - combien de jetons sont traités en parallèle.

Le réglage correct de ces paramètres améliorera considérablement la vitesse d'évaluation (voir le [code d'enveloppe](https://github.com/langchain-ai/langchain/blob/master/libs/community/langchain_community/llms/llamacpp.py) pour plus de détails).

```python
n_gpu_layers = -1  # The number of layers to put on the GPU. The rest will be on the CPU. If you don't know how many layers there are, you can use -1 to move all to GPU.
n_batch = 512  # Should be between 1 and n_ctx, consider the amount of VRAM in your GPU.

# Make sure the model path is correct for your system!
llm = LlamaCpp(
    model_path="/Users/rlm/Desktop/Code/llama.cpp/models/openorca-platypus2-13b.gguf.q4_0.bin",
    n_gpu_layers=n_gpu_layers,
    n_batch=n_batch,
    callback_manager=callback_manager,
    verbose=True,  # Verbose is required to pass to the callback manager
)
```

```python
llm_chain = prompt | llm
question = "What NFL team won the Super Bowl in the year Justin Bieber was born?"
llm_chain.invoke({"question": question})
```

```output


1. Identify Justin Bieber's birth date: Justin Bieber was born on March 1, 1994.

2. Find the Super Bowl winner of that year: The NFL season of 1993 with the Super Bowl being played in January or of 1994.

3. Determine which team won the game: The Dallas Cowboys faced the Buffalo Bills in Super Bowl XXVII on January 31, 1993 (as the year is mis-labelled due to a error). The Dallas Cowboys won this matchup.

So, Justin Bieber was born when the Dallas Cowboys were the reigning NFL Super Bowl.


llama_print_timings:        load time =   427.63 ms
llama_print_timings:      sample time =   115.85 ms /   164 runs   (    0.71 ms per token,  1415.67 tokens per second)
llama_print_timings: prompt eval time =   427.53 ms /    45 tokens (    9.50 ms per token,   105.26 tokens per second)
llama_print_timings:        eval time =  4526.53 ms /   163 runs   (   27.77 ms per token,    36.01 tokens per second)
llama_print_timings:       total time =  5293.77 ms
```

```output
"\n\n1. Identify Justin Bieber's birth date: Justin Bieber was born on March 1, 1994.\n\n2. Find the Super Bowl winner of that year: The NFL season of 1993 with the Super Bowl being played in January or of 1994.\n\n3. Determine which team won the game: The Dallas Cowboys faced the Buffalo Bills in Super Bowl XXVII on January 31, 1993 (as the year is mis-labelled due to a error). The Dallas Cowboys won this matchup.\n\nSo, Justin Bieber was born when the Dallas Cowboys were the reigning NFL Super Bowl."
```

### Métal

Si l'installation avec Metal a été correcte, vous verrez un indicateur `NEON = 1` dans les propriétés du modèle.

Deux des paramètres GPU les plus importants sont :

- `n_gpu_layers` - détermine combien de couches du modèle sont déchargées sur votre GPU Metal.
- `n_batch` - combien de jetons sont traités en parallèle, la valeur par défaut est 8, définissez-la sur un nombre plus élevé.
- `f16_kv` - pour une raison quelconque, Metal ne prend en charge que `True`, sinon vous obtiendrez une erreur telle que `Asserting on type 0 GGML_ASSERT: .../ggml-metal.m:706: false && "not implemented"`

Le réglage correct de ces paramètres améliorera considérablement la vitesse d'évaluation (voir le [code d'enveloppe](https://github.com/langchain-ai/langchain/blob/master/libs/community/langchain_community/llms/llamacpp.py) pour plus de détails).

```python
n_gpu_layers = 1  # The number of layers to put on the GPU. The rest will be on the CPU. If you don't know how many layers there are, you can use -1 to move all to GPU.
n_batch = 512  # Should be between 1 and n_ctx, consider the amount of RAM of your Apple Silicon Chip.
# Make sure the model path is correct for your system!
llm = LlamaCpp(
    model_path="/Users/rlm/Desktop/Code/llama.cpp/models/openorca-platypus2-13b.gguf.q4_0.bin",
    n_gpu_layers=n_gpu_layers,
    n_batch=n_batch,
    f16_kv=True,  # MUST set to True, otherwise you will run into problem after a couple of calls
    callback_manager=callback_manager,
    verbose=True,  # Verbose is required to pass to the callback manager
)
```

Le journal de la console affichera le journal suivant pour indiquer que Metal a été activé correctement.

```output
ggml_metal_init: allocating
ggml_metal_init: using MPS
...
```

Vous pouvez également vérifier le `Activity Monitor` en observant l'utilisation du GPU par le processus, l'utilisation du CPU chute considérablement après avoir activé `n_gpu_layers=1`.

Pour le premier appel au LLM, les performances peuvent être lentes en raison de la compilation du modèle sur le GPU Metal.

### Grammaires

Nous pouvons utiliser des [grammaires](https://github.com/ggerganov/llama.cpp/blob/master/grammars/README.md) pour contraindre les sorties du modèle et échantillonner les jetons en fonction des règles définies en elles.

Pour illustrer ce concept, nous avons inclus des [fichiers de grammaire d'exemple](https://github.com/langchain-ai/langchain/tree/master/libs/langchain/langchain/llms/grammars) qui seront utilisés dans les exemples ci-dessous.

La création de fichiers de grammaire gbnf peut être fastidieuse, mais si vous avez un cas d'utilisation où les schémas de sortie sont importants, il existe deux outils qui peuvent vous aider :
- [Application de générateur de grammaire en ligne](https://grammar.intrinsiclabs.ai/) qui convertit les définitions d'interface TypeScript en fichier gbnf.
- [Script Python](https://github.com/ggerganov/llama.cpp/blob/master/examples/json-schema-to-grammar.py) pour convertir un schéma JSON en fichier gbnf. Vous pouvez par exemple créer un objet `pydantic`, générer son schéma JSON à l'aide de la méthode `.schema_json()`, puis utiliser ce script pour le convertir en fichier gbnf.

Dans le premier exemple, fournissez le chemin du fichier `json.gbnf` spécifié afin de produire du JSON :

```python
n_gpu_layers = 1  # The number of layers to put on the GPU. The rest will be on the CPU. If you don't know how many layers there are, you can use -1 to move all to GPU.
n_batch = 512  # Should be between 1 and n_ctx, consider the amount of RAM of your Apple Silicon Chip.
# Make sure the model path is correct for your system!
llm = LlamaCpp(
    model_path="/Users/rlm/Desktop/Code/llama.cpp/models/openorca-platypus2-13b.gguf.q4_0.bin",
    n_gpu_layers=n_gpu_layers,
    n_batch=n_batch,
    f16_kv=True,  # MUST set to True, otherwise you will run into problem after a couple of calls
    callback_manager=callback_manager,
    verbose=True,  # Verbose is required to pass to the callback manager
    grammar_path="/Users/rlm/Desktop/Code/langchain-main/langchain/libs/langchain/langchain/llms/grammars/json.gbnf",
)
```

```python
%%capture captured --no-stdout
result = llm.invoke("Describe a person in JSON format:")
```

```output
{
  "name": "John Doe",
  "age": 34,
  "": {
    "title": "Software Developer",
    "company": "Google"
  },
  "interests": [
    "Sports",
    "Music",
    "Cooking"
  ],
  "address": {
    "street_number": 123,
    "street_name": "Oak Street",
    "city": "Mountain View",
    "state": "California",
    "postal_code": 94040
  }}


llama_print_timings:        load time =   357.51 ms
llama_print_timings:      sample time =  1213.30 ms /   144 runs   (    8.43 ms per token,   118.68 tokens per second)
llama_print_timings: prompt eval time =   356.78 ms /     9 tokens (   39.64 ms per token,    25.23 tokens per second)
llama_print_timings:        eval time =  3947.16 ms /   143 runs   (   27.60 ms per token,    36.23 tokens per second)
llama_print_timings:       total time =  5846.21 ms
```

Nous pouvons également fournir `list.gbnf` pour renvoyer une liste :

```python
n_gpu_layers = 1
n_batch = 512
llm = LlamaCpp(
    model_path="/Users/rlm/Desktop/Code/llama.cpp/models/openorca-platypus2-13b.gguf.q4_0.bin",
    n_gpu_layers=n_gpu_layers,
    n_batch=n_batch,
    f16_kv=True,  # MUST set to True, otherwise you will run into problem after a couple of calls
    callback_manager=callback_manager,
    verbose=True,
    grammar_path="/Users/rlm/Desktop/Code/langchain-main/langchain/libs/langchain/langchain/llms/grammars/list.gbnf",
)
```

```python
%%capture captured --no-stdout
result = llm.invoke("List of top-3 my favourite books:")
```

```output
["The Catcher in the Rye", "Wuthering Heights", "Anna Karenina"]


llama_print_timings:        load time =   322.34 ms
llama_print_timings:      sample time =   232.60 ms /    26 runs   (    8.95 ms per token,   111.78 tokens per second)
llama_print_timings: prompt eval time =   321.90 ms /    11 tokens (   29.26 ms per token,    34.17 tokens per second)
llama_print_timings:        eval time =   680.82 ms /    25 runs   (   27.23 ms per token,    36.72 tokens per second)
llama_print_timings:       total time =  1295.27 ms
```
