class DateBase {
    /**
     * basket: [{
     *     username: [[product_name,  product_price], ...],
     *     ...
     * }]
     *
     * products: [[product_name,  product_price, amount], ...]
     *
     * orders : [{
     *     username: id_order
     * }]
     *
     * @private
     */
    private storage = new Map([
        ["basket", [{}]],
        ["products", []],
        ["orders", [{}]]
    ]);
    public getter(type : string, name : string) {
        if (type === "products") {
            return this.storage.get(type).filter(el => el[0] === name);
        } else {
            return this.storage.get(type)[0][name];
        }
    }
    public setAmount(type : string, username : string, nameProduct : string, value : number) {
        if (type === "basket") {
            this.storage.get(type)[0][username].map(el => {
                if (el[0] === nameProduct) {
                    this.storage.get(type)[0][username][this.storage.get(type)[0][username].indexOf(el)][2] = value;
                    console.log("DDBVALUE", value)
                    console.log("DBBB2", this.storage.get(type)[0][username][this.storage.get(type)[0][username].indexOf(el)][2])
                }
            })
        }
    }
    public getAll(type : string) {
        return this.storage.get(type);
    }
    public adder(type : string, username : string, key : string, value : string, amount : number) : void {
        if (type === "basket") {
            if (db.getAll("basket")[0][username]) {
                this.storage.get(type)[0][username].push([key, value, amount]);
            } else {
                this.storage.get(type)[0][username] = [[key, value, amount]];
            }
        } else if (type === "products") {
            this.storage.get(type).push([key, value]);
        } else if (type === "orders") {
            this.storage.get(type)[0][username] = [new Date().valueOf()];
        }
    }
    public clearBasket(username : string) {
        this.storage.get("basket")[0][username] = [];
    }
    public countBasketContent(username : string) {
        let array = db.getAll("basket")[0][username];
        if (array) {
            let counts = {};
            for(let i = 0; i < array.length; i++){
                if (counts[array[i]]){
                    counts[array[i]] += 1;
                } else {
                    counts[array[i]] = 1;
                }
            }
            return counts;
        }
    }
}
export const db = new DateBase();