---
translated: true
---

यह नोटबुक एक एजेंट के साथ `arxiv` टूल का उपयोग करने के बारे में चर्चा करता है।

सबसे पहले, आपको `arxiv` पायथन पैकेज को इंस्टॉल करना होगा।

```python
%pip install --upgrade --quiet  arxiv
```

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_react_agent, load_tools
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(temperature=0.0)
tools = load_tools(
    ["arxiv"],
)
prompt = hub.pull("hwchase17/react")

agent = create_react_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

```python
agent_executor.invoke(
    {
        "input": "What's the paper 1605.08386 about?",
    }
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mI should use the arxiv tool to search for the paper with the given identifier.
Action: arxiv
Action Input: 1605.08386[0m[36;1m[1;3mPublished: 2016-05-26
Title: Heat-bath random walks with Markov bases
Authors: Caprice Stanley, Tobias Windisch
Summary: Graphs on lattice points are studied whose edges come from a finite set of
allowed moves of arbitrary length. We show that the diameter of these graphs on
fibers of a fixed integer matrix can be bounded from above by a constant. We
then study the mixing behaviour of heat-bath random walks on these graphs. We
also state explicit conditions on the set of moves so that the heat-bath random
walk, a generalization of the Glauber dynamics, is an expander in fixed
dimension.[0m[32;1m[1;3mThe paper "1605.08386" is titled "Heat-bath random walks with Markov bases" and is authored by Caprice Stanley and Tobias Windisch. It was published on May 26, 2016. The paper discusses the study of graphs on lattice points with edges coming from a finite set of allowed moves. It explores the diameter of these graphs and the mixing behavior of heat-bath random walks on them. The paper also discusses conditions for the heat-bath random walk to be an expander in fixed dimension.
Final Answer: The paper "1605.08386" is about heat-bath random walks with Markov bases.[0m

[1m> Finished chain.[0m
```

```output
{'input': "What's the paper 1605.08386 about?",
 'output': 'The paper "1605.08386" is about heat-bath random walks with Markov bases.'}
```

## ArXiv API रैपर

यह टूल `API रैपर` का उपयोग करता है। नीचे, हम इसके द्वारा प्रदान किए गए कुछ सुविधाओं का अन्वेषण करते हैं।

```python
from langchain_community.utilities import ArxivAPIWrapper
```

आप ArxivAPIWrapper का उपयोग किसी वैज्ञानिक लेख या लेखों के बारे में जानकारी प्राप्त करने के लिए कर सकते हैं। क्वेरी पाठ 300 वर्णों तक सीमित है।

ArxivAPIWrapper निम्नलिखित लेख क्षेत्रों को वापस देता है:
- प्रकाशन तिथि
- शीर्षक
- लेखक
- सारांश

निम्नलिखित क्वेरी "1605.08386" के arxiv ID के साथ एक लेख के बारे में जानकारी देती है।

```python
arxiv = ArxivAPIWrapper()
docs = arxiv.run("1605.08386")
docs
```

```output
'Published: 2016-05-26\nTitle: Heat-bath random walks with Markov bases\nAuthors: Caprice Stanley, Tobias Windisch\nSummary: Graphs on lattice points are studied whose edges come from a finite set of\nallowed moves of arbitrary length. We show that the diameter of these graphs on\nfibers of a fixed integer matrix can be bounded from above by a constant. We\nthen study the mixing behaviour of heat-bath random walks on these graphs. We\nalso state explicit conditions on the set of moves so that the heat-bath random\nwalk, a generalization of the Glauber dynamics, is an expander in fixed\ndimension.'
```

अब, हम `Caprice Stanley` नामक एक लेखक के बारे में जानकारी प्राप्त करना चाहते हैं।

यह क्वेरी तीन लेखों के बारे में जानकारी देती है। डिफ़ॉल्ट रूप से, क्वेरी केवल तीन शीर्ष लेखों के बारे में जानकारी देती है।

```python
docs = arxiv.run("Caprice Stanley")
docs
```

```output
'Published: 2017-10-10\nTitle: On Mixing Behavior of a Family of Random Walks Determined by a Linear Recurrence\nAuthors: Caprice Stanley, Seth Sullivant\nSummary: We study random walks on the integers mod $G_n$ that are determined by an\ninteger sequence $\\{ G_n \\}_{n \\geq 1}$ generated by a linear recurrence\nrelation. Fourier analysis provides explicit formulas to compute the\neigenvalues of the transition matrices and we use this to bound the mixing time\nof the random walks.\n\nPublished: 2016-05-26\nTitle: Heat-bath random walks with Markov bases\nAuthors: Caprice Stanley, Tobias Windisch\nSummary: Graphs on lattice points are studied whose edges come from a finite set of\nallowed moves of arbitrary length. We show that the diameter of these graphs on\nfibers of a fixed integer matrix can be bounded from above by a constant. We\nthen study the mixing behaviour of heat-bath random walks on these graphs. We\nalso state explicit conditions on the set of moves so that the heat-bath random\nwalk, a generalization of the Glauber dynamics, is an expander in fixed\ndimension.\n\nPublished: 2003-03-18\nTitle: Calculation of fluxes of charged particles and neutrinos from atmospheric showers\nAuthors: V. Plyaskin\nSummary: The results on the fluxes of charged particles and neutrinos from a\n3-dimensional (3D) simulation of atmospheric showers are presented. An\nagreement of calculated fluxes with data on charged particles from the AMS and\nCAPRICE detectors is demonstrated. Predictions on neutrino fluxes at different\nexperimental sites are compared with results from other calculations.'
```

अब, हम गैर-मौजूद लेख के बारे में जानकारी प्राप्त करने की कोशिश कर रहे हैं। इस मामले में, प्रतिक्रिया "कोई अच्छा Arxiv परिणाम नहीं मिला" है।

```python
docs = arxiv.run("1605.08386WWW")
docs
```

```output
'No good Arxiv Result was found'
```
