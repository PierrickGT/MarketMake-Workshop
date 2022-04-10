pragma solidity 0.7.4;

interface IFlashLoanReceiver {
  function executeOperation(
    address[] calldata assets,
    uint256[] calldata amounts,
    uint256[] calldata premiums,
    address initiator,
    bytes calldata params
  ) external returns (bool);
}

interface IArbitrageStrategy {
  function arbitrage() external payable;
}

interface IWETH {
  function balanceOf(address user) external view returns (uint256);

  function deposit() external payable;

  function withdraw(uint256 wad) external;

  function approve(address guy, uint256 wad) external returns (bool);

  function transferFrom(
    address src,
    address dst,
    uint256 wad
  ) external returns (bool);
}

interface ILendingPool {
  function flashLoan(
    address receiverAddress,
    address[] calldata assets,
    uint256[] calldata amounts,
    uint256[] calldata modes,
    address onBehalfOf,
    bytes calldata params,
    uint16 referralCode
  ) external;
}

contract DemoFlashloanReceiver is IFlashLoanReceiver {
  address constant LENDING_POOL = 0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9;
  IWETH constant WETH = IWETH(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);
  IArbitrageStrategy constant STRATEGY =
    IArbitrageStrategy(0x8F1034CBE5827b381067fCEfA727C069c26270c4);

  function executeOperation(
    address[] calldata assets,
    uint256[] calldata amounts,
    uint256[] calldata premiums,
    address initiator,
    bytes calldata params
  ) external override returns (bool) {
    require(assets[0] == address(WETH), "Invalid asset");
    require(amounts[0] <= 0.01 ether, "Invalid amount");

    WETH.withdraw(WETH.balanceOf(address(this)));

    (bool success, bytes memory data) = address(STRATEGY).call{ value: 0.01 ether }(
      abi.encodeWithSignature("arbitrage()")
    );

    WETH.deposit{ value: address(this).balance }();

    // Approve the LendingPool contract allowance to *pull* the owed amount
    uint256 amountOwing = amounts[0] + premiums[0];
    WETH.approve(address(LENDING_POOL), amountOwing);

    return true;
  }

  function flashLoan() external {
    address[] memory assets = new address[](1);
    assets[0] = address(WETH);

    uint256[] memory amounts = new uint256[](1);
    amounts[0] = 0.01 ether;

    uint256[] memory modes = new uint256[](1);
    modes[0] = 0;

    bytes memory params = "";
    uint16 referralCode = 0;

    ILendingPool(LENDING_POOL).flashLoan(
      address(this),
      assets,
      amounts,
      modes,
      address(this),
      params,
      referralCode
    );
  }

  receive() external payable {}
}
