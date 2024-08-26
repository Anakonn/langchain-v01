---
translated: true
---

# फायरवर्क्स

यह पृष्ठ बताता है कि लैंगचेन में [फायरवर्क्स](https://fireworks.ai/) मॉडल का उपयोग कैसे किया जाता है।

## स्थापना और सेटअप

- फायरवर्क्स एकीकरण पैकेज स्थापित करें।

  ```
  pip install langchain-fireworks
  ```

- [fireworks.ai](https://fireworks.ai) पर साइन अप करके एक फायरवर्क्स API कुंजी प्राप्त करें।
- FIREWORKS_API_KEY पर्यावरण चर को सेट करके प्रमाणीकरण करें।

## प्रमाणीकरण

फायरवर्क्स API कुंजी का उपयोग करके प्रमाणीकरण करने के दो तरीके हैं:

1.  `FIREWORKS_API_KEY` पर्यावरण चर को सेट करना।

    ```python
    os.environ["FIREWORKS_API_KEY"] = "<कुंजी>"
    ```

2.  फायरवर्क्स LLM मॉड्यूल में `api_key` फ़ील्ड को सेट करना।

    ```python
    llm = Fireworks(api_key="<कुंजी>")
    ```

## फायरवर्क्स LLM मॉड्यूल का उपयोग करना

फायरवर्क्स लैंगचेन के साथ LLM मॉड्यूल के माध्यम से एकीकृत है। इस उदाहरण में, हम mixtral-8x7b-instruct मॉडल के साथ काम करेंगे।

```python
<!--IMPORTS:[{"imported": "Fireworks", "source": "langchain_fireworks", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_fireworks.llms.Fireworks.html", "title": "Fireworks"}]-->
from langchain_fireworks import Fireworks

llm = Fireworks(
    api_key="<KEY>",
    model="accounts/fireworks/models/mixtral-8x7b-instruct",
    max_tokens=256)
llm("Name 3 sports.")
```

अधिक विस्तृत वॉकथ्रू के लिए, [यहां](/docs/integrations/llms/Fireworks) देखें।
