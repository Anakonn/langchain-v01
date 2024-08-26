---
translated: true
---

# Sistema de archivos

LangChain proporciona herramientas para interactuar con un sistema de archivos local de forma predeterminada. Este cuaderno recorre algunas de ellas.

**Nota:** ¡estas herramientas no se recomiendan para su uso fuera de un entorno de sandbox!

Primero, importaremos las herramientas.

```python
from tempfile import TemporaryDirectory

from langchain_community.agent_toolkits import FileManagementToolkit

# We'll make a temporary directory to avoid clutter
working_directory = TemporaryDirectory()
```

## El FileManagementToolkit

Si desea proporcionar todas las herramientas de archivo a su agente, es fácil hacerlo con el toolkit. Pasaremos el directorio temporal como un directorio raíz como un espacio de trabajo para el LLM.

Se recomienda siempre pasar un directorio raíz, ya que sin uno, es fácil que el LLM contamine el directorio de trabajo, y sin uno, no hay ninguna validación contra la inyección de solicitudes sencillas.

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

### Selección de herramientas del sistema de archivos

Si solo desea seleccionar ciertas herramientas, puede pasarlas como argumentos al inicializar el toolkit, o puede inicializar individualmente las herramientas deseadas.

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
