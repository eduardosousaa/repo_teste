String.prototype.reverse = function(){
    return this.split('').reverse().join('');
};

export default function FormatarReal(value){
    let valor  = value.replace(/[^\d]+/gi,'').reverse();
    let resultado  = "";
    let mascara = "###.###.###.###,##".reverse();
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
    return resultado.reverse();
}