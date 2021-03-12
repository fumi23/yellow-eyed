# yellow-eyed
iRemocon Wi-Fi (IRM-03WLA) コマンド送信ライブラリ

[公開されているコマンド仕様](https://i-remocon.com/hp/documents/IRM03WLA_command_ref_v1.pdf)に従い
TCP/IP データ通信を行う Promise ベースのライブラリです
- 公式パッケージではありません
- Raw socket を扱うためブラウザでは動作しません
- Electron で利用する場合は `nodeIntegration: true` の設定が必要です

## Installation
```
npm install yellow-eyed
```

## Usage
### Node
```js
const YellowEyed = require('yellow-eyed').default;

const client = new YellowEyed('192.168.230.13');
client.getAllSensorValue().then(response => {
  console.log(response);
  // { illuminance: 74, humidity: 41.08, temperature: 17.17 }
});
```

### CLI
T.B.D.

## License
MIT
