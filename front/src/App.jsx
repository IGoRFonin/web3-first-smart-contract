import React from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";

const CONTRACT_ADDRESS = "0x5627D30dE2F16Ca06eA47eF4B5Bc0Cff560a4895";
const CONTRACT_ABI = abi.abi;
const getEthereumObject = () => window.ethereum;

const findMetaMaskAccount = async () => {
  try {
    const ethereum = getEthereumObject();

    if (!ethereum) {
      console.error("Make sure you have MetaMask!");
      return null;
    }

    console.log("We have the Ethereum object", ethereum);
    const accounts = await ethereum.request({ method: "eth_accounts"});

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      return account;
    } else {
      console.error("No authorized account found");
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default function App() {
  const [currentAccount, setCurrentAccount] = React.useState("");
  const [allWaves, setAllWaves] = React.useState([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [value, setValue] = React.useState('');

  const handleChangeValue = (e) => {
    setValue(e.target.value);
  }

  const loadWaves = async () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const wavePortalContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    const waves = await wavePortalContract.getAllWaves();

    const wavesCleaned = waves.map(wave => {
      return {
        address: wave.waver,
        timestamp: new Date(wave.timestamp * 1000),
        message: wave.message,
      };
    });

    return wavesCleaned;
  }

  const wave = async () => {
    try {
      const ethereum = getEthereumObject();

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        setIsProcessing(true);
        const waveTxn = await wavePortalContract.wave(value, { gasLimit: 300000 });
        await waveTxn.wait();

        setIsProcessing(false);
        setValue('');
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
    }
  };

  const connectWallet = async () => {
    try {
      const ethereum = getEthereumObject();
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
  
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
  
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0])
    } catch(error) {
      console.error(error);
    }
  }
  
  React.useEffect(() => {
    findMetaMaskAccount().then((account) => {
      if (account !== null) {
        setCurrentAccount(account);
      }
    })
  }, []);

  React.useEffect(() => {
    if (currentAccount) {
      loadWaves().then((waves) => {
        setAllWaves(waves);
      })
    }
  }, [currentAccount]);

  React.useEffect(() => {
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log("New Wave", from, timestamp, message);
      setAllWaves(prev => [
        ...prev,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        }
      ])
    }

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      wavePortalContract.on("NewWave", onNewWave);
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    }
  }, []);
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        a change
        </div>

        <div className="bio">
        I am Igor and I worked on self-driving cars so that's pretty cool right? Connect your Ethereum wallet and wave at me!
        </div>

        <label className="field-wrapper">
          <span className="field-title">Message</span>
          <textarea className="field" value={value} onChange={handleChangeValue}/>
        </label>

        <button className="waveButton" onClick={wave} disabled={isProcessing}>
          {isProcessing && <i class="fa fa-spinner fa-spin"></i>} Wave at Me
        </button>

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: 'OldLace', marginTop: '16px', padding: '8px'}}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
