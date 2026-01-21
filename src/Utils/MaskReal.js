String.prototype.reverse = function(){
    return this.split('').reverse().join('');
};

export default function MaskReal(e){
    let valor  =  e.target.value.replace(/[^\d]+/gi,'').reverse();
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
    // remover zero a esquerda
    /* let resultado2 = resultado.reverse();
    let string = "";
    if(resultado2[0] == "0"){ 
       for (let z = 0; z < resultado2.length; z++) {
          if((resultado2[z] == "0" || resultado2[z] == ".") && (resultado2[z + 1] == "0" ||  resultado2[z + 1] != "0")) {
            string = resultado2.substring(z + 1);
          }else{
            break;
          }
       } 
       e.target.value = string;
    }else{ */
    e.target.value = resultado.reverse();
   /*  } */
}