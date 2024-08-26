---
translated: true
---

# Jupyter Notebook

>[Jupyter Notebook](https://en.wikipedia.org/wiki/Project_Jupyter#Applications) (anciennement `IPython Notebook`) est un environnement de calcul interactif basé sur le web pour créer des documents de type notebook.

Ce notebook couvre comment charger des données à partir d'un `notebook Jupyter (.html)` dans un format adapté à LangChain.

```python
from langchain_community.document_loaders import NotebookLoader
```

```python
loader = NotebookLoader(
    "example_data/notebook.html",
    include_outputs=True,
    max_output_length=20,
    remove_newline=True,
)
```

`NotebookLoader.load()` charge le fichier notebook `.html` dans un objet `Document`.

**Paramètres** :

* `include_outputs` (bool) : indique s'il faut inclure les sorties des cellules dans le document résultant (la valeur par défaut est False).
* `max_output_length` (int) : le nombre maximum de caractères à inclure dans chaque sortie de cellule (la valeur par défaut est 10).
* `remove_newline` (bool) : indique s'il faut supprimer les caractères de saut de ligne des sources et sorties des cellules (la valeur par défaut est False).
* `traceback` (bool) : indique s'il faut inclure la trace complète (la valeur par défaut est False).

```python
loader.load()
```

```output
[Document(page_content='\'markdown\' cell: \'[\'# Notebook\', \'\', \'This notebook covers how to load data from an .html notebook into a format suitable by LangChain.\']\'\n\n \'code\' cell: \'[\'from langchain_community.document_loaders import NotebookLoader\']\'\n\n \'code\' cell: \'[\'loader = NotebookLoader("example_data/notebook.html")\']\'\n\n \'markdown\' cell: \'[\'`NotebookLoader.load()` loads the `.html` notebook file into a `Document` object.\', \'\', \'**Parameters**:\', \'\', \'* `include_outputs` (bool): whether to include cell outputs in the resulting document (default is False).\', \'* `max_output_length` (int): the maximum number of characters to include from each cell output (default is 10).\', \'* `remove_newline` (bool): whether to remove newline characters from the cell sources and outputs (default is False).\', \'* `traceback` (bool): whether to include full traceback (default is False).\']\'\n\n \'code\' cell: \'[\'loader.load(include_outputs=True, max_output_length=20, remove_newline=True)\']\'\n\n', metadata={'source': 'example_data/notebook.html'})]
```
