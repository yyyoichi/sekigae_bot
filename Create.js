class Sekigae {
    constructor() {
        const ss = SpreadsheetApp.getActiveSpreadsheet();
        const [names, props] = ss.getSheetByName('name').getDataRange().getValues();
        this.names = names
        this.props = props
        this.sekigae = [...names]
    }
    create() {
        //配列をランダムに入れ替える
        for (let i = this.names.length - 1; i > 0; i--) {
            let r = Math.floor(Math.random() * (i + 1));
            let iseki = this._getSekiObject(i)
            let rseki = this._getSekiObject(r)
            this.sekigae[r] = iseki
            this.sekigae[i] = rseki
            let tmp = this.names[i]
            this.names[i] = this.names[r]//不要だけど、混乱するので。
            this.names[r] = tmp
        }
        return this.sekigae
    }
    /**
     * @param {string[]} data 
     * @returns {string[]}
     */
    makeSheetValues(data = this.names) {
        const d = new Date()
        d.setDate(d.getDate() + 1)
        console.log(d)

        //明日の日付をつけて保存。
        const date = Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy/MM/dd")
        const values = [[date, ...data]]
        return values;
    }
    getSekigae() {
        return this.sekigae
    }
    _getSekiObject(i) {
        const name = this.names[i]
        const type = this.props[i]
        return {n: name, t: type}
    }
}

function test() {
    const S = new Sekigae()
    S.create()
    console.log(S.getSekigae())
    // console.log(S.getSeki())
    // console.log(S.getSeki("IT"))
    // console.log(S.getSeki("ARM"))
}