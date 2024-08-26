---
translated: true
---

# पावर बीआई डेटासेट

यह नोटबुक एक एजेंट को `पावर बीआई डेटासेट` के साथ इंटरैक्ट करते हुए दिखाता है। एजेंट डेटासेट के बारे में सामान्य प्रश्नों का जवाब दे रहा है, साथ ही त्रुटियों से भी उबर रहा है।

ध्यान रखें कि, क्योंकि यह एजेंट सक्रिय रूप से विकास में है, सभी जवाब सही नहीं हो सकते हैं। यह [executequery endpoint](https://learn.microsoft.com/en-us/rest/api/power-bi/datasets/execute-queries) के खिलाफ चलता है, जो डिलीट की अनुमति नहीं देता है।

### नोट्स:

- यह azure.identity पैकेज के साथ प्रमाणीकरण पर निर्भर करता है, जिसे `pip install azure-identity` से स्थापित किया जा सकता है। वैकल्पिक रूप से, आप टोकन को स्ट्रिंग के रूप में प्रदान करके पावर बीआई डेटासेट बना सकते हैं।
- आप RLS सक्षम डेटासेट के साथ उपयोग के लिए एक उपयोगकर्ता नाम भी प्रदान कर सकते हैं।
- टूलकिट एक LLM का उपयोग करता है ताकि प्रश्न से क्वेरी बनाई जा सके, एजेंट LLM का उपयोग समग्र निष्पादन के लिए करता है।
- परीक्षण मुख्य रूप से `gpt-3.5-turbo-instruct` मॉडल के साथ किया गया था, कोडेक्स मॉडल बहुत अच्छा प्रदर्शन नहीं करते थे।

## प्रारंभीकरण

```python
from azure.identity import DefaultAzureCredential
from langchain_community.agent_toolkits import PowerBIToolkit, create_pbi_agent
from langchain_community.utilities.powerbi import PowerBIDataset
from langchain_openai import ChatOpenAI
```

```python
fast_llm = ChatOpenAI(
    temperature=0.5, max_tokens=1000, model_name="gpt-3.5-turbo", verbose=True
)
smart_llm = ChatOpenAI(temperature=0, max_tokens=100, model_name="gpt-4", verbose=True)

toolkit = PowerBIToolkit(
    powerbi=PowerBIDataset(
        dataset_id="<dataset_id>",
        table_names=["table1", "table2"],
        credential=DefaultAzureCredential(),
    ),
    llm=smart_llm,
)

agent_executor = create_pbi_agent(
    llm=fast_llm,
    toolkit=toolkit,
    verbose=True,
)
```

## उदाहरण: एक तालिका का वर्णन

```python
agent_executor.run("Describe table1")
```

## उदाहरण: एक तालिका पर सरल क्वेरी

इस उदाहरण में, एजेंट वास्तव में तालिका की पंक्ति गणना प्राप्त करने के लिए सही क्वेरी पता लगाता है।

```python
agent_executor.run("How many records are in table1?")
```

## उदाहरण: क्वेरी चलाना

```python
agent_executor.run("How many records are there by dimension1 in table2?")
```

```python
agent_executor.run("What unique values are there for dimensions2 in table2")
```

## उदाहरण: अपने स्वयं के कुछ शॉट प्रोम्प्ट जोड़ें

```python
# fictional example
few_shots = """
Question: How many rows are in the table revenue?
DAX: EVALUATE ROW("Number of rows", COUNTROWS(revenue_details))
----
Question: How many rows are in the table revenue where year is not empty?
DAX: EVALUATE ROW("Number of rows", COUNTROWS(FILTER(revenue_details, revenue_details[year] <> "")))
----
Question: What was the average of value in revenue in dollars?
DAX: EVALUATE ROW("Average", AVERAGE(revenue_details[dollar_value]))
----
"""
toolkit = PowerBIToolkit(
    powerbi=PowerBIDataset(
        dataset_id="<dataset_id>",
        table_names=["table1", "table2"],
        credential=DefaultAzureCredential(),
    ),
    llm=smart_llm,
    examples=few_shots,
)
agent_executor = create_pbi_agent(
    llm=fast_llm,
    toolkit=toolkit,
    verbose=True,
)
```

```python
agent_executor.run("What was the maximum of value in revenue in dollars in 2022?")
```
