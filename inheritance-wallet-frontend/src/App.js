import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';

const INHERITANCE_WALLET_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const INHERITANCE_WALLET_ABI = [
  "function addHeir(address _heir, uint256 _share) external",
  "function updateLastActivity() external",
  "function claimInheritance() external",
  "function heirs(address) external view returns (address wallet, uint256 share, bool isActive, uint256 lastVerification)",
  "function owner() external view returns (address)"
];

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [newHeirAddress, setNewHeirAddress] = useState('');
  const [newHeirShare, setNewHeirShare] = useState('');

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const account = accounts[0];
          setAccount(account);
          initializeContract(account);
        }
      }
    } catch (error) {
      console.error("Cüzdan bağlantı hatası:", error);
    }
  };

  const connectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      setAccount(account);
      initializeContract(account);
    } catch (error) {
      console.error("Bağlantı hatası:", error);
    }
  };

  const initializeContract = async (account) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const inheritanceContract = new ethers.Contract(
        INHERITANCE_WALLET_ADDRESS,
        INHERITANCE_WALLET_ABI,
        signer
      );
      setContract(inheritanceContract);

      const ownerAddress = await inheritanceContract.owner();
      setIsOwner(ownerAddress.toLowerCase() === account.toLowerCase());
    } catch (error) {
      console.error("Kontrat başlatma hatası:", error);
    }
  };

  const addHeir = async (e) => {
    e.preventDefault();
    try {
      const tx = await contract.addHeir(newHeirAddress, newHeirShare);
      await tx.wait();
      alert("Mirasçı başarıyla eklendi!");
      setNewHeirAddress('');
      setNewHeirShare('');
    } catch (error) {
      console.error("Mirasçı ekleme hatası:", error);
      alert("Mirasçı eklenirken hata oluştu!");
    }
  };

  const updateActivity = async () => {
    try {
      const tx = await contract.updateLastActivity();
      await tx.wait();
      alert("Aktivite güncellendi!");
    } catch (error) {
      console.error("Aktivite güncelleme hatası:", error);
      alert("Aktivite güncellenirken hata oluştu!");
    }
  };

  const claimInheritance = async () => {
    try {
      const tx = await contract.claimInheritance();
      await tx.wait();
      alert("Miras başarıyla talep edildi!");
    } catch (error) {
      console.error("Miras talep hatası:", error);
      alert("Miras talep edilirken hata oluştu!");
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Kripto Miras Cüzdanı</h1>
        {!account ? (
          <button onClick={connectWallet}>Cüzdanı Bağla</button>
        ) : (
          <>
            <p>Bağlı Adres: {account}</p>
            
            {isOwner && (
              <div className="owner-section">
                <h2>Sahip İşlemleri</h2>
                <form onSubmit={addHeir}>
                  <input
                    type="text"
                    placeholder="Mirasçı Adresi"
                    value={newHeirAddress}
                    onChange={(e) => setNewHeirAddress(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Pay Yüzdesi"
                    value={newHeirShare}
                    onChange={(e) => setNewHeirShare(e.target.value)}
                  />
                  <button type="submit">Mirasçı Ekle</button>
                </form>
                <button onClick={updateActivity}>Aktiviteyi Güncelle</button>
              </div>
            )}

            {!isOwner && (
              <div className="heir-section">
                <h2>Mirasçı İşlemleri</h2>
                <button onClick={claimInheritance}>Mirası Talep Et</button>
              </div>
            )}
          </>
        )}
      </header>
    </div>
  );
}

export default App;
