---
translated: true
---

# AI 네트워크

>[AI 네트워크](https://www.ainetwork.ai/build-on-ain)는 대규모 AI 모델을 수용하도록 설계된 레이어 1 블록체인으로, [$AIN 토큰](https://www.ainetwork.ai/token)으로 구동되는 분산 GPU 네트워크를 활용하여 AI 기반 `NFT`(`AINFTs`)를 풍부하게 합니다.

>`AINetwork Toolkit`은 [AINetwork 블록체인](https://www.ainetwork.ai/public/whitepaper.pdf)과 상호 작용하기 위한 도구 세트입니다. 이러한 도구를 사용하면 `AIN`을 전송하고, 값을 읽고 쓰며, 앱을 만들고, 블록체인 데이터베이스 내의 특정 경로에 대한 권한을 설정할 수 있습니다.

## 종속성 설치

AINetwork Toolkit을 사용하려면 ain-py 패키지를 설치해야 합니다. pip를 사용하여 설치할 수 있습니다:

```python
%pip install --upgrade --quiet  ain-py
```

## 환경 변수 설정

`AIN_BLOCKCHAIN_ACCOUNT_PRIVATE_KEY` 환경 변수를 AIN 블록체인 계정 개인 키로 설정해야 합니다.

```python
import os

os.environ["AIN_BLOCKCHAIN_ACCOUNT_PRIVATE_KEY"] = ""
```

### AIN 블록체인 개인 키 가져오기

```python
import os

from ain.account import Account

if os.environ.get("AIN_BLOCKCHAIN_ACCOUNT_PRIVATE_KEY", None):
    account = Account(os.environ["AIN_BLOCKCHAIN_ACCOUNT_PRIVATE_KEY"])
else:
    account = Account.create()
    os.environ["AIN_BLOCKCHAIN_ACCOUNT_PRIVATE_KEY"] = account.private_key
    print(
        f"""
address: {account.address}
private_key: {account.private_key}
"""
    )
# IMPORTANT: If you plan to use this account in the future, make sure to save the
#  private key in a secure place. Losing access to your private key means losing
#  access to your account.
```

```output

address: 0x5BEB4Defa2ccc274498416Fd7Cb34235DbC122Ac
private_key: f5e2f359bb6b7836a2ac70815473d1a290c517f847d096f5effe818de8c2cf14
```

## AINetwork Toolkit 초기화

AINetwork Toolkit을 다음과 같이 초기화할 수 있습니다:

```python
from langchain_community.agent_toolkits.ainetwork.toolkit import AINetworkToolkit

toolkit = AINetworkToolkit()
tools = toolkit.get_tools()
address = tools[0].interface.wallet.defaultAccount.address
```

## AINetwork Toolkit으로 에이전트 초기화

AINetwork Toolkit으로 에이전트를 다음과 같이 초기화할 수 있습니다:

```python
from langchain.agents import AgentType, initialize_agent
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(temperature=0)
agent = initialize_agent(
    tools=tools,
    llm=llm,
    verbose=True,
    agent=AgentType.OPENAI_FUNCTIONS,
)
```

## 사용 예시

AINetwork Toolkit으로 에이전트를 사용하는 예시는 다음과 같습니다:

### 테스트할 앱 이름 정의

```python
appName = f"langchain_demo_{address.lower()}"
```

### AINetwork 블록체인 데이터베이스에 앱 생성

```python
print(
    agent.run(
        f"Create an app in the AINetwork Blockchain database with the name {appName}"
    )
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `AINappOps` with `{'type': 'SET_ADMIN', 'appName': 'langchain_demo_0x5beb4defa2ccc274498416fd7cb34235dbc122ac'}`


[0m[36;1m[1;3m{"tx_hash": "0x018846d6a9fc111edb1a2246ae2484ef05573bd2c584f3d0da155fa4b4936a9e", "result": {"gas_amount_total": {"bandwidth": {"service": 4002, "app": {"langchain_demo_0x5beb4defa2ccc274498416fd7cb34235dbc122ac": 2}}, "state": {"service": 1640}}, "gas_cost_total": 0, "func_results": {"_createApp": {"op_results": {"0": {"path": "/apps/langchain_demo_0x5beb4defa2ccc274498416fd7cb34235dbc122ac", "result": {"code": 0, "bandwidth_gas_amount": 1}}, "1": {"path": "/apps/langchain_demo_0x5beb4defa2ccc274498416fd7cb34235dbc122ac", "result": {"code": 0, "bandwidth_gas_amount": 1}}, "2": {"path": "/manage_app/langchain_demo_0x5beb4defa2ccc274498416fd7cb34235dbc122ac/config/admin", "result": {"code": 0, "bandwidth_gas_amount": 1}}}, "code": 0, "bandwidth_gas_amount": 2000}}, "code": 0, "bandwidth_gas_amount": 2001, "gas_amount_charged": 5642}}[0m[32;1m[1;3mThe app with the name "langchain_demo_0x5beb4defa2ccc274498416fd7cb34235dbc122ac" has been created in the AINetwork Blockchain database.[0m

[1m> Finished chain.[0m
The app with the name "langchain_demo_0x5beb4defa2ccc274498416fd7cb34235dbc122ac" has been created in the AINetwork Blockchain database.
```

### AINetwork 블록체인 데이터베이스의 주어진 경로에 값 설정

```python
print(
    agent.run(f"Set the value {{1: 2, '34': 56}} at the path /apps/{appName}/object .")
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `AINvalueOps` with `{'type': 'SET', 'path': '/apps/langchain_demo_0x5beb4defa2ccc274498416fd7cb34235dbc122ac/object', 'value': {'1': 2, '34': 56}}`


[0m[33;1m[1;3m{"tx_hash": "0x3d1a16d9808830088cdf4d37f90f4b1fa1242e2d5f6f983829064f45107b5279", "result": {"gas_amount_total": {"bandwidth": {"service": 0, "app": {"langchain_demo_0x5beb4defa2ccc274498416fd7cb34235dbc122ac": 1}}, "state": {"service": 0, "app": {"langchain_demo_0x5beb4defa2ccc274498416fd7cb34235dbc122ac": 674}}}, "gas_cost_total": 0, "code": 0, "bandwidth_gas_amount": 1, "gas_amount_charged": 0}}[0m[32;1m[1;3mThe value {1: 2, '34': 56} has been set at the path /apps/langchain_demo_0x5beb4defa2ccc274498416fd7cb34235dbc122ac/object.[0m

[1m> Finished chain.[0m
The value {1: 2, '34': 56} has been set at the path /apps/langchain_demo_0x5beb4defa2ccc274498416fd7cb34235dbc122ac/object.
```

### AINetwork 블록체인 데이터베이스의 경로에 대한 권한 설정

```python
print(
    agent.run(
        f"Set the write permissions for the path /apps/{appName}/user/$from with the"
        " eval string auth.addr===$from ."
    )
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `AINruleOps` with `{'type': 'SET', 'path': '/apps/langchain_demo_0x5beb4defa2ccc274498416fd7cb34235dbc122ac/user/$from', 'eval': 'auth.addr===$from'}`


[0m[38;5;200m[1;3m{"tx_hash": "0x37d5264e580f6a217a347059a735bfa9eb5aad85ff28a95531c6dc09252664d2", "result": {"gas_amount_total": {"bandwidth": {"service": 0, "app": {"langchain_demo_0x5beb4defa2ccc274498416fd7cb34235dbc122ac": 1}}, "state": {"service": 0, "app": {"langchain_demo_0x5beb4defa2ccc274498416fd7cb34235dbc122ac": 712}}}, "gas_cost_total": 0, "code": 0, "bandwidth_gas_amount": 1, "gas_amount_charged": 0}}[0m[32;1m[1;3mThe write permissions for the path `/apps/langchain_demo_0x5beb4defa2ccc274498416fd7cb34235dbc122ac/user/$from` have been set with the eval string `auth.addr===$from`.[0m

[1m> Finished chain.[0m
The write permissions for the path `/apps/langchain_demo_0x5beb4defa2ccc274498416fd7cb34235dbc122ac/user/$from` have been set with the eval string `auth.addr===$from`.
```

### AINetwork 블록체인 데이터베이스의 경로에 대한 권한 가져오기

```python
print(agent.run(f"Retrieve the permissions for the path /apps/{appName}."))
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `AINownerOps` with `{'type': 'GET', 'path': '/apps/langchain_demo_0x5beb4defa2ccc274498416fd7cb34235dbc122ac'}`


[0m[33;1m[1;3m{".owner": {"owners": {"0x5BEB4Defa2ccc274498416Fd7Cb34235DbC122Ac": {"branch_owner": true, "write_function": true, "write_owner": true, "write_rule": true}}}}[0m[32;1m[1;3mThe permissions for the path /apps/langchain_demo_0x5beb4defa2ccc274498416fd7cb34235dbc122ac are as follows:

- Address: 0x5BEB4Defa2ccc274498416Fd7Cb34235DbC122Ac
  - branch_owner: true
  - write_function: true
  - write_owner: true
  - write_rule: true[0m

[1m> Finished chain.[0m
The permissions for the path /apps/langchain_demo_0x5beb4defa2ccc274498416fd7cb34235dbc122ac are as follows:

- Address: 0x5BEB4Defa2ccc274498416Fd7Cb34235DbC122Ac
  - branch_owner: true
  - write_function: true
  - write_owner: true
  - write_rule: true
```

### 팔콧에서 AIN 받기

```python
!curl http://faucet.ainetwork.ai/api/test/{address}/
```

```output
{"result":"0x0eb07b67b7d0a702cb60e865d3deafff3070d8508077ef793d69d6819fd92ea3","time":1692348112376}
```

### AIN 잔액 가져오기

```python
print(agent.run(f"Check AIN balance of {address}"))
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `AINvalueOps` with `{'type': 'GET', 'path': '/accounts/0x5BEB4Defa2ccc274498416Fd7Cb34235DbC122Ac/balance'}`


[0m[33;1m[1;3m100[0m[32;1m[1;3mThe AIN balance of address 0x5BEB4Defa2ccc274498416Fd7Cb34235DbC122Ac is 100 AIN.[0m

[1m> Finished chain.[0m
The AIN balance of address 0x5BEB4Defa2ccc274498416Fd7Cb34235DbC122Ac is 100 AIN.
```

### AIN 전송

```python
print(
    agent.run(
        "Transfer 100 AIN to the address 0x19937b227b1b13f29e7ab18676a89ea3bdea9c5b"
    )
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `AINtransfer` with `{'address': '0x19937b227b1b13f29e7ab18676a89ea3bdea9c5b', 'amount': 100}`


[0m[36;1m[1;3m{"tx_hash": "0xa59d15d23373bcc00e413ac8ba18cb016bb3bdd54058d62606aec688c6ad3d2e", "result": {"gas_amount_total": {"bandwidth": {"service": 3}, "state": {"service": 866}}, "gas_cost_total": 0, "func_results": {"_transfer": {"op_results": {"0": {"path": "/accounts/0x5BEB4Defa2ccc274498416Fd7Cb34235DbC122Ac/balance", "result": {"code": 0, "bandwidth_gas_amount": 1}}, "1": {"path": "/accounts/0x19937B227b1b13f29e7AB18676a89EA3BDEA9C5b/balance", "result": {"code": 0, "bandwidth_gas_amount": 1}}}, "code": 0, "bandwidth_gas_amount": 0}}, "code": 0, "bandwidth_gas_amount": 1, "gas_amount_charged": 869}}[0m[32;1m[1;3mThe transfer of 100 AIN to the address 0x19937b227b1b13f29e7ab18676a89ea3bdea9c5b was successful. The transaction hash is 0xa59d15d23373bcc00e413ac8ba18cb016bb3bdd54058d62606aec688c6ad3d2e.[0m

[1m> Finished chain.[0m
The transfer of 100 AIN to the address 0x19937b227b1b13f29e7ab18676a89ea3bdea9c5b was successful. The transaction hash is 0xa59d15d23373bcc00e413ac8ba18cb016bb3bdd54058d62606aec688c6ad3d2e.
```
