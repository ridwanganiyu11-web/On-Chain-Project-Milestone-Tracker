// Auto-generated from contracts/ProjectMilestoneTracker.sol
export const PROJECT_MILESTONE_TRACKER_ABI = [
  {
    "inputs": [],
    "name": "InvalidMilestoneName",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidProjectDescription",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidProjectName",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      }
    ],
    "name": "MaxMilestonesReached",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "milestoneIndex",
        "type": "uint256"
      }
    ],
    "name": "MilestoneAlreadyCompleted",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "milestoneIndex",
        "type": "uint256"
      }
    ],
    "name": "MilestoneNotFound",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "caller",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "NotProjectOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      }
    ],
    "name": "ProjectNotFound",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "milestoneIndex",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "MilestoneAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "milestoneIndex",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "completedAt",
        "type": "uint256"
      }
    ],
    "name": "MilestoneCompleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "ProjectCreated",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "MAX_MILESTONES_PER_PROJECT",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_MILESTONE_NAME_LENGTH",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_PROJECT_DESC_LENGTH",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_PROJECT_NAME_LENGTH",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      }
    ],
    "name": "addMilestone",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "milestoneIndex",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "milestoneIndex",
        "type": "uint256"
      }
    ],
    "name": "completeMilestone",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      }
    ],
    "name": "createProject",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "string[]",
        "name": "milestoneNames",
        "type": "string[]"
      }
    ],
    "name": "createProjectWithMilestones",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "milestoneIndex",
        "type": "uint256"
      }
    ],
    "name": "getMilestone",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "completed",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "completedAt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "createdAt",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "getOwnerProjects",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      }
    ],
    "name": "getProject",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "createdAt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "milestoneCount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "completedCount",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "exists",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getProjectCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      }
    ],
    "name": "getProjectMilestones",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "index",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "bool",
            "name": "completed",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "completedAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "createdAt",
            "type": "uint256"
          }
        ],
        "internalType": "struct ProjectMilestoneTracker.Milestone[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalMilestonesCompleted",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalMilestonesCreated",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const PROJECT_MILESTONE_TRACKER_BYTECODE: `0x${string}` = "0x6080604052348015600e575f5ffd5b506114c68061001c5f395ff3fe608060405234801561000f575f5ffd5b50600436106100f0575f3560e01c80636bd0620411610093578063dffedac511610063578063dffedac5146101cd578063e3ddf190146101d5578063f0f3f2c8146101de578063f326206b14610205575f5ffd5b80636bd062041461017a5780638ed9895c1461018d578063a3fc8477146101b1578063aba5d5be146101c4575f5ffd5b80633bcff3b0116100ce5780633bcff3b0146101435780634fc394761461014a57806352766d8014610152578063612a120e14610172575f5ffd5b80630d1d1afa146100f4578063246f220b1461011a57806328ccd2ab1461013a575b5f5ffd5b610107610102366004610e1b565b61021a565b6040519081526020015b60405180910390f35b61012d610128366004610e63565b6102b7565b6040516101119190610e90565b61010760025481565b5f54610107565b610107608c81565b610165610160366004610ed2565b610320565b6040516101119190610f17565b610107606481565b610107610188366004610fb1565b610480565b6101a061019b36600461101d565b610496565b60405161011195949392919061103d565b6101076101bf366004611072565b6105f1565b61010761011881565b610107603281565b61010760015481565b6101f16101ec366004610ed2565b61066f565b604051610111989796959493929190611142565b61021861021336600461101d565b610836565b005b5f838152600360205260408120600781015485919060ff166102575760405163a89b369d60e01b8152600481018390526024015b60405180910390fd5b60038101546001600160a01b031633146102a2576003810154604051631e2eac2d60e11b8152600481018490523360248201526001600160a01b03909116604482015260640161024e565b6102ad8686866109f2565b9695505050505050565b6001600160a01b0381165f9081526005602090815260409182902080548351818402810184019094528084526060939283018282801561031457602002820191905f5260205f20905b815481526020019060010190808311610300575b50505050509050919050565b5f81815260036020526040902060070154606090829060ff166103595760405163a89b369d60e01b81526004810182905260240161024e565b5f83815260046020908152604080832080548251818502810185019093528083529193909284015b82821015610473578382905f5260205f2090600502016040518060a00160405290815f82015481526020016001820180546103bb906111a5565b80601f01602080910402602001604051908101604052809291908181526020018280546103e7906111a5565b80156104325780601f1061040957610100808354040283529160200191610432565b820191905f5260205f20905b81548152906001019060200180831161041557829003601f168201915b5050509183525050600282015460ff161515602080830191909152600383015460408301526004909201546060909101529082526001929092019101610381565b5050505091505b50919050565b5f61048d85858585610bb4565b95945050505050565b5f82815260036020526040812060070154606090829081908190879060ff166104d55760405163a89b369d60e01b81526004810182905260240161024e565b5f8881526004602052604090208054881061050c5760405162fcd92b60e41b8152600481018a90526024810189905260440161024e565b5f81898154811061051f5761051f6111d7565b905f5260205f2090600502019050805f015481600101826002015f9054906101000a900460ff168360030154846004015483805461055c906111a5565b80601f0160208091040260200160405190810160405280929190818152602001828054610588906111a5565b80156105d35780601f106105aa576101008083540402835291602001916105d3565b820191905f5260205f20905b8154815290600101906020018083116105b657829003601f168201915b50505050509350975097509750975097505050509295509295909350565b5f60328211156106165760405163b25e2fe760e01b81525f600482015260240161024e565b61062287878787610bb4565b90505f5b828110156106645761065b82858584818110610644576106446111d7565b905060200281019061065691906111eb565b6109f2565b50600101610626565b509695505050505050565b5f81815260036020526040812060070154606090819083908190819081908190899060ff166106b45760405163a89b369d60e01b81526004810182905260240161024e565b5f8a81526003602081905260409091208054918101546004820154600583015460068401546007850154600186018054969796909560028901956001600160a01b039091169490939092909160ff909116908790610711906111a5565b80601f016020809104026020016040519081016040528092919081815260200182805461073d906111a5565b80156107885780601f1061075f57610100808354040283529160200191610788565b820191905f5260205f20905b81548152906001019060200180831161076b57829003601f168201915b5050505050965085805461079b906111a5565b80601f01602080910402602001604051908101604052809291908181526020018280546107c7906111a5565b80156108125780601f106107e957610100808354040283529160200191610812565b820191905f5260205f20905b8154815290600101906020018083116107f557829003601f168201915b50505050509550995099509950995099509950995099505050919395975091939597565b5f828152600360205260409020600781015483919060ff1661086e5760405163a89b369d60e01b81526004810183905260240161024e565b60038101546001600160a01b031633146108b9576003810154604051631e2eac2d60e11b8152600481018490523360248201526001600160a01b03909116604482015260640161024e565b5f848152600460205260409020805484106108f05760405162fcd92b60e41b8152600481018690526024810185905260440161024e565b5f818581548110610903576109036111d7565b5f9182526020909120600590910201600281015490915060ff1615610945576040516303f2815d60e31b8152600481018790526024810186905260440161024e565b60028101805460ff19166001908117909155426003808401919091555f88815260209190915260408120600601805490919061098290849061122e565b92505081905550600160025f82825461099b919061122e565b92505081905550336001600160a01b031685877f85db8b2e0c9153709310ee1cd77fe9c73caddb196ee38bb04c59cf78aa8a9bcf84600101426040516109e2929190611253565b60405180910390a4505050505050565b5f81801580610a015750608c81115b15610a1f576040516325e9df4160e01b815260040160405180910390fd5b5f8581526004602052604090208054603211610a515760405163b25e2fe760e01b81526004810187905260240161024e565b80805490509250806040518060a0016040528085815260200187878080601f0160208091040260200160405190810160405280939291908181526020018383808284375f92018290525093855250505060208083018290526040830182905242606090930192909252835460018181018655948252908290208351600590920201908155908201519192909190820190610aeb908261134d565b506040820151816002015f6101000a81548160ff02191690831515021790555060608201518160030155608082015181600401555050600160035f8881526020019081526020015f206005015f828254610b45919061122e565b925050819055506001805f828254610b5d919061122e565b92505081905550336001600160a01b031683877ffb7b6089cc8eb8bde528477971dd7065806f44e7c55bb794518ef2ed187ab074888842604051610ba393929190611434565b60405180910390a450509392505050565b5f83801580610bc35750606481115b15610be157604051637299cb4160e01b815260040160405180910390fd5b610118831115610c0457604051636a10586d60e11b815260040160405180910390fd5b60015f5f828254610c15919061122e565b925050819055505f54915060405180610100016040528083815260200187878080601f0160208091040260200160405190810160405280939291908181526020018383808284375f92019190915250505090825250604080516020601f8801819004810282018101909252868152918101919087908790819084018382808284375f920182905250938552505033602080850191909152426040808601919091526060850184905260808501849052600160a09095018590528784526003825290922084518155918401519192830191610cf091508261134d565b5060408201516002820190610d05908261134d565b5060608201516003820180546001600160a01b0319166001600160a01b039092169190911790556080820151600482015560a082015160058083019190915560c0830151600683015560e0909201516007909101805460ff1916911515919091179055335f81815260209283526040808220805460018101825590835293909120909201849055905183907f3c3fbb6a154e75fbef89d966d453c10b2ecc4dba66a0b8a755d720fae33a8fda90610dc5908a908a908a908a904290611457565b60405180910390a350949350505050565b5f5f83601f840112610de6575f5ffd5b50813567ffffffffffffffff811115610dfd575f5ffd5b602083019150836020828501011115610e14575f5ffd5b9250929050565b5f5f5f60408486031215610e2d575f5ffd5b83359250602084013567ffffffffffffffff811115610e4a575f5ffd5b610e5686828701610dd6565b9497909650939450505050565b5f60208284031215610e73575f5ffd5b81356001600160a01b0381168114610e89575f5ffd5b9392505050565b602080825282518282018190525f918401906040840190835b81811015610ec7578351835260209384019390920191600101610ea9565b509095945050505050565b5f60208284031215610ee2575f5ffd5b5035919050565b5f81518084528060208401602086015e5f602082860101526020601f19601f83011685010191505092915050565b5f602082016020835280845180835260408501915060408160051b8601019250602086015f5b82811015610fa557603f19878603018452815180518652602081015160a06020880152610f6d60a0880182610ee9565b604083810151151590890152606080840151908901526080928301519290970191909152506020938401939190910190600101610f3d565b50929695505050505050565b5f5f5f5f60408587031215610fc4575f5ffd5b843567ffffffffffffffff811115610fda575f5ffd5b610fe687828801610dd6565b909550935050602085013567ffffffffffffffff811115611005575f5ffd5b61101187828801610dd6565b95989497509550505050565b5f5f6040838503121561102e575f5ffd5b50508035926020909101359150565b85815260a060208201525f61105560a0830187610ee9565b941515604083015250606081019290925260809091015292915050565b5f5f5f5f5f5f60608789031215611087575f5ffd5b863567ffffffffffffffff81111561109d575f5ffd5b6110a989828a01610dd6565b909750955050602087013567ffffffffffffffff8111156110c8575f5ffd5b6110d489828a01610dd6565b909550935050604087013567ffffffffffffffff8111156110f3575f5ffd5b8701601f81018913611103575f5ffd5b803567ffffffffffffffff811115611119575f5ffd5b8960208260051b840101111561112d575f5ffd5b60208201935080925050509295509295509295565b88815261010060208201525f61115c61010083018a610ee9565b828103604084015261116e818a610ee9565b6001600160a01b039890981660608401525050608081019490945260a084019290925260c0830152151560e0909101529392505050565b600181811c908216806111b957607f821691505b60208210810361047a57634e487b7160e01b5f52602260045260245ffd5b634e487b7160e01b5f52603260045260245ffd5b5f5f8335601e19843603018112611200575f5ffd5b83018035915067ffffffffffffffff82111561121a575f5ffd5b602001915036819003821315610e14575f5ffd5b8082018082111561124d57634e487b7160e01b5f52601160045260245ffd5b92915050565b604081525f5f8454611264816111a5565b806040860152600182165f8114611282576001811461129e576112cf565b60ff1983166060870152606082151560051b87010193506112cf565b875f5260205f205f5b838110156112c6578154888201606001526001909101906020016112a7565b87016060019450505b5050506020929092019290925292915050565b634e487b7160e01b5f52604160045260245ffd5b601f821115611348578282111561134857805f5260205f20601f840160051c602085101561132157505f5b90810190601f840160051c035f5b81811015611344575f8382015560010161132f565b5050505b505050565b815167ffffffffffffffff811115611367576113676112e2565b61137b8161137584546111a5565b846112f6565b6020601f8211600181146113ad575f83156113965750848201515b5f19600385901b1c1916600184901b178455611405565b5f84815260208120601f198516915b828110156113dc57878501518255602094850194600190920191016113bc565b50848210156113f957868401515f19600387901b60f8161c191681555b505060018360011b0184555b5050505050565b81835281816020850137505f828201602090810191909152601f909101601f19169091010190565b604081525f61144760408301858761140c565b9050826020830152949350505050565b606081525f61146a60608301878961140c565b828103602084015261147d81868861140c565b915050826040830152969550505050505056fea2646970667358221220361d0465cc436a7ee31b0345c1ec9c92762380bee41d7676727237531eb935a164736f6c63430008260033";
