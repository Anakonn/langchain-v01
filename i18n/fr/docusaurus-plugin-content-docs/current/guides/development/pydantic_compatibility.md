---
translated: true
---

# Compatibilité Pydantic

- Pydantic v2 a été publié en juin 2023 (https://docs.pydantic.dev/2.0/blog/pydantic-v2-final/)
- v2 contient un certain nombre de changements cassants (https://docs.pydantic.dev/2.0/migration/)
- Pydantic v2 et v1 sont sous le même nom de package, donc les deux versions ne peuvent pas être installées en même temps

## Plan de migration Pydantic de LangChain

À partir de `langchain>=0.0.267`, LangChain permettra aux utilisateurs d'installer soit Pydantic V1 soit V2.
   * En interne, LangChain continuera à [utiliser V1](https://docs.pydantic.dev/latest/migration/#continue-using-pydantic-v1-features).
   * Pendant ce temps, les utilisateurs peuvent fixer leur version pydantic à v1 pour éviter les changements cassants, ou commencer une migration partielle en utilisant pydantic v2 dans l'ensemble de leur code, mais en évitant de mélanger le code v1 et v2 pour LangChain (voir ci-dessous).

Les utilisateurs peuvent soit fixer la version à pydantic v1 et mettre à jour leur code en une seule fois une fois que LangChain aura migré vers v2 en interne, soit ils peuvent commencer une migration partielle vers v2, mais doivent éviter de mélanger le code v1 et v2 pour LangChain.

Voici deux exemples montrant comment éviter de mélanger le code pydantic v1 et v2 dans le cas de l'héritage et dans le cas du passage d'objets à LangChain.

**Exemple 1 : Extension via héritage**

**OUI**

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

Le mélange des primitives Pydantic v2 avec les primitives Pydantic v1 peut soulever des erreurs cryptiques

**NON**

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

**Exemple 2 : Passage d'objets à LangChain**

**OUI**

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

**NON**

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
