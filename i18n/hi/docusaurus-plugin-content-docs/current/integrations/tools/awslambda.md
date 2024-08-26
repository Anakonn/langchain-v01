---
translated: true
---

# AWS Lambda

>[`Amazon AWS Lambda`](https://aws.amazon.com/pm/lambda/) एक सर्वरलेस कंप्यूटिंग सेवा है जो `Amazon Web Services` (`AWS`) द्वारा प्रदान की जाती है। यह डेवलपर्स को सर्वर्स को प्रोविजन या प्रबंधित किए बिना एप्लिकेशन और सेवाएं बनाने और चलाने में मदद करता है। यह सर्वरलेस वास्तुकला आपको कोड लिखने और तैनात करने पर ध्यान केंद्रित करने में सक्षम बनाती है, जबकि AWS स्वचालित रूप से आपके एप्लिकेशन को चलाने के लिए आवश्यक बुनियादी ढांचे का पैमाना, पैच और प्रबंधन करता है।

यह नोटबुक `AWS Lambda` टूल का उपयोग करने के बारे में चर्चा करता है।

एक एजेंट को प्रदान की गई `AWS Lambda` टूलों की सूची में शामिल करके, आप अपने एजेंट को आपके AWS क्लाउड में चल रहे कोड को इनवोक करने की क्षमता प्रदान कर सकते हैं, जिसका उपयोग आपको आवश्यकता के अनुसार करना है।

जब कोई एजेंट `AWS Lambda` टूल का उपयोग करता है, तो यह स्ट्रिंग प्रकार का तर्क प्रदान करेगा, जो फिर इवेंट पैरामीटर के माध्यम से लैम्बडा फ़ंक्शन में पास किया जाएगा।

पहले, आपको `boto3` पायथन पैकेज इंस्टॉल करना होगा।

```python
%pip install --upgrade --quiet  boto3 > /dev/null
```

एक एजेंट को टूल का उपयोग करने के लिए, आपको उस लैम्बडा फ़ंक्शन की लॉजिक के कार्यक्षमता से मेल खाते नाम और विवरण प्रदान करने होंगे।

आपको अपने फ़ंक्शन का नाम भी प्रदान करना होगा।

ध्यान दें कि क्योंकि यह टूल बस boto3 लाइब्रेरी का एक रैपर है, इसका उपयोग करने के लिए आपको `aws configure` चलाना होगा। अधिक जानकारी के लिए, [यहां](https://docs.aws.amazon.com/cli/index.html) देखें।

```python
from langchain.agents import AgentType, initialize_agent, load_tools
from langchain_openai import OpenAI

llm = OpenAI(temperature=0)

tools = load_tools(
    ["awslambda"],
    awslambda_tool_name="email-sender",
    awslambda_tool_description="sends an email with the specified content to test@testing123.com",
    function_name="testFunction1",
)

agent = initialize_agent(
    tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)

agent.run("Send an email to test@testing123.com saying hello world.")
```
