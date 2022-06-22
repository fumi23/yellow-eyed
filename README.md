# yellow-eyed

iRemocon Wi-Fi (IRM-03WLA) コマンド送信ライブラリ

[公開されているコマンド仕様](https://i-remocon.com/hp/documents/IRM03WLA_command_ref_v1.pdf)に従い
TCP/IP データ通信を行う Promise ベースのライブラリです

- 公式パッケージではありません
- [net.Socket](https://nodejs.org/api/net.html#net_class_net_socket) を扱うためブラウザでは動作しません
- Electron で利用する場合は `nodeIntegration: true` の設定が必要です

## Installation

```
npm install yellow-eyed
```

## Usage

### CommonJS

```js
const YellowEyed = require("yellow-eyed").default;
```

### ES Modules

```js
import YellowEyed from "yellow-eyed";
```

---

```js
(() => {
  const client = new YellowEyed("192.168.230.13");
  client
    .allSensors()
    .then(response => {
      console.log(response);
      // { illuminance: 74, humidity: 41.08, temperature: 17.17 }
    })
    .catch(e => {
      console.error(e.message);
      // Error Code: 001; See https://i-remocon.com/hp/documents/IRM03WLA_command_ref_v1.pdf
    })
    .finally(() => {
      client.close();
    });
})();
```

or

```js
(async () => {
  const client = new YellowEyed("192.168.230.13");
  try {
    const response = await client.allSensors();
    console.log(response);
    // { illuminance: 74, humidity: 41.08, temperature: 17.17 }
  } catch (e) {
    console.error(e.message);
    // Error Code: 001; See https://i-remocon.com/hp/documents/IRM03WLA_command_ref_v1.pdf
  } finally () {
    client.close();
  }
})();
```

### CLI

T.B.D.

## License

MIT
