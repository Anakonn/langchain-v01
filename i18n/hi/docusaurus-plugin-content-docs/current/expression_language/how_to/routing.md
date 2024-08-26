---
keywords:
- RunnableBranch
- LCEL
sidebar_position: 3
title: रूट लॉजिक इनपुट के आधार पर
translated: true
---

# इनपुट के आधार पर गतिशील रूट लॉजिक

यह नोटबुक कवर करता है कि LangChain Expression Language में रूटिंग कैसे करें।

रूटिंग आपको गैर-निर्धारित श्रृंखलाएं बनाने की अनुमति देता है जहां पिछले चरण का आउटपुट अगले चरण को परिभाषित करता है। रूटिंग LLM के साथ इंटरैक्शन के लिए संरचना और सुसंगतता प्रदान करने में मदद करता है।

रूटिंग करने के दो तरीके हैं:

1. एक [`RunnableLambda`](/docs/expression_language/primitives/functions) से शर्तीय रूप से रनेबल्स लौटाना (अनुशंसित)
2. एक `RunnableBranch` का उपयोग करना।

हम एक दो चरण की अनुक्रम का उपयोग करके दोनों तरीकों को दर्शाएंगे, जहां पहला चरण इनपुट प्रश्न को `LangChain`, `Anthropic` या `Other` के रूप में वर्गीकृत करता है, और फिर एक संबंधित प्रॉम्प्ट श्रृंखला पर रूट करता है।

## उदाहरण सेटअप

पहले, आइए एक श्रृंखला बनाते हैं जो आने वाले प्रश्नों को `LangChain`, `Anthropic` या `Other` के बारे में होने के रूप में पहचानेगी:

```python
from langchain_anthropic import ChatAnthropic
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate

chain = (
    PromptTemplate.from_template(
        """Given the user question below, classify it as either being about `LangChain`, `Anthropic`, or `Other`.

Do not respond with more than one word.

<question>
{question}
</question>

Classification:"""
    )
    | ChatAnthropic(model_name="claude-3-haiku-20240307")
    | StrOutputParser()
)

chain.invoke({"question": "how do I call Anthropic?"})
```

```output
'Anthropic'
```

अब, आइए तीन उप-श्रृंखलाएं बनाते हैं:

```python
langchain_chain = PromptTemplate.from_template(
    """You are an expert in langchain. \
Always answer questions starting with "As Harrison Chase told me". \
Respond to the following question:

Question: {question}
Answer:"""
) | ChatAnthropic(model_name="claude-3-haiku-20240307")
anthropic_chain = PromptTemplate.from_template(
    """You are an expert in anthropic. \
Always answer questions starting with "As Dario Amodei told me". \
Respond to the following question:

Question: {question}
Answer:"""
) | ChatAnthropic(model_name="claude-3-haiku-20240307")
general_chain = PromptTemplate.from_template(
    """Respond to the following question:

Question: {question}
Answer:"""
) | ChatAnthropic(model_name="claude-3-haiku-20240307")
```

## एक कस्टम फ़ंक्शन का उपयोग करना (अनुशंसित)

आप विभिन्न आउटपुट के बीच रूट करने के लिए एक कस्टम फ़ंक्शन का भी उपयोग कर सकते हैं। यहां एक उदाहरण है:

```python
def route(info):
    if "anthropic" in info["topic"].lower():
        return anthropic_chain
    elif "langchain" in info["topic"].lower():
        return langchain_chain
    else:
        return general_chain
```

```python
from langchain_core.runnables import RunnableLambda

full_chain = {"topic": chain, "question": lambda x: x["question"]} | RunnableLambda(
    route
)
```

```python
full_chain.invoke({"question": "how do I use Anthropic?"})
```

```output
AIMessage(content="As Dario Amodei told me, to use Anthropic, you can start by exploring the company's website and learning about their mission, values, and the different services and products they offer. Anthropic is focused on developing safe and ethical AI systems, so they have a strong emphasis on transparency and responsible AI development. \n\nDepending on your specific needs, you can look into Anthropic's AI research and development services, which cover areas like natural language processing, computer vision, and reinforcement learning. They also offer consulting and advisory services to help organizations navigate the challenges and opportunities of AI integration.\n\nAdditionally, Anthropic has released some open-source AI models and tools that you can explore and experiment with. These can be a great way to get hands-on experience with Anthropic's approach to AI development.\n\nOverall, Anthropic aims to be a reliable and trustworthy partner in the AI space, so I'd encourage you to reach out to them directly to discuss how they can best support your specific requirements.", response_metadata={'id': 'msg_01CtLFgFSwvTaJomrihE87Ra', 'content': [ContentBlock(text="As Dario Amodei told me, to use Anthropic, you can start by exploring the company's website and learning about their mission, values, and the different services and products they offer. Anthropic is focused on developing safe and ethical AI systems, so they have a strong emphasis on transparency and responsible AI development. \n\nDepending on your specific needs, you can look into Anthropic's AI research and development services, which cover areas like natural language processing, computer vision, and reinforcement learning. They also offer consulting and advisory services to help organizations navigate the challenges and opportunities of AI integration.\n\nAdditionally, Anthropic has released some open-source AI models and tools that you can explore and experiment with. These can be a great way to get hands-on experience with Anthropic's approach to AI development.\n\nOverall, Anthropic aims to be a reliable and trustworthy partner in the AI space, so I'd encourage you to reach out to them directly to discuss how they can best support your specific requirements.", type='text')], 'model': 'claude-3-haiku-20240307', 'role': 'assistant', 'stop_reason': 'end_turn', 'stop_sequence': None, 'type': 'message', 'usage': Usage(input_tokens=53, output_tokens=219)})
```

```python
full_chain.invoke({"question": "how do I use LangChain?"})
```

```output
AIMessage(content="As Harrison Chase told me, using LangChain involves a few key steps:\n\n1. **Set up your environment**: Install the necessary Python packages, including the LangChain library itself, as well as any other dependencies your application might require, such as language models or other integrations.\n\n2. **Understand the core concepts**: LangChain revolves around a few core concepts, like Agents, Chains, and Tools. Familiarize yourself with these concepts and how they work together to build powerful language-based applications.\n\n3. **Identify your use case**: Determine what kind of task or application you want to build using LangChain, such as a chatbot, a question-answering system, or a document summarization tool.\n\n4. **Choose the appropriate components**: Based on your use case, select the right LangChain components, such as agents, chains, and tools, to build your application.\n\n5. **Integrate with language models**: LangChain is designed to work seamlessly with various language models, such as OpenAI's GPT-3 or Anthropic's models. Connect your chosen language model to your LangChain application.\n\n6. **Implement your application logic**: Use LangChain's building blocks to implement the specific functionality of your application, such as prompting the language model, processing the response, and integrating with other services or data sources.\n\n7. **Test and iterate**: Thoroughly test your application, gather feedback, and iterate on your design and implementation to improve its performance and user experience.\n\nAs Harrison Chase emphasized, LangChain provides a flexible and powerful framework for building language-based applications, making it easier to leverage the capabilities of modern language models. By following these steps, you can get started with LangChain and create innovative solutions tailored to your specific needs.", response_metadata={'id': 'msg_01H3UXAAHG4TwxJLpxwuuVU7', 'content': [ContentBlock(text="As Harrison Chase told me, using LangChain involves a few key steps:\n\n1. **Set up your environment**: Install the necessary Python packages, including the LangChain library itself, as well as any other dependencies your application might require, such as language models or other integrations.\n\n2. **Understand the core concepts**: LangChain revolves around a few core concepts, like Agents, Chains, and Tools. Familiarize yourself with these concepts and how they work together to build powerful language-based applications.\n\n3. **Identify your use case**: Determine what kind of task or application you want to build using LangChain, such as a chatbot, a question-answering system, or a document summarization tool.\n\n4. **Choose the appropriate components**: Based on your use case, select the right LangChain components, such as agents, chains, and tools, to build your application.\n\n5. **Integrate with language models**: LangChain is designed to work seamlessly with various language models, such as OpenAI's GPT-3 or Anthropic's models. Connect your chosen language model to your LangChain application.\n\n6. **Implement your application logic**: Use LangChain's building blocks to implement the specific functionality of your application, such as prompting the language model, processing the response, and integrating with other services or data sources.\n\n7. **Test and iterate**: Thoroughly test your application, gather feedback, and iterate on your design and implementation to improve its performance and user experience.\n\nAs Harrison Chase emphasized, LangChain provides a flexible and powerful framework for building language-based applications, making it easier to leverage the capabilities of modern language models. By following these steps, you can get started with LangChain and create innovative solutions tailored to your specific needs.", type='text')], 'model': 'claude-3-haiku-20240307', 'role': 'assistant', 'stop_reason': 'end_turn', 'stop_sequence': None, 'type': 'message', 'usage': Usage(input_tokens=50, output_tokens=400)})
```

```python
full_chain.invoke({"question": "whats 2 + 2"})
```

```output
AIMessage(content='4', response_metadata={'id': 'msg_01UAKP81jTZu9fyiyFYhsbHc', 'content': [ContentBlock(text='4', type='text')], 'model': 'claude-3-haiku-20240307', 'role': 'assistant', 'stop_reason': 'end_turn', 'stop_sequence': None, 'type': 'message', 'usage': Usage(input_tokens=28, output_tokens=5)})
```

## एक RunnableBranch का उपयोग करना

एक `RunnableBranch` एक विशेष प्रकार का रनेबल है जो आपको शर्तों और रनेबल्स को परिभाषित करने की अनुमति देता है जो इनपुट के आधार पर निष्पादित किए जाएंगे। यह उपर्युक्त कस्टम फ़ंक्शन में प्राप्त कुछ भी नहीं प्रदान करता है, इसलिए हम कस्टम फ़ंक्शन का उपयोग करने की सिफारिश करते हैं।

एक `RunnableBranch` को (शर्त, रनेबल) युग्मों की एक सूची और एक डिफ़ॉल्ट रनेबल के साथ प्रारंभ किया जाता है। यह इनपुट को पास करके प्रत्येक शर्त का चयन करता है। यह पहली शर्त को चुनता है जो True मूल्य देती है, और उस शर्त से संबंधित रनेबल को इनपुट के साथ चलाता है।

यदि कोई भी प्रदान की गई शर्तें मेल नहीं खाती हैं, तो यह डिफ़ॉल्ट रनेबल को चलाता है।

यह कैसे काम करता है, इसका एक उदाहरण यहां दिया गया है:

```python
from langchain_core.runnables import RunnableBranch

branch = RunnableBranch(
    (lambda x: "anthropic" in x["topic"].lower(), anthropic_chain),
    (lambda x: "langchain" in x["topic"].lower(), langchain_chain),
    general_chain,
)
full_chain = {"topic": chain, "question": lambda x: x["question"]} | branch
full_chain.invoke({"question": "how do I use Anthropic?"})
```

```output
AIMessage(content="As Dario Amodei told me, to use Anthropic, you should first familiarize yourself with our mission and principles. Anthropic is committed to developing safe and beneficial artificial intelligence that can help solve important problems facing humanity. \n\nTo get started, I recommend exploring the resources on our website, which cover our research, products, and approach to AI development. You can also reach out to our team to learn more about how Anthropic's technology and services can support your specific needs.\n\nThe key is to engage with us in a way that aligns with our values of transparency, ethical AI, and a commitment to the wellbeing of humanity. We're here to collaborate and help you harness the power of advanced AI responsibly.", response_metadata={'id': 'msg_0187BVnpniPDJnVvwf3M1LdY', 'content': [ContentBlock(text="As Dario Amodei told me, to use Anthropic, you should first familiarize yourself with our mission and principles. Anthropic is committed to developing safe and beneficial artificial intelligence that can help solve important problems facing humanity. \n\nTo get started, I recommend exploring the resources on our website, which cover our research, products, and approach to AI development. You can also reach out to our team to learn more about how Anthropic's technology and services can support your specific needs.\n\nThe key is to engage with us in a way that aligns with our values of transparency, ethical AI, and a commitment to the wellbeing of humanity. We're here to collaborate and help you harness the power of advanced AI responsibly.", type='text')], 'model': 'claude-3-haiku-20240307', 'role': 'assistant', 'stop_reason': 'end_turn', 'stop_sequence': None, 'type': 'message', 'usage': Usage(input_tokens=53, output_tokens=160)})
```

```python
full_chain.invoke({"question": "how do I use LangChain?"})
```

```output
AIMessage(content="As Harrison Chase told me, using LangChain involves several key steps. First, you'll need to install the LangChain library and import the necessary modules. Then, you'll want to define your language model, any data sources you plan to use, and the specific tasks you want to accomplish, such as question answering, text generation, or agent-based reasoning. \n\nLangChain provides a flexible framework for building applications that leverage large language models. It includes abstractions for things like retrievers, prompts, and chains, which allow you to compose different components together to create powerful workflows. \n\nThe documentation on the LangChain website is excellent and covers many common use cases in detail. I'd recommend starting there to get a solid understanding of the core concepts and how to apply them to your specific needs. And of course, feel free to reach out if you have any other questions - I'm always happy to share more insights from my conversations with Harrison.", response_metadata={'id': 'msg_01T1naS99wGPkEAP4LME8iAv', 'content': [ContentBlock(text="As Harrison Chase told me, using LangChain involves several key steps. First, you'll need to install the LangChain library and import the necessary modules. Then, you'll want to define your language model, any data sources you plan to use, and the specific tasks you want to accomplish, such as question answering, text generation, or agent-based reasoning. \n\nLangChain provides a flexible framework for building applications that leverage large language models. It includes abstractions for things like retrievers, prompts, and chains, which allow you to compose different components together to create powerful workflows. \n\nThe documentation on the LangChain website is excellent and covers many common use cases in detail. I'd recommend starting there to get a solid understanding of the core concepts and how to apply them to your specific needs. And of course, feel free to reach out if you have any other questions - I'm always happy to share more insights from my conversations with Harrison.", type='text')], 'model': 'claude-3-haiku-20240307', 'role': 'assistant', 'stop_reason': 'end_turn', 'stop_sequence': None, 'type': 'message', 'usage': Usage(input_tokens=50, output_tokens=205)})
```

```python
full_chain.invoke({"question": "whats 2 + 2"})
```

```output
AIMessage(content='4', response_metadata={'id': 'msg_01T6T3TS6hRCtU8JayN93QEi', 'content': [ContentBlock(text='4', type='text')], 'model': 'claude-3-haiku-20240307', 'role': 'assistant', 'stop_reason': 'end_turn', 'stop_sequence': None, 'type': 'message', 'usage': Usage(input_tokens=28, output_tokens=5)})
```

# सेमांटिक समानता द्वारा रूटिंग

एक विशेष रूप से उपयोगी तकनीक है कि आप एक प्रश्न को सबसे प्रासंगिक प्रॉम्प्ट पर रूट करने के लिए एम्बेडिंग का उपयोग करें। यहां एक उदाहरण है।

```python
from langchain.utils.math import cosine_similarity
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableLambda, RunnablePassthrough
from langchain_openai import OpenAIEmbeddings

physics_template = """You are a very smart physics professor. \
You are great at answering questions about physics in a concise and easy to understand manner. \
When you don't know the answer to a question you admit that you don't know.

Here is a question:
{query}"""

math_template = """You are a very good mathematician. You are great at answering math questions. \
You are so good because you are able to break down hard problems into their component parts, \
answer the component parts, and then put them together to answer the broader question.

Here is a question:
{query}"""

embeddings = OpenAIEmbeddings()
prompt_templates = [physics_template, math_template]
prompt_embeddings = embeddings.embed_documents(prompt_templates)


def prompt_router(input):
    query_embedding = embeddings.embed_query(input["query"])
    similarity = cosine_similarity([query_embedding], prompt_embeddings)[0]
    most_similar = prompt_templates[similarity.argmax()]
    print("Using MATH" if most_similar == math_template else "Using PHYSICS")
    return PromptTemplate.from_template(most_similar)


chain = (
    {"query": RunnablePassthrough()}
    | RunnableLambda(prompt_router)
    | ChatAnthropic(model_name="claude-3-haiku-20240307")
    | StrOutputParser()
)
```

```python
print(chain.invoke("What's a black hole"))
```

```output
Using PHYSICS
As a physics professor, I would be happy to provide a concise and easy-to-understand explanation of what a black hole is.

A black hole is an incredibly dense region of space-time where the gravitational pull is so strong that nothing, not even light, can escape from it. This means that if you were to get too close to a black hole, you would be pulled in and crushed by the intense gravitational forces.

The formation of a black hole occurs when a massive star, much larger than our Sun, reaches the end of its life and collapses in on itself. This collapse causes the matter to become extremely dense, and the gravitational force becomes so strong that it creates a point of no return, known as the event horizon.

Beyond the event horizon, the laws of physics as we know them break down, and the intense gravitational forces create a singularity, which is a point of infinite density and curvature in space-time.

Black holes are fascinating and mysterious objects, and there is still much to be learned about their properties and behavior. If I were unsure about any specific details or aspects of black holes, I would readily admit that I do not have a complete understanding and would encourage further research and investigation.
```

```python
print(chain.invoke("What's a path integral"))
```

```output
Using MATH
A path integral is a powerful mathematical concept in physics, particularly in the field of quantum mechanics. It was developed by the renowned physicist Richard Feynman as an alternative formulation of quantum mechanics.

In a path integral, instead of considering a single, definite path that a particle might take from one point to another, as in classical mechanics, the particle is considered to take all possible paths simultaneously. Each path is assigned a complex-valued weight, and the total probability amplitude for the particle to go from one point to another is calculated by summing (integrating) over all possible paths.

The key ideas behind the path integral formulation are:

1. Superposition principle: In quantum mechanics, particles can exist in a superposition of multiple states or paths simultaneously.

2. Probability amplitude: The probability amplitude for a particle to go from one point to another is calculated by summing the complex-valued weights of all possible paths.

3. Weighting of paths: Each path is assigned a weight based on the action (the time integral of the Lagrangian) along that path. Paths with lower action have a greater weight.

4. Feynman's approach: Feynman developed the path integral formulation as an alternative to the traditional wave function approach in quantum mechanics, providing a more intuitive and conceptual understanding of quantum phenomena.

The path integral approach is particularly useful in quantum field theory, where it provides a powerful framework for calculating transition probabilities and understanding the behavior of quantum systems. It has also found applications in various areas of physics, such as condensed matter, statistical mechanics, and even in finance (the path integral approach to option pricing).

The mathematical construction of the path integral involves the use of advanced concepts from functional analysis and measure theory, making it a powerful and sophisticated tool in the physicist's arsenal.
```
