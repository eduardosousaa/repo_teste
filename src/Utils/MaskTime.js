String.prototype.reverse = function(){
    return this.split('').reverse().join('');
};

export default function MaskTime(e){
    if(e.target.value.length > 13) {
        e.target.value = e.target.value.replaceAll(/.$/gi, "");
        return
    }
    let mascara = "##:##".reverse()

    let valor  =  e.target.value.replace(/[^\d]+/gi,'').reverse();
    let resultado  = "";
    for (let x=0, y=0; x<mascara.length && y<valor.length;) {
        if (mascara.charAt(x) != '#') {
            resultado += mascara.charAt(x);
            x++;
        } else {
            resultado += valor.charAt(y);
            y++;
            x++;
        }
    }
    e.target.value = resultado.reverse();
}

