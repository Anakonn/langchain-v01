---
translated: true
---

# python-lint

Cet agent se spécialise dans la génération de code Python de haute qualité, en mettant l'accent sur le formatage et le linting appropriés. Il utilise `black`, `ruff` et `mypy` pour s'assurer que le code répond aux contrôles de qualité standard.

Cela simplifie le processus de codage en intégrant et en répondant à ces contrôles, ce qui se traduit par une sortie de code fiable et cohérente.

Il ne peut pas exécuter le code qu'il écrit, car l'exécution du code peut introduire des dépendances supplémentaires et des vulnérabilités de sécurité potentielles.
Cela fait de l'agent à la fois une solution sécurisée et efficace pour les tâches de génération de code.

Vous pouvez l'utiliser pour générer du code Python directement, ou le mettre en réseau avec des agents de planification et d'exécution.

## Configuration de l'environnement

- Installer `black`, `ruff` et `mypy` : `pip install -U black ruff mypy`
- Définir la variable d'environnement `OPENAI_API_KEY`.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package python-lint
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add python-lint
```

Et ajouter le code suivant à votre fichier `server.py` :

```python
from python_lint import agent_executor as python_lint_agent

add_routes(app, python_lint_agent, path="/python-lint")
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
Nous pouvons accéder au playground sur [http://127.0.0.1:8000/python-lint/playground](http://127.0.0.1:8000/python-lint/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/python-lint")
```
