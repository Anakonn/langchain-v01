---
translated: true
---

# Python REPL

Parfois, pour des calculs complexes, plutôt que de demander à un LLM de générer la réponse directement, il peut être préférable de lui demander de générer du code pour calculer la réponse, puis d'exécuter ce code pour obtenir la réponse. Afin de le faire facilement, nous fournissons un simple Python REPL pour exécuter des commandes.

Cette interface ne renverra que les éléments imprimés - par conséquent, si vous voulez l'utiliser pour calculer une réponse, assurez-vous de la faire imprimer.

```python
from langchain.agents import Tool
from langchain_experimental.utilities import PythonREPL
```

```python
python_repl = PythonREPL()
```

```python
python_repl.run("print(1+1)")
```

```output
Python REPL can execute arbitrary code. Use with caution.
```

```output
'2\n'
```

```python
# You can create the tool to pass to an agent
repl_tool = Tool(
    name="python_repl",
    description="A Python shell. Use this to execute python commands. Input should be a valid python command. If you want to see the output of a value, you should print it out with `print(...)`.",
    func=python_repl.run,
)
```
