# web3-starter
Dapp Starter to test your smart contract functionalities on client side with web3js.
>Make sure you have metamask installed on browser.

##### Steps:
1. Clone repository

```shell
git clone https://github.com/BCDevs/web3-starter.git
cd web3-starter
```
2. Edit `index.js` and add your contract parameters like abi, address, network ids, methods to test.

3. Run any http server in your project root to serve your directory.

```shell
npm install -g http-server
http-server
// or, if you have python 3.5+ installed, you can use inbuilt http server directly

python -m http.server
```

4. Open your browser and navigate to serving url. For example, if you run `http-server` in your project root, then navigate to `http://localhost:8080/`.
