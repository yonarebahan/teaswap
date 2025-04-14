require('dotenv').config();
const { ethers } = require('ethers');
const prompt = require('prompt-sync')();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const ROUTER = '0xE15efbaA098AA81BaB70c471FeA760684dc776ae';
const FACTORY = '0x6A78568CDA16c4d59B1b78e962b8455Ab09DC12F';
const WETH = '0x7752dBd604a5C43521408ee80486853dCEb4cceB';

const TOKENS = [
  { name: 'HBRL', address: '0x7d7D20Ea5afb64Fc7beC15ba4670FF08B5E838b6' },
  { name: 'MATCHA', address: '0xd2325fB82bb3122D9656D87F4aCF01e4D535d7Ea' },
  { name: 'LEAF', address: '0x0281e0e9Df9920E994051fC3798fd1565F6d28BF' },
  { name: 'FTEA', address: '0xD89455C62BeC95820cE048fbE0f2Ae900F18A2DC' },
];

function cleanAddress(address) {
  try {
    return ethers.getAddress(address);
  } catch {
    return address.toLowerCase();
  }
}

const routerAbi = [
  'function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)',
  'function swapExactETHForTokensSupportingFeeOnTransferTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) payable external',
  'function swapExactTokensForETHSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external'
];

const erc20Abi = [
  'function approve(address spender, uint amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint)',
  'function balanceOf(address account) external view returns (uint)'
];

const factoryAbi = [
  'function getPair(address tokenA, address tokenB) external view returns (address)'
];

const router = new ethers.Contract(cleanAddress(ROUTER), routerAbi, wallet);
const factory = new ethers.Contract(cleanAddress(FACTORY), factoryAbi, provider);

async function approveIfNeeded(token, tokenName, amount) {
  try {
    const rawAllowance = await token.allowance(wallet.address, ROUTER);
    const allowance = ethers.toBigInt(rawAllowance);

    if (allowance < amount) {
      console.log(`🔐 Approving ${tokenName}...`);
      const tx = await token.approve(ROUTER, amount);
      await tx.wait();
      console.log(`✅ Approve ${tokenName} selesai`);
    } else {
      console.log(`✔️ Sudah di-approve: ${tokenName}`);
    }
  } catch (err) {
    console.log(`❌ Gagal approve ${tokenName}: ${err.message}`);
  }
}

async function swapETHToToken(amountIn, tokenOut, symbol) {
  const path = [cleanAddress(WETH), cleanAddress(tokenOut)];
  console.log(`💸 Swap TEA → ${symbol}`);
  console.log(`📦 Path: [${path.join(', ')}]`);

  try {
    const amounts = await router.getAmountsOut(amountIn, path);
    const amountOutMin = amounts[1] * 95n / 100n;
    const deadline = Math.floor(Date.now() / 1000) + 600;

    const tx = await router.swapExactETHForTokensSupportingFeeOnTransferTokens(
      amountOutMin,
      path,
      wallet.address,
      deadline,
      { value: amountIn }
    );
    console.log(`🚀 Swap TEA → ${symbol}: TX ${tx.hash}`);
    await tx.wait();
    console.log(`✅ Swap selesai: TEA → ${symbol}`);
  } catch (err) {
    console.log(`❌ Gagal swap TEA → ${symbol}: ${err.shortMessage || err.message}`);
  }
}

async function swapTokenToETH(tokenAddr, symbol) {
  const token = new ethers.Contract(cleanAddress(tokenAddr), erc20Abi, wallet);
  try {
    const balance = await token.balanceOf(wallet.address);
    const amountIn = balance * 90n / 100n;
    if (amountIn <= 0n) return;

    await approveIfNeeded(token, symbol, amountIn);

    const path = [cleanAddress(tokenAddr), cleanAddress(WETH)];
    const amounts = await router.getAmountsOut(amountIn, path);
    const amountOutMin = amounts[1] * 95n / 100n;
    const deadline = Math.floor(Date.now() / 1000) + 600;

    const tx = await router.swapExactTokensForETHSupportingFeeOnTransferTokens(
      amountIn,
      amountOutMin,
      path,
      wallet.address,
      deadline
    );
    console.log(`🔁 Swap balik ${symbol} → TEA: TX ${tx.hash}`);
    await tx.wait();
    console.log(`✅ Selesai swap balik ${symbol} → TEA`);
  } catch (err) {
    console.log(`❌ Gagal swap balik ${symbol}: ${err.shortMessage || err.message}`);
  }
}

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

(async () => {
  console.log(`👛 Wallet: ${wallet.address}`);
  const input = prompt('Mau swap berapa kali? ');
  const times = parseInt(input) || 1;

  for (let i = 0; i < times; i++) {
    const randToken = TOKENS[Math.floor(Math.random() * TOKENS.length)];
    const randAmount = (Math.random() * (0.001 - 0.0001) + 0.0001).toFixed(6);
    const amountIn = ethers.parseUnits(randAmount, 18);

    await swapETHToToken(amountIn, randToken.address, randToken.name);
    const delay = Math.floor(Math.random() * (25 - 20 + 1) + 20) * 1000;
    console.log(`⏳ Menunggu ${delay / 1000} detik...\n`);
    await sleep(delay);

    console.log(`↩️ Swap balik ${randToken.name} → TEA...`);
    await swapTokenToETH(randToken.address, randToken.name);
    const delay2 = Math.floor(Math.random() * (25 - 20 + 1) + 20) * 1000;
    console.log(`⏳ Menunggu ${delay2 / 1000} detik...\n`);
    await sleep(delay2);
  }

  console.log('🎉 Semua proses selesai!');
})();
