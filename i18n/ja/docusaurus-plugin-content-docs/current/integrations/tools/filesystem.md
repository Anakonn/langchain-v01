---
translated: true
---

# ファイルシステム

LangChainは、ローカルファイルシステムとのやり取りのためのツールを提供しています。このノートブックではそれらのいくつかを説明します。

**注意:** これらのツールは、サンドボックス環境以外での使用は推奨されません!

まず、これらのツールをインポートしましょう。

```python
from tempfile import TemporaryDirectory

from langchain_community.agent_toolkits import FileManagementToolkit

# We'll make a temporary directory to avoid clutter
working_directory = TemporaryDirectory()
```

## FileManagementToolkit

エージェントにすべてのファイルツーリングを提供したい場合は、このツールキットを使うと簡単に実現できます。一時ディレクトリをルートディレクトリとして渡し、LLMの作業スペースとして使用します。

ルートディレクトリを必ず渡すことをお勧めします。ルートディレクトリがないと、LLMが作業ディレクトリを汚染してしまう可能性があり、また、簡単なプロンプトインジェクションに対する検証もできません。

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

### ファイルシステムツールの選択

特定のツールのみを使用したい場合は、ツールキットの初期化時に引数として渡すか、個別にツールを初期化することができます。

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
