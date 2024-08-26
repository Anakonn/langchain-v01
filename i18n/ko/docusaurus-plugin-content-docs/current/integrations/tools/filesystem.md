---
translated: true
---

# 파일 시스템

LangChain은 기본적으로 로컬 파일 시스템과 상호 작용할 수 있는 도구를 제공합니다. 이 노트북에서는 이러한 도구들을 살펴봅니다.

**주의:** 이러한 도구들은 샌드박스 환경 외부에서 사용하는 것은 권장되지 않습니다!

먼저 도구들을 가져옵니다.

```python
from tempfile import TemporaryDirectory

from langchain_community.agent_toolkits import FileManagementToolkit

# We'll make a temporary directory to avoid clutter
working_directory = TemporaryDirectory()
```

## FileManagementToolkit

에이전트에게 모든 파일 도구를 제공하려면 툴킷을 사용하면 쉽습니다. LLM의 작업 공간으로 임시 디렉토리를 루트 디렉토리로 전달할 것입니다.

루트 디렉토리를 항상 전달하는 것이 좋습니다. 그렇지 않으면 LLM이 작업 디렉토리를 오염시킬 수 있고, 루트 디렉토리가 없으면 간단한 프롬프트 삽입에 대한 검증이 없습니다.

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

### 파일 시스템 도구 선택

특정 도구만 선택하려면 툴킷을 초기화할 때 인수로 전달하거나 개별적으로 원하는 도구를 초기화할 수 있습니다.

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
