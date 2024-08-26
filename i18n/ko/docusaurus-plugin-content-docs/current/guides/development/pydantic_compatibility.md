---
translated: true
---

# Pydantic 호환성

- Pydantic v2는 2023년 6월에 출시되었습니다 (https://docs.pydantic.dev/2.0/blog/pydantic-v2-final/)
- v2에는 여러 가지 중대한 변경 사항이 포함되어 있습니다 (https://docs.pydantic.dev/2.0/migration/)
- Pydantic v2와 v1은 동일한 패키지 이름을 사용하므로 두 버전을 동시에 설치할 수 없습니다.

## LangChain Pydantic 마이그레이션 계획

`langchain>=0.0.267`부터 LangChain은 사용자가 Pydantic V1 또는 V2를 설치할 수 있도록 허용합니다.

- LangChain은 내부적으로 [V1을 계속 사용](https://docs.pydantic.dev/latest/migration/#continue-using-pydantic-v1-features)할 것입니다.
- 이 기간 동안 사용자는 pydantic 버전을 v1으로 고정하여 중대한 변경을 피하거나, 코드를 전체적으로 pydantic v2로 부분 마이그레이션할 수 있지만, LangChain용 v1과 v2 코드를 혼합하지 않아야 합니다(아래 참조).

사용자는 pydantic을 v1으로 고정하고, LangChain이 내부적으로 v2로 마이그레이션될 때 한 번에 코드를 업그레이드할 수 있습니다. 또는 pydantic v2로 부분 마이그레이션을 시작할 수 있지만, LangChain용 v1과 v2 코드를 혼합하지 않아야 합니다.

다음은 상속의 경우와 LangChain에 객체를 전달하는 경우 pydantic v1과 v2 코드를 혼합하지 않는 방법을 보여주는 두 가지 예입니다.

**예제 1: 상속을 통한 확장**

**예**

```python
from pydantic.v1 import root_validator, validator

class CustomTool(BaseTool): # BaseTool은 v1 코드입니다.
    x: int = Field(default=1)

    def _run(*args, **kwargs):
        return "hello"

    @validator('x') # v1 코드
    @classmethod
    def validate_x(cls, x: int) -> int:
        return 1


CustomTool(
    name='custom_tool',
    description="hello",
    x=1,
)
```

Pydantic v2 프리미티브와 Pydantic v1 프리미티브를 혼합하면 암호화된 오류가 발생할 수 있습니다.

**아니요**

```python
from pydantic import Field, field_validator # pydantic v2

class CustomTool(BaseTool): # BaseTool은 v1 코드입니다.
    x: int = Field(default=1)

    def _run(*args, **kwargs):
        return "hello"

    @field_validator('x') # v2 코드
    @classmethod
    def validate_x(cls, x: int) -> int:
        return 1


CustomTool(
    name='custom_tool',
    description="hello",
    x=1,
)
```

**예제 2: 객체를 LangChain에 전달**

**예**

```python
<!--IMPORTS:[{"imported": "Tool", "source": "langchain_core.tools", "docs": "https://api.python.langchain.com/en/latest/tools/langchain_core.tools.Tool.html", "title": "Pydantic compatibility"}]-->
from langchain_core.tools import Tool
from pydantic.v1 import BaseModel, Field # <-- v1 네임스페이스 사용

class CalculatorInput(BaseModel):
    question: str = Field()

Tool.from_function( # <-- tool은 v1 네임스페이스 사용
    func=lambda question: 'hello',
    name="Calculator",
    description="수학 질문에 답할 때 유용함",
    args_schema=CalculatorInput
)
```

**아니요**

```python
<!--IMPORTS:[{"imported": "Tool", "source": "langchain_core.tools", "docs": "https://api.python.langchain.com/en/latest/tools/langchain_core.tools.Tool.html", "title": "Pydantic compatibility"}]-->
from langchain_core.tools import Tool
from pydantic import BaseModel, Field # <-- v2 네임스페이스 사용

class CalculatorInput(BaseModel):
    question: str = Field()

Tool.from_function( # <-- tool은 v1 네임스페이스 사용
    func=lambda question: 'hello',
    name="Calculator",
    description="수학 질문에 답할 때 유용함",
    args_schema=CalculatorInput
)
```