---
translated: true
---

# guardrails-output-parser

Ce modèle utilise [guardrails-ai](https://github.com/guardrails-ai/guardrails) pour valider la sortie du LLM.

Le `GuardrailsOutputParser` est défini dans `chain.py`.

L'exemple par défaut protège contre les gros mots.

## Configuration de l'environnement

Définissez la variable d'environnement `OPENAI_API_KEY` pour accéder aux modèles OpenAI.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package guardrails-output-parser
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add guardrails-output-parser
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from guardrails_output_parser.chain import chain as guardrails_output_parser_chain

add_routes(app, guardrails_output_parser_chain, path="/guardrails-output-parser")
```

(Facultatif) Configurons maintenant LangSmith.
LangSmith nous aidera à tracer, surveiller et déboguer les applications LangChain.
Vous pouvez vous inscrire à LangSmith [ici](https://smith.langchain.com/).
Si vous n'avez pas accès, vous pouvez sauter cette section.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si vous êtes dans ce répertoire, vous pouvez alors lancer une instance LangServe directement en :

```shell
langchain serve
```

Cela démarrera l'application FastAPI avec un serveur en cours d'exécution localement sur
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles sur [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground sur [http://127.0.0.1:8000/guardrails-output-parser/playground](http://127.0.0.1:8000/guardrails-output-parser/playground)

Nous pouvons accéder au modèle depuis le code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/guardrails-output-parser")
```

Si Guardrails ne trouve pas de gros mots, la sortie traduite est renvoyée telle quelle. Si Guardrails trouve des gros mots, une chaîne vide est renvoyée.
