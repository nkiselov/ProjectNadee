class PingPong{
    constructor(obj1,obj2){
        this.objs = [obj1,obj2]
        this.ind = 0
    }

    getCur(){
        return this.objs[this.ind]
    }

    getNext(){
        return this.objs[(this.ind+1)%2];
    }

    swap(){
        this.ind = (this.ind+1)%2;
    }
}