export 1 class DateBase {
    private storage = new Map([
        ["basket", []],
        ["products", []]
    ]);
    public getter(type : string, name : number) {
        return this.storage.get(type).filter(el => el[0] === name);
    }
    public getAll(type : string) {
        return this.storage.get(type);
    }
    public adder(type : string, key : string, value : string) : void {
        this.storage.get(type).push([key, value]);
    }
}