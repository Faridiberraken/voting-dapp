async function main() {
  // Get the contract factory
  const Voting = await ethers.getContractFactory("Voting");

  // Deploy the contract
  const voting = await Voting.deploy();

  // Log the address of the deployed contract
  console.log("Voting contract deployed to:", voting.target); // Use `target` in ethers v6 to get contract address
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
