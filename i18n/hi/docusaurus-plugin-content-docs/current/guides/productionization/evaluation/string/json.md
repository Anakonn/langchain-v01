---
translated: true
---

# JSON मूल्यांकनकर्ता

[निकालना](/docs/use_cases/extraction) और फ़ंक्शन कॉलिंग एप्लिकेशन का मूल्यांकन अक्सर मॉडल के स्ट्रिंग आउटपुट को सही ढंग से पार्स करने और इसे संदर्भ ऑब्जेक्ट से कैसे तुलना करना है, इस पर आता है। निम्नलिखित `JSON` मूल्यांकनकर्ता आपके मॉडल के आउटपुट को एक सुसंगत तरीके से जांचने की क्षमता प्रदान करते हैं।

## JsonValidityEvaluator

`JsonValidityEvaluator` `JSON` स्ट्रिंग पूर्वानुमान की वैधता जांचने के लिए डिज़ाइन किया गया है।

### अवलोकन:

- **इनपुट की आवश्यकता?**: नहीं
- **संदर्भ की आवश्यकता?**: नहीं

```python
from langchain.evaluation import JsonValidityEvaluator

evaluator = JsonValidityEvaluator()
# Equivalently
# evaluator = load_evaluator("json_validity")
prediction = '{"name": "John", "age": 30, "city": "New York"}'

result = evaluator.evaluate_strings(prediction=prediction)
print(result)
```

```output
{'score': 1}
```

```python
prediction = '{"name": "John", "age": 30, "city": "New York",}'
result = evaluator.evaluate_strings(prediction=prediction)
print(result)
```

```output
{'score': 0, 'reasoning': 'Expecting property name enclosed in double quotes: line 1 column 48 (char 47)'}
```

## JsonEqualityEvaluator

`JsonEqualityEvaluator` यह आकलन करता है कि क्या JSON पूर्वानुमान एक दिए गए संदर्भ से मेल खाता है, जब दोनों को पार्स किया जाता है।

### अवलोकन:

- **इनपुट की आवश्यकता?**: नहीं
- **संदर्भ की आवश्यकता?**: हाँ

```python
from langchain.evaluation import JsonEqualityEvaluator

evaluator = JsonEqualityEvaluator()
# Equivalently
# evaluator = load_evaluator("json_equality")
result = evaluator.evaluate_strings(prediction='{"a": 1}', reference='{"a": 1}')
print(result)
```

```output
{'score': True}
```

```python
result = evaluator.evaluate_strings(prediction='{"a": 1}', reference='{"a": 2}')
print(result)
```

```output
{'score': False}
```

मूल्यांकनकर्ता भी डिफ़ॉल्ट रूप से आपको एक डिक्शनरी प्रदान करने देता है।

```python
result = evaluator.evaluate_strings(prediction={"a": 1}, reference={"a": 2})
print(result)
```

```output
{'score': False}
```

## JsonEditDistanceEvaluator

`JsonEditDistanceEvaluator` दो "canonicalized" JSON स्ट्रिंग के बीच एक सामान्यीकृत Damerau-Levenshtein दूरी की गणना करता है।

### अवलोकन:

- **इनपुट की आवश्यकता?**: नहीं
- **संदर्भ की आवश्यकता?**: हाँ
- **दूरी फ़ंक्शन**: Damerau-Levenshtein (डिफ़ॉल्ट रूप से)

_ध्यान दें: `rapidfuzz` स्थापित होना सुनिश्चित करें या किसी वैकल्पिक `string_distance` फ़ंक्शन प्रदान करें ताकि ImportError से बचा जा सके।_

```python
from langchain.evaluation import JsonEditDistanceEvaluator

evaluator = JsonEditDistanceEvaluator()
# Equivalently
# evaluator = load_evaluator("json_edit_distance")

result = evaluator.evaluate_strings(
    prediction='{"a": 1, "b": 2}', reference='{"a": 1, "b": 3}'
)
print(result)
```

```output
{'score': 0.07692307692307693}
```

```python
# The values are canonicalized prior to comparison
result = evaluator.evaluate_strings(
    prediction="""
    {
        "b": 3,
        "a":   1
    }""",
    reference='{"a": 1, "b": 3}',
)
print(result)
```

```output
{'score': 0.0}
```

```python
# Lists maintain their order, however
result = evaluator.evaluate_strings(
    prediction='{"a": [1, 2]}', reference='{"a": [2, 1]}'
)
print(result)
```

```output
{'score': 0.18181818181818182}
```

```python
# You can also pass in objects directly
result = evaluator.evaluate_strings(prediction={"a": 1}, reference={"a": 2})
print(result)
```

```output
{'score': 0.14285714285714285}
```

## JsonSchemaEvaluator

`JsonSchemaEvaluator` एक प्रदान किए गए JSON स्कीमा के खिलाफ एक JSON पूर्वानुमान की वैधता की पुष्टि करता है। यदि पूर्वानुमान स्कीमा के अनुरूप है, तो यह True (कोई त्रुटि नहीं) का स्कोर देता है। अन्यथा, यह 0 (त्रुटि हुई) का स्कोर देता है।

### अवलोकन:

- **इनपुट की आवश्यकता?**: हाँ
- **संदर्भ की आवश्यकता?**: हाँ (एक JSON स्कीमा)
- **स्कोर**: True (कोई त्रुटि नहीं) या False (त्रुटि हुई)

```python
from langchain.evaluation import JsonSchemaEvaluator

evaluator = JsonSchemaEvaluator()
# Equivalently
# evaluator = load_evaluator("json_schema_validation")

result = evaluator.evaluate_strings(
    prediction='{"name": "John", "age": 30}',
    reference={
        "type": "object",
        "properties": {"name": {"type": "string"}, "age": {"type": "integer"}},
    },
)
print(result)
```

```output
{'score': True}
```

```python
result = evaluator.evaluate_strings(
    prediction='{"name": "John", "age": 30}',
    reference='{"type": "object", "properties": {"name": {"type": "string"}, "age": {"type": "integer"}}}',
)
print(result)
```

```output
{'score': True}
```

```python
result = evaluator.evaluate_strings(
    prediction='{"name": "John", "age": 30}',
    reference='{"type": "object", "properties": {"name": {"type": "string"},'
    '"age": {"type": "integer", "minimum": 66}}}',
)
print(result)
```

```output
{'score': False, 'reasoning': "<ValidationError: '30 is less than the minimum of 66'>"}
```
