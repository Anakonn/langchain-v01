---
translated: true
---

# शेल (बैश)

एजेंटों को शेल तक पहुंच देना शक्तिशाली है (हालांकि एक सैंडबॉक्स वातावरण के बाहर जोखिमपूर्ण है)।

एलएलएम किसी भी शेल कमांड को निष्पादित कर सकता है। इसका एक सामान्य उपयोग मामला है कि एलएलएम आपके स्थानीय फ़ाइल सिस्टम के साथ बातचीत करने की अनुमति देना है।

**नोट:** शेल टूल विंडोज ओएस के साथ काम नहीं करता है।

```python
from langchain_community.tools import ShellTool

shell_tool = ShellTool()
```

```python
print(shell_tool.run({"commands": ["echo 'Hello World!'", "time"]}))
```

```output
Hello World!

real	0m0.000s
user	0m0.000s
sys	0m0.000s

/Users/wfh/code/lc/lckg/langchain/tools/shell/tool.py:34: UserWarning: The shell tool has no safeguards by default. Use at your own risk.
  warnings.warn(
```

### एजेंटों के साथ उपयोग

सभी उपकरणों की तरह, ये एक एजेंट को और जटिल कार्य करने के लिए दिए जा सकते हैं। आइए एजेंट को किसी वेब पेज से कुछ लिंक प्राप्त करने दें।

```python
from langchain.agents import AgentType, initialize_agent
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(temperature=0)

shell_tool.description = shell_tool.description + f"args {shell_tool.args}".replace(
    "{", "{{"
).replace("}", "}}")
self_ask_with_search = initialize_agent(
    [shell_tool], llm, agent=AgentType.CHAT_ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)
self_ask_with_search.run(
    "Download the langchain.com webpage and grep for all urls. Return only a sorted list of them. Be sure to use double quotes."
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mQuestion: What is the task?
Thought: We need to download the langchain.com webpage and extract all the URLs from it. Then we need to sort the URLs and return them.
Action:

{
  "action": "shell",
  "action_input": {
    "commands": [
      "curl -s https://langchain.com | grep -o 'http[s]*://[^\" ]*' | sort"
    ]
  }
}

[0m

/Users/wfh/code/lc/lckg/langchain/tools/shell/tool.py:34: UserWarning: The shell tool has no safeguards by default. Use at your own risk.
  warnings.warn(


Observation: [36;1m[1;3mhttps://blog.langchain.dev/
https://discord.gg/6adMQxSpJS
https://docs.langchain.com/docs/
https://github.com/hwchase17/chat-langchain
https://github.com/hwchase17/langchain
https://github.com/hwchase17/langchainjs
https://github.com/sullivan-sean/chat-langchainjs
https://js.langchain.com/docs/
https://python.langchain.com/en/latest/
https://twitter.com/langchainai
[0m
Thought:[32;1m[1;3mThe URLs have been successfully extracted and sorted. We can return the list of URLs as the final answer.
Final Answer: ["https://blog.langchain.dev/", "https://discord.gg/6adMQxSpJS", "https://docs.langchain.com/docs/", "https://github.com/hwchase17/chat-langchain", "https://github.com/hwchase17/langchain", "https://github.com/hwchase17/langchainjs", "https://github.com/sullivan-sean/chat-langchainjs", "https://js.langchain.com/docs/", "https://python.langchain.com/en/latest/", "https://twitter.com/langchainai"][0m

[1m> Finished chain.[0m
```

```output
'["https://blog.langchain.dev/", "https://discord.gg/6adMQxSpJS", "https://docs.langchain.com/docs/", "https://github.com/hwchase17/chat-langchain", "https://github.com/hwchase17/langchain", "https://github.com/hwchase17/langchainjs", "https://github.com/sullivan-sean/chat-langchainjs", "https://js.langchain.com/docs/", "https://python.langchain.com/en/latest/", "https://twitter.com/langchainai"]'
```
