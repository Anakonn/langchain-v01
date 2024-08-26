---
sidebar_label: Kinetica
translated: true
---

# Kinetica SqlAssist LLM Demo

यह नोटबुक दिखाता है कि कैसे Kinetica का उपयोग करके प्राकृतिक भाषा को SQL में रूपांतरित किया जा सकता है और डेटा पुनर्प्राप्ति की प्रक्रिया को सरल बनाया जा सकता है। यह डेमो श्रृंखला बनाने और उपयोग करने की मैकेनिक्स दिखाने के लिए है, न कि एलएलएम की क्षमताओं को दिखाने के लिए।

## अवलोकन

Kinetica एलएलएम वर्कफ़्लो के साथ, आप डेटाबेस में एक एलएलएम संदर्भ बनाते हैं जो अनुमान लगाने के लिए आवश्यक जानकारी प्रदान करता है, जिसमें तालिकाएं, एनोटेशन, नियम और नमूने शामिल हैं। ``ChatKinetica.load_messages_from_context()`` को कॉल करने से डेटाबेस से संदर्भ जानकारी पुनर्प्राप्त होगी ताकि इसका उपयोग चैट प्रोम्प्ट बनाने के लिए किया जा सके।

चैट प्रोम्प्ट में एक ``SystemMessage`` और ``HumanMessage``/``AIMessage`` जोड़े होते हैं जो नमूने हैं जो प्रश्न/SQL जोड़े हैं। आप इस सूची में नमूने जोड़ सकते हैं लेकिन यह एक सामान्य प्राकृतिक भाषा वार्तालाप की सुविधा प्रदान करने के लिए नहीं है।

जब आप चैट प्रोम्प्ट से एक श्रृंखला बनाते हैं और इसे निष्पादित करते हैं, तो Kinetica एलएलएम इनपुट से SQL उत्पन्न करेगा। वैकल्पिक रूप से, आप ``KineticaSqlOutputParser`` का उपयोग कर सकते हैं ताकि SQL को निष्पादित किया जा सके और परिणाम को डेटाफ़्रेम के रूप में वापस लौटाया जा सके।

वर्तमान में, SQL उत्पादन के लिए 2 एलएलएम समर्थित हैं:

1. **Kinetica SQL-GPT**: यह एलएलएम OpenAI ChatGPT API पर आधारित है।
2. **Kinetica SqlAssist**: यह एलएलएम Kinetica डेटाबेस के साथ एकीकृत होने के लिए विशेष रूप से बनाया गया है और यह सुरक्षित ग्राहक परिसर में चल सकता है।

इस डेमो के लिए हम **SqlAssist** का उपयोग करेंगे। अधिक जानकारी के लिए [Kinetica Documentation साइट](https://docs.kinetica.com/7.1/sql-gpt/concepts/) देखें।

## पूर्वापेक्षाएं

शुरू करने के लिए आपको एक Kinetica DB इंस्टेंस की आवश्यकता होगी। यदि आपके पास कोई नहीं है, तो आप एक [मुफ्त विकास इंस्टेंस](https://cloud.kinetica.com/trynow) प्राप्त कर सकते हैं।

आपको निम्नलिखित पैकेज इंस्टॉल करने की आवश्यकता होगी...

```python
# Install Langchain community and core packages
%pip install --upgrade --quiet langchain-core langchain-community

# Install Kineitca DB connection package
%pip install --upgrade --quiet gpudb typeguard

# Install packages needed for this tutorial
%pip install --upgrade --quiet faker
```

```output
Note: you may need to restart the kernel to use updated packages.
Note: you may need to restart the kernel to use updated packages.
```

## डेटाबेस कनेक्शन

आपको निम्नलिखित पर्यावरण चर सेट करने होंगे। यदि आप एक वर्चुअल पर्यावरण का उपयोग कर रहे हैं, तो आप इन्हें प्रोजेक्ट के `.env` फ़ाइल में सेट कर सकते हैं:
* `KINETICA_URL`: डेटाबेस कनेक्शन URL
* `KINETICA_USER`: डेटाबेस उपयोगकर्ता
* `KINETICA_PASSWD`: सुरक्षित पासवर्ड।

यदि आप `KineticaChatLLM` का एक उदाहरण बना सकते हैं, तो आप सफलतापूर्वक कनेक्ट हैं।

```python
from langchain_community.chat_models.kinetica import ChatKinetica

kinetica_llm = ChatKinetica()

# Test table we will create
table_name = "demo.user_profiles"

# LLM Context we will create
kinetica_ctx = "demo.test_llm_ctx"
```

## टेस्ट डेटा बनाएं

SQL उत्पन्न करने से पहले, हमें एक Kinetica तालिका और एक एलएलएम संदर्भ बनाने की आवश्यकता होगी जो तालिका का अनुमान लगा सकता है।

### कुछ नकली उपयोगकर्ता प्रोफ़ाइल बनाएं

हम `faker` पैकेज का उपयोग करके 100 नकली प्रोफ़ाइल के साथ एक डेटाफ़्रेम बनाएंगे।

```python
from typing import Generator

import pandas as pd
from faker import Faker

Faker.seed(5467)
faker = Faker(locale="en-US")


def profile_gen(count: int) -> Generator:
    for id in range(0, count):
        rec = dict(id=id, **faker.simple_profile())
        rec["birthdate"] = pd.Timestamp(rec["birthdate"])
        yield rec


load_df = pd.DataFrame.from_records(data=profile_gen(100), index="id")
load_df.head()
```

```html
<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>username</th>
      <th>name</th>
      <th>sex</th>
      <th>address</th>
      <th>mail</th>
      <th>birthdate</th>
    </tr>
    <tr>
      <th>id</th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>eduardo69</td>
      <td>Haley Beck</td>
      <td>F</td>
      <td>59836 Carla Causeway Suite 939\nPort Eugene, I...</td>
      <td>meltondenise@yahoo.com</td>
      <td>1997-11-23</td>
    </tr>
    <tr>
      <th>1</th>
      <td>lbarrera</td>
      <td>Joshua Stephens</td>
      <td>M</td>
      <td>3108 Christina Forges\nPort Timothychester, KY...</td>
      <td>erica80@hotmail.com</td>
      <td>1924-07-19</td>
    </tr>
    <tr>
      <th>2</th>
      <td>bburton</td>
      <td>Paula Kaiser</td>
      <td>F</td>
      <td>Unit 7405 Box 3052\nDPO AE 09858</td>
      <td>timothypotts@gmail.com</td>
      <td>1933-11-20</td>
    </tr>
    <tr>
      <th>3</th>
      <td>melissa49</td>
      <td>Wendy Reese</td>
      <td>F</td>
      <td>6408 Christopher Hill Apt. 459\nNew Benjamin, ...</td>
      <td>dadams@gmail.com</td>
      <td>1988-10-11</td>
    </tr>
    <tr>
      <th>4</th>
      <td>melissacarter</td>
      <td>Manuel Rios</td>
      <td>M</td>
      <td>2241 Bell Gardens Suite 723\nScottside, CA 38463</td>
      <td>williamayala@gmail.com</td>
      <td>1931-03-04</td>
    </tr>
  </tbody>
</table>
</div>
```

### डेटाफ़्रेम से एक Kinetica तालिका बनाएं

```python
from gpudb import GPUdbTable

gpudb_table = GPUdbTable.from_df(
    load_df,
    db=kinetica_llm.kdbc,
    table_name=table_name,
    clear_table=True,
    load_data=True,
)

# See the Kinetica column types
gpudb_table.type_as_df()
```

```html
<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>name</th>
      <th>type</th>
      <th>properties</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>username</td>
      <td>string</td>
      <td>[char32]</td>
    </tr>
    <tr>
      <th>1</th>
      <td>name</td>
      <td>string</td>
      <td>[char32]</td>
    </tr>
    <tr>
      <th>2</th>
      <td>sex</td>
      <td>string</td>
      <td>[char1]</td>
    </tr>
    <tr>
      <th>3</th>
      <td>address</td>
      <td>string</td>
      <td>[char64]</td>
    </tr>
    <tr>
      <th>4</th>
      <td>mail</td>
      <td>string</td>
      <td>[char32]</td>
    </tr>
    <tr>
      <th>5</th>
      <td>birthdate</td>
      <td>long</td>
      <td>[timestamp]</td>
    </tr>
  </tbody>
</table>
</div>
```

### एलएलएम संदर्भ बनाएं

आप Kinetica Workbench UI का उपयोग करके एक एलएलएम संदर्भ बना सकते हैं या आप `CREATE OR REPLACE CONTEXT` वाक्यविन्यास का उपयोग करके इसे मैन्युअल रूप से बना सकते हैं।

यहां हम पहले बनाई गई तालिका का संदर्भ लेकर एक संदर्भ बनाते हैं।

```python
# create an LLM context for the table.

from gpudb import GPUdbException

sql = f"""
CREATE OR REPLACE CONTEXT {kinetica_ctx}
(
    TABLE = demo.test_profiles
    COMMENT = 'Contains user profiles.'
),
(
    SAMPLES = (
    'How many male users are there?' =
    'select count(1) as num_users
    from demo.test_profiles
    where sex = ''M'';')
)
"""


def _check_error(response: dict) -> None:
    status = response["status_info"]["status"]
    if status != "OK":
        message = response["status_info"]["message"]
        raise GPUdbException("[%s]: %s" % (status, message))


response = kinetica_llm.kdbc.execute_sql(sql)
_check_error(response)
response["status_info"]
```

```output
{'status': 'OK',
 'message': '',
 'data_type': 'execute_sql_response',
 'response_time': 0.0148}
```

## Langchain का उपयोग करके अनुमान लगाना

नीचे के उदाहरण में, हम पहले बनाए गए तालिका और एलएलएम संदर्भ से एक श्रृंखला बनाएंगे। यह श्रृंखला SQL उत्पन्न करेगी और परिणामी डेटा को एक डेटाफ़्रेम के रूप में वापस लौटाएगी।

### Kinetica DB से चैट प्रोम्प्ट लोड करें

`load_messages_from_context()` फ़ंक्शन डेटाबेस से एक संदर्भ पुनर्प्राप्त करेगा और इसे एक चैट संदेशों की सूची में परिवर्तित करेगा जिसका उपयोग हम ``ChatPromptTemplate`` बनाने के लिए करते हैं।

```python
from langchain_core.prompts import ChatPromptTemplate

# load the context from the database
ctx_messages = kinetica_llm.load_messages_from_context(kinetica_ctx)

# Add the input prompt. This is where input question will be substituted.
ctx_messages.append(("human", "{input}"))

# Create the prompt template.
prompt_template = ChatPromptTemplate.from_messages(ctx_messages)
prompt_template.pretty_print()
```

```output
================================[1m System Message [0m================================

CREATE TABLE demo.test_profiles AS
(
   username VARCHAR (32) NOT NULL,
   name VARCHAR (32) NOT NULL,
   sex VARCHAR (1) NOT NULL,
   address VARCHAR (64) NOT NULL,
   mail VARCHAR (32) NOT NULL,
   birthdate TIMESTAMP NOT NULL
);
COMMENT ON TABLE demo.test_profiles IS 'Contains user profiles.';

================================[1m Human Message [0m=================================

How many male users are there?

==================================[1m Ai Message [0m==================================

select count(1) as num_users
    from demo.test_profiles
    where sex = 'M';

================================[1m Human Message [0m=================================

[33;1m[1;3m{input}[0m
```

### श्रृंखला बनाएं

इस श्रृंखला का अंतिम तत्व `KineticaSqlOutputParser` है जो SQL को निष्पादित करेगा और एक डेटाफ़्रेम वापस करेगा। यह वैकल्पिक है और यदि हम इसे छोड़ दें तो केवल SQL वापस आएगा।

```python
from langchain_community.chat_models.kinetica import (
    KineticaSqlOutputParser,
    KineticaSqlResponse,
)

chain = prompt_template | kinetica_llm | KineticaSqlOutputParser(kdbc=kinetica_llm.kdbc)
```

### SQL उत्पन्न करें

हमने बनाई गई श्रृंखला एक प्रश्न को इनपुट के रूप में लेगी और एक ``KineticaSqlResponse`` वापस करेगी जिसमें उत्पन्न SQL और डेटा होंगे। प्रश्न को उस एलएलएम संदर्भ से संबंधित होना चाहिए जिसका उपयोग हमने प्रोम्प्ट बनाने के लिए किया था।

```python
# Here you must ask a question relevant to the LLM context provided in the prompt template.
response: KineticaSqlResponse = chain.invoke(
    {"input": "What are the female users ordered by username?"}
)

print(f"SQL: {response.sql}")
response.dataframe.head()
```

```output
SQL: SELECT username, name
    FROM demo.test_profiles
    WHERE sex = 'F'
    ORDER BY username;
```

```html
<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>username</th>
      <th>name</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>alexander40</td>
      <td>Tina Ramirez</td>
    </tr>
    <tr>
      <th>1</th>
      <td>bburton</td>
      <td>Paula Kaiser</td>
    </tr>
    <tr>
      <th>2</th>
      <td>brian12</td>
      <td>Stefanie Williams</td>
    </tr>
    <tr>
      <th>3</th>
      <td>brownanna</td>
      <td>Jennifer Rowe</td>
    </tr>
    <tr>
      <th>4</th>
      <td>carl19</td>
      <td>Amanda Potts</td>
    </tr>
  </tbody>
</table>
</div>
```
