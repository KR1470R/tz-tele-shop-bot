class DateBase {
    private storage = new Map([
        ["basket", [{}]],
        ["products", []]
    ]);
    public getter(type : string, name : number) {
        return this.storage.get(type).filter(el => el[0] === name);
    }
    public getAll(type : string) {
        return this.storage.get(type);
    }
    public adder(type : string, username : string, key : string, value : string) : void {
        if (type === "basket") {
            if (this.storage.get(type)[0][username]) {
                this.storage.get(type)[0][username].push([key, value]);
            } else {
                this.storage.get(type)[0][username] = [[key, value]];
            }
        } else {
            this.storage.get(type).push([key, value]);
        }
    }
    public clearBasket(username : string) {
        this.storage.get("basket")[0][username] = [];
    }
}
export const db = new DateBase();