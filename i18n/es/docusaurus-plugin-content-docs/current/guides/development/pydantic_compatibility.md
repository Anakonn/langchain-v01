---
translated: true
---

# Compatibilidad con Pydantic

- Pydantic v2 se lanzó en junio de 2023 (https://docs.pydantic.dev/2.0/blog/pydantic-v2-final/)
- v2 contiene una serie de cambios importantes (https://docs.pydantic.dev/2.0/migration/)
- Pydantic v2 y v1 están bajo el mismo nombre de paquete, por lo que ambas versiones no se pueden instalar al mismo tiempo

## Plan de migración de Pydantic de LangChain

A partir de `langchain>=0.0.267`, LangChain permitirá a los usuarios instalar Pydantic V1 o V2.
   * Internamente, LangChain continuará [usando V1](https://docs.pydantic.dev/latest/migration/#continue-using-pydantic-v1-features).
   * Durante este tiempo, los usuarios pueden fijar su versión de pydantic a v1 para evitar cambios importantes, o comenzar una migración parcial usando pydantic v2 en todo su código, pero evitando mezclar código v1 y v2 para LangChain (ver a continuación).

Los usuarios pueden fijar la versión de pydantic a v1 y actualizar su código de una sola vez una vez que LangChain haya migrado internamente a v2, o pueden comenzar una migración parcial a v2, pero deben evitar mezclar código v1 y v2 para LangChain.

A continuación se muestran dos ejemplos que muestran cómo evitar mezclar código de pydantic v1 y v2 en el caso de la herencia y en el caso de pasar objetos a LangChain.

**Ejemplo 1: Extender a través de la herencia**

**SÍ**

```python
from pydantic.v1 import root_validator, validator

class CustomTool(BaseTool): # BaseTool is v1 code
    x: int = Field(default=1)

    def _run(*args, **kwargs):
        return "hello"

    @validator('x') # v1 code
    @classmethod
    def validate_x(cls, x: int) -> int:
        return 1


CustomTool(
    name='custom_tool',
    description="hello",
    x=1,
)
```

Mezclar primitivos de Pydantic v2 con primitivos de Pydantic v1 puede generar errores crípticos

**NO**

```python
from pydantic import Field, field_validator # pydantic v2

class CustomTool(BaseTool): # BaseTool is v1 code
    x: int = Field(default=1)

    def _run(*args, **kwargs):
        return "hello"

    @field_validator('x') # v2 code
    @classmethod
    def validate_x(cls, x: int) -> int:
        return 1


CustomTool(
    name='custom_tool',
    description="hello",
    x=1,
)
```

**Ejemplo 2: Pasar objetos a LangChain**

**SÍ**

```python
<!--IMPORTS:[{"imported": "Tool", "source": "langchain_core.tools", "docs": "https://api.python.langchain.com/en/latest/tools/langchain_core.tools.Tool.html", "title": "Pydantic compatibility"}]-->
from langchain_core.tools import Tool
from pydantic.v1 import BaseModel, Field # <-- Uses v1 namespace

class CalculatorInput(BaseModel):
    question: str = Field()

Tool.from_function( # <-- tool uses v1 namespace
    func=lambda question: 'hello',
    name="Calculator",
    description="useful for when you need to answer questions about math",
    args_schema=CalculatorInput
)
```

**NO**

```python
<!--IMPORTS:[{"imported": "Tool", "source": "langchain_core.tools", "docs": "https://api.python.langchain.com/en/latest/tools/langchain_core.tools.Tool.html", "title": "Pydantic compatibility"}]-->
from langchain_core.tools import Tool
from pydantic import BaseModel, Field # <-- Uses v2 namespace

class CalculatorInput(BaseModel):
    question: str = Field()

Tool.from_function( # <-- tool uses v1 namespace
    func=lambda question: 'hello',
    name="Calculator",
    description="useful for when you need to answer questions about math",
    args_schema=CalculatorInput
)
```
