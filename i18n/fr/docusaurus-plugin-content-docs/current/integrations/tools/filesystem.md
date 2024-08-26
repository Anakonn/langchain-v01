---
translated: true
---

# Système de fichiers

LangChain fournit des outils pour interagir avec un système de fichiers local. Ce notebook en présente quelques-uns.

**Remarque :** ces outils ne sont pas recommandés pour une utilisation en dehors d'un environnement isolé !

Tout d'abord, nous allons importer les outils.

```python
from tempfile import TemporaryDirectory

from langchain_community.agent_toolkits import FileManagementToolkit

# We'll make a temporary directory to avoid clutter
working_directory = TemporaryDirectory()
```

## La boîte à outils de gestion des fichiers

Si vous voulez fournir tous les outils de gestion des fichiers à votre agent, il est facile de le faire avec la boîte à outils. Nous allons passer le répertoire temporaire en tant que répertoire racine comme espace de travail pour le LLM.

Il est recommandé de toujours passer un répertoire racine, car sans cela, il est facile pour le LLM de polluer le répertoire de travail, et sans cela, il n'y a pas de validation contre l'injection de requête simple.

```python
toolkit = FileManagementToolkit(
    root_dir=str(working_directory.name)
)  # If you don't provide a root_dir, operations will default to the current working directory
toolkit.get_tools()
```

```output
[CopyFileTool(root_dir='/tmp/tmprdvsw3tg'),
 DeleteFileTool(root_dir='/tmp/tmprdvsw3tg'),
 FileSearchTool(root_dir='/tmp/tmprdvsw3tg'),
 MoveFileTool(root_dir='/tmp/tmprdvsw3tg'),
 ReadFileTool(root_dir='/tmp/tmprdvsw3tg'),
 WriteFileTool(root_dir='/tmp/tmprdvsw3tg'),
 ListDirectoryTool(root_dir='/tmp/tmprdvsw3tg')]
```

### Sélection des outils du système de fichiers

Si vous ne voulez sélectionner que certains outils, vous pouvez les passer en arguments lors de l'initialisation de la boîte à outils, ou vous pouvez initialiser individuellement les outils souhaités.

```python
tools = FileManagementToolkit(
    root_dir=str(working_directory.name),
    selected_tools=["read_file", "write_file", "list_directory"],
).get_tools()
tools
```

```output
[ReadFileTool(root_dir='/tmp/tmprdvsw3tg'),
 WriteFileTool(root_dir='/tmp/tmprdvsw3tg'),
 ListDirectoryTool(root_dir='/tmp/tmprdvsw3tg')]
```

```python
read_tool, write_tool, list_tool = tools
write_tool.invoke({"file_path": "example.txt", "text": "Hello World!"})
```

```output
'File written successfully to example.txt.'
```

```python
# List files in the working directory
list_tool.invoke({})
```

```output
'example.txt'
```
