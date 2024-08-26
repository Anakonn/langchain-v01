---
translated: true
---

# Llamafile

[Llamafile](https://github.com/Mozilla-Ocho/llamafile) vous permet de distribuer et d'exécuter des LLM avec un seul fichier.

Llamafile y parvient en combinant [llama.cpp](https://github.com/ggerganov/llama.cpp) avec [Cosmopolitan Libc](https://github.com/jart/cosmopolitan) en un seul cadre qui réduit toute la complexité des LLM à un exécutable monofichier (appelé "llamafile") qui s'exécute localement sur la plupart des ordinateurs, sans installation.

## Configuration

1. Téléchargez un llamafile pour le modèle que vous souhaitez utiliser. Vous pouvez trouver de nombreux modèles au format llamafile sur [HuggingFace](https://huggingface.co/models?other=llamafile). Dans ce guide, nous allons télécharger un petit modèle, `TinyLlama-1.1B-Chat-v1.0.Q5_K_M`. Remarque : si vous n'avez pas `wget`, vous pouvez simplement télécharger le modèle via ce [lien](https://huggingface.co/jartine/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile?download=true).

```bash
wget https://huggingface.co/jartine/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile
```

2. Rendez le llamafile exécutable. Tout d'abord, si ce n'est pas déjà fait, ouvrez un terminal. **Si vous utilisez MacOS, Linux ou BSD,** vous devrez accorder l'autorisation à votre ordinateur d'exécuter ce nouveau fichier à l'aide de `chmod` (voir ci-dessous). **Si vous êtes sur Windows,** renommez le fichier en ajoutant ".exe" à la fin (le fichier du modèle doit être nommé `TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile.exe`).

```bash
chmod +x TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile  # run if you're on MacOS, Linux, or BSD
```

3. Exécutez le llamafile en "mode serveur" :

```bash
./TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile --server --nobrowser
```

Vous pouvez maintenant effectuer des appels à l'API REST du llamafile. Par défaut, le serveur llamafile écoute sur http://localhost:8080. Vous pouvez trouver la documentation complète du serveur [ici](https://github.com/Mozilla-Ocho/llamafile/blob/main/llama.cpp/server/README.md#api-endpoints). Vous pouvez interagir directement avec le llamafile via l'API REST, mais ici nous montrerons comment interagir avec lui à l'aide de LangChain.

## Utilisation

```python
from langchain_community.llms.llamafile import Llamafile

llm = Llamafile()

llm.invoke("Tell me a joke")
```

```output
'? \nI\'ve got a thing for pink, but you know that.\n"Can we not talk about work anymore?" - What did she say?\nI don\'t want to be a burden on you.\nIt\'s hard to keep a good thing going.\nYou can\'t tell me what I want, I have a life too!'
```

Pour diffuser les jetons, utilisez la méthode `.stream(...)` :

```python
query = "Tell me a joke"

for chunks in llm.stream(query):
    print(chunks, end="")

print()
```

```output
.
- She said, "I’m tired of my life. What should I do?"
- The man replied, "I hear you. But don’t worry. Life is just like a joke. It has its funny parts too."
- The woman looked at him, amazed and happy to hear his wise words. - "Thank you for your wisdom," she said, smiling. - He replied, "Any time. But it doesn't come easy. You have to laugh and keep moving forward in life."
- She nodded, thanking him again. - The man smiled wryly. "Life can be tough. Sometimes it seems like you’re never going to get out of your situation."
- He said, "I know that. But the key is not giving up. Life has many ups and downs, but in the end, it will turn out okay."
- The woman's eyes softened. "Thank you for your advice. It's so important to keep moving forward in life," she said. - He nodded once again. "You’re welcome. I hope your journey is filled with laughter and joy."
- They both smiled and left the bar, ready to embark on their respective adventures.
```

Pour en savoir plus sur le langage d'expression LangChain et les méthodes disponibles sur un LLM, consultez l'[interface LCEL](/docs/expression_language/interface)
