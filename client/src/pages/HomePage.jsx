import { Button, Input } from "@bluefrontend/bf-component-library";
import axios from "axios";
import { bind } from "decko";
import React, { Component, Fragment } from "react";
import ReactJson from "react-json-view";
import compose from "recompose/compose";
import styled, { withTheme } from "styled-components";
import { Loader } from "../components/loader";


const instance = axios.create({
  baseURL: `${process.env.PROXY}/blockchain/`,
});


export const BannerStyle = styled.div`
  &{
    display: flex;
    flex-direction: row;
    width: 80%;
    margin: 0 auto;
    margin-top: 10vh;
    margin-bottom: 10vh;
      &>div{
        display: flex;
        flex: 1;
        flex-direction: column;
      }
  }
  .container{
    max-width: 50vw;
    overflow: scroll;
  }
  .sidebar{
    max-width: 50vw;
    overflow: scroll;
    .options{
      margin-bottom: 20px;
    }
  }
  .keys{
    height: 100px;
    display: flex;
    flex-direction: column;
    overflow: scroll;
    max-width: 40vw;
    .keys__item{
      display: flex;
      flex-direction: column;
      border-bottom: 1px solid black;
      margin-bottom: 20px;
      p{
        margin: 0px;
        margin-top: 5px;
        margin-bottom: 5px;
      }
    }
  }
`;
export class HomePage extends Component {
  constructor() {
    super();
    this.state = {
      blocks: [],
      keys: [],
      peers: [],
      pendingTransactions: [],
      transactions: [],
      message: "",
      isChainValid: false,
      balance: 0,
      currentWallet: "",
      fromAddress: "",
      fromPrivateKey: "",
      toAddress: "",
      amount: "",
    };
  }

  componentDidMount() {
    setInterval(() => {
      // this.getBlocks();
    }, 10000);
    this.handleReload();
  }

  getBlocks() {
    this.setState({ loadingBlocks: true });
    return instance.get("/blocks").then((res) => {
      this.setState({ blocks: res.data, loadingBlocks: false });
      return this.isChainValid();
    });
  }

  getPeers() {
    return instance.get("/peers").then((res) => {
      this.setState({ peers: res.data });
    }).catch((error) => {
      console.log(error);
    });
  }

  getPendingTransactions() {
    return instance.get("/transactions/pending").then((res) => {
      this.setState({ pendingTransactions: res.data.pendingTransactions });
    }).catch((error) => {
      console.log(error);
    });
  }

  isChainValid() {
    return instance.get("/healthcheck").then((res) => {
      this.setState({ isChainValid: res.data.isChainValid });
    }).catch((error) => {
      console.log(error);
    });
  }

  @bind
  handleCreateWallet() {
    instance.post("/wallet").then((res) => {
      this.setState(previousState => ({
        keys: [...previousState.keys, { publicKey: res.data.publicKey, privateKey: res.data.privateKey }],
      }));
    }).catch((error) => {
      console.log(error);
    });
  }

  @bind
  handleMining() {
    instance.post("/mine").then((res) => {
      this.handleReload();
    }).catch((error) => {
      console.log(error);
    });
  }

  @bind
  handleReload() {
    this.getBlocks();
    this.getPeers();
    this.getPendingTransactions();
  }

  @bind
  handleHack() {
    instance.post("/hack").then((res) => {
      this.setState({ isChainValid: res.data.isChainValid }, () => this.handleReload());
    }).catch((error) => {
      console.log(error);
    });
  }

  @bind
  handleCalcAmount() {
    const { currentWallet } = this.state;
    if (currentWallet) {
      instance.get(`/wallet/${currentWallet}`).then((res) => {
        this.setState({ balance: res.data.balance });
      }).catch((error) => {
        console.log(error);
      });
    }
  }

  @bind
  handleTransactionFromWallet() {
    const { currentWallet } = this.state;
    if (currentWallet) {
      instance.get(`/wallet/${currentWallet}/transactions`).then((res) => {
        this.setState({ transactions: res.data.transactions });
      }).catch((error) => {
        console.log(error);
      });
    }
  }

  @bind
  handleCalcAmountMiner() {
    instance.get("/miner").then((res) => {
      this.setState({ balance: res.data.balance, currentWallet: res.data.miningAddress });
    }).catch((error) => {
      console.log(error);
    });
  }

  @bind
  handleTransaction() {
    const {
      fromAddress, toAddress, amount, fromPrivateKey,
    } = this.state;

    if (fromAddress && toAddress && amount && fromPrivateKey) {
      instance.post("/transactions", {
        fromPrivate: fromPrivateKey, fromPublic: fromAddress, toPublic: toAddress, amount,
      }).then((res) => {
        if (res.data.success) {
          this.setState({
            message: "Successfull sended amount",
          });
          this.handleReload();
        } else {
          this.setState({ message: res.data.message });
        }
      }).catch((error) => {
        console.log(error);
      });
    }
  }

  @bind
  handleClearInput() {
    this.setState({
      fromAddress: "", fromPrivateKey: "", toAddress: "", amount: "",
    });
  }

  render() {
    const { theme } = this.props;
    const {
      blocks, loadingBlocks, keys, peers, message, isChainValid, balance, currentWallet,
      fromAddress, fromPrivateKey, toAddress, amount,
      pendingTransactions, transactions,
    } = this.state;
    return (
      <Fragment>
        <BannerStyle>
          <div className="container">
            <h1>Create wallet</h1>
            <Button style={{ width: 100, marginBottom: "20px" }} onClick={this.handleCreateWallet}>Create</Button>
            <div className="keys">
              {keys && keys.map(({ publicKey, privateKey }) => (
                <div className="keys__Item">
                  <p><b>Private key:</b> <br />{privateKey}</p>
                  <p><b>Public key:</b><br /> {publicKey}</p>
                </div>
              ))}
            </div>

            <h1>Get amount wallet</h1>
            <Button style={{ width: 200, marginBottom: "20px" }} onClick={this.handleCalcAmountMiner}>Fill in miner wallet</Button>
            <Input title={`WalletAddress ${`(${balance || 0})`}`} value={currentWallet} style={{ width: 450, marginBottom: "20px" }} onChange={(e, value) => this.setState({ currentWallet: value })} />
            <Button type="primary" style={{ width: 200, marginBottom: "20px" }} onClick={this.handleCalcAmount}>Find amount</Button>
            <Button type="primary" style={{ width: 200, marginBottom: "20px" }} onClick={this.handleTransactionFromWallet}>Get all transactions </Button>

            {transactions && transactions.length > 0 && <h3>Transactions</h3>}
            {transactions && transactions.length > 0 && <ReactJson src={transactions} enableClipboard={false} displayDataTypes={false} />}

            <h1>Make transaction</h1>

            <Input title="From address" value={fromAddress} onChange={(e, value) => this.setState({ fromAddress: value })} type="text" />
            <Input title="From private" value={fromPrivateKey} onChange={(e, value) => this.setState({ fromPrivateKey: value })} type="text" />
            <Input title="To address" value={toAddress} onChange={(e, value) => this.setState({ toAddress: value })} type="text" />
            <Input title="Amount" value={amount} onChange={(e, value) => this.setState({ amount: value })} type="text" />
            <Button style={{ width: 200, marginRight: "8px", marginTop: "20px" }} onClick={this.handleClearInput}>Clear input</Button>
            <Button type="primary" style={{ width: 200, marginRight: "8px", marginTop: "20px" }} onClick={this.handleTransaction}>Send transaction</Button>


          </div>
          <div className="sidebar">
            <div className="options">
              <Button style={{ width: 100, marginRight: "8px" }} onClick={this.handleReload}>Reload</Button>
              <Button type="primary" style={{ width: 100, marginRight: "8px" }} onClick={this.handleMining}>Mine</Button>
              <Button type="danger" style={{ width: 100, marginRight: "8px" }} disabled={blocks && blocks.length === 1} onClick={this.handleHack}>Hack</Button>
            </div>
            {loadingBlocks && <Loader />}
            {message}

            <h2 style={{ color: !isChainValid ? "red" : "" }}>Blockchain {isChainValid ? "VALID" : "INVALID"}</h2>
            <ReactJson src={blocks} enableClipboard={false} displayDataTypes={false} />

            <h2>Peers</h2>
            <ReactJson src={peers} enableClipboard={false} displayDataTypes={false} />

            <h2>Pending transaction (mempool node)</h2>
            <ReactJson src={pendingTransactions} enableClipboard={false} displayDataTypes={false} />
          </div>
        </BannerStyle>
      </Fragment>
    );
  }
}
export default compose(
  withTheme,
)(HomePage);
