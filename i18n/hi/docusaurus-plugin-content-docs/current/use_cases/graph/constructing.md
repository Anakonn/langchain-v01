---
sidebar_position: 4
translated: true
---

# ज्ञान ग्राफ़ का निर्माण करना

इस गाइड में हम अstruktured पाठ से ज्ञान ग्राफ़ बनाने के मूलभूत तरीकों पर चर्चा करेंगे। निर्मित ग्राफ़ को फिर RAG अनुप्रयोग में ज्ञान आधार के रूप में उपयोग किया जा सकता है।

## ⚠️ सुरक्षा नोट ⚠️

ज्ञान ग्राफ़ का निर्माण करने के लिए डेटाबेस में लेखन पहुंच की आवश्यकता होती है। इसमें अंतर्निहित जोखिम हैं। आयात करने से पहले डेटा की पुष्टि और मान्यता सुनिश्चित करें। सामान्य सुरक्षा सर्वोत्तम प्रथाओं के बारे में अधिक जानकारी के लिए, [यहां देखें](/docs/security)।

## वास्तुकला

उच्च स्तर पर, पाठ से ज्ञान ग्राफ़ बनाने के चरण हैं:

1. **पाठ से संरचित जानकारी निकालना**: मॉडल का उपयोग पाठ से संरचित ग्राफ़ जानकारी निकालने के लिए किया जाता है।
2. **ग्राफ़ डेटाबेस में संग्रहण**: निकाली गई संरचित ग्राफ़ जानकारी को ग्राफ़ डेटाबेस में संग्रहीत करने से डाउनस्ट्रीम RAG अनुप्रयोग सक्षम होते हैं।

## सेटअप

पहले, आवश्यक पैकेज प्राप्त करें और वातावरण चर सेट करें।
इस उदाहरण में, हम Neo4j ग्राफ़ डेटाबेस का उपयोग करेंगे।

```python
%pip install --upgrade --quiet  langchain langchain-community langchain-openai langchain-experimental neo4j
```

```output
Note: you may need to restart the kernel to use updated packages.
```

हम इस गाइड में OpenAI मॉडल का डिफ़ॉल्ट उपयोग करते हैं।

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Uncomment the below to use LangSmith. Not required.
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
```

```output
 ········
```

अब, हमें Neo4j क्रेडेंशियल और कनेक्शन को परिभाषित करने की आवश्यकता है।
[ये स्थापना चरण](https://neo4j.com/docs/operations-manual/current/installation/) का पालन करें ताकि Neo4j डेटाबेस सेट अप किया जा सके।

```python
import os

from langchain_community.graphs import Neo4jGraph

os.environ["NEO4J_URI"] = "bolt://localhost:7687"
os.environ["NEO4J_USERNAME"] = "neo4j"
os.environ["NEO4J_PASSWORD"] = "password"

graph = Neo4jGraph()
```

## LLM ग्राफ़ ट्रांसफ़ॉर्मर

पाठ से ग्राफ़ डेटा निकालना अstruktured जानकारी को संरचित प्रारूपों में रूपांतरित करने में सक्षम बनाता है, जिससे जटिल संबंधों और पैटर्नों के माध्यम से गहरी अंतर्दृष्टि और अधिक कुशल नेविगेशन की सुविधा होती है। `LLMGraphTransformer` LLM का उपयोग करके पाठ दस्तावेज़ों को संरचित ग्राफ़ दस्तावेज़ों में रूपांतरित करता है, जिससे इकाइयों और उनके संबंधों को पार्स और वर्गीकृत किया जा सकता है। LLM मॉडल का चयन निकाली गई ग्राफ़ डेटा की शुद्धता और सूक्ष्मता को निर्धारित करके परिणाम को महत्वपूर्ण रूप से प्रभावित करता है।

```python
import os

from langchain_experimental.graph_transformers import LLMGraphTransformer
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(temperature=0, model_name="gpt-4-turbo")

llm_transformer = LLMGraphTransformer(llm=llm)
```

अब हम उदाहरण पाठ को पास कर सकते हैं और परिणामों का परीक्षण कर सकते हैं।

```python
from langchain_core.documents import Document

text = """
Marie Curie, born in 1867, was a Polish and naturalised-French physicist and chemist who conducted pioneering research on radioactivity.
She was the first woman to win a Nobel Prize, the first person to win a Nobel Prize twice, and the only person to win a Nobel Prize in two scientific fields.
Her husband, Pierre Curie, was a co-winner of her first Nobel Prize, making them the first-ever married couple to win the Nobel Prize and launching the Curie family legacy of five Nobel Prizes.
She was, in 1906, the first woman to become a professor at the University of Paris.
"""
documents = [Document(page_content=text)]
graph_documents = llm_transformer.convert_to_graph_documents(documents)
print(f"Nodes:{graph_documents[0].nodes}")
print(f"Relationships:{graph_documents[0].relationships}")
```

```output
Nodes:[Node(id='Marie Curie', type='Person'), Node(id='Pierre Curie', type='Person'), Node(id='University Of Paris', type='Organization')]
Relationships:[Relationship(source=Node(id='Marie Curie', type='Person'), target=Node(id='Pierre Curie', type='Person'), type='MARRIED'), Relationship(source=Node(id='Marie Curie', type='Person'), target=Node(id='University Of Paris', type='Organization'), type='PROFESSOR')]
```

जनरेट किए गए ज्ञान ग्राफ़ की संरचना को बेहतर समझने के लिए निम्न छवि का अवलोकन करें।

![graph_construction1.png](../../../../../../static/img/graph_construction1.png)

ध्यान दें कि ग्राफ़ निर्माण प्रक्रिया अनिर्धारित है क्योंकि हम LLM का उपयोग कर रहे हैं। इसलिए, आप प्रत्येक निष्पादन पर थोड़े अलग परिणाम प्राप्त कर सकते हैं।

इसके अलावा, आप अपनी आवश्यकताओं के अनुसार निष्कर्षण के लिए नोड और संबंधों के विशिष्ट प्रकारों को परिभाषित करने में लचीलेपन का आनंद ले सकते हैं।

```python
llm_transformer_filtered = LLMGraphTransformer(
    llm=llm,
    allowed_nodes=["Person", "Country", "Organization"],
    allowed_relationships=["NATIONALITY", "LOCATED_IN", "WORKED_AT", "SPOUSE"],
)
graph_documents_filtered = llm_transformer_filtered.convert_to_graph_documents(
    documents
)
print(f"Nodes:{graph_documents_filtered[0].nodes}")
print(f"Relationships:{graph_documents_filtered[0].relationships}")
```

```output
Nodes:[Node(id='Marie Curie', type='Person'), Node(id='Pierre Curie', type='Person'), Node(id='University Of Paris', type='Organization')]
Relationships:[Relationship(source=Node(id='Marie Curie', type='Person'), target=Node(id='Pierre Curie', type='Person'), type='SPOUSE'), Relationship(source=Node(id='Marie Curie', type='Person'), target=Node(id='University Of Paris', type='Organization'), type='WORKED_AT')]
```

जनरेट किए गए ग्राफ़ को बेहतर समझने के लिए, हम इसे फिर से दृश्यमान कर सकते हैं।

![graph_construction2.png](../../../../../../static/img/graph_construction2.png)

`node_properties` पैरामीटर नोड गुणों का निष्कर्षण सक्षम करता है, जिससे अधिक विस्तृत ग्राफ़ बनाया जा सकता है।
`True` पर सेट होने पर, LLM स्वतः संबंधित नोड गुणों की पहचान और निष्कर्षण करता है।
इसके विपरीत, यदि `node_properties` को स्ट्रिंग्स की सूची के रूप में परिभाषित किया जाता है, तो LLM केवल निर्दिष्ट गुणों को पाठ से पुनः प्राप्त करता है।

```python
llm_transformer_props = LLMGraphTransformer(
    llm=llm,
    allowed_nodes=["Person", "Country", "Organization"],
    allowed_relationships=["NATIONALITY", "LOCATED_IN", "WORKED_AT", "SPOUSE"],
    node_properties=["born_year"],
)
graph_documents_props = llm_transformer_props.convert_to_graph_documents(documents)
print(f"Nodes:{graph_documents_props[0].nodes}")
print(f"Relationships:{graph_documents_props[0].relationships}")
```

```output
Nodes:[Node(id='Marie Curie', type='Person', properties={'born_year': '1867'}), Node(id='Pierre Curie', type='Person'), Node(id='University Of Paris', type='Organization')]
Relationships:[Relationship(source=Node(id='Marie Curie', type='Person'), target=Node(id='Pierre Curie', type='Person'), type='SPOUSE'), Relationship(source=Node(id='Marie Curie', type='Person'), target=Node(id='University Of Paris', type='Organization'), type='WORKED_AT')]
```

## ग्राफ़ डेटाबेस में संग्रहण

जनरेट किए गए ग्राफ़ दस्तावेज़ों को `add_graph_documents` विधि का उपयोग करके ग्राफ़ डेटाबेस में संग्रहीत किया जा सकता है।

```python
graph.add_graph_documents(graph_documents_props)
```
