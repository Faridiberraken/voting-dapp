import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
//import VotingABI from "./VotingABI.json"; // ABI file after compilation

const VotingApp = () => {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [currentAccount, setCurrentAccount] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [latestBlock, setLatestBlock] = useState(null);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your deployed contract address
  const VotingABI = [
    {
      inputs: [],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "candidateId",
          type: "uint256",
        },
      ],
      name: "VotedEvent",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "candidates",
      outputs: [
        {
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "name",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "voteCount",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_candidateId",
          type: "uint256",
        },
      ],
      name: "getCandidate",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getCandidatesCount",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_voter",
          type: "address",
        },
      ],
      name: "hasVoted",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_candidateId",
          type: "uint256",
        },
      ],
      name: "vote",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "voters",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];

  useEffect(() => {
    const init = async () => {
      try {
        let signer = null;
        let provider;
        if (window.ethereum == null) {
          // If MetaMask is not installed, we use the default provider,
          // which is backed by a variety of third-party services (such
          // as INFURA). They do not have private keys installed,
          // so they only have read-only access
          console.log("MetaMask not installed; using read-only defaults");
          provider = ethers.getDefaultProvider();
        } else {
          // Connect to the MetaMask EIP-1193 object. This is a standard
          // protocol that allows Ethers access to make all read-only
          // requests through MetaMask.
          // If no %%url%% is provided, it connects to the default
          // http://localhost:8545, which most nodes use.
          provider = new ethers.JsonRpcProvider("http://localhost:8545");

          // It also provides an opportunity to request access to write
          // operations, which will be performed by the private key
          // that MetaMask manages for the user.
          signer = await provider.getSigner();
        }
        setProvider(provider);
        const address = await signer.getAddress();
        let eth = ethers.parseEther("1.0");
        console.log("Wei value: ", eth);
        console.log("Using account:", address);
        console.log("Contract address:", contractAddress);

        setCurrentAccount(address);

        //const network = await provider.getNetwork();
        //console.log("Network:", network);
        // Fetch the latest block number
        const blockNumber = await provider.getBlockNumber();
        console.log("Block number from provider:", blockNumber);
        setLatestBlock(blockNumber);

        // Initialize the contract instance
        //const votingContract = new ethers.Contract(
        //"Voting",
        //VotingABI,
        //provider
        //);
        const votingContract = new ethers.Contract(
          contractAddress,
          VotingABI,
          signer
        );
        setContract(votingContract);

        // Check if the user has already voted
        console.log("BEFORE VOTED LINE");
        //const voted = await votingContract.hasVoted(address);
        console.log("AFTER VOTED LINE");
        // console.log("Has voted: ", voted);
        //setHasVoted(voted);

        // Fetch all candidates
        const candidatesArray = [];
        const candidatesCount = await votingContract.getCandidatesCount();
        console.log("Candidates Count:", candidatesCount);
        for (let i = 1; i <= candidatesCount; i++) {
          const candidate = await votingContract.getCandidate(i);
          candidatesArray.push({
            id: candidate[0],
            name: candidate[1],
            voteCount: candidate[2],
          });
        }
        setCandidates(candidatesArray);
      } catch (error) {
        console.error("Error initializing the dApp:", error);
      }
    };

    init();
  }, []);

  const voteForCandidate = async (candidateId) => {
    try {
      if (contract) {
        // Submit the vote transaction
        const tx = await contract.vote(candidateId);
        await tx.wait(); // Wait for the transaction to be mined

        // Reload the latest block number after mining
        const blockNumber = await provider.getBlockNumber();
        setLatestBlock(blockNumber);

        // Reload the page after voting
        window.location.reload();
      }
    } catch (error) {
      console.error("Error voting:", error);
      if (error.code === "BLOCK_TAG_ERROR") {
        alert(
          "Block tag error occurred, make sure the transaction is mined properly."
        );
      }
    }
  };

  return (
    <div>
      <h1>Voting DApp</h1>
      <p>Current Account: {currentAccount}</p>
      <p>Latest Block Number: {latestBlock}</p>

      {hasVoted ? (
        <p>You have already voted!</p>
      ) : (
        <div>
          <h2>Candidates:</h2>
          {candidates.map((candidate) => (
            <div key={candidate.id}>
              <p>
                {candidate.name} - {ethers.formatUnits(candidate.voteCount, 0)}{" "}
                votes
              </p>
              <button onClick={() => voteForCandidate(candidate.id)}>
                Vote
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VotingApp;
