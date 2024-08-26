---
translated: true
---

# Pydantic互換性

- Pydantic v2は2023年6月にリリースされました (https://docs.pydantic.dev/2.0/blog/pydantic-v2-final/)
- v2にはいくつかの重大な変更が含まれています (https://docs.pydantic.dev/2.0/migration/)
- Pydantic v2とv1は同じパッケージ名の下にあるため、両方のバージョンを同時にインストールすることはできません

## LangChain Pydantic移行計画

`langchain>=0.0.267`以降、LangChainはユーザーがPydantic V1またはV2をインストールできるようになります。
   * 内部的にLangChainはV1を継続して[使用します](https://docs.pydantic.dev/latest/migration/#continue-using-pydantic-v1-features)。
   * この期間中、ユーザーはpydantic v1にバージョンを固定して変更を回避するか、コード全体でpydantic v2への部分的な移行を開始できますが、LangChainのコードではv1とv2を混在させることはできません(以下参照)。

ユーザーはpydantic v1にバージョンを固定し、LangChainがv2に完全に移行した後に一括でコードをアップグレードするか、部分的な移行をv2に開始できますが、LangChainのコードではv1とv2を混在させることはできません。

以下は、継承の場合とLangChainにオブジェクトを渡す場合の、pydantic v1とv2のコードを混在させないための2つの例です。

**例1: 継承を使って拡張する**

**YES**

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

Pydantic v2プリミティブとPydantic v1プリミティブを混在させると、わかりにくいエラーが発生する可能性があります

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

**例2: LangChainにオブジェクトを渡す**

**YES**

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
