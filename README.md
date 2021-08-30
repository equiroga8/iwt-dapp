
# IWT dApp

The concept of identity has always been fundamental to human activities, it is a combination of ones physical and behavioural traits and can be used to effectively recognise somebody. Over the last couple of decades, the digital world has become more prevalent and there has also been an increase in the amount of devices connected to the internet. The concept of identity has naturally transitioned to an online context in the form of digital identity, which includes digital characteristics, digital behaviour, pieces of physical identity, and personal information. Digital identity can represent entities such as people, organizations, machines or even objects in a digital setting.

To associate entities with their respective digital identities, digital identity management systems are employed. They are used to identify entities on the internet in a secure way and are commonly utilized for online authentication, digital signatures, physical access, as well as record keeping. The most common models of identity management systems are centralized, which deprive the original owners of the control and protection over their identities and are therefore exposed to data breaches and privacy loss.

One of the most recent digital identity management models is self-sovereign identity (SSID). It is a digital movement that recognizes that an entity should have complete control over its digital identity and data without the intervention of administrative authorities. SSID can be used in conjunction with distributed ledger technologies (DLT) to enable a decentralized solution, that is, a decentralized identity management (DIDM) system.

There are many business processes in industry sectors that involve multiple stakeholders and machines that could potentially benefit from DIDM. One of them is inland waterway transport (IWT). Inland waterway transport is a competitive alternative to road and rail transport of cargo. In particular, it offers a safer and environment-friendly alternative in terms of both energy consumption and noise emissions. In this use case, different stakeholders have to exchange information in order to manage the transportation of goods. The value of the information is based on the authenticity of the information.

Unfortunately, DLT suffers the same problem as the internet: its users are anonymous and we do not know with whom we communicate and cooperate. Besides the potential anonymity of business partners, assessment and assurance of information quality is also an added challenge. Once the trustworthiness of a business cooperation is founded in information, integrity of this information is essential and specific knowledge about the identity of our communication partner delivering information is compulsory. Also, a mechanism to govern the accessibility of process information that occurs during the transportation of goods on a waterway is needed.


# Installation

This dApp was tested using Ubuntu 20.04.3 LTS. Node, npm and java need to be installed previously for it to work these are the versions used:

- Node: 15.0.1
- npm: 7.0.3
- Java openjdk 11.0.11 (Can be 8 or higher)

Clone the repository:

    git clone https://github.com/equiroga8/iwt-dapp.git

Give execution permissions to the scripts:

    cd iwt-dapp
    chmod +x init.sh cleanup.sh

# Startup

To start up the dApp:

    ./init.sh
    
# Set up

[Metamask](https://metamask.io/download.html) needs to be installed on your chrome browser previously. Once it's installed you need to add the accounts of out main actors. To do this open the Metamask extension, click on the avatar in the top right corner and click on import account. Here you have to paste a private key. You will need to do this 4 times for the following actors:

- Client: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
- Operator: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
- Origin Inspector: 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6
- Destination Inspector: 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a

These accounts are only used in a test-net setting. You can change the name of the account by clicking on the three vertical dots, then on account details and edit the name. 

Every time you restart the test-net you need to reset the accounts. You can do this, by clicking on the avatar in the top right corner, then on settings, advanced and lastly on Reset Account. This has to be done for the 4 accounts.

# Teardown

To close all the services at once:

    ./cleanup.sh
