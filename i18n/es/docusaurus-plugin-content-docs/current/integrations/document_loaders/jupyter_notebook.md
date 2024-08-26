---
translated: true
---

# Cuaderno de Jupyter

>[Cuaderno de Jupyter](https://en.wikipedia.org/wiki/Project_Jupyter#Applications) (anteriormente `IPython Notebook`) es un entorno computacional interactivo basado en web para crear documentos de cuaderno.

Este cuaderno cubre cómo cargar datos desde un `cuaderno de Jupyter (.html)` en un formato adecuado para LangChain.

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

`NotebookLoader.load()` carga el archivo de cuaderno `.html` en un objeto `Document`.

**Parámetros**:

* `include_outputs` (bool): si se deben incluir los resultados de las celdas en el documento resultante (el valor predeterminado es False).
* `max_output_length` (int): el número máximo de caracteres a incluir de cada resultado de celda (el valor predeterminado es 10).
* `remove_newline` (bool): si se deben eliminar los caracteres de nueva línea de las fuentes y resultados de las celdas (el valor predeterminado es False).
* `traceback` (bool): si se debe incluir el seguimiento completo (el valor predeterminado es False).

```python
loader.load()
```

```output
[Document(page_content='\'markdown\' cell: \'[\'# Notebook\', \'\', \'This notebook covers how to load data from an .html notebook into a format suitable by LangChain.\']\'\n\n \'code\' cell: \'[\'from langchain_community.document_loaders import NotebookLoader\']\'\n\n \'code\' cell: \'[\'loader = NotebookLoader("example_data/notebook.html")\']\'\n\n \'markdown\' cell: \'[\'`NotebookLoader.load()` loads the `.html` notebook file into a `Document` object.\', \'\', \'**Parameters**:\', \'\', \'* `include_outputs` (bool): whether to include cell outputs in the resulting document (default is False).\', \'* `max_output_length` (int): the maximum number of characters to include from each cell output (default is 10).\', \'* `remove_newline` (bool): whether to remove newline characters from the cell sources and outputs (default is False).\', \'* `traceback` (bool): whether to include full traceback (default is False).\']\'\n\n \'code\' cell: \'[\'loader.load(include_outputs=True, max_output_length=20, remove_newline=True)\']\'\n\n', metadata={'source': 'example_data/notebook.html'})]
```
