---
translated: true
---

# Jupyter Notebook

>[Jupyter Notebook](https://en.wikipedia.org/wiki/Project_Jupyter#Applications) (旧称 `IPython Notebook`) は、ノートブック文書を作成するための Web ベースのインタラクティブな計算環境です。

このノートブックでは、`Jupyter notebook (.html)` からデータを読み込み、LangChain で使用できる形式に変換する方法について説明します。

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

`NotebookLoader.load()` は、`.html` ノートブックファイルを `Document` オブジェクトにロードします。

**パラメーター**:

* `include_outputs` (bool): セル出力を結果のドキュメントに含めるかどうか (デフォルトは False)。
* `max_output_length` (int): 各セル出力から含める最大文字数 (デフォルトは 10)。
* `remove_newline` (bool): セルのソースと出力から改行文字を削除するかどうか (デフォルトは False)。
* `traceback` (bool): フルトレースバックを含めるかどうか (デフォルトは False)。

```python
loader.load()
```

```output
[Document(page_content='\'markdown\' cell: \'[\'# Notebook\', \'\', \'This notebook covers how to load data from an .html notebook into a format suitable by LangChain.\']\'\n\n \'code\' cell: \'[\'from langchain_community.document_loaders import NotebookLoader\']\'\n\n \'code\' cell: \'[\'loader = NotebookLoader("example_data/notebook.html")\']\'\n\n \'markdown\' cell: \'[\'`NotebookLoader.load()` loads the `.html` notebook file into a `Document` object.\', \'\', \'**Parameters**:\', \'\', \'* `include_outputs` (bool): whether to include cell outputs in the resulting document (default is False).\', \'* `max_output_length` (int): the maximum number of characters to include from each cell output (default is 10).\', \'* `remove_newline` (bool): whether to remove newline characters from the cell sources and outputs (default is False).\', \'* `traceback` (bool): whether to include full traceback (default is False).\']\'\n\n \'code\' cell: \'[\'loader.load(include_outputs=True, max_output_length=20, remove_newline=True)\']\'\n\n', metadata={'source': 'example_data/notebook.html'})]
```
