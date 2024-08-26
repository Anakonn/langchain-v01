---
translated: true
---

# NetworkX

>[NetworkX](https://networkx.org/) एक Python पैकेज है जो जटिल नेटवर्क के संरचना, गतिशीलता और कार्यों के निर्माण, संचालन और अध्ययन के लिए है।

यह नोटबुक एक ग्राफ डेटा संरचना पर प्रश्न उत्तर करने के बारे में बताता है।

## सेटअप करना

हमें एक Python पैकेज स्थापित करना होगा।

```python
%pip install --upgrade --quiet  networkx
```

## ग्राफ बनाना

इस खंड में, हम एक उदाहरण ग्राफ का निर्माण करते हैं। इस समय यह छोटे पाठ के टुकड़ों के लिए सबसे अच्छा काम करता है।

```python
from langchain.indexes import GraphIndexCreator
from langchain_openai import OpenAI
```

```python
index_creator = GraphIndexCreator(llm=OpenAI(temperature=0))
```

```python
with open("../../../modules/state_of_the_union.txt") as f:
    all_text = f.read()
```

हम केवल एक छोटा सा स्निपेट का उपयोग करेंगे, क्योंकि ज्ञान त्रिपलों को निकालना अभी थोड़ा गहन है।

```python
text = "\n".join(all_text.split("\n\n")[105:108])
```

```python
text
```

```output
'It won’t look like much, but if you stop and look closely, you’ll see a “Field of dreams,” the ground on which America’s future will be built. \nThis is where Intel, the American company that helped build Silicon Valley, is going to build its $20 billion semiconductor “mega site”. \nUp to eight state-of-the-art factories in one place. 10,000 new good-paying jobs. '
```

```python
graph = index_creator.from_text(text)
```

हम बनाए गए ग्राफ का निरीक्षण कर सकते हैं।

```python
graph.get_triples()
```

```output
[('Intel', '$20 billion semiconductor "mega site"', 'is going to build'),
 ('Intel', 'state-of-the-art factories', 'is building'),
 ('Intel', '10,000 new good-paying jobs', 'is creating'),
 ('Intel', 'Silicon Valley', 'is helping build'),
 ('Field of dreams',
  "America's future will be built",
  'is the ground on which')]
```

## ग्राफ का प्रश्न पूछना

अब हम ग्राफ QA श्रृंखला का उपयोग करके ग्राफ से प्रश्न पूछ सकते हैं।

```python
from langchain.chains import GraphQAChain
```

```python
chain = GraphQAChain.from_llm(OpenAI(temperature=0), graph=graph, verbose=True)
```

```python
chain.run("what is Intel going to build?")
```

```output


[1m> Entering new GraphQAChain chain...[0m
Entities Extracted:
[32;1m[1;3m Intel[0m
Full Context:
[32;1m[1;3mIntel is going to build $20 billion semiconductor "mega site"
Intel is building state-of-the-art factories
Intel is creating 10,000 new good-paying jobs
Intel is helping build Silicon Valley[0m

[1m> Finished chain.[0m
```

```output
' Intel is going to build a $20 billion semiconductor "mega site" with state-of-the-art factories, creating 10,000 new good-paying jobs and helping to build Silicon Valley.'
```

## ग्राफ सहेजना

हम ग्राफ को सहेज और लोड भी कर सकते हैं।

```python
graph.write_to_gml("graph.gml")
```

```python
from langchain.indexes.graph import NetworkxEntityGraph
```

```python
loaded_graph = NetworkxEntityGraph.from_gml("graph.gml")
```

```python
loaded_graph.get_triples()
```

```output
[('Intel', '$20 billion semiconductor "mega site"', 'is going to build'),
 ('Intel', 'state-of-the-art factories', 'is building'),
 ('Intel', '10,000 new good-paying jobs', 'is creating'),
 ('Intel', 'Silicon Valley', 'is helping build'),
 ('Field of dreams',
  "America's future will be built",
  'is the ground on which')]
```

```python
loaded_graph.get_number_of_nodes()
```

```python
loaded_graph.add_node("NewNode")
```

```python
loaded_graph.has_node("NewNode")
```

```python
loaded_graph.remove_node("NewNode")
```

```python
loaded_graph.get_neighbors("Intel")
```

```python
loaded_graph.has_edge("Intel", "Silicon Valley")
```

```python
loaded_graph.remove_edge("Intel", "Silicon Valley")
```

```python
loaded_graph.clear_edges()
```

```python
loaded_graph.clear()
```
