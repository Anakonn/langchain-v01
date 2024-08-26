---
translated: true
---

# Pydantic संगतता

- Pydantic v2 जून, 2023 में जारी किया गया था (https://docs.pydantic.dev/2.0/blog/pydantic-v2-final/)
- v2 में कई महत्वपूर्ण बदलाव हैं (https://docs.pydantic.dev/2.0/migration/)
- Pydantic v2 और v1 एक ही पैकेज नाम के तहत हैं, इसलिए दोनों संस्करणों को एक साथ इंस्टॉल नहीं किया जा सकता

## LangChain Pydantic माइग्रेशन योजना

`langchain>=0.0.267` के अनुसार, LangChain उपयोगकर्ताओं को Pydantic V1 या V2 में से किसी एक को इंस्टॉल करने की अनुमति देगा।
   * आंतरिक रूप से LangChain [V1 का उपयोग करेगा](https://docs.pydantic.dev/latest/migration/#continue-using-pydantic-v1-features)।
   * इस समय के दौरान, उपयोगकर्ता अपने pydantic संस्करण को v1 पर पिन कर सकते हैं ताकि महत्वपूर्ण बदलावों से बचा जा सके, या अपने कोड में pydantic v2 का आंशिक माइग्रेशन शुरू कर सकते हैं, लेकिन LangChain के लिए v1 और v2 कोड को मिलाने से बचें (नीचे देखें)।

उपयोगकर्ता या तो pydantic v1 पर पिन कर सकते हैं, और एक बार जब LangChain आंतरिक रूप से v2 में माइग्रेट हो जाए, तो अपने कोड को एक बार में अपग्रेड कर सकते हैं, या वे v2 में आंशिक माइग्रेशन शुरू कर सकते हैं, लेकिन LangChain के लिए v1 और v2 कोड को मिलाने से बचना चाहिए।

नीचे दो उदाहरण दिए गए हैं जो यह दिखाते हैं कि विरासत के मामले में और LangChain को ऑब्जेक्ट्स पास करने के मामले में pydantic v1 और v2 कोड को मिलाने से कैसे बचा जाए।

**उदाहरण 1: विरासत के माध्यम से विस्तार**

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

Pydantic v2 प्राइमिटिव्स को Pydantic v1 प्राइमिटिव्स के साथ मिलाने से अस्पष्ट त्रुटियां उत्पन्न हो सकती हैं

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

**उदाहरण 2: LangChain को ऑब्जेक्ट्स पास करना**

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
